/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // HMR 안정성을 위해 일시적으로 비활성화
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: "10mb",
  },
  // 이미지 도메인 설정
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      // HTTP 환경에서는 Cross-Origin-Opener-Policy 헤더를 제거하여 경고 해결
      ...(process.env.NODE_ENV === "production" && process.env.HTTPS === "true"
        ? [
            {
              source: "/(.*)",
              headers: [
                {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "unsafe-none",
                },
                {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin-allow-popups",
                },
              ],
            },
          ]
        : []),
    ];
  },
  webpack: (config) => {
    // Leaflet 모듈이 SSR과 충돌하지 않도록 설정
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      tls: false,
      net: false,
    };
    return config;
  },
  // 환경 변수 설정
  env: {
    MONGODB_URI:
      process.env.MONGODB_URI || "mongodb://localhost:27017/spam_analyzer",
    FLASK_SERVER_URL: process.env.FLASK_SERVER_URL || "http://localhost:5001",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // ESLint 설정 - 빌드 시 경고와 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 개발 환경 최적화
  experimental: {
    optimizeCss: false, // CSS 최적화 비활성화로 HMR 안정성 향상
  },
  // 개발 서버 설정
  ...(process.env.NODE_ENV === "development" && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: "bottom-right",
    },
  }),
  // 컴파일러 설정
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
};

export default nextConfig;
