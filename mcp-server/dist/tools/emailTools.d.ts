/**
 * 이메일 분석 관련 MCP 도구들
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
export declare const emailAnalyzeHeadersTool: Tool;
export declare function handleEmailAnalyzeHeaders(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const emailAnalyzeContentTool: Tool;
export declare function handleEmailAnalyzeContent(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const emailCalculateRiskTool: Tool;
export declare function handleEmailCalculateRisk(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const emailAnalyzeIntentTool: Tool;
export declare function handleEmailAnalyzeIntent(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const comprehensiveEmailAnalysisTool: Tool;
export declare function handleComprehensiveEmailAnalysis(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const emailTools: import("zod").objectOutputType<{
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
export declare const emailToolHandlers: {
    mcp_email_analyze_headers: typeof handleEmailAnalyzeHeaders;
    mcp_email_analyze_content: typeof handleEmailAnalyzeContent;
    mcp_email_calculate_risk: typeof handleEmailCalculateRisk;
    mcp_email_analyze_intent: typeof handleEmailAnalyzeIntent;
    mcp_comprehensive_email_analysis: typeof handleComprehensiveEmailAnalysis;
};
//# sourceMappingURL=emailTools.d.ts.map