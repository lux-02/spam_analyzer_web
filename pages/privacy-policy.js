import Head from "next/head";
import Link from "next/link";
import Footer from "../components/ui/Footer";

const effectiveDate = "2026년 3월 9일 (March 9, 2026)";
const contactEmail = "darkwinterlab@gmail.com";
const serviceUrl = "https://naver.darkwinterlab.com";
const privacyDeskKo = "개인정보 보호업무 및 고충처리 담당";
const privacyDeskEn = "Privacy Desk and Complaint Handling";

const sections = [
  {
    title: "1. 제출 시 일시 처리되는 정보 / Information Processed When You Submit",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "NAVER MAIL ANALYZER는 제15조 및 제16조에 따라 사용자가 직접 붙여넣거나, 확장앱에서 명시적으로 실행해 전달한 메일에 한해 분석에 필요한 최소 범위의 정보를 처리하려고 합니다. 아래 설명은 분석 목적의 일시 처리를 의미하며, 곧바로 서버 영구 보관을 뜻하지 않습니다.",
        bullets: [
          "이메일 원문 및 그 안에 포함된 헤더/본문/HTML 정보: From, To, Subject, Return-Path, Reply-To, Message-ID, Received 헤더 등 메일 분석에 필요한 항목",
          "파생 보안 정보: SPF, DKIM, DMARC 결과, 발신 경로, 추출된 URL/도메인/IP, 첨부파일 이름 및 형식 등",
          "분석 결과 정보: 위험도 점수, 규칙 기반 탐지 결과, AI 의도 분석 결과, 분석 시각, 분석 ID",
          "브라우저 측 편의 정보: 동일 브라우저 세션 결과 표시를 위한 sessionStorage, 테마/캐시/실패 도메인/최근 분석 ID 저장용 localStorage",
          "서비스 안정성 확인을 위한 최소 운영 정보: 오류 로그, 요청 성공/실패 여부 등 비식별 운영 메타데이터",
          "주의사항: 서비스는 민감정보나 주민등록번호 등 고유식별정보 입력을 요구하지 않으며, 가능한 경우 제출 전에 마스킹을 권장합니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "NAVER MAIL ANALYZER seeks to process only the minimum information necessary for analysis under Articles 15 and 16 of the Personal Information Protection Act, and only for emails that the user explicitly pastes into the web app or sends from the browser extension by direct action. The items below describe transient processing for analysis and do not by themselves mean persistent server retention.",
        bullets: [
          "Raw email content and embedded header/body/HTML information needed for analysis, including From, To, Subject, Return-Path, Reply-To, Message-ID, and Received headers",
          "Derived security signals such as SPF, DKIM, and DMARC results, delivery path details, extracted URLs/domains/IPs, and attachment names or types when detectable",
          "Analysis output such as risk score, rule-based findings, AI intent analysis, analysis timestamp, and analysis ID",
          "Browser-side convenience data including sessionStorage for same-browser result viewing and localStorage for theme, cache, failed-domain state, and recent analysis ID",
          "Minimal operational metadata such as error logs and request success/failure status used to keep the service reliable",
          "Caution: The service does not require sensitive data or unique identifiers such as resident registration numbers, and masking them before submission is recommended whenever possible",
        ],
      },
    ],
  },
  {
    title: "2. 이용 목적 / Purpose of Processing",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro: "처리되는 정보는 아래 목적에 한해 사용됩니다.",
        bullets: [
          "이메일의 스팸, 피싱, 사기, 악성 링크 및 위장 발신 가능성 분석",
          "SPF, DKIM, DMARC 및 발신 경로 검증",
          "본문 링크, 도메인, IP 주소의 평판 확인",
          "AI 기반 메일 의도 요약 및 사용자 인사이트 제공",
          "웹 결과 페이지 렌더링 및 동일 브라우저 내 결과 재확인 지원",
          "오류 대응, 성능 확인, 보안 모니터링 등 서비스 운영 안정성 확보",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro: "The processed information is used only for the following purposes.",
        bullets: [
          "Analyzing whether an email may be spam, phishing, scam, spoofed, or contain malicious links",
          "Verifying SPF, DKIM, DMARC, and email delivery path signals",
          "Checking the reputation of links, domains, and IP addresses found in the email",
          "Providing AI-assisted intent summaries and user-facing insights",
          "Rendering the result page and supporting result viewing in the same browser session",
          "Maintaining service reliability through error handling, performance checks, and security monitoring",
        ],
      },
    ],
  },
  {
    title: "3. 처리 및 보유 기간, 브라우저 저장, 파기 / Retention, Browser Storage, and Destruction",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "현재 일반 분석 흐름에서는 이메일 원문과 전체 분석 결과를 서버 데이터베이스에 영구 보관하지 않습니다. 다만 사용자가 분석을 실행하면 응답 생성 과정에서 네트워크 구간과 서버 메모리를 일시적으로 거칠 수 있습니다.",
        bullets: [
          "이메일 원문, 헤더/본문, 파생 보안 정보: 분석 요청 시점부터 결과 응답 생성 시점까지 일시 처리되며, 일반 분석 경로에서는 서버 DB에 영구 저장하지 않습니다",
          "분석 결과: 결과 페이지 표시에 필요한 범위에서 현재 브라우저 세션(sessionStorage)에 임시 저장되며, 탭·세션 종료 또는 저장소 삭제 시 제거될 수 있습니다",
          "편의용 로컬 캐시: localStorage에는 테마 설정, VirusTotal 결과 캐시, 실패 도메인 목록, 최근 분석 ID 등 편의 기능 관련 정보만 저장되며 이메일 원문 전체를 기본 저장 대상으로 삼지 않습니다",
          "최소 운영 로그: 웹 호스팅 및 인프라 운영 과정에서 필요한 범위의 최소 로그가 생성될 수 있으며, 해당 보유 기간은 관련 사업자의 정책 또는 법령에 따릅니다",
          "외부 공개 아님: 서비스는 사용자가 분석한 이메일 원문이나 전체 결과를 공개 페이지, 검색엔진 색인, 공개 저장소 게시 목적으로 운영하지 않습니다",
          "세션 제한: 현재 기본 구조에서는 결과 URL만 복사해도 다른 브라우저나 다른 세션에서 동일 결과가 재현되지 않도록 설계했습니다",
          "안전성 확보조치: HTTPS/TLS 전송 구간 보호, 서버 환경변수 기반 비밀값 관리, 서버 DB 비보관 구조, 브라우저 세션 중심 결과 전달 방식을 적용합니다",
          "파기: 보유기간의 경과 또는 처리 목적 달성 시 지체 없이 삭제하거나, 현재 구조상 저장소가 없는 경우에는 추가 보관 없이 처리 종료합니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "In the current normal analysis flow, raw emails and full analysis results are not persistently retained in a server-side database. However, once a user runs analysis, the data may transiently pass through network transport and server memory while the response is being generated.",
        bullets: [
          "Raw email content, headers/body, and derived security data: processed only from the time the analysis request is made until the response is generated, and not persistently stored in a server-side database in the normal analysis path",
          "Analysis result: temporarily stored only in the current browser session (sessionStorage) for result-page rendering, and removed when the tab or session ends or storage is cleared",
          "Convenience cache: localStorage is used only for theme preference, VirusTotal cache, failed-domain state, recent analysis ID, and similar convenience features, not as default storage for full raw email content",
          "Minimal operational logs: limited infrastructure logs may be created as needed for web hosting and operations, and their retention is governed by the relevant provider's policy or applicable law",
          "Not publicly published: The service is not operated to publish analyzed raw emails or full results on public pages, search indexes, or public repositories",
          "Session restriction: In the current default flow, copying only the result URL does not reproduce the same result in another browser or a different session",
          "Security measures: HTTPS/TLS in transit, server-side environment variables for secrets, a no-server-DB-retention design, and browser-session-based result handoff are applied",
          "Deletion: When the retention period expires or the processing purpose is achieved, data is deleted without delay, or in this architecture simply not kept any longer than needed",
        ],
      },
    ],
  },
  {
    title: "4. 외부 제공 가능성 및 처리업무 위탁 / External Recipients and Processors",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "분석 요청을 실제 실행하면 아래 외부 사업자 또는 수탁자에게 필요한 범위의 정보가 전달될 수 있습니다. OpenAI, VirusTotal, ipwho.is 연동은 사용자의 분석 실행을 전제로 하며, Vercel은 웹 호스팅과 인프라 운영을 담당합니다.",
        bullets: [
          "OpenAI, LLC: AI 기반 메일 의도 분석 / 전달 항목: 이메일 본문 또는 필요한 일부 문맥 / 보유·이용 기간: 해당 사업자의 정책 및 관련 법령에 따름",
          "VirusTotal: URL·도메인·IP 평판 확인 / 전달 항목: 메일에서 추출된 URL, 도메인, IP 주소 / 보유·이용 기간: 해당 사업자의 정책 및 관련 법령에 따름",
          "ipwho.is: 수신 경로 IP의 국가·도시·ISP 분석 / 전달 항목: 헤더에서 추출된 IP 주소 / 보유·이용 기간: 해당 사업자의 정책 및 관련 법령에 따름",
          "Vercel Inc.: 웹 호스팅, 인프라 운영, 최소 운영 로그 처리 / 위탁 항목: 접속 로그, 오류 로그 등 서비스 운영에 필요한 최소 정보 / 보유·이용 기간: 해당 사업자의 정책 및 관련 법령에 따름",
          "사용자가 분석을 실행하기 전에는 위 외부 전송이 발생하지 않으며, 동의를 거부할 경우 상세 분석 기능을 이용할 수 없습니다",
          "서비스는 법령상 의무가 없는 한 개인정보를 판매하지 않으며, 분석에 제출된 메일 원문을 공개 게시하지 않습니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "When a user actually runs analysis, the minimum necessary information may be transmitted to the external providers or processors listed below. OpenAI, VirusTotal, and ipwho.is are used only after the user triggers analysis, while Vercel is used for hosting and infrastructure operations.",
        bullets: [
          "OpenAI, LLC: AI-assisted intent analysis / Items sent: email body text or limited necessary context / Retention and use period: subject to the provider's policy and applicable law",
          "VirusTotal: reputation lookup for URLs, domains, and IPs / Items sent: URLs, domains, and IP addresses extracted from the email / Retention and use period: subject to the provider's policy and applicable law",
          "ipwho.is: geolocation and ISP lookup for delivery-path IPs / Items sent: IP addresses extracted from headers / Retention and use period: subject to the provider's policy and applicable law",
          "Vercel Inc.: web hosting, infrastructure operations, and minimal operational logging / Items entrusted: minimal access or error logs needed to operate the service / Retention and use period: subject to the provider's policy and applicable law",
          "These external transmissions do not occur until the user runs analysis, and refusing consent means the detailed analysis feature cannot be used",
          "We do not sell personal information unless required by law, and we do not publicly post the raw emails submitted for analysis",
        ],
      },
    ],
  },
  {
    title: "5. 사용자 권리 및 행사 방법 / Your Rights and How to Exercise Them",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro: "사용자는 아래와 같은 방식으로 자신의 데이터 처리 범위를 통제하고 확인할 수 있습니다.",
        bullets: [
          "분석 전 중단 권리: 붙여넣기 또는 확장앱 원문 수집 후에도 분석 버튼을 누르지 않으면 외부 분석 API 호출은 이루어지지 않습니다",
          "열람 권리: 현재 브라우저 세션에서 생성된 결과를 직접 확인할 수 있습니다",
          "정정·삭제·처리정지 요구: sessionStorage/localStorage를 비우거나 브라우저 탭을 종료하여 로컬 결과 및 캐시를 삭제할 수 있고, 추가 처리 중단 요청은 아래 연락처로 문의할 수 있습니다",
          "문의 권리: 처리 방식, 외부 제공 범위, 기술적 보호조치 등에 대해 아래 연락처로 문의할 수 있습니다",
          "제한 사항: 정상 분석 경로에서 서버 영구 저장을 하지 않기 때문에, 세션 종료 후 과거 이메일 원문을 서버에서 다시 제공해 드릴 수는 없습니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro: "Users can control and review the scope of data processing in the following ways.",
        bullets: [
          "Right to stop before analysis: Even after pasting email content or capturing it from the extension, no external analysis API is called unless the user actually submits the analysis request",
          "Right of access: You can view the results generated in your current browser session",
          "Right to correction, erasure, and restriction: You can remove local results and cache by clearing sessionStorage/localStorage or closing the browser tab/session, and you may request additional processing to stop through the contact channel below",
          "Right to inquiry: You may contact us using the details below to ask about processing methods, external sharing scope, or technical safeguards",
          "Practical limitation: Because the normal analysis flow does not use persistent server-side storage, we generally cannot retrieve past raw email content after the session ends",
        ],
      },
    ],
  },
  {
    title: "6. 쿠키 및 브라우저 저장소 / Cookies and Browser Storage",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "본 서비스는 광고 목적의 쿠키를 기본적으로 사용하지 않으며, 핵심 기능 제공을 위해 브라우저 저장소를 사용합니다.",
        bullets: [
          "sessionStorage: analysisResult:<id> 형태로 현재 분석 결과를 동일 브라우저 세션에서 다시 보여주기 위한 임시 저장",
          "localStorage: 테마 설정, VirusTotal 결과 캐시(vtResultsCache), 실패 도메인 목록(vtFailedDomains), 확장앱 최근 분석 ID(lastAnalysisId) 저장",
          "목적: 결과 재열람 편의성, UI 선호도 유지, 반복 평판 조회 최소화",
          "주의: 브라우저 세션이 종료되거나 저장소를 비우면 기존 분석 결과를 다시 열 수 없을 수 있습니다",
          "주의: 브라우저 저장소를 비우면 일부 편의 기능과 재열람 기능이 제한될 수 있습니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "We do not intentionally use advertising cookies by default, but we do use browser storage for essential functionality and convenience.",
        bullets: [
          "sessionStorage: Temporary storage such as analysisResult:<id> used to show the current analysis result again in the same browser session",
          "localStorage: Theme preference, VirusTotal cache (vtResultsCache), failed-domain list (vtFailedDomains), and the extension's recent analysis ID (lastAnalysisId)",
          "Purpose: Result revisiting convenience, UI preference retention, and reduction of repeated reputation lookups",
          "Caution: When the browser session ends or storage is cleared, the same analysis result may no longer be reopenable",
          "Note: Clearing browser storage may limit convenience features and result revisiting",
        ],
      },
    ],
  },
  {
    title: "7. 개인정보 보호업무 및 고충처리 부서 / Privacy Desk and Complaint Handling",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "제30조제1항제6호에 따라 개인정보 보호업무 및 관련 고충사항을 처리하는 연락 창구는 아래와 같습니다.",
        bullets: [
          `담당부서: ${privacyDeskKo}`,
          `연락처(전자우편): ${contactEmail}`,
          `서비스 웹사이트: ${serviceUrl}`,
          "안내 범위: 서버 영구 저장 데이터가 없는 구조이므로, 브라우저 저장소 삭제 방법, 외부 처리 범위, 서버 DB 비보관 구조 중심으로 지원합니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "Under Article 30(1)6, the contact channel responsible for privacy matters and related complaints is as follows.",
        bullets: [
          `Department: ${privacyDeskEn}`,
          `Contact (email): ${contactEmail}`,
          `Service website: ${serviceUrl}`,
          "Support scope: Because the service avoids persistent server-side retention in the normal path, support mainly focuses on browser-storage removal guidance, external processing scope, and explanation of the no-server-DB-retention design",
        ],
      },
    ],
  },
  {
    title: "8. 처리방침 변경 / Changes to This Policy",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro: `이 개인정보 처리방침은 ${effectiveDate}부터 적용됩니다.`,
        bullets: [
          "법령, 서비스 구조, 보안 조치, 외부 처리 범위가 바뀌면 본 페이지에 최신 내용을 반영합니다",
          "중대한 변경이 있는 경우 시행 전에 웹사이트를 통해 사전 고지합니다",
          "변경 이후 계속 서비스를 이용하는 경우, 변경된 처리방침이 적용될 수 있습니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro: `This Privacy Policy is effective as of ${effectiveDate}.`,
        bullets: [
          "If laws, service architecture, security controls, or external processing scope change, this page will be updated accordingly",
          "Material changes will be announced on the website before they take effect",
          "Continued use of the service after an update may mean the revised policy applies",
        ],
      },
    ],
  },
  {
    title: "9. 추가 고지 / Additional Notice",
    warning: true,
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "서비스 이용 전에 아래 사항을 확인해 주세요.",
        bullets: [
          "본 서비스는 방어적 보안 검토와 사용자 판단 보조를 위한 도구입니다",
          "본인이 접근 권한을 가진 이메일에 대해서만 분석을 수행해야 합니다",
          "분석 결과는 참고용이며 법적 증거, 수사 결과, 최종 판정으로 간주될 수 없습니다",
          "특히 민감정보, 주민등록번호, 금융정보 등 민감한 정보가 포함된 메일은 가능한 경우 마스킹 후 제출하시기 바랍니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro: "Please review the following before using the service.",
        bullets: [
          "This service is a defensive review tool designed to support user judgment",
          "You should analyze only emails that you are authorized to access",
          "Analysis results are for reference and should not be treated as legal evidence, an investigative finding, or a final determination",
          "If possible, mask sensitive data such as health information, resident registration numbers, or financial data before submitting an email for analysis",
        ],
      },
    ],
  },
];

