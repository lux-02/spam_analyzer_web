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

const DEFAULT_API_KEY = process.env.DEFAULT_API_KEY;

const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "*",
});

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
    return res.status(405).json({ error: "허용되지 않는 메소드입니다." });
  }

  try {
    const { rawData, apiKey } = req.body;

    if (apiKey !== DEFAULT_API_KEY) {
      return res.status(401).json({ error: "유효하지 않은 API 키입니다." });
    }

    if (!rawData || typeof rawData !== "string") {
      return res
        .status(400)
        .json({ error: "이메일 원문 데이터가 필요합니다." });
    }

    const validation = isValidEmailRawData(rawData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: `올바른 이메일 원문 데이터가 아닙니다: ${validation.reason}`,
      });
    }

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

    const id = uuidv4();

    const analysisData = {
      ...headerAnalysis,
      body: bodyAnalysis.body,
      links: bodyAnalysis.links,
      attachments,
      beacons,
      llmAnalysis,
      timestamp: new Date().toISOString(),
      source: "test-external-api",
    };

    const riskAnalysis = calculateRiskScore(
      { ...headerAnalysis, llmAnalysis },
      { ...bodyAnalysis, llmAnalysis },
      attachments,
      beacons
    );

    const finalResult = {
      ...analysisData,
      risk: riskAnalysis,
      id,
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://mail.n2f.site";
    const resultUrl = `${baseUrl}/naver/email/${id}`;

    return res.status(200).json({
      success: true,
      storage: "session-only",
      id,
      resultUrl,
      result: finalResult,
      message: "이메일 분석이 완료되었습니다.",
    });
  } catch (error) {
    console.error("분석 처리 오류:", error);
    return res.status(500).json({
      error: "분석 처리 중 오류가 발생했습니다.",
      message: error.message,
    });
  }
}
