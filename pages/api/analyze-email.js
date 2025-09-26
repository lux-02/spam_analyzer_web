import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import Cors from "cors";
import {
  analyzeEmailHeader,
  parseEmailBodyAndLinks,
  calculateRiskScore,
  checkBeaconImages,
  getEmailAttachments,
  analyzeEmailIntent,
  validateEmailRawData,
} from "../../utils/emailAnalyzer";
import { saveEmailAnalysis, getEmailAnalysis } from "../../utils/supabase";

// CORS 미들웨어 초기화
const cors = Cors({
  methods: ["POST", "GET", "OPTIONS"],
  origin: "*", // 실제 배포 시 확장앱의 ID나 특정 도메인으로 제한하는 것을 권장합니다
});

// CORS 미들웨어 실행 헬퍼 함수
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

// 파일 시스템 기반 스토리지 경로 설정 (기존 코드 유지, 아직 완전히 마이그레이션되지 않은 기능을 위해)
const DATA_DIR = path.join(process.cwd(), "data");
const RESULTS_FILE = path.join(DATA_DIR, "analysis_results.json");

// 파일 시스템 백업 저장소 초기화 함수
export function ensureFileSystemBackup() {
  // 파일 시스템 초기화 (백업용)
  if (!global.storageInitialized) {
    try {
      // 디렉토리가 없다면 생성
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // 결과 파일이 없다면 생성
      if (!fs.existsSync(RESULTS_FILE)) {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify({}), "utf8");
      }

      // 전역 변수로 초기화 완료 표시
      global.storageInitialized = true;
      console.log("파일 시스템 백업 저장소 초기화 완료");
    } catch (error) {
      console.error("파일 시스템 백업 저장소 초기화 오류:", error);
    }
  }
}

// 결과 저장 함수 (Supabase 사용)
async function saveResult(id, data) {
  try {
    // Supabase에 저장 시도
    const success = await saveEmailAnalysis(id, data);

    if (success) {
      console.log(`Supabase에 분석 결과 저장 완료 (ID: ${id})`);
      return true;
    } else {
      console.warn("Supabase 저장 실패 - 파일 시스템 저장으로 전환");
      throw new Error("Supabase 저장 실패");
    }
  } catch (error) {
    console.warn("Supabase 결과 저장 오류:", error.message);

    // Supabase 저장 실패 시 파일 시스템 백업 사용
    try {
      console.log("파일 시스템 백업 저장 시도 중...");
      ensureFileSystemBackup(); // 백업 저장소 확인

      // 기존 데이터 불러오기
      const rawData = fs.readFileSync(RESULTS_FILE, "utf8");
      const allResults = JSON.parse(rawData || "{}");

      // 새 결과 추가
      allResults[id] = data;

      // 파일에 저장
      fs.writeFileSync(
        RESULTS_FILE,
        JSON.stringify(allResults, null, 2),
        "utf8"
      );
      console.log("파일 시스템 백업 저장 성공");
      return true;
    } catch (backupError) {
      console.error("백업 저장도 실패:", backupError);
      return false;
    }
  }
}

// 결과 조회 함수 (MongoDB 사용)
export async function getResult(id) {
  try {
    if (!id) return null;

    // Supabase에서 조회
    const result = await getEmailAnalysis(id);

    // Supabase에 존재하면 반환
    if (result) {
      console.log(`Supabase에서 분석 결과 조회 성공 (ID: ${id})`);
      return result;
    }

    // Supabase에 없으면 파일 시스템에서 조회 (기존 데이터 마이그레이션 고려)
    console.log(`Supabase에 결과 없음, 파일 시스템 확인 중 (ID: ${id})`);
    if (!fs.existsSync(RESULTS_FILE)) {
      return null;
    }

    // 파일에서 데이터 불러오기
    const rawData = fs.readFileSync(RESULTS_FILE, "utf8");
    const allResults = JSON.parse(rawData || "{}");
    const fileResult = allResults[id] || null;

    if (fileResult) {
      console.log(`파일 시스템에서 분석 결과 조회 성공 (ID: ${id})`);

      // 파일에서 찾은 결과를 Supabase로 마이그레이션
      try {
        await saveResult(id, fileResult);
        console.log(
          `파일 시스템 결과를 Supabase로 마이그레이션 완료 (ID: ${id})`
        );
      } catch (migrationError) {
        console.error(`마이그레이션 실패 (ID: ${id}):`, migrationError);
      }
    }

    return fileResult;
  } catch (error) {
    console.error("결과 조회 오류:", error);

    // Supabase 조회 실패 시 파일 시스템 시도
    try {
      if (!fs.existsSync(RESULTS_FILE)) {
        return null;
      }

      // 파일에서 데이터 불러오기
      const rawData = fs.readFileSync(RESULTS_FILE, "utf8");
      const allResults = JSON.parse(rawData || "{}");
      return allResults[id] || null;
    } catch (backupError) {
      console.error("파일 시스템 백업 조회 실패:", backupError);
      return null;
    }
  }
}

