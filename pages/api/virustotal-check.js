import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메서드입니다." });
  }

  const { target, type } = req.body;

  if (!target) {
    return res.status(400).json({ error: "검사 대상이 필요합니다." });
  }

  if (!type || !["ip", "domain", "url"].includes(type)) {
    return res
      .status(400)
      .json({ error: "유효한 검사 유형이 필요합니다: ip, domain, url" });
  }

  try {
    const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

    if (!VIRUSTOTAL_API_KEY) {
      return res.status(500).json({
        error:
          "VirusTotal API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.",
      });
    }

    let response;

    if (type === "ip") {
      // IP 주소 분석
      response = await axios.get(
        `https://www.virustotal.com/api/v3/ip_addresses/${target}`,
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;
      const lastAnalysisResults = attributes.last_analysis_results;

      // IP 주소의 악성 여부 판단
      const maliciousResults = Object.entries(lastAnalysisResults)
        .filter(
          ([_, result]) =>
            result.category === "malicious" || result.category === "suspicious"
        )
        .map(([engine, result]) => ({
          engine,
          result: result.result,
          category: result.category,
        }));

      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      return res.status(200).json({
        target,
        type,
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? `악성으로 판단됨 (${stats.malicious}개의 엔진에서 탐지)`
          : "안전한 것으로 판단됨",
        analysis_stats: stats,
        detection_ratio: `${stats.malicious}/${Object.values(stats).reduce(
          (sum, val) => sum + val,
          0
        )}`,
        malicious_results: maliciousResults,
        analysis_results: lastAnalysisResults,
        virustotal_url: `https://www.virustotal.com/gui/ip-address/${target}`,
      });
    } else if (type === "domain") {
      // 도메인 분석
      response = await axios.get(
        `https://www.virustotal.com/api/v3/domains/${target}`,
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;
      const lastAnalysisResults = attributes.last_analysis_results;

      // 도메인의 악성 여부 판단
      const maliciousResults = Object.entries(lastAnalysisResults)
        .filter(
          ([_, result]) =>
            result.category === "malicious" || result.category === "suspicious"
        )
        .map(([engine, result]) => ({
          engine,
          result: result.result,
          category: result.category,
        }));

      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      return res.status(200).json({
        target,
        type,
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? `악성으로 판단됨 (${stats.malicious}개의 엔진에서 탐지)`
          : "안전한 것으로 판단됨",
        analysis_stats: stats,
        detection_ratio: `${stats.malicious}/${Object.values(stats).reduce(
          (sum, val) => sum + val,
          0
        )}`,
        malicious_results: maliciousResults,
        analysis_results: lastAnalysisResults,
        virustotal_url: `https://www.virustotal.com/gui/domain/${target}`,
      });
    } else if (type === "url") {
      // URL 제출 및 분석
      const submitResponse = await axios.post(
        "https://www.virustotal.com/api/v3/urls",
        new URLSearchParams({ url: target }).toString(),
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const analysisId = submitResponse.data.data.id;

      // 분석 결과 가져오기
      response = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      const attributes = response.data.data.attributes;
      const stats = attributes.stats;
      const results = attributes.results;

      // URL의 악성 여부 판단
      const maliciousResults = Object.entries(results)
        .filter(
          ([_, result]) =>
            result.category === "malicious" || result.category === "suspicious"
        )
        .map(([engine, result]) => ({
          engine,
          result: result.result,
          category: result.category,
        }));

      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      return res.status(200).json({
        target,
        type,
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? `악성으로 판단됨 (${stats.malicious}개의 엔진에서 탐지)`
          : "안전한 것으로 판단됨",
        analysis_stats: stats,
        detection_ratio: `${stats.malicious}/${Object.values(stats).reduce(
          (sum, val) => sum + val,
          0
        )}`,
        malicious_results: maliciousResults,
        analysis_results: results,
        virustotal_url: `https://www.virustotal.com/gui/url/${encodeURIComponent(
          target
        )}`,
      });
    }
  } catch (error) {
    console.error(
      "바이러스토탈 검사 오류:",
      error.response?.data || error.message
    );

    // URL을 찾을 수 없는 경우
    if (error.response?.status === 404) {
      return res.status(200).json({
        target,
        type,
        threat: "unknown",
        message: "해당 대상에 대한 정보가 없습니다.",
        analysis_stats: {
          malicious: 0,
          suspicious: 0,
          harmless: 0,
          undetected: 0,
        },
        detection_ratio: "0/0",
        virustotal_url: `https://www.virustotal.com/gui/search/${encodeURIComponent(
          target
        )}`,
      });
    }

    // API 키 관련 오류
    if (error.response?.status === 401) {
      return res.status(500).json({
        error: "바이러스토탈 API 키가 유효하지 않습니다.",
        details: error.response?.data,
      });
    }

    // 기타 오류
    return res.status(500).json({
      error:
        error.response?.data?.message || "바이러스토탈 검사에 실패했습니다.",
      details: error.response?.data,
    });
  }
}
