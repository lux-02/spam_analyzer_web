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
  const [tab, setTab] = useState("ai");

  if (!emailData) return null;

  const {
    body,
    htmlBody,
    links,
    beacons = [],
    attachments = [],
    llmAnalysis = null,
    hasHtml = false,
  } = emailData;

  // 도메인이 실패 목록에 있는지 확인하는 함수
  const isDomainFailed = (domain) => {
    return failedDomains.includes(domain);
  };

  // HTML 또는 텍스트 내용 준비
  const displayContent = hasHtml && htmlBody ? htmlBody : body;

  // Sanitize HTML for safe rendering
  const sanitizedHtml = DOMPurify.sanitize(displayContent || "", {
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

  // 텍스트 전용 표시를 위한 HTML 생성
  const textOnlyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          background: white;
          color: #111827;
          font-size: 14px;
        }
        a { 
          color: #3b82f6; 
          text-decoration: underline; 
        }
        a:hover { 
          color: #1d4ed8; 
        }
        pre { 
          white-space: pre-wrap; 
          word-wrap: break-word; 
          font-family: inherit;
          margin: 0;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        p {
          margin-bottom: 1em;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        td, th {
          border: 1px solid #e5e7eb;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      ${
        hasHtml && htmlBody
          ? sanitizedHtml
          : `<pre>${body || "(내용 없음)"}</pre>`
      }
    </body>
    </html>
  `;

  // 모든 URL의 도메인 추출
  const domains = links
    ? [
        ...new Set(
          links.map((link) => {
            // link가 객체인 경우 url 속성을 사용, 문자열인 경우 그대로 사용
            const url = typeof link === "object" ? link.url : link;
            return extractDomain(url);
          })
        ),
      ]
    : [];

  // 신뢰도 색상 매핑
  const confidenceColors = {
    High: "text-green-600 dark:text-green-400",
    Medium: "text-yellow-600 dark:text-yellow-400",
    Low: "text-red-600 dark:text-red-400",
  };

  // 카테고리 아이콘 매핑 (Gemini AI intent 기반)
  const categoryIcons = {
    legitimate: "✅",
    spam: "📣",
    phishing: "🎣",
    scam: "⚠️",
    promotional: "📢",
    unknown: "❓",
  };

  // 위험도 점수에 따른 색상 선택
  const getRiskScoreColor = (score) => {
    if (score <= -10) return "text-red-600 dark:text-red-400";
    if (score < 0) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  // Intent 한글 표시명
  const getIntentDisplayName = (intent) => {
    const names = {
      legitimate: "정상 메일",
      spam: "스팸 메일",
      phishing: "피싱 메일",
      scam: "사기 메일",
      promotional: "홍보 메일",
      unknown: "분석 필요",
    };
    return names[intent] || intent;
  };

  // Intent 색상
  const getIntentColor = (intent) => {
    const colors = {
      legitimate:
        "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      spam: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
      phishing: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
      scam: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
      promotional:
        "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
      unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    };
    return colors[intent] || colors.unknown;
  };

  // Intent 배지
  const getIntentBadge = (intent) => {
    const badges = {
      legitimate: "안전",
      spam: "스팸",
      phishing: "위험",
      scam: "사기",
      promotional: "홍보",
      unknown: "분석중",
    };
    return badges[intent] || "알 수 없음";
  };

  // 분석 이유 포맷팅
  const formatAnalysisReasoning = (reasoning) => {
    if (!reasoning || reasoning === "분석 이유를 찾을 수 없습니다.") {
      return (
        <div className="text-center py-4 text-gray-500">
          <span className="text-2xl block mb-2">🤔</span>
          <p>분석 이유를 찾을 수 없습니다.</p>
        </div>
      );
    }

    // JSON 형태인지 확인하고 파싱 시도
    if (reasoning.includes('"intent"') && reasoning.includes('"confidence"')) {
      return (
        <div className="text-center py-4 text-gray-500">
          <span className="text-2xl block mb-2">⚠️</span>
          <p>분석 데이터를 처리 중입니다...</p>
          <details className="mt-2 text-left">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              원시 데이터 보기
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
              {reasoning}
            </pre>
          </details>
        </div>
      );
    }

    // 일반 텍스트 처리
    const sentences = reasoning
      .split(/[.!?]\s+/)
      .filter((s) => s.trim().length > 0);

    return (
      <div className="space-y-2">
        {sentences.map((sentence, index) => (
          <p key={index} className="flex items-start">
            <span className="text-blue-500 mr-2 mt-1 text-xs">•</span>
            <span className="flex-1">{sentence.trim()}.</span>
          </p>
        ))}
      </div>
    );
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
              srcDoc={textOnlyHtml}
              title="Email Content Preview"
              className="w-full min-h-[300px] border-0 rounded"
              sandbox="allow-same-origin allow-scripts"
              style={{ background: "white" }}
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
            {links?.map((link, idx) => {
              // link가 객체인 경우와 문자열인 경우 모두 처리
              const url = typeof link === "object" ? link.url : link;
              const text = typeof link === "object" ? link.text : link;
              const suspicious =
                typeof link === "object" ? link.suspicious : false;
              const domain = extractDomain(url);

              return (
                <li
                  key={`url-${idx}`}
                  className={`p-2 rounded break-all ${
                    suspicious
                      ? "bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="mr-2 truncate max-w-[70%]">
                      <div className="text-sm font-medium">{url}</div>
                      {text && text !== url && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          링크 텍스트: {text}
                        </div>
                      )}
                      {suspicious && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                          ⚠️ 의심스러운 링크
                        </div>
                      )}
                    </div>
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
                      {categoryIcons[llmAnalysis.intent] || "📋"}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        {getIntentDisplayName(llmAnalysis.intent) || "분석 중"}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`text-xs px-2 py-1 rounded ${
                            llmAnalysis.success
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {llmAnalysis.success
                            ? "✅ 분석 완료"
                            : "⚠️ 분석 실패"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg font-bold ${getIntentColor(
                      llmAnalysis.intent
                    )}`}
                  >
                    {getIntentBadge(llmAnalysis.intent)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className="mr-2">🔍</span>
                  AI 분석 결과
                </h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {formatAnalysisReasoning(llmAnalysis.reasoning)}
                </div>
              </div>

              {llmAnalysis.redFlags && llmAnalysis.redFlags.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold mb-2 text-red-800 dark:text-red-200">
                    ⚠️ 위험 요소
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {llmAnalysis.redFlags.map((flag, index) => (
                      <li
                        key={index}
                        className="text-red-700 dark:text-red-300 text-sm"
                      >
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {llmAnalysis.recommendation && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                    💡 권장사항
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm whitespace-pre-wrap">
                    {llmAnalysis.recommendation}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h3 className="font-semibold mb-2">AI 모델 정보</h3>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded mr-2">
                    Gemini 2.5 Flash Lite
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(emailData.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailBodyContent;
