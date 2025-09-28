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
import { isValidEmailRawData } from "@/utils/validators";
import { saveEmailAnalysis } from "@/utils/supabase";

// API 키 설정 (환경 변수에서 가져오거나 기본값 사용)
const API_KEYS = (process.env.EXTERNAL_API_KEYS || "")
  .split(",")
  .filter(Boolean);
const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY;

// CORS 미들웨어 초기화
const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*", // 실제 배포 시 허용된 도메인으로 제한해야 합니다
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

// 결과 저장 함수
async function saveResult(id, data) {
  try {
    // Supabase에 저장
    const success = await saveEmailAnalysis(id, data);

    if (success) {
      console.log(`외부 API 분석 결과 저장 완료: ${id}`);
    } else {
      console.error("Supabase 저장 실패");
    }

    return true;
  } catch (error) {
    console.error("Supabase 결과 저장 오류:", error);
    return false;
  }
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
    const isValidApiKey =
      API_KEYS.length > 0
        ? API_KEYS.includes(apiKey)
        : apiKey === DEFAULT_API_KEY;

    if (!isValidApiKey) {
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

    // 이메일 본문 및 링크 분석 - 오류 처리 추가
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

    // LLM 이메일 내용 분석
    let llmAnalysis = null;
    try {
      if (bodyAnalysis.body) {
        llmAnalysis = await analyzeEmailIntent(bodyAnalysis.body);
        console.log(
          "LLM 이메일 내용 분석 완료:",
          llmAnalysis?.category,
          llmAnalysis?.confidence
        );
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
      source: "external-api",
      apiKey: apiKey, // API 키 저장 (분석 출처 식별용)
    };

    // 위험도 계산
    const riskAnalysis = calculateRiskScore({
      ...analysisData,
      beacons: beacons,
      llmAnalysis,
    });
    console.log("위험도 계산 완료");

    // 최종 분석 결과
    const finalResult = {
      ...analysisData,
      risk: riskAnalysis,
      id: id,
      rawData: rawData,
    };

    // 결과 저장 (MongoDB) - 임시로 메모리에 저장
    try {
      const saveSuccess = await saveResult(id, finalResult);
      if (saveSuccess) {
        console.log(`분석 결과 저장 완료 (ID: ${id})`);
      } else {
        console.warn(`분석 결과 저장 실패, 메모리에 임시 저장 (ID: ${id})`);
        // 메모리에 임시 저장
        global.tempAnalysisResults = global.tempAnalysisResults || {};
        global.tempAnalysisResults[id] = finalResult;
      }
    } catch (saveError) {
      console.error(
        `분석 결과 저장 오류, 메모리에 임시 저장 (ID: ${id}):`,
        saveError
      );
      // MongoDB 저장 실패 시 메모리에 저장
      global.tempAnalysisResults = global.tempAnalysisResults || {};
      global.tempAnalysisResults[id] = finalResult;
    }

    // 응답에 분석 결과 ID와 결과 페이지 URL 포함
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://naver.darkwinterlab.com";
    const resultUrl = `${baseUrl}/naver/email/${id}`;

    return res.status(200).json({
      success: true,
      id,
      resultUrl,
      message: "분석이 완료되었습니다.",
    });
  } catch (error) {
    console.error("이메일 분석 오류:", error);
    return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
}
