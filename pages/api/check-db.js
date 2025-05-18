import {
  checkDatabaseConnection,
  getRiskLevelStats,
} from "../../utils/dbHelper";

export default async function handler(req, res) {
  try {
    // 데이터베이스 연결 확인
    const isConnected = await checkDatabaseConnection();

    if (!isConnected) {
      return res.status(500).json({
        connected: false,
        error: "MongoDB 연결에 실패했습니다.",
      });
    }

    // 기본 통계 정보도 가져옴
    let stats = null;
    try {
      stats = await getRiskLevelStats();
    } catch (statsError) {
      console.error("통계 정보 조회 실패:", statsError);
    }

    return res.status(200).json({
      connected: true,
      message: "MongoDB 연결이 정상적으로 작동 중입니다.",
      stats,
      server:
        process.env.MONGODB_URI || "mongodb://localhost:27017/spam_analyzer",
    });
  } catch (error) {
    console.error("DB 연결 확인 중 오류 발생:", error);
    return res.status(500).json({
      connected: false,
      error: "데이터베이스 연결 확인 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
