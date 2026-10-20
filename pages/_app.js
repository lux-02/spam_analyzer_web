import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import Script from "next/script";
import { useRouter } from "next/router";
import { ThemeProvider } from "../context/ThemeContext";
import { useEffect } from "react";
import { suppressConsoleErrors } from "../utils/errorHandler";
import { GA_ID, isAnalyticsEnabled, trackPageView } from "../utils/analytics";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    suppressConsoleErrors();
  }, []);

  // 페이지 전환마다 정리된 경로로 page_view 를 보낸다(gtag 자동 page_view 는 끔)
  useEffect(() => {
    if (!isAnalyticsEnabled) return undefined;
    trackPageView(router.asPath);
    const handleRouteChange = (url) => trackPageView(url);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider>
      {isAnalyticsEnabled && (
        <>
          {/* js·config 명령은 utils/analytics.js 가 첫 이벤트 전에 dataLayer 에 넣는다 */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        </>
      )}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
