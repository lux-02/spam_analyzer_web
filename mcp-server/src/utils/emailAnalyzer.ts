/**
 * 이메일 분석 유틸리티 함수들
 * 기존 프로젝트의 emailAnalyzer.js를 TypeScript로 포팅
 */

import { Base64 } from "js-base64";
import * as cheerio from "cheerio";

export function decodeBase64HeaderIfNeeded(value: string): string {
  const base64Regex = /^[A-Za-z0-9+/=]{8,}$/;

  if (!value || typeof value !== "string") return value;

  const trimmed = value.trim();

  if (base64Regex.test(trimmed)) {
    try {
      return Buffer.from(trimmed, "base64").toString("utf8");
    } catch (e) {
      console.error("Base64 디코딩 오류:", e);
      return value;
    }
  }

  return value;
}

export const decodeMIMEHeader = (encodedHeader: string): string => {
  if (!encodedHeader || typeof encodedHeader !== "string") return encodedHeader;

  const normalizedHeader = encodedHeader
    .replace(/\r\n\s+/g, " ")
    .replace(/\n\s+/g, " ");

  const mimeRegex = /=\?([\w-]+)\?(B|Q)\?(.*?)\?=/gi;

  let lastIndex = 0;
  let result = "";
  let match;

  while ((match = mimeRegex.exec(normalizedHeader)) !== null) {
    if (match.index > lastIndex) {
      result += normalizedHeader.substring(lastIndex, match.index);
    }

    const [fullMatch, charset, encoding, data] = match;
    lastIndex = match.index + fullMatch.length;

    try {
      if (encoding.toUpperCase() === "B") {
        result += Buffer.from(data, "base64").toString("utf8");
      } else if (encoding.toUpperCase() === "Q") {
        result += decodeQuotedPrintable(data.replace(/_/g, " "));
      } else {
        result += fullMatch;
      }
    } catch (e) {
      console.error("MIME 헤더 디코딩 오류:", e, fullMatch);
      result += fullMatch;
    }
  }

  if (lastIndex < normalizedHeader.length) {
    result += normalizedHeader.substring(lastIndex);
  }

  return result || normalizedHeader;
};

