import { z } from "zod";
export declare const EmailAnalysisSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    spf: z.ZodOptional<z.ZodString>;
    dkim: z.ZodOptional<z.ZodString>;
    dmarc: z.ZodOptional<z.ZodString>;
    receivedPaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    receivedDetails: z.ZodOptional<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        by: z.ZodString;
        ip: z.ZodString;
        date: z.ZodString;
        fullText: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        from: string;
        date: string;
        by: string;
        ip: string;
        fullText: string;
    }, {
        from: string;
        date: string;
        by: string;
        ip: string;
        fullText: string;
    }>, "many">>;
    links: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ipAddresses: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    domains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hostNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    body: z.ZodOptional<z.ZodString>;
    beacons: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        extension: z.ZodString;
        sizeInBytes: z.ZodNumber;
        disposition: z.ZodString;
        mimeType: z.ZodString;
        formattedSize: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        extension: string;
        sizeInBytes: number;
        disposition: string;
        mimeType: string;
        formattedSize: string;
    }, {
        name: string;
        extension: string;
        sizeInBytes: number;
        disposition: string;
        mimeType: string;
        formattedSize: string;
    }>, "many">>;
    llmAnalysis: z.ZodOptional<z.ZodObject<{
        category: z.ZodString;
        confidence: z.ZodString;
        reason: z.ZodString;
        riskScore: z.ZodNumber;
        model_used: z.ZodString;
        analysisMessage: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category: string;
        confidence: string;
        reason: string;
        riskScore: number;
        model_used: string;
        analysisMessage: string;
    }, {
        category: string;
        confidence: string;
        reason: string;
        riskScore: number;
        model_used: string;
        analysisMessage: string;
    }>>;
    risk: z.ZodOptional<z.ZodObject<{
        score: z.ZodNumber;
        level: z.ZodString;
        factors: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        score: number;
        level: string;
        factors: string[];
    }, {
        score: number;
        level: string;
        factors: string[];
    }>>;
    rawData: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    from?: string | undefined;
    to?: string | undefined;
    subject?: string | undefined;
    spf?: string | undefined;
    dkim?: string | undefined;
    dmarc?: string | undefined;
    receivedPaths?: string[] | undefined;
    receivedDetails?: {
        from: string;
        date: string;
        by: string;
        ip: string;
        fullText: string;
    }[] | undefined;
    links?: string[] | undefined;
    ipAddresses?: string[] | undefined;
    domains?: string[] | undefined;
    hostNames?: string[] | undefined;
    body?: string | undefined;
    beacons?: string[] | undefined;
    attachments?: {
        name: string;
        extension: string;
        sizeInBytes: number;
        disposition: string;
        mimeType: string;
        formattedSize: string;
    }[] | undefined;
    llmAnalysis?: {
        category: string;
        confidence: string;
        reason: string;
        riskScore: number;
        model_used: string;
        analysisMessage: string;
    } | undefined;
    risk?: {
        score: number;
        level: string;
        factors: string[];
    } | undefined;
    rawData?: string | undefined;
}, {
    id: string;
    timestamp: string;
    from?: string | undefined;
    to?: string | undefined;
    subject?: string | undefined;
    spf?: string | undefined;
    dkim?: string | undefined;
    dmarc?: string | undefined;
    receivedPaths?: string[] | undefined;
    receivedDetails?: {
        from: string;
        date: string;
        by: string;
        ip: string;
        fullText: string;
    }[] | undefined;
    links?: string[] | undefined;
    ipAddresses?: string[] | undefined;
    domains?: string[] | undefined;
    hostNames?: string[] | undefined;
    body?: string | undefined;
    beacons?: string[] | undefined;
    attachments?: {
        name: string;
        extension: string;
        sizeInBytes: number;
        disposition: string;
        mimeType: string;
        formattedSize: string;
    }[] | undefined;
    llmAnalysis?: {
        category: string;
        confidence: string;
        reason: string;
        riskScore: number;
        model_used: string;
        analysisMessage: string;
    } | undefined;
    risk?: {
        score: number;
        level: string;
        factors: string[];
    } | undefined;
    rawData?: string | undefined;
}>;
export declare const IPAnalysisSchema: z.ZodObject<{
    ip: z.ZodString;
    country: z.ZodString;
    countryCode: z.ZodString;
    flag: z.ZodString;
    region: z.ZodString;
    city: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    isp: z.ZodString;
    virusTotalUrl: z.ZodString;
    portScanInfo: z.ZodOptional<z.ZodObject<{
        success: z.ZodBoolean;
        scan_result: z.ZodObject<{
            open_ports: z.ZodArray<z.ZodObject<{
                port: z.ZodNumber;
                service: z.ZodString;
                state: z.ZodString;
                service_detail: z.ZodOptional<z.ZodString>;
                banner: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }, {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }>, "many">;
            filtered_ports: z.ZodArray<z.ZodAny, "many">;
            closed_ports: z.ZodArray<z.ZodAny, "many">;
            error: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            open_ports: {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }[];
            filtered_ports: any[];
            closed_ports: any[];
            error?: string | undefined;
        }, {
            open_ports: {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }[];
            filtered_ports: any[];
            closed_ports: any[];
            error?: string | undefined;
        }>;
        scan_time: z.ZodString;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        success: boolean;
        scan_result: {
            open_ports: {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }[];
            filtered_ports: any[];
            closed_ports: any[];
            error?: string | undefined;
        };
        scan_time: string;
    }, {
        timestamp: string;
        success: boolean;
        scan_result: {
            open_ports: {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }[];
            filtered_ports: any[];
            closed_ports: any[];
            error?: string | undefined;
        };
        scan_time: string;
    }>>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    error: z.ZodOptional<z.ZodString>;
    isError: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ip: string;
    country: string;
    countryCode: string;
    flag: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
    virusTotalUrl: string;
    error?: string | undefined;
    portScanInfo?: {
        timestamp: string;
        success: boolean;
        scan_result: {
            open_ports: {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }[];
            filtered_ports: any[];
            closed_ports: any[];
            error?: string | undefined;
        };
        scan_time: string;
    } | undefined;
    isPrivate?: boolean | undefined;
    isError?: boolean | undefined;
}, {
    ip: string;
    country: string;
    countryCode: string;
    flag: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
    virusTotalUrl: string;
    error?: string | undefined;
    portScanInfo?: {
        timestamp: string;
        success: boolean;
        scan_result: {
            open_ports: {
                port: number;
                service: string;
                state: string;
                service_detail?: string | undefined;
                banner?: string | undefined;
            }[];
            filtered_ports: any[];
            closed_ports: any[];
            error?: string | undefined;
        };
        scan_time: string;
    } | undefined;
    isPrivate?: boolean | undefined;
    isError?: boolean | undefined;
}>;
export declare const VirusTotalAnalysisSchema: z.ZodObject<{
    target: z.ZodString;
    type: z.ZodEnum<["ip", "domain", "url"]>;
    threat: z.ZodEnum<["malicious", "suspicious", "none", "unknown"]>;
    message: z.ZodString;
    analysis_stats: z.ZodObject<{
        malicious: z.ZodNumber;
        suspicious: z.ZodNumber;
        harmless: z.ZodNumber;
        undetected: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
    }, {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
    }>;
    detection_ratio: z.ZodString;
    malicious_results: z.ZodOptional<z.ZodArray<z.ZodObject<{
        engine: z.ZodString;
        result: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category: string;
        engine: string;
        result: string;
    }, {
        category: string;
        engine: string;
        result: string;
    }>, "many">>;
    analysis_results: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    virustotal_url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "ip" | "domain" | "url";
    target: string;
    threat: "unknown" | "malicious" | "suspicious" | "none";
    analysis_stats: {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
    };
    detection_ratio: string;
    virustotal_url: string;
    malicious_results?: {
        category: string;
        engine: string;
        result: string;
    }[] | undefined;
    analysis_results?: Record<string, any> | undefined;
}, {
    message: string;
    type: "ip" | "domain" | "url";
    target: string;
    threat: "unknown" | "malicious" | "suspicious" | "none";
    analysis_stats: {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
    };
    detection_ratio: string;
    virustotal_url: string;
    malicious_results?: {
        category: string;
        engine: string;
        result: string;
    }[] | undefined;
    analysis_results?: Record<string, any> | undefined;
}>;
export declare const NetworkThreatAnalysisSchema: z.ZodObject<{
    targets: z.ZodArray<z.ZodString, "many">;
    results: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        ip: z.ZodString;
        country: z.ZodString;
        countryCode: z.ZodString;
        flag: z.ZodString;
        region: z.ZodString;
        city: z.ZodString;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        isp: z.ZodString;
        virusTotalUrl: z.ZodString;
        portScanInfo: z.ZodOptional<z.ZodObject<{
            success: z.ZodBoolean;
            scan_result: z.ZodObject<{
                open_ports: z.ZodArray<z.ZodObject<{
                    port: z.ZodNumber;
                    service: z.ZodString;
                    state: z.ZodString;
                    service_detail: z.ZodOptional<z.ZodString>;
                    banner: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }, {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }>, "many">;
                filtered_ports: z.ZodArray<z.ZodAny, "many">;
                closed_ports: z.ZodArray<z.ZodAny, "many">;
                error: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            }, {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            }>;
            scan_time: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            success: boolean;
            scan_result: {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            };
            scan_time: string;
        }, {
            timestamp: string;
            success: boolean;
            scan_result: {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            };
            scan_time: string;
        }>>;
        isPrivate: z.ZodOptional<z.ZodBoolean>;
        error: z.ZodOptional<z.ZodString>;
        isError: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        ip: string;
        country: string;
        countryCode: string;
        flag: string;
        region: string;
        city: string;
        latitude: number;
        longitude: number;
        isp: string;
        virusTotalUrl: string;
        error?: string | undefined;
        portScanInfo?: {
            timestamp: string;
            success: boolean;
            scan_result: {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            };
            scan_time: string;
        } | undefined;
        isPrivate?: boolean | undefined;
        isError?: boolean | undefined;
    }, {
        ip: string;
        country: string;
        countryCode: string;
        flag: string;
        region: string;
        city: string;
        latitude: number;
        longitude: number;
        isp: string;
        virusTotalUrl: string;
        error?: string | undefined;
        portScanInfo?: {
            timestamp: string;
            success: boolean;
            scan_result: {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            };
            scan_time: string;
        } | undefined;
        isPrivate?: boolean | undefined;
        isError?: boolean | undefined;
    }>, z.ZodObject<{
        target: z.ZodString;
        type: z.ZodEnum<["ip", "domain", "url"]>;
        threat: z.ZodEnum<["malicious", "suspicious", "none", "unknown"]>;
        message: z.ZodString;
        analysis_stats: z.ZodObject<{
            malicious: z.ZodNumber;
            suspicious: z.ZodNumber;
            harmless: z.ZodNumber;
            undetected: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            malicious: number;
            suspicious: number;
            harmless: number;
            undetected: number;
        }, {
            malicious: number;
            suspicious: number;
            harmless: number;
            undetected: number;
        }>;
        detection_ratio: z.ZodString;
        malicious_results: z.ZodOptional<z.ZodArray<z.ZodObject<{
            engine: z.ZodString;
            result: z.ZodString;
            category: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            category: string;
            engine: string;
            result: string;
        }, {
            category: string;
            engine: string;
            result: string;
        }>, "many">>;
        analysis_results: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        virustotal_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "ip" | "domain" | "url";
        target: string;
        threat: "unknown" | "malicious" | "suspicious" | "none";
        analysis_stats: {
            malicious: number;
            suspicious: number;
            harmless: number;
            undetected: number;
        };
        detection_ratio: string;
        virustotal_url: string;
        malicious_results?: {
            category: string;
            engine: string;
            result: string;
        }[] | undefined;
        analysis_results?: Record<string, any> | undefined;
    }, {
        message: string;
        type: "ip" | "domain" | "url";
        target: string;
        threat: "unknown" | "malicious" | "suspicious" | "none";
        analysis_stats: {
            malicious: number;
            suspicious: number;
            harmless: number;
            undetected: number;
        };
        detection_ratio: string;
        virustotal_url: string;
        malicious_results?: {
            category: string;
            engine: string;
            result: string;
        }[] | undefined;
        analysis_results?: Record<string, any> | undefined;
    }>]>, "many">;
    summary: z.ZodObject<{
        total_targets: z.ZodNumber;
        malicious_count: z.ZodNumber;
        suspicious_count: z.ZodNumber;
        safe_count: z.ZodNumber;
        error_count: z.ZodNumber;
        high_risk_targets: z.ZodArray<z.ZodString, "many">;
        recommendations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        total_targets: number;
        malicious_count: number;
        suspicious_count: number;
        safe_count: number;
        error_count: number;
        high_risk_targets: string[];
        recommendations: string[];
    }, {
        total_targets: number;
        malicious_count: number;
        suspicious_count: number;
        safe_count: number;
        error_count: number;
        high_risk_targets: string[];
        recommendations: string[];
    }>;
    analysis_timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targets: string[];
    results: ({
        ip: string;
        country: string;
        countryCode: string;
        flag: string;
        region: string;
        city: string;
        latitude: number;
        longitude: number;
        isp: string;
        virusTotalUrl: string;
        error?: string | undefined;
        portScanInfo?: {
            timestamp: string;
            success: boolean;
            scan_result: {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            };
            scan_time: string;
        } | undefined;
        isPrivate?: boolean | undefined;
        isError?: boolean | undefined;
    } | {
        message: string;
        type: "ip" | "domain" | "url";
        target: string;
        threat: "unknown" | "malicious" | "suspicious" | "none";
        analysis_stats: {
            malicious: number;
            suspicious: number;
            harmless: number;
            undetected: number;
        };
        detection_ratio: string;
        virustotal_url: string;
        malicious_results?: {
            category: string;
            engine: string;
            result: string;
        }[] | undefined;
        analysis_results?: Record<string, any> | undefined;
    })[];
    summary: {
        total_targets: number;
        malicious_count: number;
        suspicious_count: number;
        safe_count: number;
        error_count: number;
        high_risk_targets: string[];
        recommendations: string[];
    };
    analysis_timestamp: string;
}, {
    targets: string[];
    results: ({
        ip: string;
        country: string;
        countryCode: string;
        flag: string;
        region: string;
        city: string;
        latitude: number;
        longitude: number;
        isp: string;
        virusTotalUrl: string;
        error?: string | undefined;
        portScanInfo?: {
            timestamp: string;
            success: boolean;
            scan_result: {
                open_ports: {
                    port: number;
                    service: string;
                    state: string;
                    service_detail?: string | undefined;
                    banner?: string | undefined;
                }[];
                filtered_ports: any[];
                closed_ports: any[];
                error?: string | undefined;
            };
            scan_time: string;
        } | undefined;
        isPrivate?: boolean | undefined;
        isError?: boolean | undefined;
    } | {
        message: string;
        type: "ip" | "domain" | "url";
        target: string;
        threat: "unknown" | "malicious" | "suspicious" | "none";
        analysis_stats: {
            malicious: number;
            suspicious: number;
            harmless: number;
            undetected: number;
        };
        detection_ratio: string;
        virustotal_url: string;
        malicious_results?: {
            category: string;
            engine: string;
            result: string;
        }[] | undefined;
        analysis_results?: Record<string, any> | undefined;
    })[];
    summary: {
        total_targets: number;
        malicious_count: number;
        suspicious_count: number;
        safe_count: number;
        error_count: number;
        high_risk_targets: string[];
        recommendations: string[];
    };
    analysis_timestamp: string;
}>;
export type ReportFormat = "json" | "markdown";
export declare const EmailHeaderAnalysisParamsSchema: z.ZodObject<{
    rawEmailData: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rawEmailData: string;
}, {
    rawEmailData: string;
}>;
export declare const EmailContentAnalysisParamsSchema: z.ZodObject<{
    rawEmailData: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rawEmailData: string;
}, {
    rawEmailData: string;
}>;
export declare const RiskCalculationParamsSchema: z.ZodObject<{
    analysisData: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    analysisData: Record<string, any>;
}, {
    analysisData: Record<string, any>;
}>;
export declare const EmailIntentAnalysisParamsSchema: z.ZodObject<{
    emailContent: z.ZodString;
}, "strip", z.ZodTypeAny, {
    emailContent: string;
}, {
    emailContent: string;
}>;
export declare const IPAnalysisParamsSchema: z.ZodObject<{
    ipAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ipAddress: string;
}, {
    ipAddress: string;
}>;
export declare const DomainAnalysisParamsSchema: z.ZodObject<{
    domain: z.ZodString;
}, "strip", z.ZodTypeAny, {
    domain: string;
}, {
    domain: string;
}>;
export declare const VirusTotalCheckParamsSchema: z.ZodObject<{
    target: z.ZodString;
    type: z.ZodEnum<["ip", "domain", "url"]>;
}, "strip", z.ZodTypeAny, {
    type: "ip" | "domain" | "url";
    target: string;
}, {
    type: "ip" | "domain" | "url";
    target: string;
}>;
export declare const PortScanParamsSchema: z.ZodObject<{
    ipAddress: z.ZodString;
    portRange: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ipAddress: string;
    portRange?: string | undefined;
}, {
    ipAddress: string;
    portRange?: string | undefined;
}>;
export declare const SaveAnalysisParamsSchema: z.ZodObject<{
    analysisData: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    analysisData: Record<string, any>;
}, {
    analysisData: Record<string, any>;
}>;
export declare const GetAnalysisParamsSchema: z.ZodObject<{
    analysisId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    analysisId: string;
}, {
    analysisId: string;
}>;
export declare const ExportReportParamsSchema: z.ZodObject<{
    analysisId: z.ZodString;
    format: z.ZodEnum<["json", "markdown"]>;
}, "strip", z.ZodTypeAny, {
    analysisId: string;
    format: "json" | "markdown";
}, {
    analysisId: string;
    format: "json" | "markdown";
}>;
export declare const ComprehensiveEmailAnalysisParamsSchema: z.ZodObject<{
    rawEmailData: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rawEmailData: string;
}, {
    rawEmailData: string;
}>;
export declare const NetworkThreatAnalysisParamsSchema: z.ZodObject<{
    targets: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    targets: string[];
}, {
    targets: string[];
}>;
export type EmailAnalysis = z.infer<typeof EmailAnalysisSchema>;
export type IPAnalysis = z.infer<typeof IPAnalysisSchema>;
export type VirusTotalAnalysis = z.infer<typeof VirusTotalAnalysisSchema>;
export type NetworkThreatAnalysis = z.infer<typeof NetworkThreatAnalysisSchema>;
export type EmailHeaderAnalysisParams = z.infer<typeof EmailHeaderAnalysisParamsSchema>;
export type EmailContentAnalysisParams = z.infer<typeof EmailContentAnalysisParamsSchema>;
export type RiskCalculationParams = z.infer<typeof RiskCalculationParamsSchema>;
export type EmailIntentAnalysisParams = z.infer<typeof EmailIntentAnalysisParamsSchema>;
export type IPAnalysisParams = z.infer<typeof IPAnalysisParamsSchema>;
export type DomainAnalysisParams = z.infer<typeof DomainAnalysisParamsSchema>;
export type VirusTotalCheckParams = z.infer<typeof VirusTotalCheckParamsSchema>;
export type PortScanParams = z.infer<typeof PortScanParamsSchema>;
export type SaveAnalysisParams = z.infer<typeof SaveAnalysisParamsSchema>;
export type GetAnalysisParams = z.infer<typeof GetAnalysisParamsSchema>;
export type ExportReportParams = z.infer<typeof ExportReportParamsSchema>;
export type ComprehensiveEmailAnalysisParams = z.infer<typeof ComprehensiveEmailAnalysisParamsSchema>;
export type NetworkThreatAnalysisParams = z.infer<typeof NetworkThreatAnalysisParamsSchema>;
//# sourceMappingURL=types.d.ts.map