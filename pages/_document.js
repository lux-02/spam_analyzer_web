import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="light">
      <Head>
        {/* 
          Google AdSense 스크립트
          1. 실제 사용 시 YOUR_ADSENSE_CLIENT_ID 부분을 실제 ID로 교체하세요
          2. 아래 형식은 "ca-pub-XXXXXXXXXXXXXXXX" 형식이어야 합니다
          3. AdSense 계정 가입 후 관리자 페이지에서 확인 가능합니다
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_CLIENT_ID"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
