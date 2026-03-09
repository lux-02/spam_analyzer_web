import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Orbitron, Rajdhani } from "next/font/google";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";
import {
  countryCodeToFlag,
  isAnalyzableTarget,
} from "@/utils/emailAnalyzer";
import ThemeToggle from "@/components/ui/ThemeToggle";
// 컴포넌트 import
import EmailHeader from "@/components/EmailHeader";
import AuthenticationInfo from "@/components/AuthenticationInfo";
import EmailBodyContent from "@/components/EmailBodyContent";
import ReceivedPathMap from "@/components/ReceivedPathMap";
import RiskScoreChecklist from "@/components/RiskScoreChecklist";
import VirusTotalButton from "@/components/VirusTotalButton";
import VirusTotalModal from "@/components/VirusTotalModal";
import Footer from "@/components/ui/Footer";
import styles from "@/styles/CiaConsole.module.css";
// 로컬 스토리지 키 상수
const FAILED_DOMAINS_KEY = "vtFailedDomains";
const VT_RESULTS_CACHE_KEY = "vtResultsCache";
const ANALYSIS_SESSION_KEY_PREFIX = "analysisResult:";
const ANALYSIS_READY_EVENT = "darkwinterlab:analysis-ready";

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

const getAnalysisSessionKey = (analysisId) =>
  `${ANALYSIS_SESSION_KEY_PREFIX}${analysisId}`;

const decodeBase64UrlJson = (payload) => {
  if (!payload || typeof payload !== "string") return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (error) {
    console.error("분석 페이로드 디코딩 오류:", error);
    return null;
  }
};

const readAnalysisFromHash = () => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash || "";
  if (!hash.startsWith("#")) return null;

  const params = new URLSearchParams(hash.slice(1));
  const encoded = params.get("analysis");
  return decodeBase64UrlJson(encoded);
};

const clearAnalysisHash = () => {
  if (typeof window === "undefined") return;
  if (!window.location.hash) return;

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
};

const saveAnalysisToSession = (analysisId, data) => {
  if (typeof window === "undefined" || !analysisId || !data) return;
  sessionStorage.setItem(getAnalysisSessionKey(analysisId), JSON.stringify(data));
};

const readAnalysisFromSession = (analysisId) => {
  if (typeof window === "undefined" || !analysisId) return null;

  const raw = sessionStorage.getItem(getAnalysisSessionKey(analysisId));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("세션 분석 결과 파싱 오류:", error);
    sessionStorage.removeItem(getAnalysisSessionKey(analysisId));
    return null;
  }
};

const waitForSessionAnalysis = (analysisId, timeoutMs = 4000) =>
  new Promise((resolve) => {
    if (typeof window === "undefined" || !analysisId) {
      resolve(null);
      return;
    }

    const existing = readAnalysisFromSession(analysisId);
    if (existing) {
      resolve(existing);
      return;
    }

    let settled = false;

    const cleanup = () => {
      window.removeEventListener(ANALYSIS_READY_EVENT, handleReady);
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
    };

    const finish = (data) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(data);
    };

    const handleReady = (event) => {
      const eventAnalysisId = event.detail?.analysisId;

      if (eventAnalysisId && eventAnalysisId !== analysisId) {
        return;
      }

      finish(readAnalysisFromSession(analysisId));
    };

    const pollId = window.setInterval(() => {
      const next = readAnalysisFromSession(analysisId);
      if (next) {
        finish(next);
      }
    }, 150);

    const timeoutId = window.setTimeout(() => {
      finish(null);
    }, timeoutMs);

    window.addEventListener(ANALYSIS_READY_EVENT, handleReady);
  });

