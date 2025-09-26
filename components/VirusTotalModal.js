import React, { useState, useEffect } from "react";
import axios from "axios";
// PortScanResults 컴포넌트는 서버리스 환경에서 제거됨

export default function VirusTotalModal({
  isOpen,
  onClose,
  results,
  target,
  isLoading,
}) {
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [graphError, setGraphError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  // 세부 탐지 결과 표시 개수 토글 상태
  const [showAllMalicious, setShowAllMalicious] = useState(false);
  const [showAllSuspicious, setShowAllSuspicious] = useState(false);
  const [showAllOthers, setShowAllOthers] = useState(false);

  // IP 주소가 변경되면 데이터 초기화
  useEffect(() => {
    const ipAddress = results?.ip || results?.ip_address;
    if (ipAddress) {
      setGraphData(null);
      setGraphError(null);
    }
  }, [results?.ip, results?.ip_address, results?.portScanInfo]);

  // 모달이 닫힐 때 데이터 초기화
  useEffect(() => {
    if (!isOpen) {
      setGraphData(null);
      setGraphError(null);
      setLoadingGraph(false);
    }
  }, [isOpen]);

  // VT Graph 생성 함수
  const createGraph = async () => {
    // IP 주소만 처리 가능
    const ipAddress = results?.ip || results?.ip_address;
    if (!results || !ipAddress) {
      setGraphError("IP 주소에 대해서만 VT Graph를 생성할 수 있습니다.");
      return;
    }

    setLoadingGraph(true);
    setGraphError(null);
    setGraphData(null); // 기존 그래프 데이터 초기화

    try {
      console.log("그래프 생성 요청:", ipAddress);

      const response = await axios.post("/api/proxy-vt-graph", {
        node_id: ipAddress,
        node_type: "ip_address",
      });

      if (response.data.success) {
        console.log("그래프 생성 성공:", response.data.graph_id);
        setGraphData(response.data);
      } else {
        setGraphError(response.data.error || "그래프 생성에 실패했습니다.");
      }
    } catch (err) {
      setGraphError(
        err.response?.data?.error ||
          "서버 연결에 실패했습니다. Flask 서버가 실행 중인지 확인하세요."
      );
      console.error("VT Graph 생성 오류:", err);
    } finally {
      setLoadingGraph(false);
    }
  };

  // 모달 닫기 처리 함수
  const handleClose = () => {
    setGraphData(null);
    setGraphError(null);
    setLoadingGraph(false);
    onClose();
  };

  if (!isOpen) return null;

  // 안전한 분석 결과 엑세스를 위한 변수 설정
  const analysisStats = results?.analysis_stats || {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">대상 분석: {target}</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-center">분석 중입니다...</p>
            </div>
          ) : results ? (
            <>
              {/* URL이 IP로 변환된 경우 표시 */}
              {results.is_url_converted &&
                (results.ip || results.ip_address) && (
                  <div className="mb-4 bg-blue-50 dark:bg-blue-900 p-3 rounded text-blue-800 dark:text-blue-300">
                    <p>
                      <strong>참고:</strong> URL을 IP 주소로 변환하여
                      분석했습니다.
                    </p>
                    <p className="text-sm mt-1">
                      원본: {results.original_target} → IP:{" "}
                      {results.ip || results.ip_address}
                    </p>
                  </div>
                )}

              <div className="mb-6">
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    results.threat === "malicious"
                      ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : results.threat === "suspicious"
                      ? "bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : results.threat === "unknown"
                      ? "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300"
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">
                    검사 결과:{" "}
                    {results.threat === "malicious"
                      ? "위험"
                      : results.threat === "suspicious"
                      ? "의심"
                      : results.threat === "unknown"
                      ? "알 수 없음"
                      : "안전"}
                  </h3>
                  <p>{results.message}</p>

                  <div className="mt-3 space-y-2">
                    {results.virustotal_url && (
                      <div>
                        <a
                          href={results.virustotal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          VirusTotal에서 상세 결과 보기
                        </a>
                      </div>
                    )}

                    {/* IP 주소가 있는 경우에만 VT Graph 버튼 표시 */}
                    {(results.ip || results.ip_address) && (
                      <div>
                        {!graphData && !loadingGraph ? (
                          <button
                            onClick={createGraph}
                            className="text-blue-600 hover:underline"
                            disabled={loadingGraph}
                          >
                            VirusTotal Graph 생성하기
                          </button>
                        ) : loadingGraph ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-600">
                              그래프 생성 중...
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* VT Graph 결과 표시 */}
                {graphError && (
                  <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg mb-4">
                    <h3 className="text-red-700 dark:text-red-300 font-bold mb-2">
                      VT Graph 오류
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {graphError}
                    </p>
                  </div>
                )}

                {graphData && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-lg mb-2">VirusTotal Graph</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      IP 주소{" "}
                      <strong>{results.ip || results.ip_address}</strong>에 대한
                      VirusTotal 관계 그래프입니다.
                    </p>

                    <div className="text-left">
                      <a
                        href={graphData.ui_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        VirusTotal에서 그래프 보기
                      </a>

                      <div className="mt-2 text-xs text-gray-500">
                        <p>API 호출 수: {graphData.api_calls || "N/A"}</p>
                        <p>Graph ID: {graphData.graph_id}</p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="font-bold text-lg mb-2">통계 요약</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <div className="bg-red-50 dark:bg-red-900 p-3 rounded">
                    <span className="block text-xs text-red-800 dark:text-red-300">
                      악성
                    </span>
                    <span className="text-xl font-bold text-red-700 dark:text-red-300">
                      {analysisStats.malicious ||
                        analysisStats.malicious_count ||
                        0}
                    </span>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded">
                    <span className="block text-xs text-yellow-800 dark:text-yellow-300">
                      의심
                    </span>
                    <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                      {analysisStats.suspicious || 0}
                    </span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                    <span className="block text-xs text-green-800 dark:text-green-300">
                      안전
                    </span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-300">
                      {analysisStats.harmless || 0}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <span className="block text-xs text-gray-800 dark:text-gray-300">
                      미탐지
                    </span>
                    <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                      {analysisStats.undetected || 0}
                    </span>
                  </div>
                </div>

                {/* 세부 탐지 결과 */}
                {results?.analysis_results && (
                  <div className="mt-4">
                    <h3 className="font-bold text-lg mb-2">세부 탐지 결과</h3>
                    {(() => {
                      const entries = Object.entries(
                        results.analysis_results
                      ).map(([engine, r]) => ({
                        engine,
                        category: r?.category,
                        result: r?.result,
                      }));
                      const malicious = entries.filter(
                        (e) => e.category === "malicious"
                      );
                      const suspicious = entries.filter(
                        (e) => e.category === "suspicious"
                      );
                      const others = entries.filter(
                        (e) =>
                          e.category !== "malicious" &&
                          e.category !== "suspicious"
                      );

                      const Section = ({
                        title,
                        color,
                        items,
                        showAll,
                        onToggle,
                      }) => (
                        <div className="mb-3">
                          <div
                            className={`text-sm font-semibold mb-1 ${color}`}
                          >
                            {title} ({items.length})
                          </div>
                          {items.length === 0 ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              항목 없음
                            </div>
                          ) : (
                            <>
                              <ul className="text-sm space-y-1 max-h-56 overflow-auto pr-1">
                                {(showAll ? items : items.slice(0, 10)).map(
                                  (e) => (
                                    <li
                                      key={`${e.engine}-${e.result}`}
                                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-2 py-1"
                                    >
                                      <span className="font-medium">
                                        {e.engine}
                                      </span>
                                      <span className="text-right text-xs text-gray-600 dark:text-gray-300">
                                        {e.result || e.category || "-"}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                              {items.length > 10 && (
                                <button
                                  onClick={onToggle}
                                  className="mt-2 text-xs text-blue-600 hover:underline"
                                >
                                  {showAll
                                    ? "접기"
                                    : `모두 보기 (${items.length - 10}+)`}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );

                      return (
                        <div>
                          <Section
                            title="악성으로 탐지한 엔진"
                            color="text-red-600"
                            items={malicious}
                            showAll={showAllMalicious}
                            onToggle={() =>
                              setShowAllMalicious(!showAllMalicious)
                            }
                          />
                          <Section
                            title="의심으로 탐지한 엔진"
                            color="text-yellow-600"
                            items={suspicious}
                            showAll={showAllSuspicious}
                            onToggle={() =>
                              setShowAllSuspicious(!showAllSuspicious)
                            }
                          />
                          <Section
                            title="기타 결과"
                            color="text-gray-600"
                            items={others}
                            showAll={showAllOthers}
                            onToggle={() => setShowAllOthers(!showAllOthers)}
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 포트 스캔 및 배너그랩 섹션 제거됨 */}
            </>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg">
              결과를 불러오는데 실패했습니다. 다시 시도해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
