export default async function handler(req, res) {
  const { id } = req.query;

  return res.status(410).json({
    error: "분석 결과 서버 저장이 비활성화되었습니다.",
    message:
      "개인정보 보호를 위해 분석 데이터는 서버에 저장하지 않습니다. 분석 직후 전달된 결과 링크 또는 동일 브라우저 세션에서만 확인할 수 있습니다.",
    id,
  });
}
