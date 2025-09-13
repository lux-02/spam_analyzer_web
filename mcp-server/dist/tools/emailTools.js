/**
 * 이메일 분석 관련 MCP 도구들
 */
import { EmailHeaderAnalysisParamsSchema, EmailContentAnalysisParamsSchema, RiskCalculationParamsSchema, EmailIntentAnalysisParamsSchema, ComprehensiveEmailAnalysisParamsSchema, } from "../types.js";
import { analyzeEmailHeader, parseEmailBodyAndLinks, calculateRiskScore, checkBeaconImages, analyzeEmailIntent, extractEmailText, } from "../utils/emailAnalyzer.js";
import { v4 as uuidv4 } from "uuid";
// 이메일 헤더 분석 도구
export const emailAnalyzeHeadersTool = {
    name: "mcp_email_analyze_headers",
    description: "이메일 원문 데이터에서 헤더 정보를 분석하여 SPF, DKIM, DMARC 검증 및 발신 경로를 추적합니다.",
    inputSchema: {
        type: "object",
        properties: {
            rawEmailData: {
                type: "string",
                description: "분석할 이메일의 원문 데이터 (헤더 포함)",
            },
        },
        required: ["rawEmailData"],
    },
};
export async function handleEmailAnalyzeHeaders(args) {
    try {
        const params = EmailHeaderAnalysisParamsSchema.parse(args);
        const { rawEmailData } = params;
        console.log("이메일 헤더 분석 시작");
        // 이메일 헤더 분석 실행
        const headerAnalysis = analyzeEmailHeader(rawEmailData);
        console.log("이메일 헤더 분석 완료");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "이메일 헤더 분석 완료",
                        analysis: headerAnalysis,
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("이메일 헤더 분석 오류:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
}
// 이메일 콘텐츠 분석 도구
export const emailAnalyzeContentTool = {
    name: "mcp_email_analyze_content",
    description: "이메일 원문 데이터에서 본문 내용, 링크, 첨부파일을 분석하고 추적 픽셀(비콘)을 검사합니다.",
    inputSchema: {
        type: "object",
        properties: {
            rawEmailData: {
                type: "string",
                description: "분석할 이메일의 원문 데이터",
            },
        },
        required: ["rawEmailData"],
    },
};
export async function handleEmailAnalyzeContent(args) {
    try {
        const params = EmailContentAnalysisParamsSchema.parse(args);
        const { rawEmailData } = params;
        console.log("이메일 콘텐츠 분석 시작");
        // 본문 및 링크 분석
        let bodyAnalysis = { body: "", links: [] };
        try {
            bodyAnalysis = parseEmailBodyAndLinks(rawEmailData);
            console.log("이메일 본문 및 링크 분석 완료");
        }
        catch (bodyError) {
            console.error("이메일 본문 분석 오류:", bodyError);
        }
        // 비콘 이미지 체크
        let beacons = [];
        try {
            beacons = checkBeaconImages(bodyAnalysis.body);
            console.log("비콘 이미지 체크 완료");
        }
        catch (beaconError) {
            console.error("비콘 이미지 체크 오류:", beaconError);
        }
        // 이메일 텍스트 추출 (AI 분석용)
        const emailText = extractEmailText(bodyAnalysis.body || rawEmailData);
        console.log("이메일 콘텐츠 분석 완료");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "이메일 콘텐츠 분석 완료",
                        analysis: {
                            body: bodyAnalysis.body,
                            links: bodyAnalysis.links,
                            beacons,
                            emailText,
                            statistics: {
                                totalLinks: bodyAnalysis.links.length,
                                beaconCount: beacons.length,
                                bodyLength: bodyAnalysis.body.length,
                                textLength: emailText.length,
                            },
                        },
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("이메일 콘텐츠 분석 오류:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
}
// 위험도 계산 도구
export const emailCalculateRiskTool = {
    name: "mcp_email_calculate_risk",
    description: "분석된 이메일 데이터를 바탕으로 종합 위험도 점수(0-100)를 계산합니다.",
    inputSchema: {
        type: "object",
        properties: {
            analysisData: {
                type: "object",
                description: "이메일 분석 결과 데이터 (헤더, 콘텐츠, LLM 분석 결과 포함)",
            },
        },
        required: ["analysisData"],
    },
};
export async function handleEmailCalculateRisk(args) {
    try {
        const params = RiskCalculationParamsSchema.parse(args);
        const { analysisData } = params;
        console.log("위험도 점수 계산 시작");
        // 위험도 계산 실행
        const riskAnalysis = calculateRiskScore(analysisData);
        console.log("위험도 점수 계산 완료:", riskAnalysis);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "위험도 점수 계산 완료",
                        risk: riskAnalysis,
                        interpretation: {
                            level: riskAnalysis.level,
                            description: riskAnalysis.score >= 75 ? "안전함 - 위험 요소 없거나 미미함" :
                                riskAnalysis.score >= 45 ? "의심스러움 - 일부 위험 요소 있음" :
                                    "매우 위험 - 심각한 피싱/스미싱 가능성",
                            recommendations: generateRecommendations(riskAnalysis),
                        },
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("위험도 계산 오류:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
}
// AI 기반 이메일 의도 분석 도구
export const emailAnalyzeIntentTool = {
    name: "mcp_email_analyze_intent",
    description: "AI를 사용하여 이메일의 의도를 분석합니다 (피싱, 스팸, 정상 등).",
    inputSchema: {
        type: "object",
        properties: {
            emailContent: {
                type: "string",
                description: "분석할 이메일 내용 (본문 텍스트 또는 HTML)",
            },
        },
        required: ["emailContent"],
    },
};
export async function handleEmailAnalyzeIntent(args) {
    try {
        const params = EmailIntentAnalysisParamsSchema.parse(args);
        const { emailContent } = params;
        console.log("AI 이메일 의도 분석 시작");
        // AI 기반 의도 분석 실행
        const llmAnalysis = await analyzeEmailIntent(emailContent);
        console.log("AI 이메일 의도 분석 완료:", llmAnalysis);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "AI 이메일 의도 분석 완료",
                        analysis: llmAnalysis,
                        summary: {
                            category: llmAnalysis.category,
                            confidence: llmAnalysis.confidence,
                            threatLevel: getThreatLevel(llmAnalysis.category, llmAnalysis.confidence),
                            modelUsed: llmAnalysis.model_used,
                        },
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("AI 이메일 의도 분석 오류:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
}
// 종합 이메일 분석 도구
export const comprehensiveEmailAnalysisTool = {
    name: "mcp_comprehensive_email_analysis",
    description: "이메일 원문 데이터를 종합적으로 분석합니다. 헤더, 본문, 첨부파일, AI 분석을 모두 포함하며 상세 분석 결과와 위험도 점수, 권장 조치사항을 제공합니다.",
    inputSchema: {
        type: "object",
        properties: {
            rawEmailData: {
                type: "string",
                description: "분석할 이메일의 원문 데이터 (전체)",
            },
        },
        required: ["rawEmailData"],
    },
};
export async function handleComprehensiveEmailAnalysis(args) {
    try {
        const params = ComprehensiveEmailAnalysisParamsSchema.parse(args);
        const { rawEmailData } = params;
        console.log("종합 이메일 분석 시작");
        // 고유 ID 생성
        const analysisId = uuidv4();
        // 1. 이메일 헤더 분석
        const headerAnalysis = analyzeEmailHeader(rawEmailData);
        console.log("이메일 헤더 분석 완료");
        // 2. 이메일 본문 및 링크 분석
        let bodyAnalysis = { body: "", links: [] };
        try {
            bodyAnalysis = parseEmailBodyAndLinks(rawEmailData);
            console.log("이메일 본문 및 링크 분석 완료");
        }
        catch (bodyError) {
            console.error("이메일 본문 분석 오류:", bodyError);
        }
        // 3. 비콘 이미지 체크
        let beacons = [];
        try {
            beacons = checkBeaconImages(bodyAnalysis.body);
            console.log("비콘 이미지 체크 완료");
        }
        catch (beaconError) {
            console.error("비콘 이미지 체크 오류:", beaconError);
        }
        // 4. LLM 이메일 내용 분석
        let llmAnalysis = null;
        try {
            if (bodyAnalysis.body) {
                llmAnalysis = await analyzeEmailIntent(bodyAnalysis.body);
                console.log("LLM 이메일 내용 분석 완료:", llmAnalysis.category, llmAnalysis.confidence);
            }
        }
        catch (llmError) {
            console.error("LLM 이메일 내용 분석 오류:", llmError);
        }
        // 5. 종합 데이터
        const analysisData = {
            ...headerAnalysis,
            body: bodyAnalysis.body,
            links: bodyAnalysis.links,
            beacons,
            llmAnalysis,
            timestamp: new Date().toISOString(),
        };
        // 6. 위험도 계산
        const riskAnalysis = calculateRiskScore({
            ...analysisData,
            beacons: beacons,
            llmAnalysis,
        });
        console.log("위험도 계산 완료");
        // 7. 최종 분석 결과
        const finalResult = {
            ...analysisData,
            risk: riskAnalysis,
            id: analysisId,
            rawData: rawEmailData,
        };
        // 8. 권장 조치사항 생성
        const recommendations = generateDetailedRecommendations(finalResult);
        console.log("종합 이메일 분석 완료");
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "종합 이메일 분석 완료",
                        analysisId,
                        result: finalResult,
                        summary: {
                            riskLevel: riskAnalysis.level,
                            riskScore: riskAnalysis.score,
                            threatIndicators: riskAnalysis.factors.length,
                            spfStatus: headerAnalysis.spf || "Not Found",
                            dkimStatus: headerAnalysis.dkim || "Not Found",
                            dmarcStatus: headerAnalysis.dmarc || "Not Found",
                            linksFound: bodyAnalysis.links.length,
                            beaconsFound: beacons.length,
                            aiCategory: llmAnalysis?.category || "분석 실패",
                            aiConfidence: llmAnalysis?.confidence || "알 수 없음",
                        },
                        recommendations,
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("종합 이메일 분석 오류:", error);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
}
// 헬퍼 함수들
function generateRecommendations(riskAnalysis) {
    const recommendations = [];
    if (riskAnalysis.level === "danger") {
        recommendations.push("⚠️ 이메일을 즉시 삭제하고 링크나 첨부파일을 클릭하지 마세요");
        recommendations.push("📧 발신자에게 직접 연락하여 이메일 진위를 확인하세요");
        recommendations.push("🔒 계정 비밀번호를 변경하고 2FA를 활성화하세요");
    }
    else if (riskAnalysis.level === "suspicious") {
        recommendations.push("🔍 이메일 내용을 신중히 검토하고 의심스러운 부분이 있는지 확인하세요");
        recommendations.push("🔗 링크를 클릭하기 전에 URL을 확인하세요");
        recommendations.push("📎 첨부파일은 바이러스 검사 후 열어보세요");
    }
    else {
        recommendations.push("✅ 이메일이 안전한 것으로 보이지만 항상 주의하세요");
        recommendations.push("🔐 개인정보를 요구하는 이메일에는 항상 주의하세요");
    }
    return recommendations;
}
function generateDetailedRecommendations(analysisResult) {
    const recommendations = {
        immediate: [],
        preventive: [],
        technical: [],
    };
    const { risk, spf, dkim, dmarc, links, beacons, llmAnalysis } = analysisResult;
    // 즉시 조치사항
    if (risk.level === "danger") {
        recommendations.immediate.push("이메일을 즉시 삭제하세요");
        recommendations.immediate.push("링크나 첨부파일을 클릭하지 마세요");
        recommendations.immediate.push("개인정보나 비밀번호를 입력하지 마세요");
    }
    // 예방 조치사항
    if (spf !== "pass" || dkim !== "pass" || dmarc !== "pass") {
        recommendations.preventive.push("발신자 인증이 실패한 이메일은 주의깊게 검토하세요");
    }
    if (beacons && beacons.length > 0) {
        recommendations.preventive.push("추적 픽셀이 감지되었습니다. 이메일 미리보기를 비활성화하세요");
    }
    if (links && links.length > 0) {
        recommendations.preventive.push("링크를 클릭하기 전에 URL을 확인하세요");
    }
    // 기술적 조치사항
    if (risk.level !== "safe") {
        recommendations.technical.push("네트워크 방화벽에서 의심스러운 도메인을 차단하세요");
        recommendations.technical.push("이메일 보안 솔루션을 업데이트하세요");
    }
    return recommendations;
}
function getThreatLevel(category, confidence) {
    const highRiskCategories = ["비밀번호 변경 요청", "송장/청구서 위장", "로그인 시도 알림"];
    if (highRiskCategories.includes(category)) {
        return confidence === "High" ? "매우 높음" : confidence === "Medium" ? "높음" : "중간";
    }
    else if (category === "스팸 광고") {
        return confidence === "High" ? "중간" : "낮음";
    }
    else if (category === "정상 업무 메일") {
        return "낮음";
    }
    return "알 수 없음";
}
// 모든 이메일 도구들을 내보내기
export const emailTools = [
    emailAnalyzeHeadersTool,
    emailAnalyzeContentTool,
    emailCalculateRiskTool,
    emailAnalyzeIntentTool,
    comprehensiveEmailAnalysisTool,
];
export const emailToolHandlers = {
    mcp_email_analyze_headers: handleEmailAnalyzeHeaders,
    mcp_email_analyze_content: handleEmailAnalyzeContent,
    mcp_email_calculate_risk: handleEmailCalculateRisk,
    mcp_email_analyze_intent: handleEmailAnalyzeIntent,
    mcp_comprehensive_email_analysis: handleComprehensiveEmailAnalysis,
};
//# sourceMappingURL=emailTools.js.map