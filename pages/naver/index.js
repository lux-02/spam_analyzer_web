import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Orbitron, Rajdhani } from "next/font/google";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import { isValidEmailRawData } from "@/utils/validators";
import { motion, useReducedMotion } from "framer-motion";
import styles from "@/styles/LandingConsole.module.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-orbitron",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rajdhani",
});

export default function Home() {
  const [rawData, setRawData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataConsent, setDataConsent] = useState(true);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [isFloatingDismissed, setIsFloatingDismissed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const getRevealMotion = (delay = 0, distance = 26) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: distance },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.24 },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        };

  const getCardHover = () =>
    shouldReduceMotion
      ? {}
      : {
          whileHover: { y: -6, scale: 1.01 },
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 24,
          },
        };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rawData.trim()) {
      setError("이메일 원문 데이터를 입력해주세요.");
      return;
    }

    if (!dataConsent) {
      setError("개인정보 처리 고지사항을 확인하고 동의해주세요.");
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
        <div className={styles.invalidHint}>{validation.reason}</div>
      );
    }
    return (
      <div className={styles.validHint}>
        올바른 이메일 원문 형식입니다.
      </div>
    );
  };

  const heroHighlights = [
    "SPF·DKIM·DMARC 통과 여부와 발신 도메인 위장 탐지",
    "본문·링크·첨부 파일 속 피싱 키워드와 위험 행동 분석",
    "Received 헤더 기반 IP·지리·ISP 정보 추적",
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
        "Received 헤더에 기록된 IP를 기반으로 국가·도시·ISP 정보와 홉 순서를 정리합니다.",
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
        "위험도 점수, 근거, 권장 대응까지 요약해 검토와 대응 판단에 바로 활용할 수 있습니다.",
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
      description: "위험 근거와 대응 가이드를 확인하고 즉시 대응 여부를 결정하세요.",
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
      title: "서버 DB 비보관",
      description:
        "분석 요청 시 이메일 원문과 파생 보안 정보가 일시 처리될 수 있지만, 일반 분석 경로에서는 서버 DB에 영구 저장하지 않으며 결과는 동일 브라우저 세션에서만 확인되도록 전달합니다.",
    },
    {
      title: "암호화 전송",
      description: "모든 데이터는 TLS로 암호화된 통신 구간에서 처리됩니다.",
    },
    {
      title: "외부 공개 방지",
      description:
        "분석한 메일 원문과 전체 결과를 공개 페이지나 검색 노출 대상으로 운영하지 않으며, 결과는 요청한 브라우저 세션에서 우선 확인합니다.",
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
        "분석 요청 시 이메일 원문과 파생 정보는 분석 목적 범위에서 일시 처리될 수 있습니다. 다만 일반 분석 경로에서는 서버 DB에 영구 저장하지 않으며, 결과는 동일 브라우저 세션 중심으로 확인하도록 설계했습니다.",
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

  const consentSummaryItems = [
    {
      label: "처리 목적",
      value: "이메일 스팸·피싱 분석, 위험도 산정, 결과 페이지 제공",
    },
    {
      label: "처리 항목",
      value: "메일 원문, 헤더/본문, 링크·첨부·IP 등 분석에 필요한 정보",
    },
    {
      label: "외부 연동",
      value: "OpenAI(본문 의도 분석), ipwho.is(IP 위치), VirusTotal(URL/IP 평판)",
    },
    {
      label: "보유 기간",
      value:
        "서버 DB에는 영구 저장하지 않으며, 결과는 같은 브라우저 세션 중심으로 확인",
    },
    {
      label: "거부권",
      value: "동의를 거부할 수 있으나 상세 분석 기능은 이용할 수 없습니다.",
    },
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
      analyzer: "결과 화면에서 근거와 권장 대응을 바로 확인해 전달 시간을 줄입니다.",
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
    <div
      className={`min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white ${styles.landingPage} ${orbitron.variable} ${rajdhani.variable}`}
    >
      <div className={styles.gridBackdrop} aria-hidden="true" />
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

      <div className={`container mx-auto px-4 py-8 ${styles.contentWrap}`}>
        <header className={styles.headerBar}>
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/naver"
              className={styles.brandLink}
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
                    className={`rounded-full px-3 py-1 transition-colors duration-200 ${styles.navLink}`}
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
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary ${styles.mobileMenuButton}`}
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
            <div
              className={`mt-4 space-y-4 rounded-2xl p-4 md:hidden ${styles.mobileMenu}`}
            >
              <nav
                className="flex flex-col gap-2"
                aria-label="모바일 주요 섹션 바로가기"
              >
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleNavLinkClick}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${styles.navLink}`}
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

        <motion.section
          {...getRevealMotion(0)}
          className="mb-14 space-y-8"
        >
          <div className={styles.heroShell}>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <div className={styles.heroBadge}>
                  네이버 메일 보안 어시스턴트 BETA
                </div>
                <h1
                  className={`mt-4 text-4xl font-extrabold leading-tight md:text-5xl ${styles.heroTitle}`}
                >
                  의심 메일, 1분 안에
                  <br className="hidden md:block" />
                  위험도를 확인하세요
                </h1>
                <p className={`mt-4 text-base md:text-lg ${styles.heroLead}`}>
                  링크·첨부·발신자 인증 결과를 종합해 클릭 전에 피싱 위험을
                  차단하세요. 메인 랜딩도 이제 분석 콘솔과 같은 위협 인텔리전스
                  톤으로 동작합니다.
                </p>
                <ul className="mt-6 space-y-3 text-left">
                  {heroHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className={`flex items-start gap-3 text-sm md:text-base ${styles.heroListItem}`}
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${styles.heroListDot}`}
                      />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#analyze"
                    className="btn-primary btn-lg w-full transition-transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    지금 무료로 분석하기
                  </a>
                </div>
              </div>

              <div id="preview" className={styles.heroPreview}>
                <div className={`flex items-center justify-between text-xs ${styles.previewMeta}`}>
                  <span className="font-semibold uppercase tracking-wide text-red-500">
                    분석 요약 미리보기
                  </span>
                  <span>실제 보고서 형식</span>
                </div>
                <div className={`mt-4 rounded-xl p-4 ${styles.previewDanger}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                    위험 지수
                  </p>
                  <p className={`mt-1 text-3xl font-bold ${styles.previewDangerValue}`}>
                    82% · 고위험
                  </p>
                  <p className={`mt-2 text-sm ${styles.previewDangerBody}`}>
                    SPF 실패, 위장 Reply-To, 고위험 링크 2건 탐지
                  </p>
                </div>
                <ul className="mt-5 space-y-3 text-sm">
                  {previewHighlights.map((item) => (
                    <li
                      key={item}
                      className={`flex gap-3 rounded-lg p-3 ${styles.previewListItem}`}
                    >
                      <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 rounded-xl p-4 text-xs ${styles.previewNote}`}>
                  분석 결과는 위험 근거와 대응 가이드를 포함하며, 복사 한 번으로
                  즉시 검토에 활용할 수 있습니다.
                </div>
              </div>
            </div>

            <div className={styles.telemetryGrid}>
              {statHighlights.map((stat, index) => (
                <motion.div
                  key={stat.value}
                  className={styles.telemetryCard}
                  {...getCardHover()}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : {
                          type: "spring",
                          stiffness: 260,
                          damping: 24,
                          delay: index * 0.04,
                        }
                  }
                >
                  <div className={styles.telemetryLabel}>LIVE SIGNAL</div>
                  <div className={styles.telemetryValue}>{stat.value}</div>
                  <p className={styles.telemetryDescription}>
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="analyze"
          {...getRevealMotion(0.06)}
          className={`relative mx-auto w-full max-w-6xl overflow-hidden p-6 focus-within:ring-2 focus-within:ring-primary/20 md:p-10 ${styles.analyzeShell}`}
        >
          <div
            className={styles.analyzeHaloLeft}
            aria-hidden="true"
          />
          <div
            className={styles.analyzeHaloRight}
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles.analyzeBadge}`}>
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
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${styles.stepMuted}`}>
                  2. AI 분석
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${styles.stepMuted}`}>
                  3. 결과 확인
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur ${styles.analyzeInfoPill}`}>
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
              <motion.div
                className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 focus-within:border-primary focus-within:shadow-primary/30 ${styles.inputCard}`}
                {...getRevealMotion(0.1, 18)}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { scale: 1.003, boxShadow: "0 18px 36px rgba(255, 48, 74, 0.16)" }
                }
              >
                <div
                  className={styles.inputHaloPrimary}
                  aria-hidden="true"
                />
                <div
                  className={styles.inputHaloSecondary}
                  aria-hidden="true"
                />
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white ${styles.inputTopIcon}`}>
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
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${styles.characterBadge}`}>
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

                <div className={`mt-5 ${styles.textareaFrame}`}>
                  <textarea
                    id="rawData"
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    className={`relative z-[1] h-[320px] w-full rounded-2xl px-5 py-4 font-mono text-sm leading-6 transition focus:outline-none ${styles.rawTextarea}`}
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
              </motion.div>

              <motion.div
                className={`rounded-2xl p-4 ${styles.consentCard}`}
                {...getRevealMotion(0.14, 16)}
              >
                <div className="space-y-3">
                  <div className="rounded-xl border border-primary/15 bg-white/50 p-3 text-[11px] leading-5 text-text-light dark:border-primary/20 dark:bg-white/5 dark:text-gray-300">
                    {consentSummaryItems.map((item) => (
                      <p key={item.label}>
                        <span className="font-semibold text-heading dark:text-white">
                          {item.label}
                        </span>
                        {": "}
                        <span>{item.value}</span>
                      </p>
                    ))}
                    <p className="pt-1 text-[10px] text-text-light dark:text-gray-400">
                      민감정보, 주민등록번호 등 불필요한 식별정보는 가능한 경우
                      가린 뒤 제출해 주세요.
                    </p>
                  </div>

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
                      위 고지사항을 확인했고, 메일 분석을 위한 개인정보 처리에
                      동의합니다.
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
              </motion.div>

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
                원문은 분석 요청 시 일시 처리되며, 일반 분석 경로에서는 서버
                DB에 영구 저장하지 않습니다. 결과는 같은 브라우저 세션에서만
                다시 열 수 있습니다.
              </p>
            </form>

            <div className="space-y-4">
              <motion.div
                className={`rounded-2xl p-5 shadow-md backdrop-blur ${styles.sideCard}`}
                {...getRevealMotion(0.18, 16)}
                {...getCardHover()}
              >
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
              </motion.div>

              <motion.div
                className={`rounded-2xl p-5 shadow-md backdrop-blur ${styles.sideCard}`}
                {...getRevealMotion(0.24, 16)}
                {...getCardHover()}
              >
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
              </motion.div>

              <motion.div
                className={`rounded-2xl p-5 shadow-md backdrop-blur ${styles.sideCard}`}
                {...getRevealMotion(0.3, 16)}
                {...getCardHover()}
              >
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
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className={`mx-auto mt-16 max-w-5xl ${styles.sectionShell}`}
          id="extensions"
          {...getRevealMotion(0.08)}
        >
          <h3 className="text-center text-2xl font-bold text-heading dark:text-white">
            브라우저에서도 한 번에 분석
          </h3>
          <p className="mt-2 text-center text-sm text-text-light dark:text-gray-300">
            확장 프로그램을 설치하면 네이버 메일 화면에서 바로 분석을 실행할 수
            있습니다.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <motion.a
              href="https://chromewebstore.google.com/detail/egiihcmplomfonhicnabpifjpgkhcimi?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-start gap-3 rounded-xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${styles.sideCard}`}
              {...getCardHover()}
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
            </motion.a>

            <motion.a
              href="https://store.whale.naver.com/detail/iifpjpbmgopecnfibfnakgobibghhien"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-start gap-3 rounded-xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${styles.sideCard}`}
              {...getCardHover()}
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
            </motion.a>
          </div>
        </motion.section>

        <motion.section
          className={`mx-auto mt-16 max-w-5xl ${styles.sectionShell}`}
          id="features"
          {...getRevealMotion(0.1)}
        >
          <h3 className="mb-6 text-center text-2xl font-bold text-heading dark:text-white">
            무엇을 분석하나요?
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <motion.div
                key={feature.title}
                className="card flex h-full flex-col gap-4 p-6"
                {...getCardHover()}
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
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={`mx-auto mt-16 max-w-5xl ${styles.sectionShell}`}
          id="testimonials"
          {...getRevealMotion(0.12)}
        >
          <h3 className="mb-6 text-center text-2xl font-bold text-heading dark:text-white">
            베타 사용자의 피드백
          </h3>
          <p className="mx-auto max-w-2xl text-center text-sm text-text-light dark:text-gray-300">
            실제 베타 참여 기업이 체감한 변화와 효율을 확인하세요.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonialCards.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                className="card flex h-full flex-col gap-4 p-5"
                {...getCardHover()}
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
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={`mx-auto mt-16 max-w-5xl ${styles.sectionShell}`}
          id="comparison"
          {...getRevealMotion(0.14)}
        >
          <h3 className="mb-4 text-center text-2xl font-bold text-heading dark:text-white">
            수동 점검과 무엇이 다른가요?
          </h3>
          <p className="mx-auto max-w-2xl text-center text-sm text-text-light dark:text-gray-300">
            보안 지식이 없어도 누구나 위협 수준을 이해하고 공유할 수 있도록 분석
            결과를 구조화했습니다.
          </p>
          <div className={`mt-6 overflow-hidden rounded-2xl ${styles.sideCard}`}>
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
        </motion.section>

        <motion.section
          id="workflow"
          className={`mx-auto mt-16 max-w-5xl ${styles.sectionShell}`}
          {...getRevealMotion(0.16)}
        >
          <h3 className="mb-6 text-center text-2xl font-bold text-heading dark:text-white">
            3단계로 끝나는 분석
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <motion.div
                key={step.number}
                className="card flex h-full flex-col items-start gap-3 p-5 text-left"
                {...getCardHover()}
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
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={`mx-auto mt-16 max-w-4xl ${styles.sectionShell}`}
          id="contact"
          {...getRevealMotion(0.18)}
        >
          <motion.div
            className="card flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between"
            {...getCardHover()}
          >
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
          </motion.div>
        </motion.section>
      </div>

      {shouldShowFloatingCTA && (
        <motion.div
          className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 md:px-8"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.32 }}
        >
          <div className={`mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-4 backdrop-blur sm:flex-row sm:items-center ${styles.floatingCta}`}>
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
              className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary ${styles.floatingClose}`}
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
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
