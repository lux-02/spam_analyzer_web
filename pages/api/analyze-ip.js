import axios from "axios";

export default async function handler(req, res) {
  const { ip } = req.query;

  if (!ip) {
    return res.status(400).json({ error: "IP 주소가 필요합니다." });
  }

  try {
    // GeoIP 정보 가져오기 (ipwho.is 사용)
    const geoipResponse = await axios.get(`https://ipwho.is/${ip}`);
    const geoipData = geoipResponse.data;

    // 로컬 IP 또는 사설 IP인 경우
    if (geoipData.success === false) {
      return res.status(200).json({
        ip,
        country: "로컬 네트워크",
        countryCode: "LO",
        flag: "🏠",
        region: "내부망",
        city: "로컬",
        latitude: 0,
        longitude: 0,
        isp: "로컬 네트워크",
        isPrivate: true,
      });
    }

    // flag 속성 안전하게 접근
    const flagEmoji =
      geoipData.flag && geoipData.flag.emoji ? geoipData.flag.emoji : "🏳️";

    // 포트 스캔 정보 요청 (Flask 서버)
    let portScanInfo = null;
    const flaskBaseUrl =
      process.env.FLASK_SERVER_URL || "http://localhost:5001";

    try {
      // 포트 스캔 실행
      const portScanResponse = await axios.post(
        `${flaskBaseUrl}/scan`,
        { ip, port_range: "21-25,80,443,8080-8090", timeout: 5 },
        { timeout: 30000 } // 30초 타임아웃
      );

      if (portScanResponse.data && portScanResponse.data.success) {
        portScanInfo = portScanResponse.data;
      }
    } catch (scanError) {
      console.error("포트 스캔 요청 중 오류 발생:", scanError.message);
      // 오류가 발생해도 계속 진행 (포트 스캔 결과는 null)
    }

    // 결과 반환
    return res.status(200).json({
      ip,
      country: geoipData.country || "알 수 없음",
      countryCode: geoipData.country_code || "XX",
      flag: flagEmoji,
      region: geoipData.region || "알 수 없음",
      city: geoipData.city || "알 수 없음",
      latitude: geoipData.latitude || 0,
      longitude: geoipData.longitude || 0,
      isp: geoipData.connection?.isp || "알 수 없음",
      // VirusTotal 및 Shodan API는 실제 API 키가 필요하므로 추후 구현
      virusTotalUrl: `https://www.virustotal.com/gui/ip-address/${ip}/detection`,
      portScanInfo: portScanInfo,
      isPrivate: false,
    });
  } catch (error) {
    console.error("IP 분석 중 오류 발생:", error);
    // 오류 발생 시 기본 데이터 반환
    return res.status(200).json({
      ip,
      country: "분석 오류",
      countryCode: "XX",
      flag: "❓",
      region: "알 수 없음",
      city: "알 수 없음",
      latitude: 0,
      longitude: 0,
      isp: "알 수 없음",
      error: error.message,
      isError: true,
    });
  }
}
