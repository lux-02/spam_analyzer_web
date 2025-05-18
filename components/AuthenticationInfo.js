import React from "react";

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
    <div className="flex items-center">
      <span className="font-bold min-w-20">{type}:</span>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${bg} text-sm font-medium`}
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
      <h2 className="text-xl font-bold mb-4">인증 정보</h2>

      <div className="space-y-3 mb-4">
        {spf && <AuthStatus type="SPF" status={spf} />}
        {dkim && <AuthStatus type="DKIM" status={dkim} />}
        {dmarc && <AuthStatus type="DMARC" status={dmarc} />}
      </div>

      {statusMessage && (
        <div className="mt-4 p-3 rounded border border-gray-200 dark:border-gray-600">
          {statusMessage}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>SPF:</strong> 발신자 서버가 이메일을 보낼 권한이 있는지
          확인합니다.
        </p>
        <p>
          <strong>DKIM:</strong> 이메일 내용이 전송 중에 변경되지 않았는지
          확인합니다.
        </p>
        <p>
          <strong>DMARC:</strong> 도메인 소유자가 설정한 인증 정책을 준수하는지
          확인합니다.
        </p>
      </div>
    </div>
  );
};

export default AuthenticationInfo;
