import { getSql } from "./db";
import {
  VOLUME_OPTIONS,
  INTEGRATION_OPTIONS,
  IOC_FORMAT_OPTIONS,
} from "./enterpriseBetaOptions";

const LIMITS = {
  organization: 100,
  name: 50,
  email: 254,
  message: 2000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const allowedValues = (options) => new Set(options.map((option) => option.value));

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

const cleanList = (value, options) => {
  if (!Array.isArray(value)) return [];
  const allowed = allowedValues(options);
  return [...new Set(value.filter((item) => allowed.has(item)))];
};

/**
 * 기업용 베타 사전신청 입력값 검증
 * @param {Object} body - 요청 본문
 * @returns {{ valid: boolean, errors: Object, data: Object }}
 */
export function validateEnterpriseBetaInput(body) {
  const source = body && typeof body === "object" ? body : {};
  const data = {
    organization: cleanText(source.organization),
    name: cleanText(source.name),
    email: cleanText(source.email).toLowerCase(),
    volume: cleanText(source.volume),
    integrations: cleanList(source.integrations, INTEGRATION_OPTIONS),
    iocFormats: cleanList(source.iocFormats, IOC_FORMAT_OPTIONS),
    message: cleanText(source.message),
    consent: source.consent === true,
  };

  const errors = {};
  if (!data.organization) errors.organization = "회사·기관명을 입력해 주세요.";
  else if (data.organization.length > LIMITS.organization)
    errors.organization = `회사·기관명은 ${LIMITS.organization}자 이내로 입력해 주세요.`;

  if (!data.name) errors.name = "담당자 이름을 입력해 주세요.";
  else if (data.name.length > LIMITS.name)
    errors.name = `이름은 ${LIMITS.name}자 이내로 입력해 주세요.`;

  if (!data.email) errors.email = "업무용 이메일을 입력해 주세요.";
  else if (data.email.length > LIMITS.email || !EMAIL_PATTERN.test(data.email))
    errors.email = "이메일 형식을 확인해 주세요.";

  if (!allowedValues(VOLUME_OPTIONS).has(data.volume))
    errors.volume = "하루 신고 메일 규모를 골라 주세요.";

  if (data.message.length > LIMITS.message)
    errors.message = `기타 요청은 ${LIMITS.message}자 이내로 입력해 주세요.`;

  if (!data.consent) errors.consent = "개인정보 수집·이용에 동의해야 신청할 수 있습니다.";

  return { valid: Object.keys(errors).length === 0, errors, data };
}

/**
 * 기업용 베타 사전신청 저장
 * @param {Object} data - 검증을 통과한 입력값
 * @returns {Promise<{ saved: boolean, reason?: string }>}
 */
export async function saveEnterpriseBetaRequest(data) {
  const sql = getSql();
  if (!sql) {
    return { saved: false, reason: "no_client" };
  }

  try {
    await sql`
      INSERT INTO enterprise_beta_requests
        (organization, contact_name, contact_email, daily_volume,
         integrations, ioc_formats, message, consented_at)
      VALUES
        (${data.organization}, ${data.name}, ${data.email}, ${data.volume},
         ${data.integrations}, ${data.iocFormats}, ${data.message || null}, NOW())
    `;
    return { saved: true };
  } catch (error) {
    console.error("기업용 베타 신청 저장 오류:", error);
    return { saved: false, reason: error.code === "42P01" ? "table_missing" : "insert_error" };
  }
}
