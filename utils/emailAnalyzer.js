/**
 * 이메일 분석 유틸리티 함수들
 */

import { GoogleGenAI } from "@google/genai";

// Gemini AI 초기화
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * RFC 2047 인코딩된 헤더 디코딩
 * @param {string} encodedText - 인코딩된 텍스트
 * @returns {string} 디코딩된 텍스트
 */
function decodeRFC2047(encodedText) {
  if (!encodedText || typeof encodedText !== "string") {
    return encodedText;
  }

  // =?charset?encoding?encoded-text?= 패턴 매칭
  const rfc2047Pattern = /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g;

  return encodedText.replace(
    rfc2047Pattern,
    (match, charset, encoding, encodedPart) => {
      try {
        if (encoding.toLowerCase() === "b") {
          // Base64 디코딩
          const decoded = Buffer.from(encodedPart, "base64").toString("utf8");
          return decoded;
        } else if (encoding.toLowerCase() === "q") {
          // Quoted-Printable 디코딩
          let decoded = encodedPart
            .replace(/_/g, " ")
            .replace(/=([0-9A-F]{2})/g, (match, hex) => {
              return String.fromCharCode(parseInt(hex, 16));
            })
            .replace(/=0D=0A/g, "") // CRLF 제거
            .replace(/=20/g, " "); // 스페이스 복원

          // UTF-8 바이트 시퀀스를 문자로 변환
          try {
            const bytes = [];
            for (let i = 0; i < decoded.length; i++) {
              bytes.push(decoded.charCodeAt(i));
            }
            const utf8String = Buffer.from(bytes).toString("utf8");
            return utf8String;
          } catch (utf8Error) {
            console.warn("UTF-8 변환 오류:", utf8Error);
            return decoded;
          }
        }
      } catch (error) {
        console.warn("RFC 2047 디코딩 오류:", error);
        return match; // 디코딩 실패시 원본 반환
      }
      return match;
    }
  );
}

/**
 * 이메일 헤더 분석
 * @param {string} rawData - 원시 이메일 데이터
 * @returns {Object} 헤더 분석 결과
 */
export function analyzeEmailHeader(rawData) {
  const headers = {};
  const lines = rawData.split("\n");

  for (const line of lines) {
    if (line.trim() === "") break; // 헤더 끝

    if (line.startsWith(" ") || line.startsWith("\t")) {
      // 이전 헤더의 연속
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).toLowerCase();
      let value = line.substring(colonIndex + 1).trim();

      // RFC 2047 인코딩 디코딩
      value = decodeRFC2047(value);
      headers[key] = value;
    }
  }

  // Received 헤더들 분석
  const receivedHeaders = [];
  const receivedPattern = /received:/gi;
  const matches = rawData.match(/received:.*$/gim);
  if (matches) {
    receivedHeaders.push(
      ...matches.map((match) => match.replace(/^received:\s*/i, ""))
    );
  }

  // 발신자 정보 추출
  const fromHeader = headers["from"] || "";
  const returnPathHeader = headers["return-path"] || "";
  const senderHeader = headers["sender"] || "";

  // SPF, DKIM, DMARC 정보 추출 (여러 헤더에서 확인)
  let spfResult = "none";
  let dkimResult = "none";
  let dmarcResult = "none";

  // Authentication-Results 헤더에서 추출
  const authResults = headers["authentication-results"] || "";
  if (authResults) {
    spfResult = authResults.match(/spf=([^;\\s]+)/i)?.[1] || spfResult;
    dkimResult = authResults.match(/dkim=([^;\\s]+)/i)?.[1] || dkimResult;
    dmarcResult = authResults.match(/dmarc=([^;\\s]+)/i)?.[1] || dmarcResult;
  }

  // Received-SPF 헤더에서 SPF 정보 추출
  const receivedSpf = headers["received-spf"] || "";
  if (receivedSpf) {
    if (receivedSpf.includes("pass")) spfResult = "pass";
    else if (receivedSpf.includes("fail")) spfResult = "fail";
    else if (receivedSpf.includes("softfail")) spfResult = "softfail";
    else if (receivedSpf.includes("neutral")) spfResult = "neutral";
  }

  // DKIM-Signature 헤더 존재 여부로 DKIM 확인
  if (headers["dkim-signature"]) {
    dkimResult = "pass"; // 서명이 있으면 일단 pass로 간주
  }

  // ARC-Authentication-Results에서 DMARC 확인
  const arcAuthResults = headers["arc-authentication-results"] || "";
  if (arcAuthResults) {
    dmarcResult = arcAuthResults.match(/dmarc=([^;\\s]+)/i)?.[1] || dmarcResult;
  }

  return {
    from: fromHeader,
    returnPath: returnPathHeader,
    sender: senderHeader,
    subject: decodeRFC2047(headers["subject"] || ""), // Subject 디코딩
    date: headers["date"] || "",
    receivedHeaders,
    spf: spfResult,
    dkim: dkimResult,
    dmarc: dmarcResult,
    messageId: headers["message-id"] || "",
    xOriginalSender: headers["x-original-sender"] || "",
    allHeaders: {
      ...headers,
      subject: decodeRFC2047(headers["subject"] || ""), // allHeaders에서도 디코딩된 subject 사용
    },
  };
}

