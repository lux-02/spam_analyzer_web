import React from "react";

const getDescription = (type) => {
  switch (type) {
    case "SPF":
      return "발신자 서버 권한 확인";
    case "DKIM":
      return "이메일 무결성 검증";
    case "DMARC":
      return "도메인 정책 준수";
    default:
      return "";
  }
};

const AuthStatus = ({ type, status }) => {
  let bg, icon, text;

  switch (status) {
    case "pass":
      bg = "bg-green-100 text-green-800";
      icon = "✓";
      text = "통과";
      break;
    case "fail":
      bg = "bg-red-100 text-red-800";
      icon = "✗";
      text = "실패";
      break;
    case "softfail":
      bg = "bg-yellow-100 text-yellow-800";
      icon = "!";
      text = "일부 통과";
      break;
    case "neutral":
      bg = "bg-gray-100 text-gray-800";
      icon = "-";
      text = "중립";
      break;
    case "none":
      bg = "bg-gray-100 text-gray-800";
      icon = "-";
      text = "없음";
      break;
    default:
      bg = "bg-gray-100 text-gray-800";
      icon = "?";
      text = "알 수 없음";
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <span className="font-bold min-w-20">{type}:</span>
        <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
          {getDescription(type)}
        </span>
      </div>
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full ${bg} text-sm font-medium`}
      >
        <span className="mr-1">{icon}</span>
        {text}
      </span>
    </div>
  );
};

const AuthenticationInfo = ({ emailData }) => {
  if (!emailData) return null;

  const { spf, dkim, dmarc } = emailData;

  const allPassed = spf === "pass" && dkim === "pass" && dmarc === "pass";
  const anyFailed = spf === "fail" || dkim === "fail" || dmarc === "fail";

  let statusMessage = "";
  if (allPassed) {
    statusMessage = "✅ 모든 인증이 정상적으로 통과되었습니다.";
  } else if (anyFailed) {
    statusMessage = "⚠️ 일부 인증에 실패했습니다. 발신자를 신뢰할 수 없습니다.";
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">🔐</span>
        인증 정보
      </h2>

      <div className="space-y-1 mb-4">
        <AuthStatus type="SPF" status={spf} />
        <AuthStatus type="DKIM" status={dkim} />
        <AuthStatus type="DMARC" status={dmarc} />
      </div>

      {statusMessage && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            allPassed
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-200"
              : "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-800 dark:text-yellow-200"
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">{allPassed ? "✅" : "⚠️"}</span>
            {statusMessage}
          </div>
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          인증 방식 상세 설명
        </summary>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p>
              <strong>SPF (Sender Policy Framework):</strong> 발신자 서버가
              이메일을 보낼 권한이 있는지 확인합니다.
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p>
              <strong>DKIM (DomainKeys Identified Mail):</strong> 이메일 내용이
              전송 중에 변경되지 않았는지 확인합니다.
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p>
              <strong>DMARC (Domain-based Message Authentication):</strong>{" "}
              도메인 소유자가 설정한 인증 정책을 준수하는지 확인합니다.
            </p>
          </div>
        </div>
      </details>

    </div>
  );
};

export default AuthenticationInfo;
