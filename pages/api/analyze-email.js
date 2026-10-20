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
import {
  guardAnalysisRequest,
  refundAnalysisRequest,
} from "../../utils/analysisGuard";

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

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let quotaConsumed = false;
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

    // 형식 검사를 통과한 요청만 사람 확인과 하루 횟수 차감 대상으로 본다
    const guard = await guardAnalysisRequest(req);
    if (!guard.ok) {
      return res.status(guard.status).json(guard.body);
    }
    quotaConsumed = true;

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

    const riskAnalysis = calculateRiskScore(
      { ...headerAnalysis, llmAnalysis },
      { ...bodyAnalysis, llmAnalysis },
      attachments,
      beacons
    );

    // 개인정보 보호를 위해 서버 저장 없이 결과를 즉시 반환
    const finalResult = {
      ...analysisData,
      risk: riskAnalysis,
      id: analysisId,
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://mail.n2f.site";
    const resultUrl = `${baseUrl}/naver/email/${analysisId}`;

    return res.status(200).json({
      success: true,
      message: "이메일 분석 완료",
      storage: "session-only",
      resultUrl,
      result: finalResult,
      quota: guard.quota,
    });
  } catch (error) {
    console.error("이메일 분석 처리 오류:", error);
    // 서버 쪽 실패로 결과를 못 받았으니 오늘 횟수에서 빼지 않는다
    if (quotaConsumed) await refundAnalysisRequest(req);
    return res.status(500).json({
      success: false,
      message: "이메일 분석 중 오류가 발생했습니다",
      error: error.message,
    });
  }
}
