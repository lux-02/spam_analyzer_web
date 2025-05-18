import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function DatabaseStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    // 데이터베이스 상태 확인
    checkDatabaseStatus();
  }, []);

  // MongoDB 상태 확인
  const checkDatabaseStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/check-db");
      setStatus(response.data);

      // 연결이 성공하면 최근 결과도 로드
      if (response.data.connected) {
        fetchRecentResults();
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 최근 분석 결과 가져오기
  const fetchRecentResults = async () => {
    setLoadingResults(true);

    try {
      // 최근 분석 결과를 가져오는 간단한 API 엔드포인트가 필요합니다.
      // 여기서는 예시로만 사용합니다.
      const response = await axios.get("/api/recent-results");
      setRecentResults(response.data);
    } catch (err) {
      console.error("최근 결과 로드 오류:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">데이터베이스 상태</h1>

      {loading ? (
        <div className="text-center p-6">
          <p>데이터베이스 상태를 확인하는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">오류 발생</p>
          <p>{error}</p>
          <button
            onClick={checkDatabaseStatus}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <div
            className={`p-4 mb-4 rounded ${
              status?.connected ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <p className="font-bold">
              {status?.connected
                ? "✅ MongoDB 연결 성공"
                : "❌ MongoDB 연결 실패"}
            </p>
            <p className="mt-2">{status?.message || status?.error}</p>

            {status?.server && (
              <p className="mt-2 text-sm text-gray-600">
                서버: {status.server}
              </p>
            )}
          </div>

          {/* 통계 정보 */}
          {status?.stats && (
            <div className="bg-white shadow rounded p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">위험도 통계</h2>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(status.stats).map(([level, count]) => (
                  <div
                    key={level}
                    className={`p-3 rounded text-center ${getRiskBgColor(
                      level
                    )}`}
                  >
                    <p className="font-bold text-xl">{count}</p>
                    <p className="text-sm">{getRiskLevelName(level)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 분석 결과 */}
          <div className="bg-white shadow rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">최근 분석 결과</h2>
              <button
                onClick={fetchRecentResults}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded"
                disabled={loadingResults}
              >
                {loadingResults ? "로드 중..." : "새로고침"}
              </button>
            </div>

            {loadingResults ? (
              <p className="text-center py-4 text-gray-500">
                최근 분석 결과를 불러오는 중...
              </p>
            ) : recentResults.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                최근 분석 결과가 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">제목</th>
                      <th className="px-3 py-2 text-left">발신자</th>
                      <th className="px-3 py-2 text-left">날짜</th>
                      <th className="px-3 py-2 text-center">위험도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((result) => (
                      <tr key={result.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-mono">
                          {result.id.substring(0, 8)}...
                        </td>
                        <td className="px-3 py-2">
                          {result.subject || "(제목 없음)"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {result.from || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {result.timestamp
                            ? format(
                                new Date(result.timestamp),
                                "yyyy-MM-dd HH:mm"
                              )
                            : "-"}
                        </td>
                        <td className="px-3 py-2">
                          <div
                            className={`inline-block rounded-full px-2 py-1 text-xs font-bold text-white ${getRiskBadgeColor(
                              result.risk?.level
                            )}`}
                          >
                            {getRiskLevelName(result.risk?.level)} (
                            {result.risk?.score || 0})
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 위험도 수준별 배경색
function getRiskBgColor(level) {
  switch (level) {
    case "high":
      return "bg-red-100";
    case "medium":
      return "bg-yellow-100";
    case "low":
      return "bg-blue-100";
    case "safe":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
}

// 위험도 배지 색상
function getRiskBadgeColor(level) {
  switch (level) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-blue-500";
    case "safe":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

// 위험도 수준 표시
function getRiskLevelName(level) {
  switch (level) {
    case "high":
      return "높음";
    case "medium":
      return "중간";
    case "low":
      return "낮음";
    case "safe":
      return "안전";
    default:
      return "미확인";
  }
}
