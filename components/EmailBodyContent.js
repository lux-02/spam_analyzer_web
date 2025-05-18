import React, { useState } from "react";
import DOMPurify from "dompurify";
import { extractDomain } from "../utils/emailAnalyzer";
import VirusTotalButton from "./VirusTotalButton";

const EmailBodyContent = ({
  emailData,
  onCheckUrl,
  failedDomains = [],
  analyzedTargets = {},
}) => {
  const [tab, setTab] = useState("preview");

  if (!emailData) return null;

  const {
    body,
    links,
    beacons = [],
    attachments = [],
    llmAnalysis = null,
  } = emailData;

  // 도메인이 실패 목록에 있는지 확인하는 함수
  const isDomainFailed = (domain) => {
    return failedDomains.includes(domain);
  };

  // Sanitize HTML for safe rendering
  const sanitizedHtml = DOMPurify.sanitize(body || "", {
    ADD_ATTR: ["target"],
    ALLOWED_TAGS: [
      "a",
      "abbr",
      "article",
      "b",
      "blockquote",
      "br",
      "caption",
      "code",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "i",
      "img",
      "li",
      "nl",
      "ol",
      "p",
      "pre",
      "span",
      "strike",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "ul",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "style", "class"],
  });

  // 모든 URL의 도메인 추출
  const domains = links
    ? [...new Set(links.map((url) => extractDomain(url)))]
    : [];

  // 신뢰도 색상 매핑
  const confidenceColors = {
    High: "text-green-600 dark:text-green-400",
    Medium: "text-yellow-600 dark:text-yellow-400",
    Low: "text-red-600 dark:text-red-400",
  };

  // 카테고리 아이콘 매핑
  const categoryIcons = {
    "비밀번호 변경 요청": "🔑",
    "송장/청구서 위장": "📄",
    "로그인 시도 알림": "🔐",
    "이벤트 초대": "📅",
    "스팸 광고": "📣",
    "정상 업무 메일": "✉️",
    기타: "❓",
  };

  // 위험도 점수에 따른 색상 선택
  const getRiskScoreColor = (score) => {
    if (score <= -10) return "text-red-600 dark:text-red-400";
    if (score < 0) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">이메일 내용</h2>

      <div className="flex border-b mb-4 overflow-x-auto">
        <button
          className={`py-2 px-4 ${
            tab === "preview"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("preview")}
        >
          미리보기
        </button>
        <button
          className={`py-2 px-4 ${
            tab === "links"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("links")}
        >
          링크 및 도메인 ({domains.length})
        </button>
        <button
          className={`py-2 px-4 ${
            tab === "files"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("files")}
        >
          첨부파일 ({attachments.length})
        </button>
        <button
          className={`py-2 px-4 ${
            tab === "ai"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          } flex items-center`}
          onClick={() => setTab("ai")}
        >
          <span className="mr-1">AI 분석</span>
          {llmAnalysis && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              Gemini
            </span>
          )}
        </button>
      </div>

      {tab === "preview" && (
        <div>
          {beacons.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              ⚠️ 이 이메일은 {beacons.length}개의 추적 픽셀을 포함하고 있습니다.
              이메일 열람 여부가 발신자에게 전송될 수 있습니다.
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <iframe
              srcDoc={sanitizedHtml}
              title="Email Content Preview"
              className="w-full min-h-[300px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}

      {tab === "links" && (
        <div>
          <h3 className="font-semibold mb-2">
            추출된 도메인 ({domains.length}개)
          </h3>
          <ul className="mb-4 space-y-2">
            {domains.map((domain, idx) => (
              <li
                key={`domain-${idx}`}
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate max-w-[60%]">{domain}</span>
                  <div className="flex space-x-2">
                    {onCheckUrl && (
                      <VirusTotalButton
                        target={domain}
                        type="url"
                        onClick={() => onCheckUrl(domain)}
                        analyzed={analyzedTargets[domain]}
                        failed={isDomainFailed(domain)}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mb-2">
            모든 URL ({links?.length || 0}개)
          </h3>
          <ul className="space-y-2">
            {links?.map((url, idx) => {
              const domain = extractDomain(url);
              return (
                <li
                  key={`url-${idx}`}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded break-all"
                >
                  <div className="flex items-center justify-between flex-wrap">
                    <span className="mr-2 truncate max-w-[70%]">{url}</span>
                    {onCheckUrl && (
                      <VirusTotalButton
                        target={url}
                        type="url"
                        onClick={() => onCheckUrl(url)}
                        analyzed={analyzedTargets[url]}
                        failed={isDomainFailed(domain) || isDomainFailed(url)}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {tab === "files" && (
        <div>
          {attachments.length === 0 ? (
            <p>첨부 파일이 없습니다.</p>
          ) : (
            <>
              <h3 className="font-semibold mb-2">첨부 파일 목록</h3>
              <ul className="space-y-2">
                {attachments.map((file, idx) => {
                  // 위험한 확장자 리스트
                  const dangerousExtensions = [
                    "exe",
                    "js",
                    "vbs",
                    "bat",
                    "ps1",
                    "cmd",
                    "hta",
                    "scr",
                    "pif",
                    "reg",
                    "docm",
                    "xlsm",
                    "pptm",
                    "msi",
                    "jar",
                    "jse",
                    "lnk",
                    "com",
                    "gadget",
                    "dll",
                    "application",
                    "zip",
                    "rar",
                    "7z",
                  ];

                  let fileName = typeof file === "object" ? file.name : file;
                  let fileExt = "";
                  let fileSize = "";
                  let isDangerous = false;

                  if (typeof file === "object") {
                    fileExt = file.extension || "";
                    fileSize = file.formattedSize || "";
                    isDangerous = dangerousExtensions.includes(
                      fileExt.toLowerCase()
                    );
                  } else {
                    // 이전 버전과의 호환성을 위한 코드
                    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/i);
                    fileExt = extMatch ? extMatch[1].toLowerCase() : "unknown";
                    isDangerous = dangerousExtensions.some((ext) =>
                      fileName.toLowerCase().endsWith(`.${ext}`)
                    );
                  }

                  // 인라인 이미지와 첨부파일 구분
                  const isInline =
                    typeof file === "object" && file.disposition === "inline";

                  return (
                    <li
                      key={`file-${idx}`}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {/* 파일 타입 아이콘 */}
                            <span className="mr-2 text-2xl">
                              {fileExt === "pdf" && "📄"}
                              {(fileExt === "jpg" ||
                                fileExt === "jpeg" ||
                                fileExt === "png" ||
                                fileExt === "gif") &&
                                "🖼️"}
                              {(fileExt === "doc" || fileExt === "docx") &&
                                "📝"}
                              {(fileExt === "xls" || fileExt === "xlsx") &&
                                "📊"}
                              {(fileExt === "ppt" || fileExt === "pptx") &&
                                "📊"}
                              {(fileExt === "zip" ||
                                fileExt === "rar" ||
                                fileExt === "7z") &&
                                "🗜️"}
                              {(fileExt === "exe" ||
                                fileExt === "dll" ||
                                fileExt === "bat") &&
                                "⚠️"}
                              {![
                                "pdf",
                                "jpg",
                                "jpeg",
                                "png",
                                "gif",
                                "doc",
                                "docx",
                                "xls",
                                "xlsx",
                                "ppt",
                                "pptx",
                                "zip",
                                "rar",
                                "7z",
                                "exe",
                                "dll",
                                "bat",
                              ].includes(fileExt) && "📎"}
                            </span>
                            <span className="font-medium break-all">
                              {fileName}
                            </span>
                          </div>

                          {isDangerous && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">
                              ⚠️ 위험 가능성
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap text-xs text-gray-500">
                          {fileExt && (
                            <span className="mr-3">
                              타입: {fileExt.toUpperCase()}
                            </span>
                          )}
                          {fileSize && (
                            <span className="mr-3">크기: {fileSize}</span>
                          )}
                          {isInline && (
                            <span className="text-blue-500">인라인 이미지</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {tab === "ai" && (
        <div>
          {!llmAnalysis ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded text-center">
              <p className="text-gray-500 dark:text-gray-400">
                AI 분석 결과가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">
                      {categoryIcons[llmAnalysis.category] || "📋"}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">
                        {llmAnalysis.category}
                      </h3>
                      <p
                        className={`${
                          confidenceColors[llmAnalysis.confidence] ||
                          "text-gray-500"
                        } font-semibold`}
                      >
                        신뢰도: {llmAnalysis.confidence}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-xl ${getRiskScoreColor(
                      llmAnalysis.riskScore
                    )}`}
                  >
                    {llmAnalysis.riskScore > 0 ? "+" : ""}
                    {llmAnalysis.riskScore}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">분석 이유</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {llmAnalysis.reason}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">AI 모델 정보</h3>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded mr-2">
                    {llmAnalysis.model_used || "Gemini API"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(emailData.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {llmAnalysis.analysisMessage && (
                <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900 dark:border-blue-800 rounded">
                  <p className="text-blue-700 dark:text-blue-300 italic">
                    "{llmAnalysis.analysisMessage}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailBodyContent;
