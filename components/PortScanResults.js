import React, { useState } from "react";

const PortScanResults = ({ scanResults, isLoading }) => {
  const [expandedPort, setExpandedPort] = useState(null);
  const [showAllClosedPorts, setShowAllClosedPorts] = useState(false);
  const [showClosedPortDetails, setShowClosedPortDetails] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
          <span>포트 스캔 및 배너그랩 진행 중...</span>
        </div>
      </div>
    );
  }

  if (!scanResults || !scanResults.scan_result) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        스캔 결과가 없습니다.
      </div>
    );
  }

  if (scanResults.scan_result.error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg">
        <h3 className="font-bold mb-2">스캔 중 오류 발생:</h3>
        <p>{scanResults.scan_result.error}</p>
        <p className="mt-2 text-sm">
          nmap이 설치되어 있는지 확인하세요. 터미널에서 'brew install nmap'
          명령으로 설치할 수 있습니다.
        </p>
      </div>
    );
  }

  const { scan_result, scan_time } = scanResults;
  const open_ports = scan_result.open_ports || [];
  const filtered_ports = scan_result.filtered_ports || [];
  const closed_ports = scan_result.closed_ports || [];

  const togglePortDetails = (portNumber) => {
    if (expandedPort === portNumber) {
      setExpandedPort(null);
    } else {
      setExpandedPort(portNumber);
    }
  };

  const initialClosedPortsToShow = 12;
  const displayedClosedPorts = showAllClosedPorts
    ? closed_ports
    : closed_ports.slice(0, initialClosedPortsToShow);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-lg font-bold">포트 스캔 결과</h3>
        <span className="text-xs text-gray-500">소요 시간: {scan_time}</span>
      </div>

      {open_ports.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
            열린 포트 ({open_ports.length})
          </h4>
          <ul className="space-y-2">
            {open_ports.map((port) => (
              <li
                key={`open-${port.port}`}
                className="border border-green-200 dark:border-green-900 rounded-lg p-3 bg-green-50 dark:bg-green-900/20"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => togglePortDetails(port.port)}
                >
                  <div>
                    <span className="font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                      {port.port}
                    </span>
                    <span className="ml-3 font-medium">
                      {port.service || "알 수 없음"}
                    </span>
                    {port.service_detail && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({port.service_detail})
                      </span>
                    )}
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    {expandedPort === port.port ? "접기" : "상세 정보"}
                  </button>
                </div>

                {expandedPort === port.port && port.banner && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <h5 className="text-sm font-semibold mb-1">배너 정보:</h5>
                    <pre className="bg-black/10 dark:bg-black/30 p-2 rounded-md overflow-x-auto text-xs whitespace-pre-wrap">
                      {port.banner}
                    </pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {filtered_ports.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
            필터링된 포트 ({filtered_ports.length})
          </h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filtered_ports.map((port) => (
                <li key={`filtered-${port.port}`} className="text-center">
                  <span
                    className="font-mono bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-sm"
                    title={`서비스: ${port.service || "알 수 없음"}${
                      port.service_detail ? ` (${port.service_detail})` : ""
                    }`}
                  >
                    {port.port}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {closed_ports.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2 flex justify-between items-center">
            <span>닫힌 포트 ({closed_ports.length})</span>
            <button
              onClick={() => setShowClosedPortDetails(!showClosedPortDetails)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              {showClosedPortDetails ? "간단히 보기" : "상세 정보 보기"}
            </button>
          </h4>

          <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
            {showClosedPortDetails ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-2 px-3 text-left">포트</th>
                      <th className="py-2 px-3 text-left">서비스</th>
                      <th className="py-2 px-3 text-left">상세 정보</th>
                      <th className="py-2 px-3 text-left">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedClosedPorts.map((port) => (
                      <tr
                        key={`closed-detail-${port.port}`}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-2 px-3 font-mono">{port.port}</td>
                        <td className="py-2 px-3">
                          {port.service || "알 수 없음"}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-500">
                          {port.service_detail || "-"}
                        </td>
                        <td className="py-2 px-3">닫힘</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {closed_ports.length > initialClosedPortsToShow && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => setShowAllClosedPorts(!showAllClosedPorts)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showAllClosedPorts
                        ? "접기"
                        : `나머지 ${
                            closed_ports.length - initialClosedPortsToShow
                          }개 포트 더 보기`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {displayedClosedPorts.map((port) => (
                    <li key={`closed-${port.port}`} className="text-center">
                      <span
                        className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                        title={`서비스: ${port.service || "알 수 없음"}${
                          port.service_detail ? ` (${port.service_detail})` : ""
                        }`}
                      >
                        {port.port}
                      </span>
                    </li>
                  ))}
                </ul>

                {closed_ports.length > initialClosedPortsToShow && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => setShowAllClosedPorts(!showAllClosedPorts)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showAllClosedPorts
                        ? "접기"
                        : `나머지 ${
                            closed_ports.length - initialClosedPortsToShow
                          }개 포트 더 보기`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {open_ports.length === 0 &&
        filtered_ports.length === 0 &&
        closed_ports.length === 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p>
              스캔된 포트가 없습니다. nmap이 올바르게 설치되어 있는지
              확인하세요.
            </p>
          </div>
        )}
    </div>
  );
};

export default PortScanResults;
