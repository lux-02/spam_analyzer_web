export default async function handler(req, res) {
  const { id } = req.query;

  return res.status(410).json({
    error: "분석 결과 서버 저장이 비활성화되었습니다.",
    message:
      "개인정보 보호를 위해 분석 데이터는 서버 DB에 저장하지 않습니다. 결과는 분석 직후 동일 브라우저 세션에서만 확인할 수 있으며, URL만으로는 재현되지 않습니다.",
    id,
  });
}
