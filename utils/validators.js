/**
 * 이메일 원문 데이터의 유효성을 검증합니다
 * @param {string} rawData - 검증할 이메일 원문 데이터
 * @returns {Object} 유효성 검증 결과
 */
export const isValidEmailRawData = (rawData) => {
  // 필수 이메일 헤더 필드 중 최소 1개 이상 존재하는지 확인
  const requiredHeaders = [
    "From:",
    "To:",
    "Subject:",
    "Date:",
    "Received:",
    "Message-ID:",
  ];
  const foundHeaders = requiredHeaders.filter((header) =>
    rawData.includes(header)
  );

  // 최소 길이 확인 (메일 원문은 보통 수백 바이트 이상)
  const minLength = 100;

  // 이메일 본문 구분자가 있는지 확인
  const hasBodySeparator = rawData.includes("\n\n");

  // 검증 결과
  return {
    isValid:
      foundHeaders.length >= 1 &&
      rawData.length > minLength &&
      hasBodySeparator,
    reason:
      foundHeaders.length < 1
        ? "이메일 헤더 정보가 부족합니다."
        : rawData.length <= minLength
        ? "메일 원문 데이터가 너무 짧습니다."
        : !hasBodySeparator
        ? "이메일 형식이 올바르지 않습니다."
        : "",
  };
};