export default function EmailAnalysisResult() {
  const router = useRouter();
  const { id } = router.query;
  const source = Array.isArray(router.query.source)
    ? router.query.source[0]
    : router.query.source;
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipLocations, setIpLocations] = useState([]);
  const [showDetails, setShowDetails] = useState(true);

  // VirusTotal 관련 상태
  const [virusTotalModalOpen, setVirusTotalModalOpen] = useState(false);
  const [virusTotalResults, setVirusTotalResults] = useState(null);
  const [virusTotalTarget, setVirusTotalTarget] = useState("");
  const [virusTotalLoading, setVirusTotalLoading] = useState(false);
  const [failedDomains, setFailedDomains] = useState([]);
  const [analyzedTargets, setAnalyzedTargets] = useState({}); // 분석된 타겟 상태 추가
  const [resultsCache, setResultsCache] = useState({}); // 결과 캐시 상태 추가
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 중 상태 추가
  const shouldReduceMotion = useReducedMotion();
  const hasGeoLocations = ipLocations.some(
    (loc) =>
      loc &&
      Number.isFinite(Number(loc.latitude)) &&
      Number.isFinite(Number(loc.longitude))
  );
  const geolocatedCount = ipLocations.filter(
    (loc) =>
      loc &&
      Number.isFinite(Number(loc.latitude)) &&
      Number.isFinite(Number(loc.longitude))
  ).length;
  const uniqueCountryCount = new Set(
    ipLocations.map((loc) => loc?.country || loc?.countryCode).filter(Boolean)
  ).size;
  const uniqueIspCount = new Set(
    ipLocations.map((loc) => loc?.isp).filter(Boolean)
  ).size;
  const geoCoverage = Math.round(
    (geolocatedCount / Math.max(ipLocations.length, 1)) * 100
  );
  const firstHopCountry =
    ipLocations[0]?.country || ipLocations[0]?.countryCode || "미상";
  const lastHopCountry =
    ipLocations[ipLocations.length - 1]?.country ||
    ipLocations[ipLocations.length - 1]?.countryCode ||
    "미상";
  const routeTraceLabel = `${firstHopCountry} → ${lastHopCountry}`;

  const getPanelMotion = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.45,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        };

  const getRouteItemMotion = (index = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, x: -12 },
          animate: { opacity: 1, x: 0 },
          whileHover: { x: 4, scale: 1.004 },
          transition: {
            duration: 0.3,
            delay: 0.22 + index * 0.04,
            ease: [0.22, 1, 0.36, 1],
          },
        };

  const renderStatusState = (content) => (
    <div
      className={`min-h-screen ${styles.consolePage} ${orbitron.variable} ${rajdhani.variable}`}
    >
      <div className={styles.gridBackdrop} aria-hidden="true" />
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className={`w-full max-w-lg rounded-2xl p-6 ${styles.hudPanel}`}>
          {content}
        </div>
      </div>
    </div>
  );

  // 초기화 시 로컬 스토리지에서 실패한 도메인 및 캐시된 결과 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 실패한 도메인 로드
      const storedFailedDomains = localStorage.getItem(FAILED_DOMAINS_KEY);
      if (storedFailedDomains) {
        try {
          setFailedDomains(JSON.parse(storedFailedDomains));
        } catch (e) {
          console.error("실패한 도메인 로드 오류:", e);
          localStorage.removeItem(FAILED_DOMAINS_KEY);
        }
      }

      // 캐시된 결과 로드
      const storedResults = localStorage.getItem(VT_RESULTS_CACHE_KEY);
      if (storedResults) {
        try {
          setResultsCache(JSON.parse(storedResults));
        } catch (e) {
          console.error("캐시된 결과 로드 오류:", e);
          localStorage.removeItem(VT_RESULTS_CACHE_KEY);
        }
      }
    }
  }, []);

  // 실패한 도메인을 로컬 스토리지에 저장하는 함수
  const saveFailedDomain = useCallback((domain) => {
    if (typeof window === "undefined" || !domain) return;

    setFailedDomains((prev) => {
      if (prev.includes(domain)) return prev;
      const next = [...prev, domain];
      localStorage.setItem(FAILED_DOMAINS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // 결과를 캐시에 저장하는 함수
  const saveResultToCache = useCallback((target, result) => {
    if (typeof window === "undefined" || !target) return;

    setResultsCache((prev) => {
      const next = { ...prev, [target]: result };
      localStorage.setItem(VT_RESULTS_CACHE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // 도메인이 실패 목록에 있는지 확인하는 함수
  const isDomainFailed = useCallback(
    (domain) => {
      return failedDomains.includes(domain);
    },
    [failedDomains]
  );

  // 타겟이 이미 분석되었는지 확인하는 함수
  const isTargetAnalyzed = useCallback(
    (target) => {
      return target in analyzedTargets;
    },
    [analyzedTargets]
  );

  // 이메일 분석 결과 가져오기
  useEffect(() => {
    const fetchEmailData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        let data = readAnalysisFromHash();
        if (data) {
          saveAnalysisToSession(id, data);
          if (data.id && data.id !== id) {
            saveAnalysisToSession(data.id, data);
          }
          clearAnalysisHash();
        }

        if (!data) {
          data = readAnalysisFromSession(id);
        }

        if (!data && source === "session") {
          data = await waitForSessionAnalysis(id);
        }

        if (!data) {
          // 하위 호환: 과거 ID 기반 조회
          const response = await fetch(`/api/email/${id}`);
          if (!response.ok) {
            throw new Error(
              "분석 결과를 찾을 수 없습니다. 개인정보 보호 정책으로 서버 저장이 비활성화되어 세션이 만료되었을 수 있습니다."
            );
          }
          data = await response.json();
          saveAnalysisToSession(id, data);
        }

        setEmailData(data);

        // IP 주소 후보 수집: api가 제공하는 ipAddresses 없을 경우 Received 헤더/전송 IP에서 추출
        const ipv4Regex =
          /(?:\b|\()(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\b|\))/g;

        const extractedFromReceived = Array.isArray(data.receivedHeaders)
          ? data.receivedHeaders.flatMap((h) =>
              (h.match(ipv4Regex) || []).map((s) => s.replace(/[()]/g, ""))
            )
          : [];

        const sessionIp =
          (data.allHeaders &&
            (data.allHeaders["x-session-ip"] ||
              data.allHeaders["x-session-ip"])) ||
          null;

        const candidates = [
          ...(Array.isArray(data.ipAddresses) ? data.ipAddresses : []),
          ...extractedFromReceived,
          ...(sessionIp ? [sessionIp] : []),
        ]
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i); // 고유화

        if (candidates.length > 0) {
          const ipLocations = await Promise.all(
            candidates.map(async (ip) => {
              try {
                const result = await axios.get(`/api/analyze-ip?ip=${ip}`);
                return result.data;
              } catch (error) {
                console.error(`IP ${ip} 분석 오류:`, error);
                return null;
              }
            })
          );

          setIpLocations(ipLocations.filter((loc) => loc !== null));
        }
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailData();
  }, [id, source]);

  // 이메일 데이터가 로드된 후 자동으로 모든 IP와 URL 분석
  useEffect(() => {
    const autoAnalyzeTargets = async () => {
      if (!emailData || isAnalyzing) return;

      setIsAnalyzing(true);
      console.log("자동 분석 시작...");

      // 분석할 타겟 목록 수집
      const targets = new Set();

      // IP 주소 추가
      if (emailData.ipAddresses) {
        emailData.ipAddresses.forEach((ip) => {
          if (
            isAnalyzableTarget(ip, "ip") &&
            !isTargetAnalyzed(ip) &&
            !isDomainFailed(ip)
          ) {
            targets.add(ip);
          }
        });
      }

      // Received 헤더에서 도메인 및 IP 추가
      if (emailData.receivedDetails) {
        emailData.receivedDetails.forEach((detail) => {
          if (
            detail.from &&
            isAnalyzableTarget(detail.from, "url") &&
            !isTargetAnalyzed(detail.from) &&
            !isDomainFailed(detail.from)
          ) {
            targets.add(detail.from);
          }
          if (
            detail.by &&
            isAnalyzableTarget(detail.by, "url") &&
            !isTargetAnalyzed(detail.by) &&
            !isDomainFailed(detail.by)
          ) {
            targets.add(detail.by);
          }
          if (
            detail.ip &&
            isAnalyzableTarget(detail.ip, "ip") &&
            !isTargetAnalyzed(detail.ip) &&
            !isDomainFailed(detail.ip)
          ) {
            targets.add(detail.ip);
          }
        });
      }

      // 도메인 추가
      if (emailData.domains) {
        emailData.domains.forEach((domain) => {
          if (
            isAnalyzableTarget(domain, "url") &&
            !isTargetAnalyzed(domain) &&
            !isDomainFailed(domain)
          ) {
            targets.add(domain);
          }
        });
      }

      // 링크 추가 (최대 10개만)
      if (emailData.links) {
        let linkCount = 0;
        for (const url of emailData.links) {
          if (linkCount >= 10) break; // 최대 10개 링크만 자동 분석
          if (
            isAnalyzableTarget(url, "url") &&
            !isTargetAnalyzed(url) &&
            !isDomainFailed(url)
          ) {
            targets.add(url);
            linkCount++;
          }
        }
      }

      console.log(`총 ${targets.size}개 타겟 자동 분석 대기 중...`);

      // 병렬로 최대 3개씩 분석 실행
      const targetsArray = Array.from(targets);
      const batchSize = 3;
      const newAnalyzedTargets = { ...analyzedTargets };
      let hasAnalyzedTargetChanges = false;

      if (targetsArray.length === 0) {
        setIsAnalyzing(false);
        return;
      }

      for (let i = 0; i < targetsArray.length; i += batchSize) {
        const batch = targetsArray.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (target) => {
            try {
              console.log(`분석 중: ${target}`);
              newAnalyzedTargets[target] = { status: "analyzing" };
              hasAnalyzedTargetChanges = true;

              try {
                const response = await axios.post("/api/virustotal", {
                  target,
                });

                if (response.status === 200) {
                  const data = response.data;

                  // DNS 조회 실패 처리
                  if (
                    data.query_status === "failed" &&
                    data.error === "DNS 조회 실패"
                  ) {
                    saveFailedDomain(target);
                    newAnalyzedTargets[target] = { status: "failed" };
                    hasAnalyzedTargetChanges = true;
                  } else {
                    saveResultToCache(target, data);

                    // 분석 결과에 따른 상태 설정
                    const threat = data.threat;
                    const isSuspicious =
                      data.analysis_stats?.suspicious > 0 || // URL 분석
                      data.analysis_stats?.malicious_details?.some((detail) =>
                        detail.result.includes("suspicious")
                      ) ||
                      false; // IP 분석

                    newAnalyzedTargets[target] = {
                      status: "analyzed",
                      threat:
                        isSuspicious && threat !== "malicious"
                          ? "suspicious"
                          : threat,
                    };
                    hasAnalyzedTargetChanges = true;
                  }
                } else {
                  newAnalyzedTargets[target] = { status: "error" };
                  hasAnalyzedTargetChanges = true;
                }
              } catch (apiError) {
                // VirusTotal API 호출 오류 처리 (500 에러 포함)
                console.error(
                  `VirusTotal API 요청 오류 (${target}):`,
                  apiError.message
                );
                newAnalyzedTargets[target] = {
                  status: "error",
                  message: "API 요청 실패 (분석 건너뜀)",
                };
                hasAnalyzedTargetChanges = true;
              }
            } catch (error) {
              console.error(`자동 분석 실패 (${target}):`, error);
              newAnalyzedTargets[target] = { status: "error" };
              hasAnalyzedTargetChanges = true;
            }
          })
        );
      }

      if (hasAnalyzedTargetChanges) {
        setAnalyzedTargets(newAnalyzedTargets);
      }
      setIsAnalyzing(false);
      console.log("자동 분석 완료");
    };

    autoAnalyzeTargets();
  }, [
    emailData,
    analyzedTargets,
    isAnalyzing,
    isDomainFailed,
    isTargetAnalyzed,
    saveFailedDomain,
    saveResultToCache,
  ]);

  // VirusTotal 분석 수행
  const handleVirusTotalCheck = async (target, type = "ip") => {
    // 캐시된 결과가 있는 경우 사용
    if (target in resultsCache) {
      setVirusTotalTarget(target);
      setVirusTotalResults(resultsCache[target]);
      setVirusTotalModalOpen(true);
      return;
    }

    setVirusTotalTarget(target);
    setVirusTotalResults(null);
    setVirusTotalLoading(true);
    setVirusTotalModalOpen(true);

    try {
      try {
        const response = await axios.post("/api/virustotal", { target });

        if (response.status === 200) {
          const data = response.data;

          // DNS 조회 실패 처리
          if (
            data.query_status === "failed" &&
            data.error === "DNS 조회 실패"
          ) {
            saveFailedDomain(target);
          } else {
            // 의심 상태 체크 (suspicious 항목이 있는지 확인)
            const isSuspicious =
              data.analysis_stats?.suspicious > 0 || // URL 분석
              data.analysis_stats?.malicious_details?.some((detail) =>
                detail.result.includes("suspicious")
              ) ||
              false; // IP 분석

            if (isSuspicious && data.threat !== "malicious") {
              // 기존 데이터에 의심 상태 추가
              data.threat = "suspicious";
              data.message = "의심스러운 요소가 발견되었습니다.";
            }

            saveResultToCache(target, data);
          }

          setVirusTotalResults(data);
        } else {
          setVirusTotalResults({
            error: "분석 중 오류가 발생했습니다.",
            details: response.data,
          });
        }
      } catch (apiError) {
        console.error(
          `VirusTotal API 요청 오류 (${target}):`,
          apiError.message
        );
        setVirusTotalResults({
          error: "서버 오류로 분석이 실패했습니다.",
          details: apiError.message,
          message: "서버 내부 오류가 발생했습니다. 나중에 다시 시도해 주세요.",
        });
      }
    } catch (error) {
      console.error("VirusTotal 분석 오류:", error);
      setVirusTotalResults({
        error: "분석 요청 중 오류가 발생했습니다.",
        details: error.response?.data || error.message,
      });
    } finally {
      setVirusTotalLoading(false);
    }
  };

  // 모달 닫기
  const closeVirusTotalModal = () => {
    setVirusTotalModalOpen(false);
  };

  // 로딩 처리
  if (loading) {
    return renderStatusState(
      <div className="text-center">
        <div className="mb-4 text-2xl font-bold text-heading dark:text-white">
          📧 분석 결과 로딩 중...
        </div>
        <p className="mb-4 text-sm text-text-light dark:text-gray-400">
          분석 결과와 위협 인텔리전스 데이터를 불러오고 있습니다.
        </p>
        <div className="mx-auto h-1 w-48 animate-pulse rounded-full bg-primary"></div>
      </div>
    );
  }

  // 오류 처리
  if (error) {
    return renderStatusState(
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <h1 className="mb-4 text-2xl font-bold text-red-700 dark:text-red-300">
          오류 발생
        </h1>
        <p className="mb-4 text-text dark:text-gray-200">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!emailData) {
    return renderStatusState(
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
        <h1 className="mb-4 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
          분석 결과 없음
        </h1>
        <p className="mb-4 text-text dark:text-gray-200">
          해당 ID의 분석 결과를 찾을 수 없습니다. 서버 비저장 정책으로 인해 브라우저 세션이 종료되면 결과가 사라질 수 있습니다.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white ${styles.consolePage} ${orbitron.variable} ${rajdhani.variable}`}
    >
      <div className={styles.gridBackdrop} aria-hidden="true" />
      <Head>
        <title>이메일 분석 결과 - NAVER MAIL ANALYZER</title>
        <meta name="description" content="네이버 이메일 스팸/피싱 분석 결과" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={`${styles.headerBar} p-4 shadow-md mb-6`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1
              className={`text-xl font-semibold ${styles.brandTitle}`}
              onClick={() => router.push("/naver")}
            >
              THREAT INTELLIGENCE CONSOLE
            </h1>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className={`container mx-auto px-4 py-8 ${styles.consoleContainer}`}>
        <motion.div className={styles.commandStrip} {...getPanelMotion(0.02)}>
          <span className={styles.stripLabel}>OPS MODE</span>
          <span className={styles.stripValue}>LIVE MONITORING</span>
          <span className={styles.stripLabel}>ANALYSIS ID</span>
          <span className={styles.stripValue}>{emailData.id}</span>
          <span className={styles.stripLabel}>THREAT SCORE</span>
          <span className={styles.stripValue}>{emailData.risk?.score ?? "-"}</span>
        </motion.div>

        <motion.div {...getPanelMotion(0.06)}>
          <EmailHeader emailData={emailData} className={styles.hudPanel} />
        </motion.div>

        {isAnalyzing && (
          <motion.div
            className={`mb-4 p-3 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded flex items-center ${styles.statusAlert}`}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : { duration: 0.28 }}
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 dark:border-blue-300 mr-2"></div>
            <span>이메일 내 IP 및 URL 자동 분석 중...</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div {...getPanelMotion(0.1)}>
            <RiskScoreChecklist
              emailData={emailData}
              className={styles.hudPanel}
            />
          </motion.div>
          <motion.div {...getPanelMotion(0.14)}>
            <AuthenticationInfo
              emailData={emailData}
              className={styles.hudPanel}
            />
          </motion.div>
        </div>

        {ipLocations.length > 0 && (
          <motion.section
            className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6 ${styles.hudPanel} ${styles.routePanel}`}
            {...getPanelMotion(0.18)}
          >
            <h2 className="text-xl font-bold mb-4">수신 경로 모니터링</h2>
            <div className={styles.routeTelemetryGrid}>
              <div className={styles.routeTelemetryCard}>
                <span className={styles.routeTelemetryLabel}>NETWORK HOPS</span>
                <span className={styles.routeTelemetryValue}>{ipLocations.length}</span>
              </div>
              <div className={styles.routeTelemetryCard}>
                <span className={styles.routeTelemetryLabel}>COUNTRY NODES</span>
                <span className={styles.routeTelemetryValue}>{uniqueCountryCount}</span>
              </div>
              <div className={styles.routeTelemetryCard}>
                <span className={styles.routeTelemetryLabel}>ISP NODES</span>
                <span className={styles.routeTelemetryValue}>{uniqueIspCount || "-"}</span>
              </div>
              <div className={styles.routeTelemetryCard}>
                <span className={styles.routeTelemetryLabel}>TRACE ROUTE</span>
                <span className={styles.routeTelemetryValueLong}>{routeTraceLabel}</span>
              </div>
            </div>

            <div className={styles.routeSignalWrap}>
              <div className={styles.routeSignalMeta}>
                <span>GEO COVERAGE</span>
                <span>{geoCoverage}%</span>
              </div>
              <div className={styles.routeSignalTrack}>
                <motion.div
                  className={styles.routeSignalFill}
                  initial={shouldReduceMotion ? undefined : { width: "0%" }}
                  animate={shouldReduceMotion ? undefined : { width: `${geoCoverage}%` }}
                  transition={shouldReduceMotion ? undefined : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={shouldReduceMotion ? { width: `${geoCoverage}%` } : undefined}
                />
              </div>
            </div>

            {hasGeoLocations && (
              <motion.div
                className={styles.routeMapCard}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.35, delay: 0.08 }}
              >
                <div className={styles.routeMapMeta}>
                  <span className={styles.routeMapMetaLabel}>GLOBAL ROUTE MAP</span>
                  <span className={styles.routeMapMetaValue}>
                    GEO NODES {geolocatedCount}/{ipLocations.length}
                  </span>
                </div>
                <div className={styles.routeMapViewport}>
                  <ReceivedPathMap ipLocations={ipLocations} />
                </div>
              </motion.div>
            )}

            <div className="mt-4 text-sm">
              <h3 className="font-bold mb-2">네트워크 홉:</h3>
              <ul className="space-y-2">
                {ipLocations.map((loc, idx) => (
                  <motion.li
                    key={`path-${idx}`}
                    className={`flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded ${styles.routeItem}`}
                    {...getRouteItemMotion(idx)}
                  >
                    <span className="mr-2 font-medium">{idx + 1}.</span>
                    <span className="mr-2">
                      {loc.countryCode && countryCodeToFlag(loc.countryCode)}
                    </span>
                    <div className="flex flex-col flex-grow">
                      <span>
                        {loc.ip} ({loc.country || "알 수 없음"}
                        {loc.city ? `, ${loc.city}` : ""})
                      </span>
                      {loc.latitude && loc.longitude && (
                        <span className="text-xs text-gray-500 mt-1">
                          좌표: {loc.latitude.toFixed(4)},{" "}
                          {loc.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex space-x-2">
                      <VirusTotalButton
                        target={loc.ip}
                        type="ip"
                        onClick={() => handleVirusTotalCheck(loc.ip, "ip")}
                        analyzed={analyzedTargets[loc.ip]}
                        failed={isDomainFailed(loc.ip)}
                      />
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {emailData.receivedDetails &&
              emailData.receivedDetails.length > 0 && (
                <div className="mt-4">
                  <motion.button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`text-blue-500 hover:text-blue-600 flex items-center text-sm ${styles.toggleDetailButton}`}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  >
                    {showDetails
                      ? "상세 정보 숨기기"
                      : "Received 헤더 상세 정보 보기"}
                    <svg
                      className={`ml-1 h-5 w-5 transform ${
                        showDetails ? "rotate-180" : ""
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>

                  {showDetails && (
                    <motion.div
                      className="mt-2 overflow-auto max-h-96 text-xs"
                      initial={
                        shouldReduceMotion ? undefined : { opacity: 0, y: 6 }
                      }
                      animate={
                        shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
                      }
                      transition={shouldReduceMotion ? undefined : { duration: 0.24 }}
                    >
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-2 text-left">#</th>
                            <th className="p-2 text-left">From</th>
                            <th className="p-2 text-left">By</th>
                            <th className="p-2 text-left">IP</th>
                            <th className="p-2 text-left">날짜</th>
                            <th className="p-2 text-left">분석</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailData.receivedDetails.map((detail, idx) => (
                            <tr
                              key={`detail-${idx}`}
                              className="border-b border-gray-200 dark:border-gray-600"
                            >
                              <td className="p-2">{idx + 1}</td>
                              <td className="p-2">
                                {detail.from || "-"}
                                {detail.from && !detail.ip && (
                                  <div className="mt-1">
                                    <VirusTotalButton
                                      target={detail.from}
                                      type="url"
                                      onClick={() =>
                                        handleVirusTotalCheck(
                                          detail.from,
                                          "url"
                                        )
                                      }
                                      analyzed={analyzedTargets[detail.from]}
                                      failed={isDomainFailed(detail.from)}
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="p-2">
                                {detail.by || "-"}
                                {detail.by && !detail.ip && (
                                  <div className="mt-1">
                                    <VirusTotalButton
                                      target={detail.by}
                                      type="url"
                                      onClick={() =>
                                        handleVirusTotalCheck(detail.by, "url")
                                      }
                                      analyzed={analyzedTargets[detail.by]}
                                      failed={isDomainFailed(detail.by)}
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="p-2">
                                {detail.ip || "-"}
                              </td>
                              <td className="p-2">{detail.date || "-"}</td>
                              <td className="p-2">
                                {detail.ip && (
                                  <VirusTotalButton
                                    target={detail.ip}
                                    type="ip"
                                    onClick={() =>
                                      handleVirusTotalCheck(detail.ip, "ip")
                                    }
                                    analyzed={analyzedTargets[detail.ip]}
                                    failed={isDomainFailed(detail.ip)}
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </div>
              )}
          </motion.section>
        )}

        <motion.div {...getPanelMotion(0.24)}>
          <EmailBodyContent
            emailData={emailData}
            onCheckUrl={(url) => handleVirusTotalCheck(url, "url")}
            failedDomains={failedDomains}
            analyzedTargets={analyzedTargets}
            className={styles.hudPanel}
          />
        </motion.div>

        {/* VirusTotal 검사 결과 모달 */}
        <VirusTotalModal
          isOpen={virusTotalModalOpen}
          onClose={closeVirusTotalModal}
          results={virusTotalResults}
          target={virusTotalTarget}
          isLoading={virusTotalLoading}
        />
      </div>
      <Footer />
    </div>
  );
}
