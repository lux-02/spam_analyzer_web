/**
 * 네트워크 분석 관련 MCP 도구들
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
export declare const analyzeIpTool: Tool;
export declare function handleAnalyzeIp(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const analyzeDomainTool: Tool;
export declare function handleAnalyzeDomain(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const virusTotalCheckTool: Tool;
export declare function handleVirusTotalCheck(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const portScanTool: Tool;
export declare function handlePortScan(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const networkThreatAnalysisTool: Tool;
export declare function handleNetworkThreatAnalysis(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const networkTools: import("zod").objectOutputType<{
    name: import("zod").ZodString;
    description: import("zod").ZodOptional<import("zod").ZodString>;
    inputSchema: import("zod").ZodObject<{
        type: import("zod").ZodLiteral<"object">;
        properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
    }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
        type: import("zod").ZodLiteral<"object">;
        properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
    }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
        type: import("zod").ZodLiteral<"object">;
        properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
    }, import("zod").ZodTypeAny, "passthrough">>;
}, import("zod").ZodTypeAny, "passthrough">[];
export declare const networkToolHandlers: {
    mcp_analyze_ip: typeof handleAnalyzeIp;
    mcp_analyze_domain: typeof handleAnalyzeDomain;
    mcp_virustotal_check: typeof handleVirusTotalCheck;
    mcp_port_scan: typeof handlePortScan;
    mcp_network_threat_analysis: typeof handleNetworkThreatAnalysis;
};
//# sourceMappingURL=networkTools.d.ts.map