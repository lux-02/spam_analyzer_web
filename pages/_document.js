import { Html, Head, Main, NextScript } from "next/document";

const themeBootScript = `
  (function() {
    try {
      var key = "theme";
      var stored = window.localStorage.getItem(key);
      var theme = stored === "light" || stored === "dark"
        ? stored
        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      if (!stored) {
        window.localStorage.setItem(key, theme);
      }
    } catch (error) {
      document.documentElement.classList.add("light");
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export default function Document() {
  return (
    <Html
      lang="ko"
      className="light"
      data-theme="light"
      suppressHydrationWarning
    >
      <Head>
        <meta name="color-scheme" content="light dark" />
        {/* 검색엔진 소유 확인(Google Search Console, 네이버 서치어드바이저). 값이 있을 때만 넣는다 */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
        {process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION && (
          <meta
            name="naver-site-verification"
            content={process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION}
          />
        )}
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
        {/* 프로덕션 환경에서만 AdSense 스크립트 로드 */}
        {process.env.NODE_ENV === "production" && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1884359786783237"
            crossOrigin="anonymous"
          ></script>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
