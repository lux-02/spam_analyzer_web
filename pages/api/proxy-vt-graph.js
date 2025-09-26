// VT Graph 기능은 Flask 서버 의존성으로 인해 서버리스 환경에서 비활성화
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "올바르지 않은 요청 메소드입니다" });
  }

  return res.status(503).json({
    success: false,
    error:
      "VT Graph 기능은 현재 서버리스 환경에서 지원되지 않습니다. VirusTotal 웹사이트에서 직접 확인해주세요.",
  });
}