function PolicyBlock({ heading, intro, bullets }) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="font-semibold mb-2">{heading}</h4>
      <p className="mb-2">{intro}</p>
      <ul className="list-disc ml-6 mt-2 space-y-2">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white">
      <Head>
        <title>개인정보 처리방침 - NAVER MAIL ANALYZER</title>
        <meta
          name="description"
          content="NAVER MAIL ANALYZER의 현재 서비스 구조에 맞춘 개인정보 처리방침"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/naver" className="inline-block">
            <h1 className="text-3xl font-bold text-heading dark:text-white hover:text-primary">
              📧 NAVER MAIL ANALYZER
            </h1>
          </Link>
        </div>

        <div className="bg-white dark:bg-box shadow-custom rounded-xl p-6 w-full max-w-5xl mx-auto mb-8">
          <h2 className="text-3xl font-bold mb-8 text-heading dark:text-white text-center">
            개인정보 처리방침 / Privacy Policy
          </h2>

          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <p>시행일자 / Effective Date: {effectiveDate}</p>
            <p>최종 수정일 / Last Updated: {effectiveDate}</p>
          </div>

          <div className="space-y-8 text-text dark:text-text-light">
            {sections.map((section) => (
              <section
                key={section.title}
                className={`border-l-4 pl-4 ${
                  section.warning
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded"
                    : "border-primary"
                }`}
              >
                <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                  {section.title}
                </h3>

                {section.blocks.map((block) => (
                  <PolicyBlock key={`${section.title}-${block.heading}`} {...block} />
                ))}
              </section>
            ))}

            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                10. 문의 및 신고 기관 / Contact and Regulatory Resources
              </h3>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">
                  개인정보 보호 관련 문의는 아래로 연락해 주세요.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-3">
                  <p>
                    <strong>담당부서:</strong> {privacyDeskKo}
                  </p>
                  <p>
                    <strong>이메일:</strong>{" "}
                    <a href={`mailto:${contactEmail}`} className="text-primary underline">
                      {contactEmail}
                    </a>
                  </p>
                  <p>
                    <strong>웹사이트:</strong>{" "}
                    <a
                      href={serviceUrl}
                      className="text-primary underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {serviceUrl}
                    </a>
                  </p>
                  <p className="mt-3 text-sm">
                    국내 개인정보 침해 신고나 상담이 필요한 경우 아래 기관을 참고하실 수 있습니다.
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                    <li>
                      개인정보침해신고센터:{" "}
                      <a
                        href="https://privacy.kisa.or.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        privacy.kisa.or.kr
                      </a>{" "}
                      / 국번없이 118
                    </li>
                    <li>
                      개인정보분쟁조정위원회:{" "}
                      <a
                        href="https://www.kopico.go.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.kopico.go.kr
                      </a>{" "}
                      / 1833-6972
                    </li>
                    <li>
                      대검찰청 사이버범죄수사단:{" "}
                      <a
                        href="https://www.spo.go.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.spo.go.kr
                      </a>{" "}
                      / 국번없이 1301
                    </li>
                    <li>
                      경찰청 사이버안전국:{" "}
                      <a
                        href="https://cyberbureau.police.go.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        cyberbureau.police.go.kr
                      </a>{" "}
                      / 국번없이 182
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">
                  For privacy-related questions, please contact us below.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-3">
                  <p>
                    <strong>Department:</strong> {privacyDeskEn}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${contactEmail}`} className="text-primary underline">
                      {contactEmail}
                    </a>
                  </p>
                  <p>
                    <strong>Website:</strong>{" "}
                    <a
                      href={serviceUrl}
                      className="text-primary underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {serviceUrl}
                    </a>
                  </p>
                  <p className="mt-3 text-sm">
                    If you need to report or consult about privacy infringement in
                    Korea, you may also refer to the following resources.
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                    <li>
                      Privacy Infringement Report Center:{" "}
                      <a
                        href="https://privacy.kisa.or.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        privacy.kisa.or.kr
                      </a>{" "}
                      / Call 118
                    </li>
                    <li>
                      Personal Information Dispute Mediation Committee:{" "}
                      <a
                        href="https://www.kopico.go.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.kopico.go.kr
                      </a>{" "}
                      / 1833-6972
                    </li>
                    <li>
                      Supreme Prosecutors&apos; Office Cybercrime Investigation Unit:{" "}
                      <a
                        href="https://www.spo.go.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.spo.go.kr
                      </a>{" "}
                      / Call 1301
                    </li>
                    <li>
                      National Police Agency Cyber Safety Bureau:{" "}
                      <a
                        href="https://cyberbureau.police.go.kr"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        cyberbureau.police.go.kr
                      </a>{" "}
                      / Call 182
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t-2 border-gray-300 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                본 개인정보 처리방침은 현재 서비스 구조를 기준으로 작성되었으며,
                일시 처리 범위, 서버 DB 비보관 구조, 외부 처리 범위가 바뀌면 함께 업데이트됩니다.
                <br />
                This Privacy Policy reflects the current service architecture and
                will be updated if transient-processing scope, server-side
                retention behavior, or external processing scope changes.
              </p>
              <p className="mt-4 text-sm font-semibold">
                📧{" "}
                <a href={`mailto:${contactEmail}`} className="text-primary underline">
                  {contactEmail}
                </a>
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                © 2026 NAVER MAIL ANALYZER. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
