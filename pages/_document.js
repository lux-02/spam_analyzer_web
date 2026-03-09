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
