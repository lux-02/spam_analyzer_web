import { analyzeEmailIntent } from "../../utils/emailAnalyzer";

/**
 * 이메일 의도 분석 API 엔드포인트
 * @param {Object} req - Next.js request 객체
 * @param {Object} res - Next.js response 객체
 */
export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({ error: "지원하지 않는 메소드입니다" });
  }

  try {
    // 요청 본문에서 emailContent 필드 추출
    const { emailContent } = req.body;

    if (!emailContent) {
      return res.status(400).json({ error: "이메일 내용이 필요합니다" });
    }

    // 이메일 의도 분석 실행
    const analysisResult = await analyzeEmailIntent(emailContent);

    // 결과 반환
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error("이메일 의도 분석 API 오류:", error);
    return res.status(500).json({
      error: "분석 처리 중 오류가 발생했습니다",
      message: error.message,
    });
  }
}
