import { z } from "zod";
// 이메일 분석 관련 타입들
export const EmailAnalysisSchema = z.object({
    id: z.string(),
    timestamp: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
    subject: z.string().optional(),
    spf: z.string().optional(),
    dkim: z.string().optional(),
    dmarc: z.string().optional(),
    receivedPaths: z.array(z.string()).optional(),
    receivedDetails: z
        .array(z.object({
        from: z.string(),
        by: z.string(),
        ip: z.string(),
        date: z.string(),
        fullText: z.string(),
    }))
        .optional(),
    links: z.array(z.string()).optional(),
    ipAddresses: z.array(z.string()).optional(),
    domains: z.array(z.string()).optional(),
    hostNames: z.array(z.string()).optional(),
    body: z.string().optional(),
    beacons: z.array(z.string()).optional(),
    attachments: z
        .array(z.object({
        name: z.string(),
        extension: z.string(),
        sizeInBytes: z.number(),
        disposition: z.string(),
        mimeType: z.string(),
        formattedSize: z.string(),
    }))
        .optional(),
    llmAnalysis: z
        .object({
        category: z.string(),
        confidence: z.string(),
        reason: z.string(),
        riskScore: z.number(),
        model_used: z.string(),
        analysisMessage: z.string(),
    })
        .optional(),
    risk: z
        .object({
        score: z.number(),
        level: z.string(),
        factors: z.array(z.string()),
    })
        .optional(),
    rawData: z.string().optional(),
});
// IP 분석 관련 타입들
export const IPAnalysisSchema = z.object({
    ip: z.string(),
    country: z.string(),
    countryCode: z.string(),
    flag: z.string(),
    region: z.string(),
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    isp: z.string(),
    virusTotalUrl: z.string(),
    portScanInfo: z
        .object({
        success: z.boolean(),
        scan_result: z.object({
            open_ports: z.array(z.object({
                port: z.number(),
                service: z.string(),
                state: z.string(),
                service_detail: z.string().optional(),
                banner: z.string().optional(),
            })),
            filtered_ports: z.array(z.any()),
            closed_ports: z.array(z.any()),
            error: z.string().optional(),
        }),
        scan_time: z.string(),
        timestamp: z.string(),
    })
        .optional(),
    isPrivate: z.boolean().optional(),
    error: z.string().optional(),
    isError: z.boolean().optional(),
});
// VirusTotal 검사 관련 타입들
export const VirusTotalAnalysisSchema = z.object({
    target: z.string(),
    type: z.enum(["ip", "domain", "url"]),
    threat: z.enum(["malicious", "suspicious", "none", "unknown"]),
    message: z.string(),
    analysis_stats: z.object({
        malicious: z.number(),
        suspicious: z.number(),
        harmless: z.number(),
        undetected: z.number(),
    }),
    detection_ratio: z.string(),
    malicious_results: z
        .array(z.object({
        engine: z.string(),
        result: z.string(),
        category: z.string(),
    }))
        .optional(),
    analysis_results: z.record(z.any()).optional(),
    virustotal_url: z.string(),
});
// 네트워크 위협 분석 결과 타입
export const NetworkThreatAnalysisSchema = z.object({
    targets: z.array(z.string()),
    results: z.array(z.union([IPAnalysisSchema, VirusTotalAnalysisSchema])),
    summary: z.object({
        total_targets: z.number(),
        malicious_count: z.number(),
        suspicious_count: z.number(),
        safe_count: z.number(),
        error_count: z.number(),
        high_risk_targets: z.array(z.string()),
        recommendations: z.array(z.string()),
    }),
    analysis_timestamp: z.string(),
});
// MCP 도구 매개변수 스키마들
export const EmailHeaderAnalysisParamsSchema = z.object({
    rawEmailData: z.string().min(1, "이메일 원문 데이터는 필수입니다"),
});
export const EmailContentAnalysisParamsSchema = z.object({
    rawEmailData: z.string().min(1, "이메일 원문 데이터는 필수입니다"),
});
export const RiskCalculationParamsSchema = z.object({
    analysisData: z.record(z.any()),
});
export const EmailIntentAnalysisParamsSchema = z.object({
    emailContent: z.string().min(1, "이메일 내용은 필수입니다"),
});
export const IPAnalysisParamsSchema = z.object({
    ipAddress: z.string().ip("유효한 IP 주소를 입력해주세요"),
});
export const DomainAnalysisParamsSchema = z.object({
    domain: z.string().min(1, "도메인은 필수입니다"),
});
export const VirusTotalCheckParamsSchema = z.object({
    target: z.string().min(1, "검사 대상은 필수입니다"),
    type: z.enum(["ip", "domain", "url"]),
});
export const PortScanParamsSchema = z.object({
    ipAddress: z.string().ip("유효한 IP 주소를 입력해주세요"),
    portRange: z.string().optional(),
});
export const SaveAnalysisParamsSchema = z.object({
    analysisData: z.record(z.any()),
});
export const GetAnalysisParamsSchema = z.object({
    analysisId: z.string().min(1, "분석 ID는 필수입니다"),
});
export const ExportReportParamsSchema = z.object({
    analysisId: z.string().min(1, "분석 ID는 필수입니다"),
    format: z.enum(["json", "markdown"]),
});
export const ComprehensiveEmailAnalysisParamsSchema = z.object({
    rawEmailData: z.string().min(1, "이메일 원문 데이터는 필수입니다"),
});
export const NetworkThreatAnalysisParamsSchema = z.object({
    targets: z.array(z.string()).min(1, "최소 하나의 대상이 필요합니다"),
});
//# sourceMappingURL=types.js.map