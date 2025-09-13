/**
 * 데이터 관리 관련 MCP 도구들
 */
import mongoose from "mongoose";
import { SaveAnalysisParamsSchema, GetAnalysisParamsSchema, ExportReportParamsSchema, } from "../types.js";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
// MongoDB 연결 상태를 추적하는 변수
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/spam_analyzer";
// 캐시된 연결을 저장하는 객체
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
// MongoDB 연결 함수
async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI)
            .then((mongoose) => {
            console.log("MongoDB 연결 성공");
            return mongoose;
        })
            .catch((error) => {
            console.error("MongoDB 연결 실패:", error);
            throw error;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
// 모델 스키마 정의
const AnalysisResultSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    from: { type: String },
    to: { type: String },
    subject: { type: String },
    spf: { type: String },
    dkim: { type: String },
    dmarc: { type: String },
    receivedPaths: [String],
    receivedDetails: [Object],
    links: [String],
    ipAddresses: [String],
    domains: [String],
    hostNames: [String],
    body: { type: String },
    beacons: [String],
    attachments: [Object],
    llmAnalysis: {
        category: String,
        confidence: String,
        reason: String,
        riskScore: Number,
        model_used: String,
        analysisMessage: String,
    },
    risk: {
        score: Number,
        factors: [String],
        level: String,
    },
    rawData: { type: String },
    analysisType: { type: String, default: "email" }, // email, network, comprehensive
    metadata: {
        userAgent: String,
        sourceIp: String,
        analysisVersion: String,
    },
}, {
    timestamps: true,
});
// 모델 생성 (이미 존재하는 경우 재사용)
const AnalysisResult = mongoose.models.AnalysisResult || mongoose.model("AnalysisResult", AnalysisResultSchema);
// 분석 결과 저장 도구
export const saveAnalysisResultTool = {
    name: "mcp_save_analysis_result",
    description: "분석 결과를 MongoDB에 저장합니다.",
    inputSchema: {
        type: "object",
        properties: {
            analysisData: {
                type: "object",
                description: "저장할 분석 결과 데이터",
            },
        },
        required: ["analysisData"],
    },
};
export async function handleSaveAnalysisResult(args) {
    try {
        const params = SaveAnalysisParamsSchema.parse(args);
        const { analysisData } = params;
        console.log("분석 결과 저장 시작");
        // MongoDB 연결
        await connectToDatabase();
        // ID가 없으면 생성
        if (!analysisData.id) {
            analysisData.id = uuidv4();
        }
        // 메타데이터 추가
        const enrichedData = {
            ...analysisData,
            metadata: {
                analysisVersion: "1.0.0",
                savedAt: new Date().toISOString(),
                ...analysisData.metadata,
            },
        };
        // 기존 데이터 확인
        const existingResult = await AnalysisResult.findOne({ id: analysisData.id });
        if (existingResult) {
            // 기존 데이터 업데이트
            await AnalysisResult.updateOne({ id: analysisData.id }, enrichedData);
            console.log(`기존 분석 결과 업데이트 완료 (ID: ${analysisData.id})`);
        }
        else {
            // 새 데이터 저장
            const newResult = new AnalysisResult(enrichedData);
            await newResult.save();
            console.log(`새 분석 결과 저장 완료 (ID: ${analysisData.id})`);
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "분석 결과 저장 완료",
                        analysisId: analysisData.id,
                        action: existingResult ? "updated" : "created",
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("분석 결과 저장 오류:", error);
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
// 분석 결과 조회 도구
export const getAnalysisResultTool = {
    name: "mcp_get_analysis_result",
    description: "저장된 분석 결과를 조회합니다.",
    inputSchema: {
        type: "object",
        properties: {
            analysisId: {
                type: "string",
                description: "조회할 분석 결과의 ID",
            },
        },
        required: ["analysisId"],
    },
};
export async function handleGetAnalysisResult(args) {
    try {
        const params = GetAnalysisParamsSchema.parse(args);
        const { analysisId } = params;
        console.log(`분석 결과 조회 시작: ${analysisId}`);
        // MongoDB 연결
        await connectToDatabase();
        // 분석 결과 조회
        const result = await AnalysisResult.findOne({ id: analysisId });
        if (!result) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: "해당 ID의 분석 결과를 찾을 수 없습니다",
                            analysisId,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
        console.log(`분석 결과 조회 완료: ${analysisId}`);
        const analysisResult = result.toObject();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "분석 결과 조회 완료",
                        analysisId,
                        result: analysisResult,
                        summary: {
                            analysisType: analysisResult.analysisType || "email",
                            riskLevel: analysisResult.risk?.level || "알 수 없음",
                            riskScore: analysisResult.risk?.score || 0,
                            createdAt: analysisResult.createdAt,
                            updatedAt: analysisResult.updatedAt,
                            hasAttachments: analysisResult.attachments && analysisResult.attachments.length > 0,
                            linksCount: analysisResult.links ? analysisResult.links.length : 0,
                            ipAddressesCount: analysisResult.ipAddresses ? analysisResult.ipAddresses.length : 0,
                        },
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("분석 결과 조회 오류:", error);
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
// 최근 분석 결과 조회 도구
export const getRecentAnalysesTool = {
    name: "mcp_get_recent_analyses",
    description: "최근 분석 결과 목록을 조회합니다.",
    inputSchema: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "조회할 결과 수 (기본값: 10, 최대: 100)",
                minimum: 1,
                maximum: 100,
            },
            analysisType: {
                type: "string",
                description: "분석 타입 필터 (email, network, comprehensive)",
                enum: ["email", "network", "comprehensive"],
            },
            riskLevel: {
                type: "string",
                description: "위험도 레벨 필터 (safe, suspicious, danger)",
                enum: ["safe", "suspicious", "danger"],
            },
        },
    },
};
export async function handleGetRecentAnalyses(args) {
    try {
        const { limit = 10, analysisType, riskLevel } = args;
        console.log(`최근 분석 결과 조회 시작: limit=${limit}, type=${analysisType}, risk=${riskLevel}`);
        // MongoDB 연결
        await connectToDatabase();
        // 쿼리 조건 구성
        const query = {};
        if (analysisType) {
            query.analysisType = analysisType;
        }
        if (riskLevel) {
            query["risk.level"] = riskLevel;
        }
        // 최근 분석 결과 조회
        const results = await AnalysisResult.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(limit, 100))
            .select("id timestamp from subject risk.level risk.score analysisType createdAt updatedAt");
        console.log(`최근 분석 결과 조회 완료: ${results.length}개 결과`);
        // 통계 계산
        const statistics = {
            total: results.length,
            byRiskLevel: {
                safe: results.filter(r => r.risk?.level === "safe").length,
                suspicious: results.filter(r => r.risk?.level === "suspicious").length,
                danger: results.filter(r => r.risk?.level === "danger").length,
            },
            byAnalysisType: {
                email: results.filter(r => r.analysisType === "email").length,
                network: results.filter(r => r.analysisType === "network").length,
                comprehensive: results.filter(r => r.analysisType === "comprehensive").length,
            },
            averageRiskScore: results.reduce((sum, r) => sum + (r.risk?.score || 0), 0) / results.length || 0,
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "최근 분석 결과 조회 완료",
                        results: results.map(r => ({
                            id: r.id,
                            timestamp: r.timestamp,
                            from: r.from,
                            subject: r.subject ? r.subject.substring(0, 50) + (r.subject.length > 50 ? "..." : "") : null,
                            riskLevel: r.risk?.level,
                            riskScore: r.risk?.score,
                            analysisType: r.analysisType,
                            createdAt: r.createdAt,
                            updatedAt: r.updatedAt,
                        })),
                        statistics,
                        query: {
                            limit,
                            analysisType,
                            riskLevel,
                        },
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("최근 분석 결과 조회 오류:", error);
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
// 분석 보고서 내보내기 도구
export const exportAnalysisReportTool = {
    name: "mcp_export_analysis_report",
    description: "분석 결과를 보고서 형태로 내보냅니다 (JSON 또는 Markdown 형식).",
    inputSchema: {
        type: "object",
        properties: {
            analysisId: {
                type: "string",
                description: "내보낼 분석 결과의 ID",
            },
            format: {
                type: "string",
                enum: ["json", "markdown"],
                description: "보고서 형식 (json 또는 markdown)",
            },
        },
        required: ["analysisId", "format"],
    },
};
export async function handleExportAnalysisReport(args) {
    try {
        const params = ExportReportParamsSchema.parse(args);
        const { analysisId, format } = params;
        console.log(`분석 보고서 내보내기 시작: ${analysisId} (${format})`);
        // 분석 결과 조회
        const analysisResult = await handleGetAnalysisResult({ analysisId });
        const analysisData = JSON.parse(analysisResult.content[0].text);
        if (!analysisData.success) {
            return analysisResult; // 오류를 그대로 전달
        }
        const result = analysisData.result;
        if (format === "json") {
            // JSON 형식 보고서
            const jsonReport = {
                reportMetadata: {
                    reportId: uuidv4(),
                    analysisId: analysisId,
                    generatedAt: new Date().toISOString(),
                    format: "json",
                    version: "1.0.0",
                },
                executiveSummary: {
                    subject: result.subject || "제목 없음",
                    from: result.from || "발신자 정보 없음",
                    riskLevel: result.risk?.level || "알 수 없음",
                    riskScore: result.risk?.score || 0,
                    threatFactors: result.risk?.factors?.length || 0,
                    recommendation: getRiskRecommendation(result.risk?.level),
                },
                technicalAnalysis: {
                    emailAuthentication: {
                        spf: result.spf || "Not Found",
                        dkim: result.dkim || "Not Found",
                        dmarc: result.dmarc || "Not Found",
                    },
                    networkAnalysis: {
                        ipAddresses: result.ipAddresses || [],
                        domains: result.domains || [],
                        links: result.links || [],
                    },
                    contentAnalysis: {
                        beacons: result.beacons || [],
                        attachments: result.attachments || [],
                        bodyLength: result.body ? result.body.length : 0,
                    },
                    aiAnalysis: result.llmAnalysis || null,
                },
                detailedFindings: {
                    riskFactors: result.risk?.factors || [],
                    receivedPath: result.receivedPaths || [],
                    securityHeaders: {
                        spfStatus: result.spf,
                        dkimStatus: result.dkim,
                        dmarcStatus: result.dmarc,
                    },
                },
                rawData: {
                    analysisTimestamp: result.timestamp,
                    analysisId: result.id,
                    originalData: format === "json" ? result.rawData : "[원문 데이터는 Markdown 형식에서만 포함됩니다]",
                },
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "JSON 보고서 생성 완료",
                            report: jsonReport,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
        else if (format === "markdown") {
            // Markdown 형식 보고서
            const markdownReport = generateMarkdownReport(result, analysisId);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "Markdown 보고서 생성 완료",
                            report: markdownReport,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
        throw new Error("지원하지 않는 보고서 형식입니다");
    }
    catch (error) {
        console.error("분석 보고서 내보내기 오류:", error);
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
// 분석 통계 조회 도구
export const getAnalysisStatisticsTool = {
    name: "mcp_get_analysis_statistics",
    description: "저장된 분석 결과들의 통계를 조회합니다.",
    inputSchema: {
        type: "object",
        properties: {
            timeRange: {
                type: "string",
                description: "통계 기간 (1d, 7d, 30d, 90d)",
                enum: ["1d", "7d", "30d", "90d"],
            },
        },
    },
};
export async function handleGetAnalysisStatistics(args) {
    try {
        const { timeRange = "7d" } = args;
        console.log(`분석 통계 조회 시작: ${timeRange}`);
        // MongoDB 연결
        await connectToDatabase();
        // 시간 범위 계산
        const now = new Date();
        const timeRangeMap = {
            "1d": 1,
            "7d": 7,
            "30d": 30,
            "90d": 90,
        };
        const daysBack = timeRangeMap[timeRange] || 7;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        // 통계 쿼리
        const totalResults = await AnalysisResult.countDocuments({
            createdAt: { $gte: startDate },
        });
        const riskLevelStats = await AnalysisResult.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: "$risk.level", count: { $sum: 1 } } },
        ]);
        const analysisTypeStats = await AnalysisResult.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: "$analysisType", count: { $sum: 1 } } },
        ]);
        const averageRiskScore = await AnalysisResult.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: null, avgScore: { $avg: "$risk.score" } } },
        ]);
        const dailyStats = await AnalysisResult.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    dangerCount: {
                        $sum: { $cond: [{ $eq: ["$risk.level", "danger"] }, 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        console.log(`분석 통계 조회 완료: ${totalResults}개 결과`);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        success: true,
                        message: "분석 통계 조회 완료",
                        timeRange,
                        period: `${format(startDate, "yyyy-MM-dd")} ~ ${format(now, "yyyy-MM-dd")}`,
                        statistics: {
                            total: totalResults,
                            averageRiskScore: averageRiskScore[0]?.avgScore || 0,
                            riskLevelDistribution: Object.fromEntries(riskLevelStats.map((stat) => [stat._id || "unknown", stat.count])),
                            analysisTypeDistribution: Object.fromEntries(analysisTypeStats.map((stat) => [stat._id || "unknown", stat.count])),
                            dailyTrend: dailyStats.map((stat) => ({
                                date: stat._id,
                                total: stat.count,
                                dangerCount: stat.dangerCount,
                                dangerRate: stat.count > 0 ? (stat.dangerCount / stat.count * 100).toFixed(1) : "0",
                            })),
                        },
                        insights: generateStatisticsInsights({
                            total: totalResults,
                            riskLevelStats,
                            dailyStats,
                            timeRange,
                        }),
                        timestamp: new Date().toISOString(),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("분석 통계 조회 오류:", error);
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
function getRiskRecommendation(riskLevel) {
    switch (riskLevel) {
        case "danger":
            return "즉시 차단하고 보안팀에 신고하세요";
        case "suspicious":
            return "주의깊게 검토하고 추가 조사를 권장합니다";
        case "safe":
            return "안전하지만 지속적인 모니터링을 유지하세요";
        default:
            return "추가 분석이 필요합니다";
    }
}
function generateMarkdownReport(result, analysisId) {
    const reportDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    return `# 이메일 보안 분석 보고서

## 개요
- **분석 ID**: ${analysisId}
- **생성 시간**: ${reportDate}
- **분석 대상**: ${result.subject || "제목 없음"}
- **발신자**: ${result.from || "발신자 정보 없음"}

## 위험도 평가
- **위험 등급**: ${getRiskLevelEmoji(result.risk?.level)} ${result.risk?.level || "알 수 없음"}
- **위험 점수**: ${result.risk?.score || 0}/100
- **권장 조치**: ${getRiskRecommendation(result.risk?.level)}

## 인증 상태
| 인증 방식 | 상태 |
|-----------|------|
| SPF | ${getStatusEmoji(result.spf)} ${result.spf || "Not Found"} |
| DKIM | ${getStatusEmoji(result.dkim)} ${result.dkim || "Not Found"} |
| DMARC | ${getStatusEmoji(result.dmarc)} ${result.dmarc || "Not Found"} |

## 위험 요소
${result.risk?.factors?.map((factor) => `- ⚠️ ${factor}`).join('\n') || "- ✅ 발견된 위험 요소가 없습니다"}

## 네트워크 분석
- **IP 주소**: ${result.ipAddresses?.length || 0}개 발견
- **도메인**: ${result.domains?.length || 0}개 발견
- **링크**: ${result.links?.length || 0}개 발견

## 콘텐츠 분석
- **추적 픽셀**: ${result.beacons?.length || 0}개 발견
- **첨부파일**: ${result.attachments?.length || 0}개 발견
- **본문 길이**: ${result.body ? result.body.length : 0} 문자

${result.llmAnalysis ? `
## AI 분석 결과
- **분류**: ${result.llmAnalysis.category}
- **신뢰도**: ${result.llmAnalysis.confidence}
- **모델**: ${result.llmAnalysis.model_used}
- **분석 내용**: ${result.llmAnalysis.reason}
` : ''}

## 상세 정보
### 수신 경로
${result.receivedPaths?.map((path, index) => `${index + 1}. ${path}`).join('\n') || "수신 경로 정보 없음"}

### IP 주소 목록
${result.ipAddresses?.map((ip) => `- ${ip}`).join('\n') || "IP 주소 정보 없음"}

### 링크 목록
${result.links?.map((link) => `- ${link}`).join('\n') || "링크 정보 없음"}

---
*이 보고서는 자동으로 생성되었습니다. 추가 분석이나 문의사항이 있으시면 보안팀에 연락하세요.*
`;
}
function getRiskLevelEmoji(level) {
    switch (level) {
        case "danger": return "🔴";
        case "suspicious": return "🟠";
        case "safe": return "🟢";
        default: return "⚪";
    }
}
function getStatusEmoji(status) {
    switch (status) {
        case "pass": return "✅";
        case "fail": return "❌";
        case "softfail": return "⚠️";
        case "none": return "❓";
        default: return "❓";
    }
}
function generateStatisticsInsights(data) {
    const insights = [];
    const { total, riskLevelStats, dailyStats, timeRange } = data;
    if (total === 0) {
        insights.push("선택된 기간 동안 분석된 이메일이 없습니다.");
        return insights;
    }
    // 위험도 분포 분석
    const dangerCount = riskLevelStats.find((s) => s._id === "danger")?.count || 0;
    const dangerRate = (dangerCount / total * 100).toFixed(1);
    if (dangerCount > 0) {
        insights.push(`⚠️ 전체 분석 중 ${dangerRate}% (${dangerCount}개)가 위험한 이메일로 분류되었습니다.`);
    }
    else {
        insights.push("✅ 위험한 이메일이 발견되지 않았습니다.");
    }
    // 일일 트렌드 분석
    if (dailyStats.length > 1) {
        const recent = dailyStats.slice(-2);
        const trend = recent[1].count - recent[0].count;
        if (trend > 0) {
            insights.push(`📈 최근 분석량이 증가하고 있습니다 (${trend}개 증가).`);
        }
        else if (trend < 0) {
            insights.push(`📉 최근 분석량이 감소하고 있습니다 (${Math.abs(trend)}개 감소).`);
        }
    }
    // 평균 분석량
    const avgDaily = (total / parseInt(timeRange.replace('d', ''))).toFixed(1);
    insights.push(`📊 일평균 ${avgDaily}개의 이메일이 분석되었습니다.`);
    return insights;
}
// 모든 데이터 도구들을 내보내기
export const dataTools = [
    saveAnalysisResultTool,
    getAnalysisResultTool,
    getRecentAnalysesTool,
    exportAnalysisReportTool,
    getAnalysisStatisticsTool,
];
export const dataToolHandlers = {
    mcp_save_analysis_result: handleSaveAnalysisResult,
    mcp_get_analysis_result: handleGetAnalysisResult,
    mcp_get_recent_analyses: handleGetRecentAnalyses,
    mcp_export_analysis_report: handleExportAnalysisReport,
    mcp_get_analysis_statistics: handleGetAnalysisStatistics,
};
//# sourceMappingURL=dataTools.js.map