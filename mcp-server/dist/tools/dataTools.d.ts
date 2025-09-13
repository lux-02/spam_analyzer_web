/**
 * 데이터 관리 관련 MCP 도구들
 */
import { Tool } from "@modelcontextprotocol/sdk/types.js";
export declare const saveAnalysisResultTool: Tool;
export declare function handleSaveAnalysisResult(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const getAnalysisResultTool: Tool;
export declare function handleGetAnalysisResult(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const getRecentAnalysesTool: Tool;
export declare function handleGetRecentAnalyses(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const exportAnalysisReportTool: Tool;
export declare function handleExportAnalysisReport(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const getAnalysisStatisticsTool: Tool;
export declare function handleGetAnalysisStatistics(args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
export declare const dataTools: import("zod").objectOutputType<{
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
export declare const dataToolHandlers: {
    mcp_save_analysis_result: typeof handleSaveAnalysisResult;
    mcp_get_analysis_result: typeof handleGetAnalysisResult;
    mcp_get_recent_analyses: typeof handleGetRecentAnalyses;
    mcp_export_analysis_report: typeof handleExportAnalysisReport;
    mcp_get_analysis_statistics: typeof handleGetAnalysisStatistics;
};
//# sourceMappingURL=dataTools.d.ts.map