export const decodeQuotedPrintable = (str: string): string => {
  if (!str || typeof str !== "string") return str;

  try {
    const decoded = str
      .replace(/=\r\n/g, "")
      .replace(/=([0-9A-F]{2})/gi, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });

    return decodeURIComponent(escape(decoded));
  } catch (e) {
    console.error("Quoted-Printable 디코딩 오류:", e);

    try {
      return str.replace(/=\r\n/g, "").replace(/=([0-9A-F]{2})/gi, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch {
      return str;
    }
  }
};

export const analyzeEmailHeader = (emailData: string) => {
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
  const domainRegex = /@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/;
  const hostRegex = /\((.*?)\[/;
  const dateRegex =
    /;\s*([A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{1,2}:\d{1,2}:\d{1,2}\s+[-+]\d{4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{1,2}:\d{1,2}:\d{1,2}\s+[-+]\d{4})/;

  const ipAddresses: string[] = [];
  const domains = new Set<string>();
  const hostNames: string[] = [];
  const receivedEntries: any[] = [];

  const lines = emailData.split("\n");
  const result: any = {
    spf: "Not Found",
    dkim: "Not Found",
    dmarc: "Not Found",
    receivedPaths: [],
    receivedDetails: [],
    date: "Not Found",
    to: "Not Found",
    from: "Not Found",
    subject: "Not Found",
    links: [],
    ipAddresses: [],
    domains: [],
    hostNames: [],
  };

  let isHTMLContent = false;
  let htmlContent = "";
  let currentReceivedBlock: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("<div>") || isHTMLContent) {
      htmlContent += line + "\n";
      if (line.trim().endsWith("</div>")) {
        isHTMLContent = false;
      } else {
        isHTMLContent = true;
      }
    }

    // SPF 분석
    if (line.includes("spf=softfail")) {
      result.spf = "softfail";
    } else if (line.includes("spf=pass")) {
      result.spf = "pass";
    } else if (line.includes("spf=neutral")) {
      result.spf = "neutral";
    } else if (line.includes("spf=none")) {
      result.spf = "none";
    } else if (line.includes("spf=fail")) {
      result.spf = "fail";
    }

    // DMARC 분석
    if (line.includes("dmarc=fail")) {
      result.dmarc = "fail";
    } else if (line.includes("dmarc=pass")) {
      result.dmarc = "pass";
    }

    // DKIM 분석
    if (line.includes("dkim=fail")) {
      result.dkim = "fail";
    } else if (line.includes("dkim=pass")) {
      result.dkim = "pass";
    }

    // Received 헤더 처리
    if (line.startsWith("Received:")) {
      currentReceivedBlock = {
        fullText: line.trim(),
        from: "",
        by: "",
        date: "",
        ip: "",
      };

      const fromMatch = line.match(/from\s+([^\s;()]+)/i);
      if (fromMatch) {
        currentReceivedBlock.from = fromMatch[1];
      }

      const byMatch = line.match(/by\s+([^\s;()]+)/i);
      if (byMatch) {
        currentReceivedBlock.by = byMatch[1];
      }

      const ipMatch = line.match(ipRegex);
      if (ipMatch && ipMatch[0] !== "127.0.0.1" && ipMatch[0] !== "0.0.0.0") {
        currentReceivedBlock.ip = ipMatch[0];
        ipAddresses.push(ipMatch[0]);
      }

      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        currentReceivedBlock.date = dateMatch[1];
      }

      let nextLine = "";
      let j = i + 1;

      while (j < lines.length) {
        nextLine = lines[j].trim();

        if (nextLine.match(/^[A-Za-z-]+:/)) {
          break;
        }

        currentReceivedBlock.fullText += " " + nextLine;

        if (!currentReceivedBlock.from) {
          const fromMatch = nextLine.match(/from\s+([^\s;()]+)/i);
          if (fromMatch) {
            currentReceivedBlock.from = fromMatch[1];
          }
        }

        if (!currentReceivedBlock.by) {
          const byMatch = nextLine.match(/by\s+([^\s;()]+)/i);
          if (byMatch) {
            currentReceivedBlock.by = byMatch[1];
          }
        }

        if (!currentReceivedBlock.ip) {
          const ipMatch = nextLine.match(ipRegex);
          if (
            ipMatch &&
            ipMatch[0] !== "127.0.0.1" &&
            ipMatch[0] !== "0.0.0.0"
          ) {
            currentReceivedBlock.ip = ipMatch[0];
            ipAddresses.push(ipMatch[0]);
          }
        }

        if (!currentReceivedBlock.date) {
          const dateMatch = nextLine.match(dateRegex);
          if (dateMatch) {
            currentReceivedBlock.date = dateMatch[1];
          }
        }

        j++;
      }

      i = j - 1;

      const domainMatches = currentReceivedBlock.fullText.match(
        new RegExp(domainRegex.source, "g")
      );
      if (domainMatches) {
        domainMatches.forEach((match: string) => {
          const domain = match.match(domainRegex)?.[1];
          if (domain) domains.add(domain);
        });
      }

      const hostMatch = currentReceivedBlock.fullText.match(hostRegex);
      if (hostMatch) {
        hostNames.push(hostMatch[1].trim());
      }

      receivedEntries.push(currentReceivedBlock);
    }

    // Date 헤더
    if (line.startsWith("Date:")) {
      result.date = line.substring(5).trim();
    }

    // Subject 헤더
    if (line.startsWith("Subject:")) {
      const subjectValue = line.substring(8).trim();
      result.subject = decodeMIMEHeader(subjectValue);
    }

    // From 헤더
    if (line.startsWith("From:")) {
      const fromValue = line.substring(5).trim();
      result.from = decodeMIMEHeader(fromValue);
    }

    // To 헤더
    if (line.startsWith("To:")) {
      const toValue = line.substring(3).trim();
      result.to = decodeMIMEHeader(toValue);
    }
  }

  // HTML 컨텐츠에서 링크 추출
  const linkRegex = /href="([^"]*)"/g;
  let match;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    result.links.push(match[1]);
  }

  const reversedReceivedEntries = [...receivedEntries].reverse();

  result.receivedPaths = reversedReceivedEntries
    .map((entry) => {
      let pathInfo = entry.from || "";
      if (entry.ip) {
        pathInfo += ` [${entry.ip}]`;
      }
      return pathInfo;
    })
    .filter(Boolean);

  result.receivedDetails = reversedReceivedEntries.map((entry) => ({
    from: entry.from || "",
    by: entry.by || "",
    ip: entry.ip || "",
    date: entry.date || "",
    fullText: entry.fullText,
  }));

  result.ipAddresses = [...new Set(ipAddresses)];
  result.domains = Array.from(domains);
  result.hostNames = hostNames;

  // 데이터 필터링
  const filteredResult: any = {};
  Object.keys(result).forEach((key) => {
    if (Array.isArray(result[key]) && result[key].length > 0) {
      filteredResult[key] = result[key];
    } else if (typeof result[key] === "string" && result[key] !== "Not Found") {
      filteredResult[key] = result[key];
    }
  });

  return filteredResult;
};

