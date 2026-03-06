import { v4 as uuidv4 } from "uuid";
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

// CORS 미들웨어 초기화
const cors = Cors({
  methods: ["POST", "GET", "OPTIONS"],
  origin: "*", // 실제 배포 시 허용 도메인으로 제한 권장
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

function encodeAnalysisPayload(payload) {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64url");
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

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

    const isValid = validateEmailRawData(rawData);
    if (!isValid.valid) {
      return res.status(400).json({
        success: false,
        error: `올바른 이메일 원문 데이터가 아닙니다: ${isValid.reason}`,
      });
    }

    console.log("이메일 분석 요청 시작");

    const headerAnalysis = analyzeEmailHeader(rawData);

    let bodyAnalysis = { body: "", links: [] };
    try {
      bodyAnalysis = parseEmailBodyAndLinks(rawData);
    } catch (bodyError) {
      console.error("이메일 본문 분석 오류:", bodyError);
    }

    let attachments = [];
    try {
      attachments = getEmailAttachments(rawData);
    } catch (attachmentError) {
      console.error("첨부 파일 분석 오류:", attachmentError);
    }

    let beacons = [];
    try {
      beacons = checkBeaconImages(bodyAnalysis.body);
    } catch (beaconError) {
      console.error("비콘 이미지 체크 오류:", beaconError);
    }

    let llmAnalysis = null;
    try {
      if (bodyAnalysis.body) {
        llmAnalysis = await analyzeEmailIntent(bodyAnalysis.body);
      }
    } catch (llmError) {
      console.error("LLM 이메일 내용 분석 오류:", llmError);
    }

    const analysisId = uuidv4();

    const analysisData = {
      ...headerAnalysis,
      body: bodyAnalysis.body,
      links: bodyAnalysis.links,
      attachments,
      beacons,
      llmAnalysis,
      timestamp: new Date().toISOString(),
    };

    const riskAnalysis = calculateRiskScore({
      ...analysisData,
      beacons,
      llmAnalysis,
    });

    // 개인정보 보호를 위해 서버 저장 없이 결과를 즉시 반환
    const finalResult = {
      ...analysisData,
      risk: riskAnalysis,
      id: analysisId,
    };

    const payload = encodeAnalysisPayload(finalResult);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://naver.darkwinterlab.com";
    const resultUrl = `${baseUrl}/naver/email/${analysisId}#analysis=${payload}`;

    return res.status(200).json({
      success: true,
      message: "이메일 분석 완료",
      storage: "none",
      resultUrl,
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
