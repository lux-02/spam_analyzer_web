import React, { useState } from "react";
import { format } from "date-fns";
import RiskBadge from "./RiskBadge";
import { countryCodeToFlag } from "../utils/emailAnalyzer";

const EmailHeader = ({ emailData }) => {
  const [showRawData, setShowRawData] = useState(false);

  if (!emailData) return <div>데이터 로딩 중...</div>;

  const { from, to, subject, date, risk, id, timestamp, country, countryCode } =
    emailData;

  const formattedDate = date ? new Date(date) : new Date(timestamp);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <h1 className="text-2xl font-bold mb-4 break-words">
        {subject || "(제목 없음)"}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <RiskBadge level={risk?.riskLevel || risk?.level} score={risk?.score} />

        {country && countryCode && (
          <div className="flex items-center">
            <span className="text-2xl mr-1">
              {countryCodeToFlag(countryCode)}
            </span>
            <span>{country}</span>
          </div>
        )}

        <div className="ml-auto">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          >
            {showRawData ? "원문 닫기" : "원문 내용 보기"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            보낸 사람
          </p>
          <p className="font-semibold break-words">
            {from || "(발신자 정보 없음)"}
          </p>
        </div>
      </div>

      <div className="border-t pt-4 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap justify-between">
        <div>분석 ID: {id}</div>
        <div>분석 시간: {format(formattedDate, "yyyy-MM-dd HH:mm:ss")}</div>
      </div>

      {showRawData && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-auto max-h-96">
          <pre className="text-xs">
            {emailData.rawData || "원문 데이터가 없습니다."}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EmailHeader;