export function parseEmailBodyAndLinks(rawEmailData: string) {
  const contentTypeRegex =
    /Content-Type:\s*text\/(plain|html);\s*charset=["']?([^"';\s]+)["']?/gi;
  const transferEncodingRegex =
    /Content-Transfer-Encoding:\s*(quoted-printable|base64)/i;

  let charset = "utf-8";
  let body = "";
  let links: string[] = [];

  const matches = Array.from(rawEmailData.matchAll(contentTypeRegex));

  for (const match of matches) {
    charset = match[2]?.toLowerCase() || "utf-8";

    const encodingMatch = rawEmailData.match(transferEncodingRegex);
    const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : "7bit";

    const bodyStartIndex = rawEmailData.indexOf("\n\n", match.index);
    if (bodyStartIndex !== -1) {
      let encodedBody = rawEmailData.substring(bodyStartIndex).trim();
      let decoded;

      try {
        if (encoding === "base64") {
          decoded = Buffer.from(encodedBody, "base64").toString("utf8");
        } else if (encoding === "quoted-printable") {
          decoded = decodeQuotedPrintable(encodedBody);
        } else {
          decoded = encodedBody;
        }
      } catch (e) {
        console.error("이메일 본문 디코딩 오류:", e);
        decoded = encodedBody;
      }

      body = decoded;

      const hrefRegex = /https?:\/\/[^\s"'<>]+/g;
      links = Array.from(decoded.match(hrefRegex) || []);
      break;
    }
  }

  return { body, links };
}

export const calculateRiskScore = (emailData: any) => {
  let riskScore = 100;
  const riskFactors: string[] = [];

  // SPF 검사
  if (emailData.spf === "fail" || emailData.spf === "none") {
    riskScore -= 15;
    riskFactors.push("SPF 인증 실패");
  } else if (emailData.spf === "softfail") {
    riskScore -= 10;
    riskFactors.push("SPF 인증 일부 실패");
  } else if (emailData.spf !== "pass") {
    riskScore -= 5;
    riskFactors.push("SPF 인증 불확실");
  }

  // DKIM 검사
  if (emailData.dkim === "fail") {
    riskScore -= 15;
    riskFactors.push("DKIM 서명 실패");
  } else if (emailData.dkim !== "pass") {
    riskScore -= 10;
    riskFactors.push("DKIM 서명 없음");
  }

  // DMARC 검사
  if (emailData.dmarc === "fail") {
    riskScore -= 15;
    riskFactors.push("DMARC 정책 실패");
  } else if (emailData.dmarc !== "pass") {
    riskScore -= 10;
    riskFactors.push("DMARC 정책 없음");
  }

  // 비콘 이미지 체크
  if (emailData.beacons && emailData.beacons.length > 0) {
    riskScore -= 10;
    riskFactors.push("추적 픽셀 (비콘) 발견");
  }

  // LLM 분석 결과 반영
  if (emailData.llmAnalysis) {
    const {
      category,
      confidence,
      riskScore: llmRiskScore,
    } = emailData.llmAnalysis;

    if (
      ["비밀번호 변경 요청", "송장/청구서 위장", "로그인 시도 알림"].includes(
        category
      )
    ) {
      if (confidence === "High") {
        riskScore += llmRiskScore;
        riskFactors.push(`AI 분석: ${category} (높은 신뢰도)`);
      } else if (confidence === "Medium") {
        riskScore += llmRiskScore;
        riskFactors.push(`AI 분석: ${category} (중간 신뢰도)`);
      } else {
        riskScore -= 5;
        riskFactors.push(`AI 분석: ${category} (낮은 신뢰도)`);
      }
    } else if (category === "스팸 광고" && confidence === "High") {
      riskScore += llmRiskScore;
      riskFactors.push("AI 분석: 스팸 광고 (높은 신뢰도)");
    } else if (category === "정상 업무 메일" && confidence === "High") {
      riskScore += 5;
      riskFactors.push("AI 분석: 정상 업무 메일 (높은 신뢰도)");
    }
  }

  // 모든 인증이 통과했을 경우 가산점
  if (
    emailData.spf === "pass" &&
    emailData.dkim === "pass" &&
    emailData.dmarc === "pass"
  ) {
    riskScore += 10;
    riskFactors.push("모든 인증 통과 (+10점)");
  }

  // 점수 범위 제한
  riskScore = Math.max(0, Math.min(100, riskScore));

  // 위험 등급 결정
  let riskLevel;
  if (riskScore >= 75) {
    riskLevel = "safe";
  } else if (riskScore >= 45) {
    riskLevel = "suspicious";
  } else {
    riskLevel = "danger";
  }

  return { score: riskScore, level: riskLevel, factors: riskFactors };
};

export const checkBeaconImages = (htmlContent: string): string[] => {
  if (!htmlContent || typeof htmlContent !== "string") {
    return [];
  }

  try {
    const beaconPattern =
      /<img[^>]+(width=['"]?1['"]?[^>]+height=['"]?1['"]?|style=['"]?[^"']*display\s*:\s*none[^"']*['"]?)[^>]*>/gi;

    const beacons: string[] = [];
    let match;

    while ((match = beaconPattern.exec(htmlContent)) !== null) {
      const imgTag = match[0];
      const srcMatch = imgTag.match(/src=['"]([^'"]+)['"]/);
      if (srcMatch) {
        beacons.push(srcMatch[1]);
      }
    }

    return beacons;
  } catch (error) {
    console.error("비콘 이미지 체크 중 오류 발생:", error);
    return [];
  }
};

export const extractEmailText = (emailContent: string): string => {
  try {
    let content = emailContent;
    if (
      Base64.isValid(emailContent) &&
      /^[A-Za-z0-9+/=]+$/.test(emailContent)
    ) {
      content = Base64.decode(emailContent);
    }

    const $ = cheerio.load(content);
    const text = $("body").text().trim();
    return text || content;
  } catch (error) {
    console.error("이메일 텍스트 추출 오류:", error);
    return emailContent;
  }
};

export const analyzeEmailIntent = async (emailContent: string) => {
  try {
    const emailText = extractEmailText(emailContent);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    if (!GEMINI_API_KEY) {
      console.error(
        "Gemini API 키가 설정되지 않았습니다. 로컬 대체 분석을 실행합니다."
      );
      return performLocalFallbackAnalysis(emailText);
    }

    const prompt = `다음 이메일 본문을 분석하여, 이메일의 의도를 아래 분류 중 하나로 판단해주세요:

1. 비밀번호 변경 요청  
2. 송장/청구서 위장  
3. 로그인 시도 알림  
4. 이벤트 초대  
5. 스팸 광고  
6. 정상 업무 메일  
7. 기타 (직접 서술)

또한 판단에 대한 신뢰도를 다음 중 하나로 표시하고, 간단한 이유를 함께 작성해주세요:

- High: 단어 표현, 패턴, 문맥이 명확하게 특정 의도를 드러냅니다.  
- Medium: 일부 표현이 의도와 유사하지만, 맥락상 확신은 어려움  
- Low: 판단에 필요한 단서가 거의 없거나 일반적인 표현만 사용됨

반드시 JSON 형식으로 응답해주세요.

예시 응답 형식:
{
  "category": "스팸 광고",
  "confidence": "High",
  "reason": "광고성 상품 링크와 할인 안내 문구가 명확하게 포함되어 있음",
  "riskScore": -5
}

위험도 점수(riskScore)는 다음 기준으로 책정합니다:
- 비밀번호 변경 요청 (High 신뢰도): -15
- 비밀번호 변경 요청 (Medium 신뢰도): -10 
- 비밀번호 변경 요청 (Low 신뢰도): -5
- 송장/청구서 위장 (High 신뢰도): -15
- 송장/청구서 위장 (Medium 신뢰도): -10
- 송장/청구서 위장 (Low 신뢰도): -5
- 로그인 시도 알림 (High 신뢰도): -15
- 로그인 시도 알림 (Medium 신뢰도): -10
- 로그인 시도 알림 (Low 신뢰도): -5
- 스팸 광고 (High 신뢰도): -5
- 정상 업무 메일 (High 신뢰도): 5
- 기타 카테고리: 0

이메일 본문:
${emailText}`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API 요청 실패: ${response.status}`);
      }

      const geminiResponse = await response.json();
      const responseText =
        geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = responseText.match(/({[\s\S]*})/);

      if (!jsonMatch) {
        throw new Error("Gemini API 응답에서 JSON 데이터를 찾을 수 없습니다");
      }

      const result = JSON.parse(jsonMatch[1]);

      if (!result.category || !result.confidence) {
        throw new Error("Gemini API 응답에 필수 필드가 누락되었습니다");
      }

      return {
        ...result,
        model_used: "Google Gemini API",
        analysisMessage: getAnalysisMessage(result.category, result.confidence),
      };
    } catch (apiError) {
      console.error("Gemini API 호출 오류:", apiError);
      return performLocalFallbackAnalysis(emailText);
    }
  } catch (error) {
    console.error("이메일 의도 분석 오류:", error);
    return performLocalFallbackAnalysis(extractEmailText(emailContent));
  }
};

const performLocalFallbackAnalysis = (emailText: string) => {
  console.log("로컬 키워드 기반 분석으로 대체");

  let category = "정상 업무 메일";
  let confidence = "Low";
  let reason = "서버 분석 실패로 키워드 기반 대체 분석을 사용합니다.";
  let riskScore = 0;

  const lowerEmailText = emailText.toLowerCase();

  if (
    lowerEmailText.includes("비밀번호") &&
    (lowerEmailText.includes("변경") || lowerEmailText.includes("재설정"))
  ) {
    category = "비밀번호 변경 요청";
    confidence = "Medium";
    reason = "비밀번호 변경 관련 키워드가 포함되어 있습니다.";
    riskScore = -10;
  } else if (
    lowerEmailText.includes("로그인") &&
    (lowerEmailText.includes("시도") || lowerEmailText.includes("감지"))
  ) {
    category = "로그인 시도 알림";
    confidence = "Medium";
    reason = "로그인 시도 관련 키워드가 포함되어 있습니다.";
    riskScore = -10;
  } else if (
    lowerEmailText.includes("청구서") ||
    lowerEmailText.includes("송장") ||
    lowerEmailText.includes("결제")
  ) {
    category = "송장/청구서 위장";
    confidence = "Medium";
    reason = "청구서 관련 키워드가 포함되어 있습니다.";
    riskScore = -10;
  } else if (
    lowerEmailText.includes("초대") ||
    lowerEmailText.includes("이벤트")
  ) {
    category = "이벤트 초대";
    confidence = "Medium";
    reason = "이벤트 초대 관련 키워드가 포함되어 있습니다.";
    riskScore = 0;
  } else if (
    lowerEmailText.includes("할인") ||
    lowerEmailText.includes("프로모션") ||
    lowerEmailText.includes("광고")
  ) {
    category = "스팸 광고";
    confidence = "Medium";
    reason = "광고성 키워드가 포함되어 있습니다.";
    riskScore = -5;
  }

  return {
    category,
    confidence,
    reason,
    riskScore,
    model_used: "클라이언트 키워드 분석 (API 오류)",
    analysisMessage: getAnalysisMessage(category, confidence),
  };
};

const getAnalysisMessage = (category: string, confidence: string): string => {
  const confidenceMap: Record<string, string> = {
    High: "높습니다",
    Medium: "중간 수준입니다",
    Low: "낮습니다",
  };

  const categoryMap: Record<string, string> = {
    "비밀번호 변경 요청": "비밀번호 변경 요청 메일일",
    "송장/청구서 위장": "송장/청구서로 위장한 피싱 메일일",
    "로그인 시도 알림": "로그인 시도 알림을 가장한 피싱 메일일",
    "이벤트 초대": "이벤트 초대 메일일",
    "스팸 광고": "광고성 스팸 메일일",
    "정상 업무 메일": "정상적인 업무 메일일",
    기타: "특정 의도를 파악하기 어려운 메일일",
  };

  return `이 메일은 ${categoryMap[category] || category} 가능성이 ${
    confidenceMap[confidence] || confidence
  }.`;
};
