import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="light">
      <Head>
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
