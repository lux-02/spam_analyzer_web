/**
 * 요청자의 IP. Vercel 은 x-forwarded-for 첫 값에 실제 접속 IP 를 넣는다.
 * @param {Object} req - Next.js request 객체
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}
