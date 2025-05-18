import axios from "axios";

export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "도메인이 필요합니다." });
  }

  try {
    // Google DNS API를 이용해 A 레코드 조회
    const dnsResponse = await axios.get(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`
    );

    let ip = null;

    if (dnsResponse.data.Answer && dnsResponse.data.Answer.length > 0) {
      // 첫 번째 A 레코드의 IP 주소 사용
      for (const record of dnsResponse.data.Answer) {
        if (record.type === 1) {
          // A 레코드
          ip = record.data;
          break;
        }
      }
    }

    if (!ip) {
      return res
        .status(404)
        .json({ error: "도메인에 대한 IP 주소를 찾을 수 없습니다." });
    }

    // 결과 IP 주소를 /api/analyze-ip로 포워딩
    const ipAnalysisResponse = await axios.get(
      `${req.headers.host.includes("localhost") ? "http" : "https"}://${
        req.headers.host
      }/api/analyze-ip?ip=${ip}`
    );

    return res.status(200).json({
      domain,
      resolvedIp: ip,
      ...ipAnalysisResponse.data,
    });
  } catch (error) {
    console.error("도메인 분석 중 오류 발생:", error);
    return res.status(500).json({
      error: "도메인 분석 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
