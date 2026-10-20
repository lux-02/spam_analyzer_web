import {
  validateEnterpriseBetaInput,
  saveEnterpriseBetaRequest,
} from "../../utils/enterpriseBeta";
import { getClientIp } from "../../utils/clientIp";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const FALLBACK_EMAIL = "darkwinterlab@gmail.com";

// 서버리스 인스턴스 단위의 간단한 제출 제한(같은 IP 1시간 5회)
const submissions = new Map();

const isRateLimited = (ip, now = Date.now()) => {
  const recent = (submissions.get(ip) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }
  submissions.set(ip, [...recent, now]);
  return false;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // 사람에게는 보이지 않는 입력란. 값이 있으면 봇으로 보고 조용히 성공 처리한다.
  if (typeof req.body?.website === "string" && req.body.website.trim()) {
    return res.status(200).json({ success: true });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({
      success: false,
      error: "신청이 너무 많이 들어왔습니다. 잠시 후 다시 시도해 주세요.",
    });
  }

  const { valid, errors, data } = validateEnterpriseBetaInput(req.body);
  if (!valid) {
    return res.status(400).json({
      success: false,
      error: "입력값을 확인해 주세요.",
      fields: errors,
    });
  }

  const result = await saveEnterpriseBetaRequest(data);
  if (!result.saved) {
    return res.status(503).json({
      success: false,
      error: `신청을 저장하지 못했습니다. ${FALLBACK_EMAIL} 로 보내 주시면 같은 순서로 확인하겠습니다.`,
    });
  }

  return res.status(201).json({ success: true });
}
