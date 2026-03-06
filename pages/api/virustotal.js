import axios from "axios";
import dns from "dns";
import { promisify } from "util";

// DNS 조회를 프로미스로 변환
const dnsLookup = promisify(dns.lookup);

// IP 주소 유효성 검사
const isValidIpAddress = (ip) => {
  return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip);
};

// URL 정제 함수 - 괄호, 구두점 등 제거
const sanitizeUrl = (url) => {
  // URL에서 흔히 발생하는 문제 패턴 수정
  // 끝에 있는 괄호나 마침표 등 제거
  return url.replace(/[(),.;'"!?]+$/, "");
};

// URL 유효성 검사
const isValidUrl = (url) => {
  try {
    // URL 정제
    const sanitizedUrl = sanitizeUrl(url);
    new URL(
      sanitizedUrl.startsWith("http") ? sanitizedUrl : `https://${sanitizedUrl}`
    );
    return true;
  } catch (e) {
    return false;
  }
};

// 도메인 추출
const extractDomain = (url) => {
  try {
    // URL 정제
    const sanitizedUrl = sanitizeUrl(url);
    const parsedUrl = new URL(
      sanitizedUrl.startsWith("http") ? sanitizedUrl : `https://${sanitizedUrl}`
    );
    return parsedUrl.hostname;
  } catch (e) {
    return url;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { target } = req.body;

  if (!target) {
    return res
      .status(400)
      .json({ error: "검사 대상(URL 또는 IP)이 필요합니다." });
  }

  try {
    // 입력 정제
    const sanitizedTarget = sanitizeUrl(target);
    console.log(`원본 입력: ${target}, 정제된 입력: ${sanitizedTarget}`);

    // IP 주소인지 확인
    const isIPAddress = isValidIpAddress(sanitizedTarget);
    // IP 아닌 경우 URL인지 확인
    const isUrl = !isIPAddress && isValidUrl(sanitizedTarget);

    // 유효하지 않은 입력인 경우
    if (!isIPAddress && !isUrl) {
      return res.status(400).json({
        error: "유효하지 않은 IP 주소 또는 URL입니다.",
        original_input: target,
        sanitized_input: sanitizedTarget,
      });
    }

    let ipToAnalyze = sanitizedTarget;
    let originalTarget = target;

    // URL인 경우 IP로 변환
    if (isUrl) {
      try {
        // 도메인 추출
        const domain = extractDomain(sanitizedTarget);
        console.log(`도메인 추출: ${domain}`);

        // DNS 조회로 IP 가져오기
        const { address } = await dnsLookup(domain);
        ipToAnalyze = address;
        console.log(`도메인 ${domain}의 IP 주소: ${ipToAnalyze}`);
      } catch (dnsError) {
        console.error("DNS 조회 오류:", dnsError);

        // DNS 조회 실패 시 URL 그대로 분석
        return res.status(200).json({
          query_status: "failed",
          threat: "unknown",
          message: "도메인의 IP 주소를 찾을 수 없습니다.",
          error: "DNS 조회 실패",
          original_target: originalTarget,
          sanitized_target: sanitizedTarget,
        });
      }
    }

    // IP 주소 분석 진행
    if (ipToAnalyze) {
      try {
        const response = await axios.get(
          `https://www.virustotal.com/api/v3/ip_addresses/${ipToAnalyze}`,
          {
            headers: {
              "x-apikey": process.env.VIRUSTOTAL_API_KEY,
            },
          }
        );

        const attributes = response.data.data.attributes;
        const stats = attributes.last_analysis_stats;
        const lastAnalysisResults = attributes.last_analysis_results;

        // IP 주소의 악성 여부를 판단
        const maliciousResults = Object.entries(lastAnalysisResults)
          .filter(([_, result]) => result.category === "malicious")
          .map(([engine, result]) => ({
            engine,
            result: result.result,
          }));

        const isMalicious = maliciousResults.length > 0;

        return res.status(200).json({
          query_status: "ok",
          threat: isMalicious ? "malicious" : "none",
          message: isMalicious
            ? isUrl
              ? `악성 IP(${ipToAnalyze})로 판단되었습니다.`
              : "악성 IP 주소로 판단되었습니다."
            : isUrl
            ? `안전한 IP(${ipToAnalyze})입니다.`
            : "안전한 IP 주소입니다.",
          original_target: originalTarget,
          ip_address: ipToAnalyze,
          is_url_converted: isUrl,
          analysis_stats: {
            ...stats,
            malicious_count: maliciousResults.length,
            malicious_details: maliciousResults,
          },
          analysis_results: lastAnalysisResults,
          virustotal_url: `https://www.virustotal.com/gui/ip-address/${ipToAnalyze}`,
        });
      } catch (vtError) {
        console.error(
          "VirusTotal IP 분석 오류:",
          vtError.response?.data || vtError.message
        );

        // URL 분석 시도
        if (isUrl) {
          return await analyzeUrl(sanitizedTarget, res, originalTarget);
        }

        // 오류 처리
        handleError(vtError, originalTarget, res);
      }
    } else if (isUrl) {
      // IP 추출에 실패한 경우 일반 URL 분석 진행
      return await analyzeUrl(sanitizedTarget, res, originalTarget);
    }
  } catch (error) {
    console.error(
      "VirusTotal 검사 오류:",
      error.response?.data || error.message
    );
    handleError(error, target, res);
  }
}

// URL 분석 함수
async function analyzeUrl(url, res, originalTarget) {
  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const formBody = new URLSearchParams({ url: formattedUrl });

    const submitResponse = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      formBody.toString(),
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const analysisId = submitResponse.data.data.id;

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY,
        },
      }
    );

    const attributes = response.data.data.attributes;
    const stats = attributes.stats;
    const results = attributes.results;
    const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

    return res.status(200).json({
      query_status: "ok",
      threat: isMalicious ? "malicious" : "none",
      message: isMalicious ? "악성 URL로 판단되었습니다." : "안전한 URL입니다.",
      original_target: originalTarget || url,
      sanitized_target: url,
      analysis_stats: stats,
      analysis_results: results,
      virustotal_url: `https://www.virustotal.com/gui/url/${analysisId}`,
    });
  } catch (error) {
    console.error(
      "VirusTotal URL 분석 오류:",
      error.response?.data || error.message
    );
    handleError(error, url, res);
  }
}

// 오류 처리 함수
function handleError(error, target, res) {
  // URL을 찾을 수 없는 경우
  if (error.response?.status === 404) {
    return res.status(200).json({
      query_status: "ok",
      threat: "unknown",
      message: "해당 대상에 대한 정보가 없습니다.",
      original_target: target,
      analysis_stats: {
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
      },
      virustotal_url: `https://www.virustotal.com/gui/search/${encodeURIComponent(
        target
      )}`,
    });
  }

  // API 키 관련 오류
  if (error.response?.status === 401) {
    return res.status(500).json({
      error: "VirusTotal API 키가 유효하지 않습니다.",
      details: error.response?.data,
    });
  }

  // 기타 오류
  return res.status(500).json({
    error: error.response?.data?.message || "검사에 실패했습니다.",
    details: error.response?.data,
  });
}