export default async function handler(req, res) {
  // CORS 미들웨어 실행
  await runMiddleware(req, res, cors);

  // 파일 시스템 백업 저장소 초기화
  ensureFileSystemBackup();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { rawData } = req.body;

    if (!rawData) {
      return res
        .status(400)
        .json({ error: "이메일 원문 데이터가 필요합니다." });
    }

    // 원문 데이터 유효성 검사
    const isValid = validateEmailRawData(rawData);
    if (!isValid.valid) {
      return res.status(400).json({
        success: false,
        error: `올바른 이메일 원문 데이터가 아닙니다: ${isValid.reason}`,
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
      // 오류가 발생해도 계속 진행 (빈 값 사용)
    }

    // 첨부 파일 확인
    let attachments = [];
    try {
      attachments = getEmailAttachments(rawData);
      console.log("첨부 파일 확인 완료:", attachments);
    } catch (attachmentError) {
      console.error("첨부 파일 분석 오류:", attachmentError);
      // 오류가 발생해도 계속 진행
    }

    // 비콘 이미지 체크
    let beacons = [];
    try {
      beacons = checkBeaconImages(bodyAnalysis.body);
      console.log("비콘 이미지 체크 완료");
    } catch (beaconError) {
      console.error("비콘 이미지 체크 오류:", beaconError);
      // 오류가 발생해도 계속 진행
    }

    // LLM 이메일 내용 분석
    let llmAnalysis = null;
    try {
      if (bodyAnalysis.body) {
        llmAnalysis = await analyzeEmailIntent(bodyAnalysis.body);
        console.log(
          "LLM 이메일 내용 분석 완료:",
          llmAnalysis.category,
          llmAnalysis.confidence
        );
      }
    } catch (llmError) {
      console.error("LLM 이메일 내용 분석 오류:", llmError);
      // 오류가 발생해도 계속 진행
    }

    // 고유 ID 생성
    const analysisId = uuidv4();
    console.log(`분석 ID 생성 완료: ${analysisId}`);

    // 종합 데이터
    const analysisData = {
      ...headerAnalysis,
      body: bodyAnalysis.body,
      links: bodyAnalysis.links,
      attachments,
      beacons,
      llmAnalysis,
      timestamp: new Date().toISOString(),
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
      id: analysisId,
      rawData: rawData,
    };

    // 결과 저장 (MongoDB) - 연결 실패 시에도 계속 진행
    try {
      const saveSuccess = await saveResult(analysisId, finalResult);
      if (saveSuccess) {
        console.log(`분석 결과 저장 완료 (ID: ${analysisId})`);
      } else {
        console.warn(
          `분석 결과 저장 실패 (ID: ${analysisId}) - 로컬 저장소 사용`
        );
      }
    } catch (saveError) {
      console.warn(`MongoDB 저장 오류 - 분석은 계속 진행:`, saveError.message);
    }

    // 세션 쿠키에 접근 허용 ID 저장/갱신
    try {
      const rawCookie = req.headers.cookie || "";
      const cookies = Object.fromEntries(
        rawCookie
          .split(";")
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const eq = c.indexOf("=");
            return [
              decodeURIComponent(c.slice(0, eq)),
              decodeURIComponent(c.slice(eq + 1)),
            ];
          })
      );

      let ids = [];
      if (cookies.analysis_ids) {
        try {
          ids = JSON.parse(cookies.analysis_ids);
          if (!Array.isArray(ids)) ids = [];
        } catch (_) {
          ids = [];
        }
      }
      // 중복 없이 추가
      if (!ids.includes(analysisId)) ids.push(analysisId);

      const cookieValue = encodeURIComponent(JSON.stringify(ids));
      const isProd = process.env.NODE_ENV === "production";
      const cookieParts = [
        `analysis_ids=${cookieValue}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
      ];
      if (isProd) cookieParts.push("Secure");

      res.setHeader("Set-Cookie", cookieParts.join("; "));
    } catch (cookieErr) {
      console.warn("세션 쿠키 설정 실패:", cookieErr);
    }

    // 결과 반환
    return res.status(200).json({
      success: true,
      message: "이메일 분석 완료",
      result: finalResult,
    });
  } catch (error) {
    console.error("이메일 분석 처리 오류:", error);
    return res.status(500).json({
      success: false,
      message: "이메일 분석 중 오류가 발생했습니다",
      error: error.message,
    });
  }
}

// 중복 함수 제거됨 - emailAnalyzer.js에서 import된 validateEmailRawData 사용

// 서버 사이드에서 사용할 분석 결과 조회 함수
export async function getServerSideResult(id) {
  // 조회 전 스토리지 초기화 확인
  await initializeStorage();
  return getResult(id);
}
