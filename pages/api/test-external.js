import Cors from "cors";
import { v4 as uuidv4 } from "uuid";
import {
  analyzeEmailHeader,
  parseEmailBodyAndLinks,
  calculateRiskScore,
  checkBeaconImages,
  getEmailAttachments,
  analyzeEmailIntent,
} from "@/utils/emailAnalyzer";
import { validateEmailRawData } from "@/utils/emailAnalyzer";

// API 키 설정 (환경변수 필수)
const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY;

// CORS 미들웨어 초기화
const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*",
});

// CORS 미들웨어 실행 함수
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // CORS 미들웨어 실행
  await runMiddleware(req, res, cors);

  // POST 요청이 아닌 경우 처리
  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않는 메소드입니다." });
  }

  try {
    const { rawData, apiKey } = req.body;

    // API 키 검증
    if (apiKey !== DEFAULT_API_KEY) {
      console.warn("유효하지 않은 API 키 요청:", apiKey || "없음");
      return res.status(401).json({ error: "유효하지 않은 API 키입니다." });
    }

    // 원문 데이터가 없는 경우
    if (!rawData || typeof rawData !== "string") {
      return res
        .status(400)
        .json({ error: "이메일 원문 데이터가 필요합니다." });
    }

    // 유효성 검사
    const validation = isValidEmailRawData(rawData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: `올바른 이메일 원문 데이터가 아닙니다: ${validation.reason}`,
      });
    }

    console.log("이메일 분석 요청 시작");

    // 이메일 헤더 분석
    const headerAnalysis = analyzeEmailHeader(rawData);
    console.log("이메일 헤더 분석 완료");

    // 이메일 본문 및 링크 분석
    let bodyAnalysis = { body: "", links: [] };
    try {
      bodyAnalysis = parseEmailBodyAndLinks(rawData);
      console.log("이메일 본문 및 링크 분석 완료");
    } catch (bodyError) {
      console.error("이메일 본문 분석 오류:", bodyError);
    }

    // 첨부 파일 확인
    let attachments = [];
    try {
      attachments = getEmailAttachments(rawData);
      console.log("첨부 파일 확인 완료:", attachments.length);
    } catch (attachmentError) {
      console.error("첨부 파일 분석 오류:", attachmentError);
    }

    // 비콘 이미지 체크
    let beacons = [];
    try {
      beacons = checkBeaconImages(bodyAnalysis.body);
      console.log("비콘 이미지 체크 완료");
    } catch (beaconError) {
      console.error("비콘 이미지 체크 오류:", beaconError);
    }

    // LLM 이메일 내용 분석 (간소화)
    let llmAnalysis = null;
    try {
      if (bodyAnalysis.body) {
        llmAnalysis = await analyzeEmailIntent(bodyAnalysis.body);
        console.log("LLM 이메일 내용 분석 완료:", llmAnalysis?.category);
      }
    } catch (llmError) {
      console.error("LLM 이메일 내용 분석 오류:", llmError);
    }

    // 고유 ID 생성
    const id = uuidv4();
    console.log(`분석 ID 생성 완료: ${id}`);

    // 종합 데이터
    const analysisData = {
      ...headerAnalysis,
      body: bodyAnalysis.body,
      links: bodyAnalysis.links,
      attachments,
      beacons,
      llmAnalysis,
      timestamp: new Date().toISOString(),
      source: "test-external-api",
      apiKey: apiKey,
    };

    // 위험도 계산
    const riskAnalysis = calculateRiskScore({
      ...analysisData,
      beacons: beacons,
      llmAnalysis,
    });
    console.log("위험도 계산 완료");

    // 최종 분석 결과 (메모리에만 저장)
    const finalResult = {
      ...analysisData,
      risk: riskAnalysis,
      id: id,
      rawData: rawData,
    };

    // 메모리에 임시 저장 (실제 운영에서는 데이터베이스 사용)
    global.tempAnalysisResults = global.tempAnalysisResults || {};
    global.tempAnalysisResults[id] = finalResult;

    console.log(`분석 결과 임시 저장 완료 (ID: ${id})`);

    // 응답에 분석 결과 ID와 결과 페이지 URL 포함
    const baseUrl = "https://darkwinterlab.com";
    const resultUrl = `${baseUrl}/naver/email/${id}`;

    return res.status(200).json({
      success: true,
      id: id,
      resultUrl: resultUrl,
      message: "이메일 분석이 완료되었습니다.",
      analysisData: {
        riskScore: riskAnalysis.score,
        riskLevel: riskAnalysis.level,
        category: llmAnalysis?.category || "분석 중",
        linksCount: bodyAnalysis.links.length,
        attachmentsCount: attachments.length,
        beaconsCount: beacons.length,
      },
    });
  } catch (error) {
    console.error("분석 처리 오류:", error);
    return res.status(500).json({
      error: "분석 처리 중 오류가 발생했습니다.",
      message: error.message,
    });
  }
}
