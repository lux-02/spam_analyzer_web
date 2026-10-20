import { getClientIp } from "./clientIp";
import { verifyTurnstile } from "./turnstile";
import { consumeDailyQuota, refundDailyQuota } from "./dailyQuota";

/**
 * 분석 API 공통 관문: 사람 확인(Turnstile) → 하루 횟수 차감
 * 사람 확인에 실패하면 횟수를 차감하지 않는다.
 * @param {Object} req - Next.js request 객체
 * @param {{ requireHuman?: boolean }} options - 브라우저 위젯을 띄울 수 없는 외부 API 는 false
 * @returns {Promise<{ ok: true, quota: Object } | { ok: false, status: number, body: Object }>}
 */
export async function guardAnalysisRequest(req, { requireHuman = true } = {}) {
  const ip = getClientIp(req);

  const human = requireHuman
    ? await verifyTurnstile(req.body?.turnstileToken, ip)
    : { ok: true, skipped: true };
  if (!human.ok) {
    return {
      ok: false,
      status: 403,
      body: {
        success: false,
        code: "turnstile_failed",
        error: "사람 확인이 끝나지 않았습니다. 확인 상자를 다시 체크한 뒤 분석해 주세요.",
      },
    };
  }

  const quota = await consumeDailyQuota(ip);
  if (!quota.allowed) {
    return {
      ok: false,
      status: 429,
      body: {
        success: false,
        code: "daily_limit",
        error: `오늘 무료 분석 ${quota.limit}회를 모두 쓰셨습니다. 내일 0시(한국 시간)에 다시 쓸 수 있습니다.`,
        quota: { limit: quota.limit, remaining: 0 },
      },
    };
  }

  return { ok: true, quota: { limit: quota.limit, remaining: quota.remaining } };
}

/**
 * 관문을 통과한 뒤 서버 오류로 분석이 실패하면 차감한 1회를 돌려준다.
 * @param {Object} req - Next.js request 객체
 * @returns {Promise<void>}
 */
export function refundAnalysisRequest(req) {
  return refundDailyQuota(getClientIp(req));
}
