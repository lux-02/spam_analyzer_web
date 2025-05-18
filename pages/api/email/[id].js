import { getResult, initializeStorage } from "../analyze-email";

export default async function handler(req, res) {
  // 스토리지 초기화 확인
  await initializeStorage();

  const { id } = req.query;

  if (!id) {
    console.log("API Error: 분석 ID가 누락됨");
    return res.status(400).json({ error: "분석 ID가 필요합니다." });
  }

  console.log(`ID ${id}에 대한 분석 결과 요청`);

  // MongoDB에서 분석 결과 조회
  const result = await getResult(id);

  if (!result) {
    console.log(`API Error: ID ${id}에 대한 분석 결과 없음`);
    return res.status(404).json({
      error: "해당 ID의 분석 결과를 찾을 수 없습니다.",
      message: "분석 결과가 만료되었거나 유효하지 않은 ID입니다.",
    });
  }

  console.log(`ID ${id}에 대한 분석 결과 반환 성공`);
  return res.status(200).json(result);
}
