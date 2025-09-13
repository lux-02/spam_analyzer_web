#!/usr/bin/env node

/**
 * HTTP 모드로 MCP 서버를 시작하는 스크립트
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 설정
process.env.HTTP_MODE = "true";
process.env.MCP_SERVER_PORT = process.env.MCP_SERVER_PORT || "3001";
process.env.MCP_SERVER_HOST = process.env.MCP_SERVER_HOST || "localhost";

console.log("🚀 HTTP 모드로 MCP 서버를 시작합니다...");
console.log(`포트: ${process.env.MCP_SERVER_PORT}`);
console.log(`호스트: ${process.env.MCP_SERVER_HOST}`);

// TypeScript 파일을 직접 실행
const serverProcess = spawn("npx", ["tsx", join(__dirname, "src/index.ts")], {
  stdio: "inherit",
  env: process.env,
});

serverProcess.on("error", (error) => {
  console.error("서버 시작 오류:", error);
  process.exit(1);
});

serverProcess.on("exit", (code) => {
  console.log(`서버가 종료되었습니다. 종료 코드: ${code}`);
  process.exit(code || 0);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n서버를 종료합니다...");
  serverProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("\n서버를 종료합니다...");
  serverProcess.kill("SIGTERM");
});
