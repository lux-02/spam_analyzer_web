#!/usr/bin/env node

/**
 * Spam Analyzer MCP Server
 * 이메일 보안 분석을 위한 MCP (Model Context Protocol) 서버
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import { config } from "dotenv";

// 환경 변수 로드
config();

// 도구들 임포트
import { emailTools, emailToolHandlers } from "./tools/emailTools.js";
import { networkTools, networkToolHandlers } from "./tools/networkTools.js";
import { dataTools, dataToolHandlers } from "./tools/dataTools.js";

// 모든 도구들과 핸들러들을 합치기
const allTools = [...emailTools, ...networkTools, ...dataTools];
const allToolHandlers = {
  ...emailToolHandlers,
  ...networkToolHandlers,
  ...dataToolHandlers,
};

class SpamAnalyzerMCPServer {
  private server: Server;
  private httpServer?: express.Application;

  constructor() {
    this.server = new Server(
      {
        name: "spam-analyzer-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupMCPHandlers();
    this.setupHTTPServer();
  }

  private setupMCPHandlers() {
    // 도구 목록 제공
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log("도구 목록 요청 받음");
      return {
        tools: allTools,
      };
    });

    // 도구 실행
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      console.log(`도구 실행 요청: ${name}`);
      console.log("매개변수:", JSON.stringify(args, null, 2));

      try {
        if (name in allToolHandlers) {
          const handler = allToolHandlers[name as keyof typeof allToolHandlers];
          const result = await handler(args);

          console.log(`도구 실행 완료: ${name}`);
          return result;
        } else {
          const errorMessage = `알 수 없는 도구: ${name}`;
          console.error(errorMessage);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: errorMessage,
                    availableTools: Object.keys(allToolHandlers),
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
      } catch (error) {
        const errorMessage = `도구 실행 중 오류 발생: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`;
        console.error(`${name} 실행 오류:`, error);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: errorMessage,
                  tool: name,
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      }
    });

    // 서버 이벤트 핸들링
    this.server.onerror = (error) => {
      console.error("MCP 서버 오류:", error);
    };

    process.on("SIGINT", async () => {
      console.log("\nMCP 서버를 종료합니다...");
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHTTPServer() {
    if (process.env.HTTP_MODE === "true") {
      this.httpServer = express();

      // 미들웨어 설정
      this.httpServer.use(cors());
      this.httpServer.use(express.json({ limit: "10mb" }));
      this.httpServer.use(
        express.urlencoded({ extended: true, limit: "10mb" })
      );

      // 헬스 체크 엔드포인트
      this.httpServer.get("/health", (req, res) => {
        res.json({
          status: "healthy",
          server: "spam-analyzer-mcp-server",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          capabilities: [
            "email-analysis",
            "network-analysis",
            "data-management",
          ],
          tools: allTools.map((tool) => tool.name),
        });
      });

      // 도구 목록 엔드포인트
      this.httpServer.get("/tools", (req, res) => {
        res.json({
          success: true,
          tools: allTools,
          count: allTools.length,
          categories: {
            email: emailTools.length,
            network: networkTools.length,
            data: dataTools.length,
          },
        });
      });

      // 도구 실행 엔드포인트
      this.httpServer.post("/tools/:toolName", async (req, res) => {
        const { toolName } = req.params;
        const args = req.body;

        console.log(`HTTP 도구 실행 요청: ${toolName}`);

        try {
          if (toolName in allToolHandlers) {
            const handler =
              allToolHandlers[toolName as keyof typeof allToolHandlers];
            const result = await handler(args);

            // MCP 형식의 응답을 HTTP 응답으로 변환
            const responseContent = result.content[0].text;
            const responseData = JSON.parse(responseContent);

            res.json(responseData);
          } else {
            res.status(404).json({
              success: false,
              error: `알 수 없는 도구: ${toolName}`,
              availableTools: Object.keys(allToolHandlers),
            });
          }
        } catch (error) {
          console.error(`HTTP ${toolName} 실행 오류:`, error);
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "알 수 없는 오류",
            tool: toolName,
          });
        }
      });

      // 일괄 도구 실행 엔드포인트
      this.httpServer.post("/tools/batch", async (req, res) => {
        const { requests } = req.body;

        if (!Array.isArray(requests)) {
          return res.status(400).json({
            success: false,
            error: "requests는 배열이어야 합니다",
          });
        }

        console.log(`HTTP 일괄 도구 실행 요청: ${requests.length}개`);

        const results = [];

        for (const request of requests) {
          const { tool, args } = request;

          try {
            if (tool in allToolHandlers) {
              const handler =
                allToolHandlers[tool as keyof typeof allToolHandlers];
              const result = await handler(args);

              const responseContent = result.content[0].text;
              const responseData = JSON.parse(responseContent);

              results.push({
                tool,
                success: true,
                result: responseData,
              });
            } else {
              results.push({
                tool,
                success: false,
                error: `알 수 없는 도구: ${tool}`,
              });
            }
          } catch (error) {
            console.error(`일괄 실행 중 ${tool} 오류:`, error);
            results.push({
              tool,
              success: false,
              error: error instanceof Error ? error.message : "알 수 없는 오류",
            });
          }
        }

        res.json({
          success: true,
          message: "일괄 도구 실행 완료",
          results,
          summary: {
            total: requests.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
          },
        });
      });

      // 루트 엔드포인트 (MCP 서버 정보)
      this.httpServer.get("/", (req, res) => {
        res.json({
          server: "spam-analyzer-mcp-server",
          version: "1.0.0",
          description: "이메일 스팸/피싱 분석을 위한 MCP 서버",
          protocol: "Model Context Protocol",
          endpoints: {
            jsonrpc: "POST /jsonrpc",
            health: "GET /health",
            tools: "GET /tools",
            docs: "GET /docs",
          },
          usage: {
            claude_remote_mcp: "https://darkwinterlab.com/mcp/jsonrpc",
            cursor_remote_mcp: "https://darkwinterlab.com/mcp/jsonrpc",
            chatgpt: "https://darkwinterlab.com/mcp/jsonrpc",
            local_stdio: "로컬 STDIO 모드 사용",
          },
        });
      });

      // API 문서 엔드포인트
      this.httpServer.get("/docs", (req, res) => {
        const documentation = generateAPIDocumentation();
        res.json(documentation);
      });

      // OpenAPI 스키마 엔드포인트 (ChatGPT Actions 연동용)
      this.httpServer.get("/openapi.json", (req, res) => {
        // CORS 헤더 추가
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        const openApiSchema = {
          openapi: "3.0.0",
          info: {
            title: "Email Spam Analyzer",
            description: "이메일 분석 API",
            version: "1.0.0",
          },
          servers: [
            {
              url: "https://darkwinterlab.com/mcp",
            },
          ],
          paths: {
            "/analyze/email": {
              post: {
                summary: "이메일 분석",
                operationId: "analyzeEmail",
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          rawEmailData: {
                            type: "string",
                            description: "이메일 원문",
                          },
                        },
                        required: ["rawEmailData"],
                      },
                    },
                  },
                },
                responses: {
                  "200": {
                    description: "Success",
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: {
                            success: { type: "boolean" },
                            riskScore: { type: "integer" },
                            riskLevel: { type: "string" },
                            analysis: { type: "object" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };
        res.json(openApiSchema);
      });

      // 테스트 엔드포인트 (ChatGPT Actions 연결 테스트용)
      this.httpServer.get("/test", (req, res) => {
        res.json({
          success: true,
          message: "ChatGPT Actions 연결 성공",
          server: "spam-analyzer-mcp-server",
          timestamp: new Date().toISOString(),
        });
      });

      // REST API 엔드포인트들 (ChatGPT Actions용)
      this.httpServer.post("/analyze/email", async (req, res) => {
        try {
          const { rawEmailData } = req.body;

          if (!rawEmailData) {
            return res.status(400).json({
              success: false,
              error: "rawEmailData is required",
            });
          }

          // MCP 도구 호출
          const result = await allToolHandlers[
            "mcp_comprehensive_email_analysis"
          ]({ rawEmailData });

          // 결과를 ChatGPT가 이해하기 쉬운 형태로 변환
          const analysisResult =
            typeof result === "string" ? JSON.parse(result) : result;

          res.json({
            success: true,
            riskScore: analysisResult.riskScore || 0,
            riskLevel: analysisResult.riskLevel || "unknown",
            analysis: analysisResult,
            recommendations: analysisResult.recommendations || [],
          });
        } catch (error) {
          console.error("Email analysis error:", error);
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Analysis failed",
          });
        }
      });

      this.httpServer.post("/analyze/ip", async (req, res) => {
        try {
          const { ipAddress } = req.body;

          if (!ipAddress) {
            return res.status(400).json({
              success: false,
              error: "ipAddress is required",
            });
          }

          // MCP 도구 호출
          const result = await allToolHandlers["mcp_analyze_ip"]({ ipAddress });

          res.json({
            success: true,
            ipInfo: result,
            riskLevel: "unknown", // IP 분석 결과에 따라 동적으로 설정
          });
        } catch (error) {
          console.error("IP analysis error:", error);
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Analysis failed",
          });
        }
      });

      // JSON-RPC 2.0 엔드포인트 (MCP Remote 표준)
      this.httpServer.post("/jsonrpc", async (req, res) => {
        // CORS 헤더 설정
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );

        try {
          const { jsonrpc, method, params, id } = req.body;

          // JSON-RPC 2.0 검증
          if (jsonrpc !== "2.0") {
            return res.status(400).json({
              jsonrpc: "2.0",
              error: { code: -32600, message: "Invalid Request" },
              id: id || null,
            });
          }

          let result;

          switch (method) {
            case "initialize":
              result = {
                protocolVersion: "2024-11-05",
                capabilities: {
                  tools: { listChanged: false },
                  resources: { subscribe: false, listChanged: false },
                  prompts: { listChanged: false },
                  logging: {},
                },
                serverInfo: {
                  name: "spam-analyzer-mcp-server",
                  version: "1.0.0",
                },
              };
              break;

            case "tools/list":
              result = {
                tools: allTools.map((tool) => ({
                  name: tool.name,
                  description: tool.description,
                  inputSchema: tool.inputSchema,
                })),
              };
              break;

            case "tools/call":
              const { name: toolName, arguments: toolArgs } = params;

              if (!allToolHandlers[toolName as keyof typeof allToolHandlers]) {
                return res.json({
                  jsonrpc: "2.0",
                  error: {
                    code: -32602,
                    message: `Unknown tool: ${toolName}`,
                    data: { availableTools: Object.keys(allToolHandlers) },
                  },
                  id: id || null,
                });
              }

              const toolResult = await allToolHandlers[
                toolName as keyof typeof allToolHandlers
              ](toolArgs);

              // MCP 표준 응답 형식으로 변환
              if (
                toolResult &&
                typeof toolResult === "object" &&
                "content" in toolResult
              ) {
                result = toolResult;
              } else {
                result = {
                  content: [
                    {
                      type: "text",
                      text:
                        typeof toolResult === "string"
                          ? toolResult
                          : JSON.stringify(toolResult, null, 2),
                    },
                  ],
                  isError: false,
                };
              }
              break;

            case "ping":
              result = {};
              break;

            default:
              return res.json({
                jsonrpc: "2.0",
                error: {
                  code: -32601,
                  message: `Method not found: ${method}`,
                  data: {
                    supportedMethods: [
                      "initialize",
                      "tools/list",
                      "tools/call",
                      "ping",
                    ],
                  },
                },
                id: id || null,
              });
          }

          res.json({
            jsonrpc: "2.0",
            result,
            id: id || null,
          });
        } catch (error) {
          console.error("JSON-RPC Error:", error);
          res.json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal error",
              data: error instanceof Error ? error.message : String(error),
            },
            id: req.body?.id || null,
          });
        }
      });

      // CORS preflight 지원
      this.httpServer.options("/jsonrpc", (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        res.sendStatus(200);
      });

      // 404 핸들러
      this.httpServer.use("*", (req, res) => {
        res.status(404).json({
          success: false,
          error: "엔드포인트를 찾을 수 없습니다",
          availableEndpoints: [
            "GET /health",
            "GET /tools",
            "POST /tools/:toolName",
            "POST /tools/batch",
            "GET /docs",
            "GET /openapi.json",
            "POST /analyze/email",
            "POST /analyze/ip",
            "POST /jsonrpc",
          ],
        });
      });

      // 에러 핸들러
      this.httpServer.use((error: any, req: any, res: any, next: any) => {
        console.error("HTTP 서버 오류:", error);
        res.status(500).json({
          success: false,
          error: "서버 내부 오류가 발생했습니다",
        });
      });
    }
  }

  async start() {
    const mode = process.env.HTTP_MODE === "true" ? "HTTP" : "STDIO";

    console.log(`Spam Analyzer MCP Server 시작 중... (모드: ${mode})`);
    console.log(`사용 가능한 도구: ${allTools.length}개`);
    console.log("도구 목록:");
    allTools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    if (mode === "HTTP" && this.httpServer) {
      const port = parseInt(process.env.MCP_SERVER_PORT || "3001");
      const host = process.env.MCP_SERVER_HOST || "0.0.0.0"; // 외부 접근 허용

      this.httpServer.listen(port, host, () => {
        console.log(
          `\n🚀 HTTP MCP 서버가 http://${host}:${port}에서 실행 중입니다`
        );
        console.log(`📊 헬스 체크: http://${host}:${port}/health`);
        console.log(`🔧 도구 목록: http://${host}:${port}/tools`);
        console.log(`📖 API 문서: http://${host}:${port}/docs`);
        console.log("\n사용 예시:");
        console.log(
          `curl -X POST http://${host}:${port}/tools/mcp_email_analyze_headers \\`
        );
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"rawEmailData": "your-email-data"}'`);
      });
    } else {
      // STDIO 모드
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log("\n📡 STDIO MCP 서버가 실행 중입니다");
      console.log("MCP 클라이언트에서 연결을 기다리고 있습니다...");
    }
  }
}

// API 문서 생성
function generateAPIDocumentation() {
  return {
    title: "Spam Analyzer MCP Server API",
    version: "1.0.0",
    description: "이메일 보안 분석을 위한 MCP 서버 API 문서",
    baseUrl:
      process.env.HTTP_MODE === "true"
        ? `http://${process.env.MCP_SERVER_HOST || "localhost"}:${
            process.env.MCP_SERVER_PORT || "3001"
          }`
        : "N/A (STDIO 모드)",
    endpoints: {
      health: {
        method: "GET",
        path: "/health",
        description: "서버 상태 확인",
        response: "서버 상태 정보",
      },
      tools: {
        method: "GET",
        path: "/tools",
        description: "사용 가능한 도구 목록 조회",
        response: "도구 목록 및 설명",
      },
      executeTool: {
        method: "POST",
        path: "/tools/:toolName",
        description: "개별 도구 실행",
        parameters: "도구별 매개변수",
        response: "도구 실행 결과",
      },
      batchExecute: {
        method: "POST",
        path: "/tools/batch",
        description: "여러 도구 일괄 실행",
        parameters: { requests: "Array<{tool: string, args: object}>" },
        response: "일괄 실행 결과",
      },
    },
    tools: allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
      category: getToolCategory(tool.name),
    })),
    examples: {
      emailAnalysis: {
        endpoint: "/tools/mcp_comprehensive_email_analysis",
        method: "POST",
        body: {
          rawEmailData: "Received: from example.com...",
        },
      },
      ipAnalysis: {
        endpoint: "/tools/mcp_analyze_ip",
        method: "POST",
        body: {
          ipAddress: "8.8.8.8",
        },
      },
      batchAnalysis: {
        endpoint: "/tools/batch",
        method: "POST",
        body: {
          requests: [
            {
              tool: "mcp_analyze_ip",
              args: { ipAddress: "8.8.8.8" },
            },
            {
              tool: "mcp_virustotal_check",
              args: { target: "example.com", type: "domain" },
            },
          ],
        },
      },
    },
  };
}

function getToolCategory(toolName: string): string {
  if (toolName.includes("email")) return "email";
  if (
    toolName.includes("network") ||
    toolName.includes("ip") ||
    toolName.includes("domain") ||
    toolName.includes("virustotal") ||
    toolName.includes("port")
  )
    return "network";
  if (
    toolName.includes("save") ||
    toolName.includes("get") ||
    toolName.includes("export") ||
    toolName.includes("statistics")
  )
    return "data";
  return "other";
}

// 서버 시작
async function main() {
  try {
    const server = new SpamAnalyzerMCPServer();
    await server.start();
  } catch (error) {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 서버 시작
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("치명적 오류:", error);
    process.exit(1);
  });
}
