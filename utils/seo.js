import { DEFAULT_DAILY_LIMIT } from "./quotaConfig";

export const SITE_URL = "https://mail.n2f.site";
export const SITE_NAME = "NAVER MAIL ANALYZER";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const PUBLISHER_NAME = "다크윈터랩(DarkWinterLab)";

export const LANDING_TITLE = "피싱 메일 확인·네이버 메일 원문 분석 | NAVER MAIL ANALYZER";
export const LANDING_DESCRIPTION = `의심 메일 원문을 붙여넣으면 실제 발신 주소, SPF·DKIM·DMARC 인증 결과, 수신 경로, 숨은 링크와 첨부파일 위험을 1분 안에 정리합니다. 가입 없이 하루 ${DEFAULT_DAILY_LIMIT}회 무료.`;

/**
 * 서비스 자체를 설명하는 구조화 데이터(WebApplication)
 * @returns {Object}
 */
export function buildWebApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: "네이버 메일 분석기",
    url: `${SITE_URL}/`,
    image: OG_IMAGE,
    description: LANDING_DESCRIPTION,
    inLanguage: "ko-KR",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
      description: `가입 없이 하루 ${DEFAULT_DAILY_LIMIT}회 무료 분석`,
    },
    featureList: [
      "실제 발신 주소와 표시 이름 비교",
      "SPF·DKIM·DMARC 인증 결과 확인",
      "Received 헤더 기반 수신 경로·IP 위치 추적",
      "본문 링크·숨긴 문구·첨부파일 위험 분석",
      "AI 기반 메일 의도 분석과 위험 점수",
    ],
    publisher: { "@type": "Organization", name: PUBLISHER_NAME, url: `${SITE_URL}/` },
  };
}

/**
 * 화면에 보이는 FAQ 와 같은 내용으로 FAQPage 구조화 데이터를 만든다.
 * @param {{ question: string, answer: string }[]} items
 * @returns {Object}
 */
export function buildFaqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * 분석 사례 글의 Article 구조화 데이터
 * @param {string} slug
 * @param {Object} meta - utils/reportContent 의 머리말
 * @returns {Object}
 */
export function buildArticleJsonLd(slug, meta) {
  const url = `${SITE_URL}/reports/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    image: meta.image ? `${SITE_URL}${meta.image}` : OG_IMAGE,
    datePublished: meta.date,
    dateModified: meta.updated,
    inLanguage: "ko-KR",
    keywords: meta.keywords.join(", "),
    mainEntityOfPage: url,
    url,
    author: { "@type": "Person", name: "오윤석", url: `${SITE_URL}/` },
    publisher: { "@type": "Organization", name: PUBLISHER_NAME, url: `${SITE_URL}/` },
    ...(meta.blog ? { isBasedOn: meta.blog } : {}),
  };
}

/**
 * 홈 > 분석 사례 > 글 경로
 * @param {{ name: string, path: string }[]} trail
 * @returns {Object}
 */
export function buildBreadcrumbJsonLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * <script type="application/ld+json"> 에 넣을 문자열. "</script>" 로 태그가 끊기지 않게 막는다.
 * @param {Object} data
 * @returns {{ __html: string }}
 */
export function jsonLdHtml(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
