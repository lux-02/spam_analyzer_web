import React, { useState } from "react";

const CheckItem = ({
  title,
  description,
  passed,
  deduction,
  bonus = false,
}) => {
  return (
    <div className="flex items-start p-3 border-b">
      <div className="flex-shrink-0 mt-0.5">
        {passed ? (
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          {deduction !== 0 && (
            <span
              className={`text-sm font-semibold ${
                bonus ? "text-green-600" : "text-red-600"
              }`}
            >
              {bonus ? `+${Math.abs(deduction)}` : `-${Math.abs(deduction)}`}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

const RiskScoreChecklist = ({ emailData }) => {
  const [showChecklist, setShowChecklist] = useState(true);

  if (!emailData || !emailData.risk) return null;

  // 위험도 평가 항목
  const riskFactors = [
    {
      id: "spf",
      title: "SPF 인증",
      passed: emailData.spf === "pass",
      description:
        "이메일 서버가 발신자 도메인을 대신해 메일을 보낼 권한이 있는지 확인합니다.",
      deduction:
        emailData.spf === "pass"
          ? 0
          : emailData.spf === "fail" || emailData.spf === "none"
          ? -15
          : -10,
    },
    {
      id: "dkim",
      title: "DKIM 서명",
      passed: emailData.dkim === "pass",
      description:
        "발신자가 서명한 이메일 본문이 전송 중에 변조되지 않았는지 확인합니다.",
      deduction:
        emailData.dkim === "pass" ? 0 : emailData.dkim === "fail" ? -10 : 0,
    },
    {
      id: "dmarc",
      title: "DMARC 정책",
      passed: emailData.dmarc === "pass",
      description:
        "도메인 소유자가 정의한 이메일 인증 정책을 준수하는지 확인합니다.",
      deduction:
        emailData.dmarc === "pass" ? 0 : emailData.dmarc === "fail" ? -10 : 0,
    },
    {
      id: "beacons",
      title: "추적 픽셀 (비콘)",
      passed: !emailData.beacons || emailData.beacons.length === 0,
      description: "이메일에 숨겨진 추적 이미지가 포함되어 있는지 확인합니다.",
      deduction: !emailData.beacons || emailData.beacons.length === 0 ? 0 : -10,
    },
  ];

  // LLM 분석 결과가 있으면 위험도 평가 항목에 추가
  if (emailData.llmAnalysis) {
    const { category, confidence, riskScore, reason } = emailData.llmAnalysis;

    // 위험한 의도로 분류된 경우만 리스크 체크리스트에 추가
    const isHighRiskCategory = [
      "비밀번호 변경 요청",
      "송장/청구서 위장",
      "로그인 시도 알림",
    ].includes(category);
    const isSpamCategory = category === "스팸 광고";
    const isNormalCategory = category === "정상 업무 메일";

    if (isHighRiskCategory || isSpamCategory || isNormalCategory) {
      let deductionValue = 0;
      let isPassed = false;

      // API에서 제공하는 riskScore 값을 직접 사용
      deductionValue = riskScore;

      if (isHighRiskCategory) {
        isPassed = false;
      } else if (isSpamCategory) {
        isPassed = false;
      } else if (isNormalCategory) {
        isPassed = true;
      }

      riskFactors.push({
        id: "llm_analysis",
        title: "AI 내용 분석",
        passed: isPassed,
        description: `${
          reason ||
          `이메일이 ${category}으로 분류되었습니다 (신뢰도: ${confidence})`
        }`,
        deduction: deductionValue,
        bonus: deductionValue > 0,
      });
    }
  }

  // 모든 인증 통과 시 가산점
  const passedAll =
    emailData.spf === "pass" &&
    emailData.dkim === "pass" &&
    emailData.dmarc === "pass";

  // API에서 계산된 점수 사용
  const calculatedScore = emailData.risk.score;

  const riskLevel =
    calculatedScore <= 40
      ? "danger"
      : calculatedScore <= 70
      ? "suspicious"
      : "safe";

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">위험도 점수</h2>
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="text-blue-500 hover:text-blue-600 flex items-center"
        >
          {showChecklist ? "닫기" : "점수 계산 방식 보기"}
          <svg
            className={`ml-1 h-5 w-5 transform ${
              showChecklist ? "rotate-180" : ""
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
      </div>

      <div className="flex items-center mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${
              riskLevel === "safe"
                ? "bg-green-500"
                : riskLevel === "suspicious"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${calculatedScore}%` }}
          ></div>
        </div>
        <span className="ml-4 font-bold text-lg">{calculatedScore}</span>
      </div>

      {/* AI 분석 결과 메시지 표시 */}
      {emailData.llmAnalysis && emailData.llmAnalysis.analysisMessage && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded text-indigo-800">
          🤖 {emailData.llmAnalysis.analysisMessage}
        </div>
      )}

      {showChecklist && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 font-semibold border-b">
            위험도 계산 체크리스트
          </div>

          <div>
            {riskFactors.map((factor) => (
              <CheckItem
                key={factor.id}
                title={factor.title}
                description={factor.description}
                passed={factor.passed}
                deduction={factor.deduction}
                bonus={factor.bonus}
              />
            ))}

            {passedAll && (
              <CheckItem
                title="모든 인증 통과"
                description="SPF, DKIM, DMARC 인증이 모두 통과되었습니다."
                passed={true}
                deduction={10}
                bonus={true}
              />
            )}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t">
            <div className="flex justify-between">
              <span className="font-semibold">최종 점수:</span>
              <span className="font-bold">{calculatedScore} / 100</span>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span>위험 등급:</span>
              <span>
                {riskLevel === "safe" && "🟢 정상"}
                {riskLevel === "suspicious" && "🟠 의심"}
                {riskLevel === "danger" && "🔴 위험"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>점수 해석:</strong>
        </p>
        <ul className="mt-1 pl-5 list-disc">
          <li>
            <strong>0-40점:</strong> 매우 위험 - 심각한 피싱/스미싱 가능성
          </li>
          <li>
            <strong>41-70점:</strong> 의심스러움 - 일부 위험 요소 있음
          </li>
          <li>
            <strong>71-100점:</strong> 안전함 - 위험 요소 없거나 미미함
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RiskScoreChecklist;