/**
 * MIME 멀티파트 메시지 파싱
 * @param {string} rawData - 원시 이메일 데이터
 * @param {string} boundary - MIME 경계
 * @returns {Object} 파싱된 MIME 파트들
 */
function parseMimeMultipart(rawData, boundary) {
  const parts = rawData.split(`--${boundary}`);
  const mimeParts = [];

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart || trimmedPart === "--") continue;

    const partLines = trimmedPart.split("\n");
    const headers = {};
    let bodyStartIndex = 0;

    // 파트 헤더 파싱 (연속된 헤더 라인 처리)
    for (let i = 0; i < partLines.length; i++) {
      const line = partLines[i];
      if (line.trim() === "") {
        bodyStartIndex = i + 1;
        break;
      }

      // 연속된 헤더 라인 처리 (공백으로 시작하는 라인)
      if (line.startsWith(" ") || line.startsWith("\t")) {
        const lastHeaderKey = Object.keys(headers).pop();
        if (lastHeaderKey) {
          headers[lastHeaderKey] += " " + line.trim();
        }
        continue;
      }

      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).toLowerCase().trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }

    const body = partLines.slice(bodyStartIndex).join("\n");
    mimeParts.push({ headers, body });
  }

  return mimeParts;
}

/**
 * Quoted-Printable 디코딩
 * @param {string} encoded - 인코딩된 텍스트
 * @returns {string} 디코딩된 텍스트
 */
