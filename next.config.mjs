/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: "10mb",
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
  },
};

export default nextConfig;
