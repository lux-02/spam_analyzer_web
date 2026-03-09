import Head from "next/head";
import Link from "next/link";
import Footer from "../components/ui/Footer";

const effectiveDate = "2026년 3월 9일 (March 9, 2026)";
const contactEmail = "darkwinterlab@gmail.com";
const serviceUrl = "https://naver.darkwinterlab.com";

const sections = [
  {
    title: "1. 수집 및 처리 정보 / Information We Process",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "NAVER MAIL ANALYZER는 사용자가 직접 붙여넣거나, 확장앱에서 명시적으로 실행해 전달한 메일에 한해 아래 정보를 처리합니다.",
        bullets: [
          "이메일 원문 및 그 안에 포함된 헤더/본문/HTML 정보: From, To, Subject, Return-Path, Reply-To, Message-ID, Received 헤더 등 메일 분석에 필요한 항목",
          "파생 보안 정보: SPF, DKIM, DMARC 결과, 발신 경로, 추출된 URL/도메인/IP, 첨부파일 이름 및 형식 등",
          "분석 결과 정보: 위험도 점수, 규칙 기반 탐지 결과, AI 의도 분석 결과, 분석 시각, 분석 ID",
          "브라우저 측 편의 정보: 결과 전달용 URL fragment(#analysis=...), 동일 브라우저 재열람을 위한 sessionStorage, 테마/캐시/실패 도메인/최근 분석 ID 저장용 localStorage",
          "서비스 안정성 확인을 위한 최소 운영 정보: 오류 로그, 요청 성공/실패 여부 등 비식별 운영 메타데이터",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "NAVER MAIL ANALYZER processes the following information only for emails that the user explicitly pastes into the web app or sends from the browser extension by direct action.",
        bullets: [
          "Raw email content and embedded header/body/HTML information needed for analysis, including From, To, Subject, Return-Path, Reply-To, Message-ID, and Received headers",
          "Derived security signals such as SPF, DKIM, and DMARC results, delivery path details, extracted URLs/domains/IPs, and attachment names or types when detectable",
          "Analysis output such as risk score, rule-based findings, AI intent analysis, analysis timestamp, and analysis ID",
          "Browser-side convenience data including the handoff URL fragment (#analysis=...), sessionStorage for same-browser result viewing, and localStorage for theme, cache, failed-domain state, and recent analysis ID",
          "Minimal operational metadata such as error logs and request success/failure status used to keep the service reliable",
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
    title: "3. 저장 방식, 보안 및 파기 / Storage, Security, and Deletion",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "현재 일반 분석 흐름에서는 이메일 원문과 전체 분석 결과를 서버 데이터베이스에 영구 저장하지 않습니다.",
        bullets: [
          "서버 저장: 일반 분석 경로에서 이메일 원문과 전체 분석 결과를 MongoDB, Supabase 등 서버 DB에 영구 저장하지 않습니다",
          "결과 전달: 분석 결과는 즉시 응답 본문과 URL fragment(#analysis=...)로 전달되며, fragment 값은 일반적인 HTTP 요청에 포함되어 서버로 전송되지 않습니다",
          "브라우저 저장: 결과 페이지는 URL fragment를 클라이언트에서 해석한 뒤 sessionStorage에 복사해 동일 브라우저에서 결과를 다시 볼 수 있도록 합니다",
          "로컬 캐시: localStorage에는 테마 설정, VirusTotal 결과 캐시, 실패 도메인 목록, 확장앱의 최근 분석 ID 등 편의용 정보만 저장되며 이메일 원문 전체를 기본 저장 대상으로 삼지 않습니다",
          "파기: sessionStorage 데이터는 탭/세션 종료 또는 브라우저 저장소 삭제 시 제거될 수 있고, localStorage 데이터는 사용자가 직접 삭제할 수 있습니다",
          "보안: 서비스 전송 구간은 HTTPS/TLS로 보호되며, 서버 비밀값(API 키 등)은 서버 측 환경변수로만 관리합니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "In the current normal analysis flow, raw emails and full analysis results are not persistently stored in a server-side database.",
        bullets: [
          "Server storage: Raw email content and full analysis results are not persistently stored in MongoDB, Supabase, or other server databases in the normal analysis path",
          "Result handoff: Analysis output is returned immediately in the response body and in a URL fragment (#analysis=...), and the fragment is not included in standard HTTP requests to the server",
          "Browser storage: The result page decodes the fragment client-side and copies it into sessionStorage so the same browser can reopen the result",
          "Local cache: localStorage is used only for convenience data such as theme preference, VirusTotal cache, failed-domain state, and the extension's recent analysis ID, not as default storage for full raw email content",
          "Deletion: sessionStorage data may disappear when the tab or browser session ends or when browser storage is cleared, and localStorage data can also be cleared by the user",
          "Security: Data in transit is protected by HTTPS/TLS, and server secrets such as API keys are managed only in server-side environment variables",
        ],
      },
    ],
  },
  {
    title: "4. 제3자 처리 및 외부 서비스 / Third-Party Processing and External Services",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "일부 분석 기능은 아래 외부 서비스를 통해 처리됩니다. 각 서비스는 자체 개인정보 처리방침을 가집니다.",
        bullets: [
          "OpenAI API: 이메일 본문 또는 분석에 필요한 일부 문맥을 전달하여 메일 의도 및 위험 신호를 요약합니다",
          "VirusTotal API: 이메일에서 추출된 URL, 도메인, IP 주소의 평판을 조회합니다",
          "호스팅/인프라 사업자(Vercel 등): 웹페이지와 API 운영 과정에서 최소 수준의 인프라 로그가 생성될 수 있습니다",
          "사용자가 분석을 실행하기 전에는 위 외부 서비스 호출이 발생하지 않으며, 법령상 의무가 없는 한 개인정보를 판매하지 않습니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "Certain analysis features rely on the external services below. Each service operates under its own privacy policy.",
        bullets: [
          "OpenAI API: Used to process the email body or limited necessary context to summarize intent and risk signals",
          "VirusTotal API: Used to look up the reputation of extracted URLs, domains, and IP addresses",
          "Hosting/infrastructure providers (such as Vercel): Minimal infrastructure logs may be generated while serving the web app and APIs",
          "These external calls are not made until the user actually runs analysis, and we do not sell personal information unless required by law",
        ],
      },
    ],
  },
  {
    title: "5. 사용자 권리 및 행사 방법 / Your Rights and How to Exercise Them",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro: "사용자는 아래와 같은 방식으로 자신의 데이터 처리에 대응할 수 있습니다.",
        bullets: [
          "분석 전 중단 권리: 붙여넣기 또는 확장앱 원문 수집 후에도 분석 버튼을 누르지 않으면 외부 분석 API 호출은 이루어지지 않습니다",
          "열람 권리: 현재 브라우저 세션에서 생성된 결과를 직접 확인할 수 있습니다",
          "삭제 권리: sessionStorage/localStorage를 비우거나 브라우저 탭을 종료하여 로컬 결과 및 캐시를 삭제할 수 있습니다",
          "문의 권리: 처리 방식, 외부 제공 범위, 기술적 보호조치 등에 대해 아래 연락처로 문의할 수 있습니다",
          "제한 사항: 정상 분석 경로에서 서버 영구 저장을 하지 않기 때문에, 세션 종료 후 과거 이메일 원문을 서버에서 다시 제공해 드릴 수는 없습니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro: "Users can respond to data processing in the following ways.",
        bullets: [
          "Right to stop before analysis: Even after pasting email content or capturing it from the extension, no external analysis API is called unless the user actually submits the analysis request",
          "Right of access: You can view the results generated in your current browser session",
          "Right to erasure: You can remove local results and cache by clearing sessionStorage/localStorage or closing the browser tab/session",
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
          "Note: Clearing browser storage may limit convenience features and result revisiting",
        ],
      },
    ],
  },
  {
    title: "7. 개인정보 보호 문의 / Privacy Contact",
    blocks: [
      {
        heading: "🇰🇷 한국어",
        intro:
          "개인정보 처리와 관련된 문의, 삭제 요청, 기술적 설명 요청은 아래 채널로 접수하실 수 있습니다.",
        bullets: [
          `이메일: ${contactEmail}`,
          `서비스 웹사이트: ${serviceUrl}`,
          "안내 범위: 서버 영구 저장 데이터가 없는 구조이므로, 브라우저 저장소 삭제 방법과 외부 처리 범위 중심으로 지원합니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro:
          "Questions about privacy, deletion requests, or technical explanations may be submitted through the channels below.",
        bullets: [
          `Email: ${contactEmail}`,
          `Service website: ${serviceUrl}`,
          "Support scope: Because the service avoids persistent server-side storage in the normal path, support mainly focuses on browser-storage removal guidance and explanation of external processing scope",
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
          "특히 민감한 개인정보가 포함된 메일은 외부 분석 실행 전 신중히 판단하시기 바랍니다",
        ],
      },
      {
        heading: "🇺🇸 English",
        intro: "Please review the following before using the service.",
        bullets: [
          "This service is a defensive review tool designed to support user judgment",
          "You should analyze only emails that you are authorized to access",
          "Analysis results are for reference and should not be treated as legal evidence, an investigative finding, or a final determination",
          "Please be especially cautious before submitting emails that contain sensitive personal information to external analysis features",
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
                분석 저장 방식이나 외부 처리 범위가 바뀌면 함께 업데이트됩니다.
                <br />
                This Privacy Policy reflects the current service architecture and
                will be updated if storage behavior or external processing scope
                changes.
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
