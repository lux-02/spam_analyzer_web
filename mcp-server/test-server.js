#!/usr/bin/env node

/**
 * MCP 서버 테스트 스크립트
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:3001";

async function testServer() {
  console.log("🧪 MCP 서버 테스트 시작...\n");

  try {
    // 1. 헬스 체크
    console.log("1. 헬스 체크 테스트");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ 헬스 체크 성공:", healthData.status);
    console.log(`   서버 버전: ${healthData.version}`);
    console.log(`   사용 가능한 도구: ${healthData.tools.length}개\n`);

    // 2. 도구 목록 조회
    console.log("2. 도구 목록 조회 테스트");
    const toolsResponse = await fetch(`${BASE_URL}/tools`);
    const toolsData = await toolsResponse.json();
    console.log("✅ 도구 목록 조회 성공");
    console.log(`   총 도구 수: ${toolsData.count}개`);
    console.log("   카테고리별 도구 수:", toolsData.categories);
    console.log("\n");

    // 3. 이메일 헤더 분석 테스트
    console.log("3. 이메일 헤더 분석 테스트");
    const sampleEmailData = `Received: from mail.example.com (1.2.3.4)
From: test@example.com
To: user@test.com
Subject: Test Email
Date: Mon, 1 Jan 2024 12:00:00 +0000
DKIM-Signature: v=1; a=rsa-sha256; d=example.com
Content-Type: text/plain

This is a test email.`;

    const emailAnalysisResponse = await fetch(
      `${BASE_URL}/tools/mcp_email_analyze_headers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawEmailData: sampleEmailData }),
      }
    );

    const emailAnalysisData = await emailAnalysisResponse.json();
    if (emailAnalysisData.success) {
      console.log("✅ 이메일 헤더 분석 성공");
      console.log(`   발신자: ${emailAnalysisData.analysis.from || "없음"}`);
      console.log(`   수신자: ${emailAnalysisData.analysis.to || "없음"}`);
      console.log(`   제목: ${emailAnalysisData.analysis.subject || "없음"}`);
    } else {
      console.log("❌ 이메일 헤더 분석 실패:", emailAnalysisData.error);
    }
    console.log("\n");

    // 4. IP 분석 테스트
    console.log("4. IP 분석 테스트");
    const ipAnalysisResponse = await fetch(`${BASE_URL}/tools/mcp_analyze_ip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipAddress: "8.8.8.8" }),
    });

    const ipAnalysisData = await ipAnalysisResponse.json();
    if (ipAnalysisData.success) {
      console.log("✅ IP 분석 성공");
      console.log(`   국가: ${ipAnalysisData.analysis.country}`);
      console.log(`   지역: ${ipAnalysisData.analysis.region}`);
      console.log(`   ISP: ${ipAnalysisData.analysis.isp}`);
      console.log(`   위험도: ${ipAnalysisData.analysis.threatLevel}`);
    } else {
      console.log("❌ IP 분석 실패:", ipAnalysisData.error);
    }
    console.log("\n");

    // 5. 일괄 실행 테스트
    console.log("5. 일괄 실행 테스트");
    const batchResponse = await fetch(`${BASE_URL}/tools/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            tool: "mcp_email_analyze_headers",
            args: { rawEmailData: sampleEmailData },
          },
          {
            tool: "mcp_analyze_ip",
            args: { ipAddress: "1.1.1.1" },
          },
        ],
      }),
    });

    const batchData = await batchResponse.json();
    if (batchData.success) {
      console.log("✅ 일괄 실행 성공");
      console.log(`   총 요청: ${batchData.summary.total}개`);
      console.log(`   성공: ${batchData.summary.successful}개`);
      console.log(`   실패: ${batchData.summary.failed}개`);
    } else {
      console.log("❌ 일괄 실행 실패:", batchData.error);
    }
    console.log("\n");

    // 6. API 문서 조회 테스트
    console.log("6. API 문서 조회 테스트");
    const docsResponse = await fetch(`${BASE_URL}/docs`);
    const docsData = await docsResponse.json();
    console.log("✅ API 문서 조회 성공");
    console.log(`   문서 제목: ${docsData.title}`);
    console.log(`   API 버전: ${docsData.version}`);
    console.log(`   도구 수: ${docsData.tools.length}개`);
    console.log("\n");

    console.log("🎉 모든 테스트가 완료되었습니다!");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error.message);
    console.error("\n서버가 실행 중인지 확인하세요:");
    console.error("npm run start:http");
    process.exit(1);
  }
}

// 메인 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  testServer();
}
