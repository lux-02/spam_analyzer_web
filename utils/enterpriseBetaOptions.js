// 기업용 베타 사전신청 선택지. 페이지(클라이언트)와 API(서버)가 함께 쓴다.

export const VOLUME_OPTIONS = [
  { value: "under_10", label: "하루 10건 미만" },
  { value: "10_50", label: "하루 10~50건" },
  { value: "50_200", label: "하루 50~200건" },
  { value: "over_200", label: "하루 200건 이상" },
  { value: "unknown", label: "아직 모름" },
];

export const INTEGRATION_OPTIONS = [
  { value: "siem", label: "SIEM" },
  { value: "soar", label: "SOAR" },
  { value: "ticket", label: "티켓 시스템(Jira 등)" },
  { value: "messenger", label: "슬랙·팀즈 알림" },
  { value: "mail_gateway", label: "메일 게이트웨이" },
  { value: "api_only", label: "API만 있으면 충분" },
];

export const IOC_FORMAT_OPTIONS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "stix", label: "STIX 2.1" },
  { value: "misp", label: "MISP" },
  { value: "yara_sigma", label: "YARA·Sigma 규칙" },
];
