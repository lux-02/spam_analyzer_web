import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import {
  countryCodeToFlag,
  isValidIpAddress,
  isValidUrl,
  isAnalyzableTarget,
} from "@/utils/emailAnalyzer";

// 컴포넌트 import
import EmailHeader from "@/components/EmailHeader";
import AuthenticationInfo from "@/components/AuthenticationInfo";
import ReceivedPathMap from "@/components/ReceivedPathMap";
import EmailBodyContent from "@/components/EmailBodyContent";
import RiskScoreChecklist from "@/components/RiskScoreChecklist";
import VirusTotalButton from "@/components/VirusTotalButton";
import VirusTotalModal from "@/components/VirusTotalModal";
import AdBanner from "@/components/ui/AdBanner";

// 로컬 스토리지 키 상수
const FAILED_DOMAINS_KEY = "vtFailedDomains";
const VT_RESULTS_CACHE_KEY = "vtResultsCache";

export default function EmailAnalysisResult() {
  const router = useRouter();
  const { id } = router.query;
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ipLocations, setIpLocations] = useState([]);
  const [showMap, setShowMap] = useState(true);
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
  const saveFailedDomain = (domain) => {
    if (typeof window === "undefined" || !domain) return;

    const newFailedDomains = [...failedDomains, domain];
    setFailedDomains(newFailedDomains);
    localStorage.setItem(FAILED_DOMAINS_KEY, JSON.stringify(newFailedDomains));
  };

  // 결과를 캐시에 저장하는 함수
  const saveResultToCache = (target, result) => {
    if (typeof window === "undefined" || !target) return;

    const newCache = { ...resultsCache, [target]: result };
    setResultsCache(newCache);
    localStorage.setItem(VT_RESULTS_CACHE_KEY, JSON.stringify(newCache));
  };

  // 도메인이 실패 목록에 있는지 확인하는 함수
  const isDomainFailed = (domain) => {
    return failedDomains.includes(domain);
  };

  // 타겟이 이미 분석되었는지 확인하는 함수
  const isTargetAnalyzed = (target) => {
    return target in analyzedTargets;
  };

  // 이메일 분석 결과 가져오기
  useEffect(() => {
    const fetchEmailData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/email/${id}`);

        if (!response.ok) {
          throw new Error("분석 결과를 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        setEmailData(data);

        // IP 주소 위치 정보 가져오기
        if (data.ipAddresses && data.ipAddresses.length > 0) {
          const ipLocations = await Promise.all(
            data.ipAddresses.map(async (ip) => {
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
  }, [id]);

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

      for (let i = 0; i < targetsArray.length; i += batchSize) {
        const batch = targetsArray.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (target) => {
            try {
              console.log(`분석 중: ${target}`);
              newAnalyzedTargets[target] = { status: "analyzing" };

              const type = isValidIpAddress(target) ? "ip" : "url";
              const response = await axios.post("/api/virustotal", { target });

              if (response.status === 200) {
                const data = response.data;

                // DNS 조회 실패 처리
                if (
                  data.query_status === "failed" &&
                  data.error === "DNS 조회 실패"
                ) {
                  saveFailedDomain(target);
                  newAnalyzedTargets[target] = { status: "failed" };
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
                }
              } else {
                newAnalyzedTargets[target] = { status: "error" };
              }
            } catch (error) {
              console.error(`자동 분석 실패 (${target}):`, error);
              newAnalyzedTargets[target] = { status: "error" };
            }
          })
        );
      }

      setAnalyzedTargets(newAnalyzedTargets);
      setIsAnalyzing(false);
      console.log("자동 분석 완료");
    };

    autoAnalyzeTargets();
  }, [emailData]);

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
      const response = await axios.post("/api/virustotal", { target });

      if (response.status === 200) {
        const data = response.data;

        // DNS 조회 실패 처리
        if (data.query_status === "failed" && data.error === "DNS 조회 실패") {
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

  // VirusTotal 체크 및 VT Graph 모달 열기
  const handleVTGraphOpen = (ip) => {
    handleVirusTotalCheck(ip, "ip");
  };

  // 로딩 처리
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">📧 분석 결과 로딩 중...</div>
          <div className="animate-pulse bg-blue-500 h-1 w-48 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // 오류 처리
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-lg w-full">
          <h1 className="text-2xl font-bold text-red-700 mb-4">오류 발생</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!emailData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg max-w-lg w-full">
          <h1 className="text-2xl font-bold text-yellow-700 mb-4">
            분석 결과 없음
          </h1>
          <p className="text-gray-700 mb-4">
            해당 ID의 분석 결과를 찾을 수 없습니다.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 메타 타이틀 설정
  const pageTitle = emailData.subject
    ? `${emailData.subject} - 스팸 메일 분석 결과`
    : "이메일 분석 결과";

  // 지도 표시 토글 핸들러
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white">
      <Head>
        <title>이메일 분석 결과 - NAVER MAIL ANALYZER</title>
        <meta name="description" content="네이버 이메일 스팸/피싱 분석 결과" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 shadow-md mb-6">
        <div className="container mx-auto">
          <div className="flex items-center">
            <h1
              className="text-xl font-semibold"
              onClick={() => router.push("/naver")}
            >
              NAVER MAIL ANALYZER
            </h1>

            <button
              onClick={() => router.push("/naver")}
              className="ml-auto bg-white text-blue-700 px-3 py-1 rounded hover:bg-gray-100"
            >
              NEW
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <EmailHeader emailData={emailData} />

        {isAnalyzing && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 dark:border-blue-300 mr-2"></div>
            <span>이메일 내 IP 및 URL 자동 분석 중...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskScoreChecklist emailData={emailData} />
          <AuthenticationInfo emailData={emailData} />
        </div>

        {ipLocations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold mb-4">이메일 경로 추적</h2>

              <button
                onClick={toggleMap}
                className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {showMap ? "지도 숨기기" : "지도 보기"}
              </button>
            </div>

            {showMap && (
              <div
                className="h-96 w-full rounded-lg overflow-hidden"
                key={`map-container-${id}`}
              >
                <ReceivedPathMap ipLocations={ipLocations} />
              </div>
            )}

            <div className="mt-4 text-sm">
              <h3 className="font-bold mb-2">서버 경로:</h3>
              <ul className="space-y-2">
                {ipLocations.map((loc, idx) => (
                  <li
                    key={`path-${idx}`}
                    className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
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
                  </li>
                ))}
              </ul>
            </div>

            {emailData.receivedPaths && emailData.receivedPaths.length > 0 && (
              <div className="mt-4 text-sm">
                <h3 className="font-bold mb-2">모든 Received 경로(시간순):</h3>
                <ul className="space-y-2">
                  {emailData.receivedPaths.map((path, idx) => (
                    <li
                      key={`full-path-${idx}`}
                      className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="mr-2 font-medium">{idx + 1}.</span>
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {emailData.receivedDetails &&
              emailData.receivedDetails.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-500 hover:text-blue-600 flex items-center text-sm"
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
                  </button>

                  {showDetails && (
                    <div className="mt-2 overflow-auto max-h-96 text-xs">
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
                                {detail.ip && (
                                  <div className="mt-1">
                                    <VirusTotalButton
                                      target={detail.ip}
                                      type="ip"
                                      onClick={() =>
                                        handleVirusTotalCheck(detail.ip, "ip")
                                      }
                                      analyzed={analyzedTargets[detail.ip]}
                                      failed={isDomainFailed(detail.ip)}
                                    />
                                  </div>
                                )}
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
                    </div>
                  )}
                </div>
              )}
          </div>
        )}

        <EmailBodyContent
          emailData={emailData}
          onCheckUrl={(url) => handleVirusTotalCheck(url, "url")}
          failedDomains={failedDomains}
          analyzedTargets={analyzedTargets}
        />

        {/* VirusTotal 검사 결과 모달 */}
        <VirusTotalModal
          isOpen={virusTotalModalOpen}
          onClose={closeVirusTotalModal}
          results={virusTotalResults}
          target={virusTotalTarget}
          isLoading={virusTotalLoading}
        />
      </div>

      {/* 하단 광고 배너 추가 */}
      <div className="container mx-auto px-4 mb-4">
        <AdBanner slot="3456789012" format="auto" />
      </div>
    </div>
  );
}
