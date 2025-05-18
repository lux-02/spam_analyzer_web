import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "올바르지 않은 요청 메소드입니다" });
  }

  try {
    // Flask 서버의 IP 주소와 포트를 설정합니다
    // 환경에 따라 이 값을 .env 파일에서 가져오거나 다르게 설정할 수 있습니다
    const FLASK_SERVER =
      process.env.FLASK_SERVER_URL || "http://localhost:5001";

    // Flask 서버에 요청을 전달합니다
    const response = await axios.post(
      `${FLASK_SERVER}/api/vt-graph`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Flask 서버의 응답을 클라이언트에게 전달합니다
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("VT Graph 프록시 오류:", error);

    // 오류 응답 처리
    if (error.response) {
      // Flask 서버에서 응답이 왔지만 오류 상태 코드일 경우
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || "서버에서 오류가 발생했습니다",
      });
    } else if (error.request) {
      // 요청이 전송되었지만 응답이 없는 경우
      return res.status(503).json({
        success: false,
        error:
          "Flask 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.",
      });
    } else {
      // 요청 설정 중 오류가 발생한 경우
      return res.status(500).json({
        success: false,
        error: "요청 처리 중 오류가 발생했습니다: " + error.message,
      });
    }
  }
}
