import React from "react";

const RiskBadge = ({ level, score }) => {
  let badgeColor, icon, label;

  switch (level) {
    case "high":
    case "danger":
      badgeColor = "bg-red-500";
      icon = "🔴";
      label = "위험";
      break;
    case "medium":
    case "suspicious":
      badgeColor = "bg-orange-500";
      icon = "🟠";
      label = "의심";
      break;
    case "low":
    case "safe":
      badgeColor = "bg-green-500";
      icon = "🟢";
      label = "정상";
      break;
    default:
      badgeColor = "bg-gray-500";
      icon = "❓";
      label = "알 수 없음";
  }

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full ${badgeColor} text-white font-medium`}
    >
      <span className="mr-1">{icon}</span>
      <span>{label}</span>
      {score !== undefined && <span className="ml-2 font-bold">{score}점</span>}
    </div>
  );
};

export default RiskBadge;
