import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  VOLUME_OPTIONS,
  INTEGRATION_OPTIONS,
  IOC_FORMAT_OPTIONS,
} from "@/utils/enterpriseBetaOptions";
import { trackEvent } from "@/utils/analytics";

const FALLBACK_EMAIL = "darkwinterlab@gmail.com";

const INITIAL_FORM = {
  organization: "",
  name: "",
  email: "",
  volume: "",
  integrations: [],
  iocFormats: [],
  message: "",
  consent: false,
  website: "",
};

const PLANNED_FEATURES = [
  {
    title: "신고 메일 일괄 분류",
    body: "임직원이 신고한 의심 메일을 한꺼번에 받아 위험도 순으로 정리합니다.",
  },
  {
    title: "API 연동",
    body: "SIEM·SOAR·티켓 시스템에서 분석을 호출하고 결과를 받아 갑니다.",
  },
  {
    title: "IOC 내보내기",
    body: "분석 결과에서 발신 주소, URL, 도메인, IP를 정해진 형식으로 뽑아 줍니다.",
  },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}

function CheckboxGroup({ legend, name, options, selected, onToggle }) {
  return (
    <fieldset>
      <legend className="form-label dark:text-white">{legend}</legend>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-text dark:text-gray-200"
          >
            <input
              type="checkbox"
              className="form-checkbox"
              name={name}
              value={option.value}
              checked={selected.includes(option.value)}
              onChange={() => onToggle(name, option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function EnterpriseBeta() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleListValue = (name, value) => {
    setForm((prev) => {
      const current = prev[name];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [name]: next };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/enterprise-beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        setFieldErrors(result.fields || {});
        setErrorMessage(result.error || "신청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setStatus("error");
        return;
      }

      setStatus("done");
      trackEvent("generate_lead", { lead_source: "enterprise_beta", daily_volume: form.volume });
      setForm(INITIAL_FORM);
    } catch (error) {
      console.error("기업용 베타 신청 전송 실패:", error);
      setErrorMessage(
        `네트워크 문제로 신청을 보내지 못했습니다. ${FALLBACK_EMAIL} 로 보내 주셔도 됩니다.`
      );
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-text dark:bg-gray-900 dark:text-white">
      <Head>
        <title>기업용 베타 사전신청 - NAVER MAIL ANALYZER</title>
        <meta
          name="description"
          content="신고 메일 일괄 분류, API 연동, IOC 내보내기를 준비하고 있습니다. 필요한 기능을 알려 주시면 우선순위에 반영합니다."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NAVER MAIL ANALYZER" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:title" content="기업용 베타 사전신청 - NAVER MAIL ANALYZER" />
        <meta
          property="og:description"
          content="신고 메일 일괄 분류, API 연동, IOC 내보내기를 준비하고 있습니다."
        />
        <meta property="og:image" content="https://mail.n2f.site/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://mail.n2f.site/enterprise" />
        <link rel="canonical" href="https://mail.n2f.site/enterprise" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://mail.n2f.site/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/naver"
            className="text-lg font-bold tracking-wide text-heading hover:text-primary dark:text-white"
          >
            NAVER MAIL ANALYZER
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[1fr_1.3fr]">
          <section>
            <p className="text-sm text-text-light dark:text-gray-400">기업용 베타 사전신청</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-heading dark:text-white">
              보안 담당자가 쓰는 기능을
              <br />
              먼저 만들려고 합니다
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-text-light dark:text-gray-300">
              가격은 아직 정하지 않았습니다. 하루에 신고 메일이 얼마나 들어오는지,
              어떤 시스템과 붙여야 하는지 알려 주시면 그 순서대로 만들고, 베타가
              열리면 신청하신 순서대로 연락드립니다.
            </p>

            <dl className="mt-8 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {PLANNED_FEATURES.map((feature) => (
                <div key={feature.title} className="py-4">
                  <dt className="font-semibold text-heading dark:text-white">{feature.title}</dt>
                  <dd className="mt-1 text-sm text-text-light dark:text-gray-300">{feature.body}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs text-text-light dark:text-gray-400">
              폼 대신 메일로 보내셔도 됩니다:{" "}
              <a href={`mailto:${FALLBACK_EMAIL}?subject=기업용%20베타%20사전신청`} className="underline">
                {FALLBACK_EMAIL}
              </a>
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-custom dark:bg-box">
            {status === "done" ? (
              <div role="status" className="py-10">
                <h2 className="text-xl font-bold text-heading dark:text-white">신청을 받았습니다</h2>
                <p className="mt-3 text-sm text-text-light dark:text-gray-300">
                  남겨 주신 업무용 이메일로 베타 일정이 정해지면 연락드리겠습니다.
                  그동안 개별 메일 분석은 지금처럼 무료로 쓰실 수 있습니다.
                </p>
                <Link href="/naver#analyze" className="btn-primary mt-6">
                  메일 분석하러 가기
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="organization" className="form-label dark:text-white">
                    회사·기관명
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    className="form-input"
                    maxLength={100}
                    autoComplete="organization"
                    value={form.organization}
                    onChange={updateField}
                    required
                  />
                  <FieldError message={fieldErrors.organization} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="form-label dark:text-white">
                      담당자 이름
                    </label>
                    <input
                      id="name"
                      name="name"
                      className="form-input"
                      maxLength={50}
                      autoComplete="name"
                      value={form.name}
                      onChange={updateField}
                      required
                    />
                    <FieldError message={fieldErrors.name} />
                  </div>
                  <div>
                    <label htmlFor="email" className="form-label dark:text-white">
                      업무용 이메일
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      maxLength={254}
                      autoComplete="email"
                      value={form.email}
                      onChange={updateField}
                      required
                    />
                    <FieldError message={fieldErrors.email} />
                  </div>
                </div>

                <div>
                  <label htmlFor="volume" className="form-label dark:text-white">
                    하루에 들어오는 신고 메일
                  </label>
                  <select
                    id="volume"
                    name="volume"
                    className="form-select"
                    value={form.volume}
                    onChange={updateField}
                    required
                  >
                    <option value="">골라 주세요</option>
                    {VOLUME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.volume} />
                </div>

                <CheckboxGroup
                  legend="연동이 필요한 곳 (여러 개 고를 수 있음)"
                  name="integrations"
                  options={INTEGRATION_OPTIONS}
                  selected={form.integrations}
                  onToggle={toggleListValue}
                />

                <CheckboxGroup
                  legend="받고 싶은 IOC 형식 (여러 개 고를 수 있음)"
                  name="iocFormats"
                  options={IOC_FORMAT_OPTIONS}
                  selected={form.iocFormats}
                  onToggle={toggleListValue}
                />

                <div>
                  <label htmlFor="message" className="form-label dark:text-white">
                    그 밖에 필요한 기능 (선택)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    maxLength={2000}
                    value={form.message}
                    onChange={updateField}
                  />
                  <FieldError message={fieldErrors.message} />
                </div>

                {/* 봇 차단용 입력란. 화면과 보조기기에서 모두 숨긴다. */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">웹사이트</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={updateField}
                  />
                </div>

                <div className="rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-text-light dark:bg-box-light dark:text-gray-300">
                  <p>수집 항목: 회사·기관명, 담당자 이름, 업무용 이메일, 신고 메일 규모, 연동·IOC 형식, 기타 요청</p>
                  <p>이용 목적: 기업용 베타 수요 조사와 베타 오픈 안내</p>
                  <p>보유 기간: 신청일로부터 1년, 또는 삭제를 요청하실 때까지</p>
                  <p className="mt-1">
                    동의하지 않으셔도 되지만, 그 경우 신청을 받을 수 없습니다. 자세한 내용은{" "}
                    <Link href="/privacy-policy" className="underline">
                      개인정보 처리방침
                    </Link>
                    에 있습니다.
                  </p>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-text dark:text-white">
                    <input
                      type="checkbox"
                      name="consent"
                      className="form-checkbox"
                      checked={form.consent}
                      onChange={updateField}
                      required
                    />
                    위 내용을 읽었고, 개인정보 수집·이용에 동의합니다.
                  </label>
                  <FieldError message={fieldErrors.consent} />
                </div>

                {status === "error" && errorMessage && (
                  <p role="alert" className="text-sm text-danger">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "보내는 중…" : "사전신청 보내기"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
