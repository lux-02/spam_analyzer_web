import { connectToDatabase } from "../../utils/db";
import { getAnalysisSummaries } from "../../utils/dbHelper";

export default async function handler(req, res) {
  try {
    // MongoDB 연결
    await connectToDatabase();

    // 파라미터 처리 (기본값: 최근 20개)
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    if (limit > 100) {
      return res.status(400).json({
        error: "한 번에 최대 100개까지 조회할 수 있습니다.",
      });
    }

    // 최근 분석 결과 요약 가져오기
    const results = await getAnalysisSummaries(limit, skip);

    return res.status(200).json(results);
  } catch (error) {
    console.error("최근 분석 결과 조회 중 오류 발생:", error);
    return res.status(500).json({
      error: "최근 분석 결과 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
