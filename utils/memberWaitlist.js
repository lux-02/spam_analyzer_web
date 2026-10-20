import { getSql } from "./db";

const EMAIL_MAX = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * 회원 사전등록 입력값 검증
 * @param {Object} body - 요청 본문
 * @returns {{ valid: boolean, errors: Object, data: Object }}
 */
export function validateMemberWaitlistInput(body) {
  const source = body && typeof body === "object" ? body : {};
  const data = {
    email: typeof source.email === "string" ? source.email.trim().toLowerCase() : "",
    consent: source.consent === true,
  };

  const errors = {};
  if (!data.email) errors.email = "이메일을 입력해 주세요.";
  else if (data.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(data.email))
    errors.email = "이메일 형식을 확인해 주세요.";

  if (!data.consent) errors.consent = "개인정보 수집·이용에 동의해야 등록할 수 있습니다.";

  return { valid: Object.keys(errors).length === 0, errors, data };
}

/**
 * 회원 사전등록 저장. 같은 이메일로 다시 등록하면 동의 시각만 새로 고친다.
 * @param {Object} data - 검증을 통과한 입력값
 * @returns {Promise<{ saved: boolean, reason?: string }>}
 */
export async function saveMemberWaitlist(data) {
  const sql = getSql();
  if (!sql) {
    return { saved: false, reason: "no_client" };
  }

  try {
    await sql`
      INSERT INTO member_waitlist (email, consented_at)
      VALUES (${data.email}, NOW())
      ON CONFLICT (email)
      DO UPDATE SET consented_at = NOW(),
                    expires_at = NOW() + INTERVAL '1 year'
    `;
    return { saved: true };
  } catch (error) {
    console.error("회원 사전등록 저장 오류:", error);
    return { saved: false, reason: error.code === "42P01" ? "table_missing" : "insert_error" };
  }
}
