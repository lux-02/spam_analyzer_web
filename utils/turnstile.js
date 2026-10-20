const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5000;

/**
 * 사이트 키(브라우저 빌드에 들어감)와 시크릿 키가 둘 다 있어야 사람 확인을 켠다.
 * 한쪽만 있으면 위젯이 안 뜨는데 서버는 토큰을 요구해 모든 분석이 막히기 때문이다.
 * @returns {boolean}
 */
export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

/**
 * Cloudflare Turnstile 토큰 검증
 *
 * - 키가 둘 다 설정되지 않았으면 검증을 건너뛴다(로컬 개발·키 등록 전).
 * - Cloudflare 에 닿지 못하면 통과시킨다. 하루 횟수 제한이 따로 있어서,
 *   Cloudflare 장애 때 모든 분석이 막히는 쪽보다 낫다고 본다.
 * @param {string} token - 브라우저 위젯이 발급한 토큰
 * @param {string} ip - 요청자 IP
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string }>}
 */
export async function verifyTurnstile(token, ip) {
  if (!isTurnstileConfigured()) {
    return { ok: true, skipped: true };
  }

  if (typeof token !== "string" || !token) {
    return { ok: false, reason: "missing_token" };
  }

  const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token });
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    const result = await response.json();
    if (result.success) return { ok: true };
    return { ok: false, reason: (result["error-codes"] || []).join(",") || "rejected" };
  } catch (error) {
    console.error("Turnstile 검증 요청 실패, 통과 처리:", error);
    return { ok: true, skipped: true, reason: "verify_unreachable" };
  }
}
