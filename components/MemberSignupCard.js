import { useState } from "react";
import Link from "next/link";
import { DEFAULT_DAILY_LIMIT } from "@/utils/quotaConfig";
import { trackEvent } from "@/utils/analytics";

const COPY = {
  result: {
    title: "이 결과, 다음에도 다시 보고 싶다면",
    body: `지금은 결과가 이 브라우저 창에만 남고, 무료 분석은 하루 ${DEFAULT_DAILY_LIMIT}회까지입니다. 분석 기록 저장과 더 넉넉한 분석 횟수를 회원 기능으로 준비하고 있어요. 이메일을 남겨 주시면 열리는 날 먼저 알려 드릴게요.`,
  },
  limit: {
    title: "오늘 무료 분석을 모두 쓰셨어요",
    body: `무료 분석은 하루 ${DEFAULT_DAILY_LIMIT}회이고, 한국 시간 0시에 다시 채워집니다. 더 자주 쓰셔야 한다면 준비 중인 회원 기능 알림을 받아 보세요.`,
  },
};

/**
 * 회원 기능 사전등록 카드. 실제 가입이 아니라 오픈 알림용 이메일만 받는다.
 * @param {{ variant?: "result" | "limit", remaining?: number | null, className?: string }} props
 */
export default function MemberSignupCard({ variant = "result", remaining = null, className = "" }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const copy = COPY[variant] || COPY.result;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!consent) {
      setStatus("error");
      setMessage("개인정보 수집·이용에 동의해 주세요.");
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/member-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.fields?.email || data.error || "등록하지 못했습니다.");
      }
      setStatus("done");
      trackEvent("generate_lead", { lead_source: "member_waitlist", placement: variant });
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <section className={`mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 ${className}`}>
      <h2 className="text-xl font-bold text-heading dark:text-white">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-light dark:text-gray-300">{copy.body}</p>
      {variant === "result" && typeof remaining === "number" && (
        <p className="mt-2 text-sm font-semibold text-primary">
          오늘 남은 무료 분석: {remaining}회
        </p>
      )}

      {status === "done" ? (
        <p className="mt-4 text-sm font-semibold text-heading dark:text-white">
          등록했습니다. 회원 기능이 열리면 이 주소로 알려 드릴게요.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`member-email-${variant}`} className="sr-only">
              이메일
            </label>
            <input
              id={`member-email-${variant}`}
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="form-input flex-1"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn-primary whitespace-nowrap"
            >
              {status === "submitting" ? "등록 중..." : "오픈 알림 받기"}
            </button>
          </div>
          {/* 봇만 채우는 숨은 입력란 */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="hidden"
            aria-hidden="true"
          />
          <label className="flex items-start gap-2 text-xs text-text-light dark:text-gray-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              회원 기능 오픈 안내를 위해 이메일을 수집·이용하는 데 동의합니다. 1년 동안
              보관하며, 언제든 삭제를 요청할 수 있습니다.
              <Link href="/privacy-policy" target="_blank" className="ml-1 text-primary hover:underline">
                개인정보 처리방침
              </Link>
            </span>
          </label>
          {status === "error" && message && (
            <p className="text-xs text-red-500">{message}</p>
          )}
        </form>
      )}
    </section>
  );
}
