import { connectToDatabase, AnalysisResult } from "./db";

/**
 * 모든 분석 결과의 요약 목록을 가져옵니다.
 * @param {Number} limit - 최대 조회 개수
 * @param {Number} skip - 건너뛸 문서 수 (페이지네이션)
 * @returns {Promise<Array>} 분석 결과 요약 목록
 */
export async function getAnalysisSummaries(limit = 50, skip = 0) {
  await connectToDatabase();

  // 기본 정보만 투영하여 최신순으로 조회
  const summaries = await AnalysisResult.find(
    {},
    {
      id: 1,
      timestamp: 1,
      from: 1,
      to: 1,
      subject: 1,
      "risk.score": 1,
      "risk.level": 1,
      _id: 0,
    }
  )
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

  return summaries;
}

/**
 * 위험도 수준별 분석 결과 개수를 집계합니다.
 * @returns {Promise<Object>} 위험도 수준별 개수
 */
export async function getRiskLevelStats() {
  await connectToDatabase();

  const stats = await AnalysisResult.aggregate([
    {
      $group: {
        _id: "$risk.level",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 조회 결과를 가독성 있는 형태로 변환
  const formattedStats = {};
  stats.forEach((item) => {
    formattedStats[item._id] = item.count;
  });

  return formattedStats;
}

/**
 * 특정 필드에 특정 값이 포함된 분석 결과를 검색합니다.
 * @param {String} field - 검색할 필드명
 * @param {String} value - 검색할 값
 * @param {Number} limit - 최대 조회 개수
 * @returns {Promise<Array>} 검색 결과 목록
 */
export async function searchAnalysisResults(field, value, limit = 20) {
  await connectToDatabase();

  // 검색 쿼리 구성
  const query = {};

  // 필드가 문자열이라면 부분 일치 검색
  if (["from", "to", "subject"].includes(field)) {
    query[field] = { $regex: value, $options: "i" };
  }
  // IP 주소 검색
  else if (field === "ipAddress") {
    query["ipAddresses"] = { $in: [value] };
  }
  // 도메인 검색
  else if (field === "domain") {
    query["domains"] = { $in: [value] };
  }
  // 위험도 수준 검색
  else if (field === "riskLevel") {
    query["risk.level"] = value;
  }
  // 기본 필드 검색
  else {
    query[field] = value;
  }

  // 요약 데이터만 조회
  const results = await AnalysisResult.find(query, {
    id: 1,
    timestamp: 1,
    from: 1,
    to: 1,
    subject: 1,
    "risk.score": 1,
    "risk.level": 1,
    _id: 0,
  })
    .sort({ timestamp: -1 })
    .limit(limit);

  return results;
}

/**
 * MongoDB 연결 상태를 확인합니다.
 * @returns {Promise<Boolean>} 연결 상태
 */
export async function checkDatabaseConnection() {
  try {
    await connectToDatabase();
    return true;
  } catch (error) {
    console.error("MongoDB 연결 확인 실패:", error);
    return false;
  }
}
