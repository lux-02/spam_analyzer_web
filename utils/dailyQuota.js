import { createHmac } from "crypto";
import { getSql } from "./db";
import { DEFAULT_DAILY_LIMIT } from "./quotaConfig";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const CLEANUP_PROBABILITY = 0.02;
const FALLBACK_SALT = "mail.n2f.site";

// DB 를 쓸 수 없을 때만 쓰는 인스턴스 단위 카운터
const memoryCounts = new Map();

/**
 * 하루 분석 허용 횟수(ANALYSIS_DAILY_LIMIT, 기본 5)
 * @returns {number}
 */
export function getDailyLimit() {
  const parsed = Number.parseInt(process.env.ANALYSIS_DAILY_LIMIT, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT;
}

/**
 * 한국 시간 기준 날짜(YYYY-MM-DD). 자정(KST)에 횟수가 초기화된다.
 * @param {number} now - 기준 시각(ms)
 * @returns {string}
 */
export function kstDate(now = Date.now()) {
  return new Date(now + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * 횟수를 셀 단위. IPv4 는 주소 그대로, IPv6 는 앞 64비트(/64)로 묶는다.
 * IPv6 사용자는 보통 /64 대역 안에서 주소를 마음대로 바꿀 수 있기 때문이다.
 * @param {string} ip
 * @returns {string}
 */
export function quotaSubject(ip) {
  const value = String(ip || "unknown").trim().toLowerCase();
  const mapped = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  if (!value.includes(":")) return value;

  const [head, tail = ""] = value.split("%")[0].split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = value.includes("::") && tail ? tail.split(":") : [];
  const missing = Math.max(8 - headGroups.length - tailGroups.length, 0);
  const groups = value.includes("::")
    ? [...headGroups, ...Array(missing).fill("0"), ...tailGroups]
    : headGroups;
  return `${groups.slice(0, 4).map((group) => group.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

/**
 * IP 는 원문으로 저장하지 않고, 비밀 솔트(QUOTA_SALT)와 날짜를 섞은 HMAC-SHA256 으로만 저장한다(가명처리).
 * @param {string} ip
 * @param {string} date
 * @returns {string}
 */
export function hashIp(ip, date) {
  const salt = process.env.QUOTA_SALT;
  if (!salt && process.env.NODE_ENV === "production") {
    console.warn("QUOTA_SALT 미설정: 공개된 기본 솔트로 IP 를 가명처리합니다");
  }
  return createHmac("sha256", salt || FALLBACK_SALT)
    .update(`${date}:${quotaSubject(ip)}`)
    .digest("hex");
}

const toResult = (count, limit) => ({
  allowed: count <= limit,
  limit,
  remaining: Math.max(limit - count, 0),
});

const addInMemory = (key, delta, limit) => {
  const count = Math.max((memoryCounts.get(key) || 0) + delta, 0);
  memoryCounts.set(key, count);
  return toResult(count, limit);
};

/**
 * 오늘 분석 1회를 차감한다. 한도를 넘으면 allowed=false.
 * @param {string} ip - 요청자 IP
 * @returns {Promise<{ allowed: boolean, limit: number, remaining: number }>}
 */
export async function consumeDailyQuota(ip) {
  const limit = getDailyLimit();
  const date = kstDate();
  const ipHash = hashIp(ip, date);

  const sql = getSql();
  if (!sql) {
    return addInMemory(`${date}:${ipHash}`, 1, limit);
  }

  try {
    const rows = await sql`
      INSERT INTO analysis_daily_usage (ip_hash, usage_date, request_count)
      VALUES (${ipHash}, ${date}, 1)
      ON CONFLICT (ip_hash, usage_date)
      DO UPDATE SET request_count = analysis_daily_usage.request_count + 1,
                    updated_at = NOW()
      RETURNING request_count
    `;
    // 처리방침의 보유기간(7일)을 지키기 위해 요청 50번 중 1번꼴로 지난 기록을 지운다
    if (Math.random() < CLEANUP_PROBABILITY) {
      try {
        await sql`DELETE FROM analysis_daily_usage WHERE usage_date < ${date}::date - INTERVAL '7 days'`;
      } catch (cleanupError) {
        console.error("지난 분석 횟수 기록 삭제 오류:", cleanupError);
      }
    }
    return toResult(Number(rows[0].request_count), limit);
  } catch (error) {
    console.error("분석 횟수 기록 오류, 메모리 카운터 사용:", error);
    return addInMemory(`${date}:${ipHash}`, 1, limit);
  }
}

/**
 * 서버 오류로 분석이 끝나지 못했을 때 차감한 1회를 돌려준다.
 * @param {string} ip - 요청자 IP
 * @returns {Promise<void>}
 */
export async function refundDailyQuota(ip) {
  const limit = getDailyLimit();
  const date = kstDate();
  const ipHash = hashIp(ip, date);

  const sql = getSql();
  if (!sql) {
    addInMemory(`${date}:${ipHash}`, -1, limit);
    return;
  }

  try {
    await sql`
      UPDATE analysis_daily_usage
      SET request_count = GREATEST(request_count - 1, 0), updated_at = NOW()
      WHERE ip_hash = ${ipHash} AND usage_date = ${date}
    `;
  } catch (error) {
    console.error("분석 횟수 반환 오류:", error);
  }
}