function decodeQuotedPrintable(encoded) {
  if (!encoded || typeof encoded !== "string") {
    return encoded;
  }

  let decoded = encoded
    .replace(/=\r?\n/g, "") // soft line breaks 제거
    .replace(/=([0-9A-F]{2})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

  // UTF-8 바이트 배열을 문자열로 변환
  try {
    // 먼저 일반적인 UTF-8 디코딩 시도
    const utf8Decoded = Buffer.from(decoded, "binary").toString("utf8");
    return utf8Decoded;
  } catch (error) {
    console.warn("UTF-8 변환 실패, 원본 반환:", error);
    return decoded;
  }
}

/**
 * 이메일 본문 및 링크 분석
 * @param {string} rawData - 원시 이메일 데이터
 * @returns {Object} 본문 및 링크 분석 결과
 */
export function parseEmailBodyAndLinks(rawData) {
  try {
    // 입력 데이터 검증
    if (!rawData || typeof rawData !== "string") {
      console.warn("parseEmailBodyAndLinks: 잘못된 입력 데이터");
      return {
        body: "",
        htmlBody: "",
        links: [],
        hasHtml: false,
        bodyLength: 0,
      };
    }

    // 헤더와 본문 분리
    const headerBodySplit = rawData.split(/\n\s*\n/);
    let bodyPart =
      headerBodySplit.length > 1 ? headerBodySplit.slice(1).join("\n\n") : "";

    // Content-Type 헤더에서 MIME 정보 추출
    const headerPart = headerBodySplit[0] || "";
    const contentTypeMatch = headerPart.match(/content-type:\s*([^;\n]+)/i);
    const contentType = contentTypeMatch
      ? contentTypeMatch[1].toLowerCase().trim()
      : "text/plain";

    // boundary 추출
    const boundaryMatch = headerPart.match(/boundary[=\s]*["']?([^"';\s\n]+)/i);
    const boundary = boundaryMatch ? boundaryMatch[1] : null;

    // Content-Transfer-Encoding 추출
    const encodingMatch = headerPart.match(
      /content-transfer-encoding:\s*([^\n]+)/i
    );
    const encoding = encodingMatch
      ? encodingMatch[1].toLowerCase().trim()
      : null;

    let textBody = "";
    let htmlBody = "";
    let hasHtml = false;

    // MIME 멀티파트 처리
    if (boundary && contentType.includes("multipart")) {
      const mimeParts = parseMimeMultipart(bodyPart, boundary);

      for (const part of mimeParts) {
        const partContentType = part.headers["content-type"] || "";
        const partEncoding = part.headers["content-transfer-encoding"] || "";
        let partBody = part.body;

        // 인코딩 디코딩
        if (partEncoding.includes("quoted-printable")) {
          partBody = decodeQuotedPrintable(partBody);
        } else if (partEncoding.includes("base64")) {
          try {
            partBody = Buffer.from(
              partBody.replace(/\s/g, ""),
              "base64"
            ).toString("utf8");
          } catch (e) {
            console.warn("Base64 디코딩 실패:", e);
          }
        }

        if (partContentType.includes("text/html")) {
          htmlBody = partBody;
          hasHtml = true;
        } else if (partContentType.includes("text/plain")) {
          textBody = partBody;
        }
      }
    } else {
      // 단일 파트 메시지
      let decodedBody = bodyPart;

      // 인코딩 디코딩
      if (encoding === "quoted-printable") {
        decodedBody = decodeQuotedPrintable(bodyPart);
      } else if (encoding === "base64") {
        try {
          decodedBody = Buffer.from(
            bodyPart.replace(/\s/g, ""),
            "base64"
          ).toString("utf8");
        } catch (e) {
          console.warn("Base64 디코딩 실패:", e);
        }
      }

      if (contentType.includes("text/html")) {
        htmlBody = decodedBody;
        hasHtml = true;
        // HTML에서 텍스트 추출
        textBody = decodedBody
          .replace(/<[^>]*>/g, "")
          .replace(/&[a-zA-Z0-9#]+;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        textBody = decodedBody;
      }
    }

    // 최종 텍스트 본문 정리
    const cleanBody = textBody
      .replace(/\s+/g, " ") // 연속된 공백 제거
      .trim();

    // 링크 추출
    const linkRegex = /(https?:\/\/[^\s<>"]+)/gi;
    const links = [];
    let match;

    try {
      while ((match = linkRegex.exec(bodyPart)) !== null) {
        links.push({
          url: match[1],
          text: match[1],
          suspicious: isLinkSuspicious(match[1]),
        });
      }
    } catch (linkError) {
      console.warn("링크 추출 중 오류:", linkError);
    }

    return {
      body: cleanBody,
      htmlBody: htmlBody,
      links,
      hasHtml: hasHtml,
      bodyLength: cleanBody.length,
    };
  } catch (error) {
    console.error("parseEmailBodyAndLinks 오류:", error);
    return {
      body: "",
      links: [],
      hasHtml: false,
      bodyLength: 0,
    };
  }
}

/**
 * 링크 의심도 검사
 * @param {string} url - 검사할 URL
 * @returns {boolean} 의심스러운 링크 여부
 */
function isLinkSuspicious(url) {
  const suspiciousPatterns = [
    /bit\\.ly/i,
    /tinyurl/i,
    /t\\.co/i,
    /goo\\.gl/i,
    /short/i,
    /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, // IP 주소
    /[a-z0-9]{10,}\.com/i, // 랜덤한 긴 도메인
    /[a-z0-9]{10,}\.net/i,
    /[a-z0-9]{10,}\.org/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(url));
}

/**
 * 위험도 점수 계산
 * @param {Object} headerAnalysis - 헤더 분석 결과
 * @param {Object} bodyAnalysis - 본문 분석 결과
 * @param {Array} attachments - 첨부파일 목록
 * @param {Array} beacons - 비콘 이미지 목록
 * @returns {Object} 위험도 점수 및 상세 정보
 */
export function calculateRiskScore(
  headerAnalysis,
  bodyAnalysis,
  attachments,
  beacons
) {
  let score = 0;
  const factors = [];

  // 안전한 기본값 설정
  const safeHeaderAnalysis = headerAnalysis || {};
  const safeBodyAnalysis = bodyAnalysis || { links: [], body: "" };
  const safeAttachments = attachments || [];
  const safeBeacons = beacons || [];

  // SPF 검사 (기본 점수에서 차감하는 방식)
  if (safeHeaderAnalysis.spf === "pass") {
    score -= 0; // SPF 통과시 점수 차감 없음
    factors.push("SPF 인증 통과");
  } else if (safeHeaderAnalysis.spf === "fail") {
    score += 30;
    factors.push("SPF 인증 실패");
  } else if (safeHeaderAnalysis.spf === "softfail") {
    score += 15;
    factors.push("SPF 소프트 실패");
  } else if (safeHeaderAnalysis.spf === "none") {
    score += 15;
    factors.push("SPF 인증 누락");
  }

  // DKIM 검사
  if (safeHeaderAnalysis.dkim === "pass") {
    score -= 0; // DKIM 통과시 점수 차감 없음
    factors.push("DKIM 인증 통과");
  } else if (safeHeaderAnalysis.dkim === "fail") {
    score += 25;
    factors.push("DKIM 인증 실패");
  } else if (safeHeaderAnalysis.dkim === "none") {
    score += 10;
    factors.push("DKIM 인증 누락");
  }

  // DMARC 검사
  if (safeHeaderAnalysis.dmarc === "pass") {
    score -= 0; // DMARC 통과시 점수 차감 없음
    factors.push("DMARC 정책 통과");
  } else if (safeHeaderAnalysis.dmarc === "fail") {
    score += 20;
    factors.push("DMARC 정책 위반");
  } else if (safeHeaderAnalysis.dmarc === "none") {
    score += 10;
    factors.push("DMARC 정책 누락");
  }

  // 의심스러운 링크
  const suspiciousLinks = (safeBodyAnalysis.links || []).filter(
    (link) => link.suspicious
  );
  if (suspiciousLinks.length > 0) {
    score += suspiciousLinks.length * 15;
    factors.push(`${suspiciousLinks.length}개의 의심스러운 링크`);
  }

  // 첨부파일 검사
  const dangerousAttachments = safeAttachments.filter((att) =>
    /\.(exe|bat|cmd|scr|pif|com|js|jar|zip|rar)$/i.test(att.filename)
  );
  if (dangerousAttachments.length > 0) {
    score += dangerousAttachments.length * 25;
    factors.push(`${dangerousAttachments.length}개의 위험한 첨부파일`);
  }

  // 비콘 이미지
  if (safeBeacons.length > 0) {
    score += safeBeacons.length * 10;
    factors.push(`${safeBeacons.length}개의 추적 이미지`);
  }

  // 발신자 검증
  if (safeHeaderAnalysis.from && !safeHeaderAnalysis.from.includes("@")) {
    score += 20;
    factors.push("잘못된 발신자 형식");
  }

  // Return-Path와 From 불일치
  if (safeHeaderAnalysis.returnPath && safeHeaderAnalysis.from) {
    const fromDomain = safeHeaderAnalysis.from.split("@")[1];
    const returnPathDomain = safeHeaderAnalysis.returnPath
      .replace(/[<>]/g, "")
      .split("@")[1];
    if (fromDomain !== returnPathDomain) {
      score += 15;
      factors.push("발신자 도메인 불일치");
    }
  }

  // AI 분석 가중치 반영
  if (safeHeaderAnalysis.llmAnalysis || safeBodyAnalysis.llmAnalysis) {
    const ai = safeHeaderAnalysis.llmAnalysis || safeBodyAnalysis.llmAnalysis;
    if (ai && ai.intent) {
      if (ai.intent === "phishing" || ai.intent === "scam") {
        score += 30; // 피싱/사기 판단 가중치
        factors.push("AI 분석: 피싱/사기 판단(+30)");
      } else if (ai.intent === "spam") {
        score += 10; // 스팸은 낮은 가중치
        factors.push("AI 분석: 스팸 판단(+10)");
      } else if (ai.intent === "legitimate" || ai.intent === "promotional") {
        score -= 5; // 정상/홍보는 약간의 감점
        factors.push("AI 분석: 정상/홍보 판단(-5)");
      }
    }
  }

  // 점수 상한 설정
  score = Math.max(0, Math.min(score, 100));

  // 위험도 레벨 결정 (점수가 높을수록 위험)
  let riskLevel = "low";
  if (score >= 70) riskLevel = "high";
  else if (score >= 40) riskLevel = "medium";

  return {
    score,
    riskLevel,
    factors,
    maxScore: 100,
  };
}

/**
 * 비콘 이미지 검사
 * @param {string} body - 이메일 본문
 * @returns {Array} 비콘 이미지 목록
 */
export function checkBeaconImages(body) {
  const beacons = [];

  // img 태그에서 src 추출
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(body)) !== null) {
    const src = match[1];

    // 비콘으로 의심되는 이미지 패턴
    if (
      src.includes("track") ||
      src.includes("pixel") ||
      src.includes("beacon") ||
      src.includes("open") ||
      /1x1/i.test(src) ||
      /pixel/i.test(src)
    ) {
      beacons.push({
        src,
        type: "tracking_pixel",
      });
    }
  }

  return beacons;
}

/**
 * 첨부파일 정보 추출
 * @param {string} rawData - 원시 이메일 데이터
 * @returns {Array} 첨부파일 목록
 */
export function getEmailAttachments(rawData) {
  const attachments = [];

  // Content-Disposition 헤더에서 첨부파일 찾기
  const attachmentRegex =
    /Content-Disposition:\s*attachment;\s*filename=["']?([^"'\n;]+)["']?/gi;
  let match;

  while ((match = attachmentRegex.exec(rawData)) !== null) {
    const filename = match[1];
    attachments.push({
      filename,
      dangerous: /\.(exe|bat|cmd|scr|pif|com|js|jar)$/i.test(filename),
      compressed: /\.(zip|rar|7z|tar|gz)$/i.test(filename),
    });
  }

  return attachments;
}

/**
 * Gemini AI를 사용한 이메일 의도 분석
 * @param {string} emailContent - 이메일 내용
 * @returns {Object} 의도 분석 결과
 */
export async function analyzeEmailIntent(emailContent) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Gemini API 키가 설정되지 않음. 기본 분석 사용.");
      return {
        success: true,
        intent: "unknown",
        confidence: 0.5,
        reasoning: "Gemini API 키가 설정되지 않아 기본 분석을 사용합니다.",
        redFlags: [],
        recommendation: "API 키를 설정하면 더 정확한 분석을 받을 수 있습니다.",
      };
    }

    // Gemini 2.5 Flash Lite 모델 사용

    const prompt = `
다음 이메일의 의도를 분석해주세요. 특히 스팸, 피싱, 사기 등의 악의적인 의도가 있는지 판단해주세요.

이메일 내용:
${emailContent}

다음 형식으로 응답해주세요:
{
  "intent": "legitimate/spam/phishing/scam/promotional",
  "confidence": 0.85,
  "reasoning": "분석 근거",
  "redFlags": ["의심스러운 요소들"],
  "recommendation": "사용자에게 권장사항"
}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const text = result.text;

    try {
      // JSON 코드 블록 제거 (```json ... ``` 형태)
      let cleanText = text.trim();

      // 코드 블록 패턴 제거
      cleanText = cleanText.replace(/^```json\s*\n?/i, "");
      cleanText = cleanText.replace(/\n?\s*```\s*$/i, "");

      // 추가적인 정리
      cleanText = cleanText.trim();

      console.log("Gemini AI 원본 응답:", text);
      console.log("정리된 JSON:", cleanText);

      // JSON 파싱
      const analysisResult = JSON.parse(cleanText);

      return {
        success: true,
        ...analysisResult,
      };
    } catch (parseError) {
      console.warn("JSON 파싱 실패:", parseError);
      console.log("파싱 실패한 텍스트:", text);

      // JSON 파싱 실패 시 텍스트에서 정보 추출 시도
      try {
        const intentMatch = text.match(/"intent":\s*"([^"]+)"/i);
        const confidenceMatch = text.match(/"confidence":\s*([0-9.]+)/i);
        const reasoningMatch = text.match(/"reasoning":\s*"([^"]+)"/i);

        return {
          success: true,
          intent: intentMatch ? intentMatch[1] : "unknown",
          confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
          reasoning: reasoningMatch ? reasoningMatch[1] : text,
          redFlags: [],
          recommendation:
            "AI 응답 파싱에 실패했습니다. 수동으로 이메일을 검토해주세요.",
        };
      } catch (fallbackError) {
        return {
          success: false,
          intent: "unknown",
          confidence: 0.5,
          reasoning: text,
          redFlags: [],
          recommendation: "수동으로 이메일을 검토해주세요.",
        };
      }
    }
  } catch (error) {
    console.error("Gemini AI 분석 오류:", error);
    return {
      success: true,
      intent: "unknown",
      confidence: 0.3,
      reasoning: "AI 분석에 실패했습니다. 기본 규칙 기반 분석을 사용합니다.",
      redFlags: [],
      recommendation: "수동으로 이메일을 검토해주세요.",
    };
  }
}

/**
 * 이메일 원문 데이터 유효성 검사
 * @param {string} rawData - 원시 이메일 데이터
 * @returns {Object} 유효성 검사 결과
 */
export function validateEmailRawData(rawData) {
  if (!rawData || typeof rawData !== "string") {
    return { valid: false, reason: "이메일 데이터가 문자열이 아닙니다." };
  }

  if (rawData.length < 50) {
    return { valid: false, reason: "이메일 데이터가 너무 짧습니다." };
  }

  // 기본적인 이메일 헤더 구조 확인
  if (!rawData.includes("From:") && !rawData.includes("from:")) {
    return { valid: false, reason: "From 헤더가 없습니다." };
  }

  if (!rawData.includes("\n\n") && !rawData.includes("\r\n\r\n")) {
    return { valid: false, reason: "헤더와 본문이 분리되지 않았습니다." };
  }

  return { valid: true };
}

/**
 * 도메인 추출 함수
 * @param {string} url - URL 또는 이메일 주소
 * @returns {string} 도메인
 */
export function extractDomain(url) {
  try {
    // 이메일 주소인 경우
    if (url.includes("@") && !url.includes("://")) {
      return url.split("@")[1];
    }

    // URL인 경우
    if (url.includes("://")) {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    }

    // 그냥 도메인인 경우
    return url;
  } catch (error) {
    return url;
  }
}

/**
 * IP 주소 유효성 검사
 * @param {string} ip - IP 주소
 * @returns {boolean} 유효한 IP 주소 여부
 */
export function isValidIpAddress(ip) {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * URL 유효성 검사
 * @param {string} url - URL
 * @returns {boolean} 유효한 URL 여부
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 분석 가능한 대상인지 확인
 * @param {string} target - 분석 대상
 * @returns {boolean} 분석 가능 여부
 */
export function isAnalyzableTarget(target) {
  if (!target || typeof target !== "string") {
    return false;
  }

  // IP 주소 또는 도메인, URL인지 확인
  return (
    isValidIpAddress(target) ||
    isValidUrl(target) ||
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(target)
  );
}

/**
 * 국가 코드를 국기 이모지로 변환
 * @param {string} countryCode - 2자리 국가 코드
 * @returns {string} 국기 이모지
 */
export function countryCodeToFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());

  return String.fromCodePoint(...codePoints);
}
