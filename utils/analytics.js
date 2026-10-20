// Google Analytics 4. NEXT_PUBLIC_GA_ID 가 있고 운영 빌드일 때만 동작한다.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const isAnalyticsEnabled = Boolean(GA_ID) && process.env.NODE_ENV === "production";

const SITE_ORIGIN = "https://mail.n2f.site";

/**
 * 분석 결과 주소(/naver/email/<uuid>)는 방문마다 달라서 하나로 묶고, 쿼리·해시는 버린다.
 * 결과 ID 가 GA 에 쌓이지 않게 하려는 목적도 있다.
 * @param {string} path
 * @returns {string}
 */
export function normalizePath(path = "/") {
  const clean = String(path).split(/[?#]/)[0] || "/";
  return clean.replace(/^\/naver\/email\/[^/]+/, "/naver/email/[id]");
}

// gtag.js 가 아직 안 불렸어도 dataLayer 에 쌓아 두면 스크립트가 불린 뒤 순서대로 보낸다
const gtag = (...args) => {
  if (!isAnalyticsEnabled || typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtagStub() {
      window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
    };
  }
  // 이벤트보다 config 가 먼저 쌓여야 GA4 가 받아들인다. 자동 page_view 는 끄고 직접 보낸다.
  if (!window.__gaConfigured) {
    window.__gaConfigured = true;
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
  }
  window.gtag(...args);
};

/**
 * 페이지 조회 기록
 * @param {string} path - router.asPath
 */
export function trackPageView(path) {
  const pagePath = normalizePath(path);
  gtag("event", "page_view", {
    page_path: pagePath,
    page_location: `${SITE_ORIGIN}${pagePath}`,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}

/**
 * 사용자 행동 이벤트. 메일 원문·이메일 주소 같은 개인정보는 절대 넣지 않는다.
 * @param {string} name - GA4 이벤트 이름
 * @param {Object} params - 숫자·짧은 코드 값만
 */
export function trackEvent(name, params = {}) {
  gtag("event", name, params);
}
