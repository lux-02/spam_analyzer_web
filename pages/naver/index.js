import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import { isValidEmailRawData } from "@/utils/validators";

export default function Home() {
  const [rawData, setRawData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataConsent, setDataConsent] = useState(true);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [isFloatingDismissed, setIsFloatingDismissed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rawData.trim()) {
      setError("이메일 원문 데이터를 입력해주세요.");
      return;
    }

    if (!dataConsent) {
      setError("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    // 원문 데이터 유효성 검사
    const validation = isValidEmailRawData(rawData);
    if (!validation.isValid) {
      setError(`올바른 이메일 원문 데이터가 아닙니다: ${validation.reason}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다.");
      }

      const analysisResult = data.result;
      const analysisId = analysisResult?.id;

      if (!analysisResult || !analysisId) {
        throw new Error(
          "분석 결과를 가져오는데 실패했습니다: 분석 ID를 찾을 수 없습니다."
        );
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `analysisResult:${analysisId}`,
          JSON.stringify(analysisResult)
        );
      }

      console.log("분석 완료, 결과 페이지로 이동합니다:", analysisId);

      router.push(`/naver/email/${analysisId}`);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // 실시간 유효성 검사 결과
  const getValidationHint = () => {
    if (!rawData.trim()) return null;

    const validation = isValidEmailRawData(rawData);
    if (!validation.isValid) {
      return (
        <div className="text-red-500 text-sm mt-1">{validation.reason}</div>
      );
    }
    return (
      <div className="text-green-500 text-sm mt-1">
        올바른 이메일 원문 형식입니다.
      </div>
    );
  };

  const heroHighlights = [
    "SPF·DKIM·DMARC 통과 여부와 발신 도메인 위장 탐지",
    "본문·링크·첨부 파일 속 피싱 키워드와 위험 행동 분석",
    "Received 헤더 기반 IP·지리·ISP 정보 시각화",
  ];

  const statHighlights = [
    { value: "20+ 항목", description: "헤더·본문·링크·IP를 교차 검사" },
    { value: "< 1분", description: "AI가 위험도를 계산하는 평균 시간" },
    { value: "베타 무료", description: "지금 가입 없이 무제한 분석" },
  ];

  const featureCards = [
    {
      title: "발신자/헤더 정밀 분석",
      description:
        "SPF, DKIM, DMARC 결과와 Return-Path·Reply-To 불일치 여부를 한 번에 확인합니다.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5l7.5 3v4.75c0 4.486-3.284 8.686-7.5 9.75-4.216-1.064-7.5-5.264-7.5-9.75V7.5L12 4.5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 12l1.5 1.5 3-3"
          />
        </svg>
      ),
    },
    {
      title: "본문·링크·첨부 탐지",
      description:
        "피싱 키워드, 가짜 로그인 유도 문구, 단축 URL과 위험 확장자를 탐지합니다.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5h6l3 3v4.5a6 6 0 11-6-6V5z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 11h2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l4 4" />
        </svg>
      ),
    },
    {
      title: "IP·지리 정보 추적",
      description:
        "Received 헤더에 기록된 IP를 기반으로 국가·도시·ISP 정보를 시각화합니다.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 100-18 9 9 0 000 18z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.5 3 2.5 15 0 18"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c-2.5 3-2.5 15 0 18"
          />
        </svg>
      ),
    },
    {
      title: "결과 요약 & 조치 가이드",
      description:
        "위험도 점수, 근거, 권장 대응까지 요약해 팀원과 안전하게 공유할 수 있습니다.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21H6a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 016 3h9l3 3v6"
          />
        </svg>
      ),
    },
  ];

  const workflowSteps = [
    {
      number: "01",
      title: "원문 붙여넣기",
      description:
        "네이버 메일의 더보기 > 원문 보기 내용을 그대로 붙여넣습니다.",
    },
    {
      number: "02",
      title: "AI 분석",
      description:
        "헤더, 본문, 링크, 첨부, 수신 경로를 AI가 자동으로 점수화합니다.",
    },
    {
      number: "03",
      title: "결과 확인",
      description: "위험 근거와 대응 가이드를 확인하고 팀과 공유하세요.",
    },
  ];

  const useCases = [
    {
      title: "기업 보안 담당자",
      description:
        "의심 메일을 빠르게 분류하고 사용자 신고 대응 시간을 절감합니다.",
      outcome: "보안팀 인입 전에 1차 검증 완료",
    },
    {
      title: "고객 상담·CS 팀",
      description:
        "사용자 문의를 받은 즉시 원문을 붙여넣어 피싱 여부를 명확히 안내합니다.",
      outcome: "답변 품질 향상 & 재문의 감소",
    },
    {
      title: "개인 사용자",
      description:
        "로그인 유도 메일을 열기 전 위험도를 확인해 피해를 예방합니다.",
      outcome: "클릭 전 사전 차단",
    },
  ];

  const trustPoints = [
    {
      title: "최소한의 수집",
      description:
        "분석 데이터는 서버에 저장하지 않고, 사용자 브라우저 세션에서만 결과를 확인합니다.",
    },
    {
      title: "암호화 전송",
      description: "모든 데이터는 TLS로 암호화된 통신 구간에서 처리됩니다.",
    },
    {
      title: "투명한 처리",
      description:
        "개인정보 처리방침에서 수집 항목과 보관 정책을 누구나 확인할 수 있습니다.",
    },
  ];

  const faqItems = [
    {
      question: "분석 결과는 어디까지 신뢰할 수 있나요?",
      answer:
        "수신 경로, 인증 결과, 링크, 키워드를 종합 분석하지만 100%를 보장하지는 않습니다. 의심 시 발신자 확인과 공식 채널 문의를 권장합니다.",
    },
    {
      question: "분석한 데이터는 저장되나요?",
      answer:
        "아니요. 분석 결과는 서버에 저장하지 않으며, 분석 직후 사용자 브라우저 세션에서만 확인할 수 있습니다.",
    },
    {
      question: "기업용 커스텀 규칙을 적용할 수 있나요?",
      answer:
        "API 형태로 제공하거나 발신 도메인 화이트리스트·특정 키워드 알림 등을 커스텀 구성할 수 있습니다.",
    },
    {
      question: "브라우저에서도 바로 분석할 수 있나요?",
      answer:
        "크롬·웨일 확장 프로그램을 설치하면 메일 화면에서 바로 분석을 실행할 수 있습니다.",
    },
  ];

  const analysisTips = [
    "제목과 발신자 정보까지 포함된 전체 원문을 붙여넣어 주세요.",
    "특수문자나 공백이 삭제되지 않도록 평문 모드로 복사하면 정확도가 높아집니다.",
  ];

  const troubleshootingTips = [
    "모바일 앱에서는 원문 전체 복사가 제한될 수 있어 데스크톱 환경에서 복사를 권장합니다.",
    "표나 이미지가 많은 메일은 원문 상단의 MIME Boundary 구분선을 포함했는지 확인하세요.",
    "붙여넣기 후 텍스트 앞에 공백이 남아 있다면 한 번 더 다듬어 주시면 분석 속도가 빨라집니다.",
  ];

  const previewHighlights = [
    "위장 로그인 링크 2건 감지 (naver-login.help, secure-naver.co)",
    "SPF 실패 및 Reply-To 도메인 불일치로 피싱 가능성 높음",
    "첨부 ZIP 내부에서 실행 파일(.exe) 탐지",
  ];

  const navLinks = [
    { label: "분석 시작", href: "#analyze" },
    { label: "특징", href: "#features" },
    { label: "성공 사례", href: "#testimonials" },
    { label: "비교", href: "#comparison" },
  ];

  const comparisonRows = [
    {
      criteria: "분석 범위",
      manual: "헤더·본문·링크를 별도로 확인해야 합니다.",
      analyzer: "SPF·DKIM 결과부터 링크·첨부 위험까지 한 번에 정리합니다.",
    },
    {
      criteria: "소요 시간",
      manual: "평균 10~15분 이상이 걸리며 실수 가능성이 있습니다.",
      analyzer: "평균 1분 이내로 위험 근거와 대응 가이드를 제공합니다.",
    },
    {
      criteria: "필요 역량",
      manual: "보안 지식이 있어야 해석할 수 있습니다.",
      analyzer: "자동 해석과 표현으로 누구나 이해할 수 있습니다.",
    },
    {
      criteria: "공유 방식",
      manual: "스크린샷과 메모를 직접 정리해 전달해야 합니다.",
      analyzer: "분석 링크와 요약을 클릭 한 번으로 팀과 공유합니다.",
    },
  ];

  const enterpriseHighlights = [
    {
      title: "커스텀 정책 반영",
      description:
        "조직에서 사용하는 발신 도메인 화이트리스트와 금지 키워드를 반영해 맞춤 알림을 제공합니다.",
    },
    {
      title: "내부 제보 흐름 개선",
      description:
        "사용자 신고 메일을 자동으로 분류해 보안팀이 고위험 항목부터 대응할 수 있도록 도와줍니다.",
    },
    {
      title: "API & 확장성",
      description:
        "요청 시 API 형태로 연동하거나 Slack·Teams 등 메신저 알림을 구성할 수 있습니다.",
    },
  ];

  const resourceCards = [
    {
      title: "도입 가이드",
      description:
        "보안팀이 NAVER MAIL ANALYZER를 빠르게 도입할 수 있도록 체크리스트를 제공합니다.",
      action: "이메일로 받기",
      href: "mailto:support@darkwinterlab.com?subject=NAVER%20MAIL%20ANALYZER%20도입%20가이드%20요청",
    },
    {
      title: "분석 리포트 샘플",
      description:
        "실제 고위험 이메일을 분석한 리포트를 열람해 보고 투자 가치를 판단하세요.",
      action: "샘플 요청",
      href: "mailto:support@darkwinterlab.com?subject=분석%20리포트%20샘플%20요청",
    },
    {
      title: "API 연동 사양",
      description:
        "내부 시스템이나 챗봇과 연동할 수 있는 REST API 스펙 문서를 제공합니다.",
      action: "사양 문의",
      href: "mailto:support@darkwinterlab.com?subject=NAVER%20MAIL%20ANALYZER%20API%20연동%20문의",
    },
  ];

  const testimonialCards = [
    {
      quote:
        "내부 임직원 신고 메일을 1차로 걸러내는 데 걸리던 시간이 70% 줄었습니다.",
      name: "김지훈",
      role: "중견 제조사 보안 담당자",
      outcome: "하루 평균 40건의 신고 메일을 10분 이내로 분류",
    },
    {
      quote:
        "메일 원문을 해석할 줄 몰랐던 상담팀도 위험 근거를 바로 이해하고 공유할 수 있습니다.",
      name: "박서연",
      role: "핀테크 고객지원 팀장",
      outcome: "재문의율 35% 감소",
    },
    {
      quote:
        "베타 API를 활용해 Slack 경보와 연동하니 야간 대응이 훨씬 수월해졌습니다.",
      name: "이도윤",
      role: "스타트업 CISO",
      outcome: "야간 보안 온콜 대응 시간 50% 단축",
    },
  ];

  const integrationSteps = [
    {
      timeframe: "Day 0",
      title: "Kick-off & 계정 설정",
      description: "베타 계정 발급 후 팀 권한과 로그 보관 정책을 설정합니다.",
    },
    {
      timeframe: "Day 3",
      title: "커스텀 규칙 적용",
      description:
        "화이트리스트, 위험 키워드, 알림 채널을 조직 정책에 맞게 구성합니다.",
    },
    {
      timeframe: "Week 2",
      title: "확장 프로그램 배포",
      description:
        "상담·보안팀에 크롬/웨일 확장 프로그램을 배포하고 교육 세션을 진행합니다.",
    },
    {
      timeframe: "Week 4",
      title: "API/메신저 연동",
      description:
        "Slack·Teams 혹은 티켓 시스템과 연동해 신고 흐름을 자동화합니다.",
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileNavOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY || window.pageYOffset;
      setShowFloatingCTA(scrolled > 640);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const characterCount = rawData.length;
  const shouldShowFloatingCTA = showFloatingCTA && !isFloatingDismissed;
  const handleNavLinkClick = () => setIsMobileNavOpen(false);
  const handleClearRawData = () => setRawData("");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white">
      <Head>
        <title>NAVER MAIL ANALYZER | 스팸·피싱 이메일 즉시 분석</title>
        <meta
          name="description"
          content="네이버 메일 원문을 붙여넣으면 AI가 스팸·피싱 위험을 즉시 분석합니다. 링크/첨부·발신자·수신 경로·IP까지 한 번에 점검하세요."
        />
        <meta property="og:title" content="NAVER MAIL ANALYZER" />
        <meta
          property="og:description"
          content="네이버 메일 원문을 붙여넣으면 AI가 스팸·피싱 위험을 즉시 분석합니다."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/dwl_logo_w.svg" />
        <meta property="og:url" content="https://darkwinterlab.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NAVER MAIL ANALYZER" />
        <meta
          name="twitter:description"
          content="네이버 메일 원문을 붙여넣으면 AI가 스팸·피싱 위험을 즉시 분석합니다."
        />
        <meta name="twitter:image" content="/dwl_logo_w.svg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/naver"
              className="text-lg font-bold tracking-tight text-heading dark:text-white"
            >
              NAVER MAIL ANALYZER
            </Link>

            <div className="hidden w-full items-center justify-between gap-6 md:flex">
              <nav
                className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-light dark:text-gray-300"
                aria-label="주요 섹션 바로가기"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleNavLinkClick}
                    className="rounded-full px-3 py-1 transition-colors duration-200 hover:bg-primary hover:text-white dark:hover:bg-primary-dark"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <a
                href="mailto:support@darkwinterlab.com?subject=NAVER%20MAIL%20ANALYZER%20베타%20상담"
                className="btn-outline btn-sm"
              >
                베타 상담
              </a>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen((prev) => !prev)}
                aria-label={isMobileNavOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isMobileNavOpen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {isMobileNavOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isMobileNavOpen && (
            <div className="mt-4 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-custom dark:border-gray-700 dark:bg-box dark:shadow-custom-dark md:hidden">
              <nav
                className="flex flex-col gap-2"
                aria-label="모바일 주요 섹션 바로가기"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleNavLinkClick}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-heading transition-colors duration-200 hover:bg-primary/10 dark:text-gray-100 dark:hover:bg-primary/20"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2">
                <a href="#analyze" className="btn-primary btn-sm">
                  분석 시작
                </a>
                <a
                  href="mailto:support@darkwinterlab.com?subject=NAVER%20MAIL%20ANALYZER%20베타%20상담"
                  className="btn-outline btn-sm"
                >
                  베타 상담하기
                </a>
              </div>
            </div>
          )}
        </header>

        <section className="mb-14 space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent p-8 shadow-custom dark:from-indigo-400/10 dark:via-primary/10 dark:shadow-custom-dark md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-white/10">
              네이버 메일 보안 어시스턴트 BETA
            </div>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-heading dark:text-white md:text-5xl">
              의심 메일, 1분 안에 위험도를 확인하세요
            </h1>
            <p className="mt-3 text-base text-text-light md:text-lg">
              링크·첨부·발신자 인증 결과를 종합해 클릭 전에 피싱 위험을
              차단하세요.
            </p>
            <ul className="mt-6 space-y-3 text-left">
              {heroHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 text-sm text-text dark:text-gray-200 md:text-base"
                >
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <div
              id="preview"
              className="mt-8 rounded-2xl border border-white/40 bg-white/90 p-6 text-left shadow-lg backdrop-blur dark:border-gray-700/60 dark:bg-gray-900/85 dark:text-gray-100"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  분석 요약 미리보기
                </span>
                <span className="text-xs text-text-light dark:text-gray-300">
                  실제 보고서 형식
                </span>
              </div>
              <div className="mt-4 rounded-xl border border-red-200 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-transparent p-4 text-text dark:border-red-500/40 dark:from-red-500/25 dark:via-orange-500/20 dark:to-transparent dark:bg-gray-900/60 dark:text-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  위험 지수
                </p>
                <p className="mt-1 text-3xl font-bold text-heading dark:text-white">
                  82% · 고위험
                </p>
                <p className="mt-2 text-sm text-text-light dark:text-gray-300">
                  SPF 실패, 위장 Reply-To, 고위험 링크 2건 탐지
                </p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-text dark:text-gray-200">
                {previewHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70"
                  >
                    <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-dashed border-indigo-300 p-4 text-xs text-text-light dark:border-indigo-500/40 dark:bg-gray-900/60 dark:text-gray-300">
                분석 결과는 위험 근거와 대응 가이드를 포함하며, 복사 한 번으로
                팀과 공유할 수 있습니다.
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#analyze"
                className="btn-primary btn-lg w-full transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                지금 무료로 분석하기
              </a>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {statHighlights.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-xl border border-white/40 bg-white/80 p-4 text-sm font-medium text-heading shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <div className="text-xl font-bold text-primary dark:text-primary-light">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-xs text-text-light dark:text-gray-300">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="analyze"
          className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-white p-6 shadow-custom focus-within:ring-2 focus-within:ring-primary/20 dark:border-gray-700 dark:from-primary/15 dark:via-gray-900 dark:to-gray-950 dark:shadow-custom-dark md:p-10"
        >
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-400/20"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                Step 1 · 지금 원문 붙여넣기
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-heading dark:text-white md:text-4xl">
                네이버 메일 원문을 붙여넣고 위험도를 즉시 확인하세요
              </h2>
              <p className="mt-2 text-sm text-text-light dark:text-gray-300 md:text-base">
                복잡한 헤더 해석 없이 원문을 입력하면 AI가 인증 결과, 링크, 첨부
                위험을 한눈에 정리합니다.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wide text-text-light dark:text-gray-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-white">
                  1. 원문 붙여넣기
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 dark:bg-white/10">
                  2. AI 분석
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 dark:bg-white/10">
                  3. 결과 공유
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-text-light shadow-sm backdrop-blur dark:bg-gray-800/80 dark:text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-primary"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.293 9.293a1 1 0 011.414 0L10 9.586l.293-.293a1 1 0 111.414 1.414l-.293.293.293.293a1 1 0 01-1.414 1.414L10 12.414l-.293.293a1 1 0 01-1.414-1.414l.293-.293-.293-.293a1 1 0 010-1.414z" />
              </svg>
              붙여넣기 후 분석 버튼을 누르면 평균 1분 내 결과 제공
            </div>
          </div>

          <div className="relative mt-10 grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-white to-white p-6 shadow-xl transition-all duration-300 focus-within:border-primary focus-within:shadow-primary/30 dark:from-primary/15 dark:via-gray-900 dark:to-gray-950">
                <div
                  className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-12 -left-16 h-40 w-40 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-400/20"
                  aria-hidden="true"
                />
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7h8m-8 4h5m-9 5V8a2 2 0 012-2h10l2 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80 dark:text-primary-light/70">
                        네이버 메일 원문 입력
                      </p>
                      <h3 className="text-lg font-bold text-heading dark:text-white">
                        이메일 원문 데이터
                      </h3>
                      <p className="mt-1 text-xs text-text-light dark:text-gray-300">
                        빠르게 붙여넣고 바로 위험도를 확인하세요. 복사한 내용을
                        수정하지 않고 그대로 입력하면 정확도가 높아집니다.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur dark:bg-gray-800/70 dark:text-primary-light">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M4 4a2 2 0 012-2h5l5 5v7a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      <path d="M13 3v3h3" />
                    </svg>
                    {characterCount.toLocaleString()}자
                  </span>
                </div>

                <div className="relative mt-5">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/40 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
                    aria-hidden="true"
                  />
                  <textarea
                    id="rawData"
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    className="relative z-[1] h-[320px] w-full rounded-2xl border border-gray-200 bg-white/95 px-5 py-4 font-mono text-sm leading-6 text-text shadow-inner transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100"
                    placeholder="네이버 메일의 '더보기 > 원문 보기'에서 복사한 원문을 그대로 붙여넣어 주세요."
                    aria-describedby="raw-data-helper"
                  />
                </div>

                <div id="raw-data-helper" className="mt-2 min-h-[20px] text-xs">
                  {getValidationHint()}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearRawData}
                    className="btn-text btn-sm"
                  >
                    입력 내용 초기화
                  </button>
                  <span className="text-[11px] text-text-light dark:text-gray-400">
                    붙여넣기 단축키:{" "}
                    <span className="font-semibold text-primary">
                      Ctrl / ⌘ + V
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-700/70 dark:bg-gray-900/60">
                <div className="flex items-start gap-3">
                  <input
                    id="dataConsent"
                    type="checkbox"
                    checked={dataConsent}
                    onChange={(e) => setDataConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="dataConsent"
                    className="text-xs text-text-light dark:text-gray-300"
                  >
                    개인정보 수집 및 이용에 동의합니다.
                    <Link
                      href="/privacy-policy"
                      className="ml-2 text-primary hover:underline"
                      target="_blank"
                    >
                      개인정보 처리방침
                    </Link>
                  </label>
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5"
              >
                {isLoading ? "분석 중..." : "이메일 분석하기"}
              </button>
              <p className="text-xs text-text-light dark:text-gray-400">
                첨부 파일이나 링크를 열기 전에 결과를 확인하세요. 붙여넣은
                원문은 분석 및 저장 정책에 따라 안전하게 처리됩니다.
              </p>
            </form>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-heading dark:text-white">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                    ✓
                  </span>
                  정확도 높이는 체크리스트
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-text-light dark:text-gray-300">
                  {analysisTips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-heading dark:text-white">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-300">
                    !
                  </span>
                  자주 발생하는 오류
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-text-light dark:text-gray-300">
                  {troubleshootingTips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-heading dark:text-white">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-200">
                    i
                  </span>
                  사용 가이드
                </h3>
                <div className="mt-3 space-y-3 text-xs text-text-light dark:text-gray-300">
                  <div>
                    <span className="font-semibold text-heading dark:text-white">
                      복사 &amp; 붙여넣기
                    </span>
                    <p>
                      분석할 이메일 원문을 복사해 왼쪽 입력창에 붙여넣고
                      &apos;이메일 분석하기&apos;를 누르면 됩니다.
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-heading dark:text-white">
                      원문 위치
                    </span>
                    <p>
                      네이버 메일의 &apos;더보기(⋮) &gt; 원문 보기&apos;를
                      선택하면 전체 헤더와 본문을 확인할 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-heading dark:text-white">
                      분석 시간
                    </span>
                    <p>
                      평균 1분 이내로 위험도와 근거를 제공하며, 진행 상황은
                      실시간으로 갱신됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl" id="extensions">
          <h3 className="text-center text-2xl font-bold text-heading dark:text-white">
            브라우저에서도 한 번에 분석
          </h3>
          <p className="mt-2 text-center text-sm text-text-light dark:text-gray-300">
            확장 프로그램을 설치하면 네이버 메일 화면에서 바로 분석을 실행할 수
            있습니다.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a
              href="https://chromewebstore.google.com/detail/egiihcmplomfonhicnabpifjpgkhcimi?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Image
                  src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg"
                  alt="Chrome Web Store"
                  width={48}
                  height={48}
                  className="h-10 w-10"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-heading dark:text-white">
                  Chrome 웹스토어
                </h4>
                <p className="text-sm text-text-light dark:text-gray-300">
                  크롬 브라우저용 확장 프로그램
                </p>
              </div>
            </a>

            <a
              href="https://store.whale.naver.com/detail/iifpjpbmgopecnfibfnakgobibghhien"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Image
                  src="https://shared-whale.pstatic.net/favicon/store/icon.png"
                  alt="Whale Store"
                  width={48}
                  height={48}
                  className="h-10 w-10"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-heading dark:text-white">
                  웨일 스토어
                </h4>
                <p className="text-sm text-text-light dark:text-gray-300">
                  네이버 웨일 브라우저용 확장 앱
                </p>
              </div>
            </a>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl" id="features">
          <h3 className="mb-6 text-center text-2xl font-bold text-heading dark:text-white">
            무엇을 분석하나요?
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="card flex h-full flex-col gap-4 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-primary dark:bg-indigo-500/20">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-heading dark:text-white">
                  {feature.title}
                </h4>
                <p className="text-sm text-text-light dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl" id="testimonials">
          <h3 className="mb-6 text-center text-2xl font-bold text-heading dark:text-white">
            베타 사용자의 피드백
          </h3>
          <p className="mx-auto max-w-2xl text-center text-sm text-text-light dark:text-gray-300">
            실제 베타 참여 기업이 체감한 변화와 효율을 확인하세요.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonialCards.map((testimonial) => (
              <div
                key={testimonial.name}
                className="card flex h-full flex-col gap-4 p-5"
              >
                <p className="text-sm text-text dark:text-gray-100">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <div className="text-sm font-semibold text-heading dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-text-light dark:text-gray-300">
                    {testimonial.role}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                    {testimonial.outcome}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl" id="comparison">
          <h3 className="mb-4 text-center text-2xl font-bold text-heading dark:text-white">
            수동 점검과 무엇이 다른가요?
          </h3>
          <p className="mx-auto max-w-2xl text-center text-sm text-text-light dark:text-gray-300">
            보안 지식이 없어도 누구나 위협 수준을 이해하고 공유할 수 있도록 분석
            결과를 구조화했습니다.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-custom dark:border-gray-700 dark:bg-box dark:shadow-custom-dark">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    비교 항목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-light dark:text-gray-400">
                    수동 점검
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    NAVER MAIL ANALYZER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {comparisonRows.map((row) => (
                  <tr key={row.criteria} className="align-top">
                    <td className="px-4 py-4 text-sm font-medium text-heading dark:text-white">
                      {row.criteria}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-light dark:text-gray-300">
                      {row.manual}
                    </td>
                    <td className="px-4 py-4 text-sm text-text dark:text-gray-100">
                      {row.analyzer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="workflow" className="mx-auto mt-16 max-w-5xl">
          <h3 className="mb-6 text-center text-2xl font-bold text-heading dark:text-white">
            3단계로 끝나는 분석
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <div
                key={step.number}
                className="card flex h-full flex-col items-start gap-3 p-5 text-left"
              >
                <span className="text-sm font-semibold uppercase text-primary">
                  {step.number}
                </span>
                <h4 className="text-lg font-semibold text-heading dark:text-white">
                  {step.title}
                </h4>
                <p className="text-sm text-text-light dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl" id="contact">
          <div className="card flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-xl font-bold text-heading dark:text-white">
                지금 바로 의심 이메일을 점검하세요
              </h4>
              <p className="text-sm text-text-light dark:text-gray-300">
                복잡한 절차 없이 원문을 붙여넣기만 하면 위험도와 대응 가이드를
                확인할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#analyze" className="btn-primary">
                무료로 시작하기
              </a>
            </div>
          </div>
        </section>
      </div>

      {shouldShowFloatingCTA && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 md:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-custom backdrop-blur dark:bg-gray-900/95 dark:shadow-custom-dark sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-semibold text-heading dark:text-white">
                의심 메일 분석을 지금 시작해 보세요
              </p>
              <p className="text-xs text-text-light dark:text-gray-300">
                무료 베타 기간 동안 분석 횟수 제한 없이 사용할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#analyze" className="btn-primary btn-sm">
                분석 시작
              </a>
            </div>
            <button
              type="button"
              onClick={() => setIsFloatingDismissed(true)}
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="배너 닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
