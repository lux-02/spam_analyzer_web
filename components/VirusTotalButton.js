import React from "react";
import { isAnalyzableTarget } from "../utils/emailAnalyzer";

export default function VirusTotalButton({
  target,
  type,
  onClick,
  analyzed,
  failed,
}) {
  // 분석 불가능한 대상인 경우 버튼 표시하지 않음
  if (!isAnalyzableTarget(target, type)) {
    return null;
  }

  // 이미 실패로 확인된 경우 비활성화된 버튼 표시
  if (failed || (analyzed && analyzed.status === "failed")) {
    return (
      <button
        disabled
        className="inline-flex items-center px-2 py-1 text-xs bg-gray-400 text-white rounded opacity-60 cursor-not-allowed"
        title="DNS 조회 실패"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        분석 불가
      </button>
    );
  }

  // 분석중인 경우 로딩 표시
  if (analyzed && analyzed.status === "analyzing") {
    return (
      <button
        disabled
        className="inline-flex items-center px-2 py-1 text-xs bg-blue-400 text-white rounded"
        title="분석 중..."
      >
        <svg
          className="animate-spin h-3 w-3 mr-1"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        분석 중
      </button>
    );
  }

  // 이미 분석 완료된 경우 결과에 따라 버튼 스타일 변경
  if (analyzed && analyzed.status === "analyzed") {
    const isMalicious = analyzed.threat === "malicious";
    const isSuspicious = analyzed.threat === "suspicious";

    // 결과에 따른 버튼 색상 및 아이콘 설정
    let buttonClass = "bg-green-600 hover:bg-green-700"; // 기본값(안전)
    let buttonTitle = `${target} 안전함`;
    let buttonText = "안전";

    if (isMalicious) {
      buttonClass = "bg-red-600 hover:bg-red-700";
      buttonTitle = `${target} 위험 감지됨`;
      buttonText = "위험";
    } else if (isSuspicious) {
      buttonClass = "bg-yellow-600 hover:bg-yellow-700";
      buttonTitle = `${target} 의심 사항 있음`;
      buttonText = "의심";
    }

    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center px-2 py-1 text-xs ${buttonClass} text-white rounded transition-colors`}
        title={buttonTitle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          {isMalicious ? (
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          ) : isSuspicious ? (
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1.002 1.002 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          )}
        </svg>
        {buttonText}
      </button>
    );
  }

  // 기본 버튼
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      title={`${target} 바이러스 검사하기`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
          clipRule="evenodd"
        />
      </svg>
      {type === "ip" ? "IP 분석" : "URL 분석"}
    </button>
  );
}
