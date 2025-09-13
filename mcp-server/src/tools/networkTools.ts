/**
 * 네트워크 분석 관련 MCP 도구들
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import {
  IPAnalysisParams,
  DomainAnalysisParams,
  VirusTotalCheckParams,
  PortScanParams,
  NetworkThreatAnalysisParams,
  IPAnalysisParamsSchema,
  DomainAnalysisParamsSchema,
  VirusTotalCheckParamsSchema,
  PortScanParamsSchema,
  NetworkThreatAnalysisParamsSchema,
} from "../types.js";

// IP 분석 도구
export const analyzeIpTool: Tool = {
  name: "mcp_analyze_ip",
  description: "IP 주소의 지리적 위치, 포트 스캔, 위험도를 분석합니다.",
  inputSchema: {
    type: "object",
    properties: {
      ipAddress: {
        type: "string",
        description: "분석할 IP 주소",
        pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$",
      },
    },
    required: ["ipAddress"],
  },
};

export async function handleAnalyzeIp(args: any) {
  try {
    const params = IPAnalysisParamsSchema.parse(args);
    const { ipAddress } = params;

    console.log(`IP 분석 시작: ${ipAddress}`);

    // GeoIP 정보 가져오기
    let geoipData: any;
    try {
      const geoipResponse = await axios.get(`https://ipwho.is/${ipAddress}`);
      geoipData = geoipResponse.data;
    } catch (error) {
      console.error("GeoIP 조회 오류:", error);
      throw new Error("IP 주소 정보를 가져올 수 없습니다");
    }

    // 로컬 IP 처리
    if (geoipData.success === false) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "IP 분석 완료 (로컬 네트워크)",
                analysis: {
                  ip: ipAddress,
                  country: "로컬 네트워크",
                  countryCode: "LO",
                  flag: "🏠",
                  region: "내부망",
                  city: "로컬",
                  latitude: 0,
                  longitude: 0,
                  isp: "로컬 네트워크",
                  isPrivate: true,
                  threatLevel: "낮음",
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const flagEmoji =
      geoipData.flag && geoipData.flag.emoji ? geoipData.flag.emoji : "🏳️";

    // Flask 서버에서 포트 스캔 정보 요청
    let portScanInfo = null;
    const flaskBaseUrl =
      process.env.FLASK_SERVER_URL || "http://localhost:5001";

    try {
      console.log(`포트 스캔 시작: ${ipAddress}`);
      const portScanResponse = await axios.post(
        `${flaskBaseUrl}/scan`,
        { ip: ipAddress, port_range: "21-25,80,443,8080-8090", timeout: 10 },
        { timeout: 150000 }
      );

      if (portScanResponse.data && portScanResponse.data.success) {
        console.log(
          `포트 스캔 성공: ${ipAddress}, 소요시간: ${portScanResponse.data.scan_time}`
        );
        portScanInfo = portScanResponse.data;
      }
    } catch (scanError) {
      console.error("포트 스캔 요청 중 오류 발생:", scanError);
    }

    // 위험도 평가
    const threatLevel = assessIpThreatLevel(geoipData, portScanInfo);

    const result = {
      ip: ipAddress,
      country: geoipData.country || "알 수 없음",
      countryCode: geoipData.country_code || "XX",
      flag: flagEmoji,
      region: geoipData.region || "알 수 없음",
      city: geoipData.city || "알 수 없음",
      latitude: geoipData.latitude || 0,
      longitude: geoipData.longitude || 0,
      isp: geoipData.connection?.isp || "알 수 없음",
      virusTotalUrl: `https://www.virustotal.com/gui/ip-address/${ipAddress}/detection`,
      portScanInfo: portScanInfo,
      isPrivate: false,
      threatLevel,
      analysisTime: new Date().toISOString(),
    };

    console.log(`IP 분석 완료: ${ipAddress}`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: "IP 분석 완료",
              analysis: result,
              summary: {
                location: `${result.city}, ${result.region}, ${result.country}`,
                coordinates: `${result.latitude}, ${result.longitude}`,
                openPorts: portScanInfo?.scan_result?.open_ports?.length || 0,
                threatLevel: threatLevel,
                recommendation: getThreatRecommendation(threatLevel),
              },
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    console.error("IP 분석 오류:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다",
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

// 도메인 분석 도구
export const analyzeDomainTool: Tool = {
  name: "mcp_analyze_domain",
  description: "도메인의 DNS 조회를 수행하고 해당 IP 주소 분석과 연계합니다.",
  inputSchema: {
    type: "object",
    properties: {
      domain: {
        type: "string",
        description: "분석할 도메인명",
      },
    },
    required: ["domain"],
  },
};

export async function handleAnalyzeDomain(args: any) {
  try {
    const params = DomainAnalysisParamsSchema.parse(args);
    const { domain } = params;

    console.log(`도메인 분석 시작: ${domain}`);

    // Google DNS API를 이용해 A 레코드 조회
    let ip = null;
    try {
      const dnsResponse = await axios.get(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`
      );

      if (dnsResponse.data.Answer && dnsResponse.data.Answer.length > 0) {
        for (const record of dnsResponse.data.Answer) {
          if (record.type === 1) {
            // A 레코드
            ip = record.data;
            break;
          }
        }
      }
    } catch (error) {
      console.error("DNS 조회 오류:", error);
      throw new Error("도메인 DNS 조회에 실패했습니다");
    }

    if (!ip) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: "도메인에 대한 IP 주소를 찾을 수 없습니다",
                domain,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    console.log(`도메인 ${domain}의 IP 주소: ${ip}`);

    // IP 분석 수행
    const ipAnalysisResult = await handleAnalyzeIp({ ipAddress: ip });
    const ipAnalysis = JSON.parse(ipAnalysisResult.content[0].text);

    console.log(`도메인 분석 완료: ${domain}`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: "도메인 분석 완료",
              domain,
              resolvedIp: ip,
              ipAnalysis: ipAnalysis.analysis,
              summary: {
                domain,
                ip,
                location: ipAnalysis.summary?.location || "알 수 없음",
                threatLevel: ipAnalysis.analysis?.threatLevel || "알 수 없음",
                recommendation:
                  ipAnalysis.summary?.recommendation || "추가 조사 필요",
              },
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    console.error("도메인 분석 오류:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다",
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

// VirusTotal 검사 도구
export const virusTotalCheckTool: Tool = {
  name: "mcp_virustotal_check",
  description: "VirusTotal API를 통해 IP, 도메인, URL의 위험도를 검사합니다.",
  inputSchema: {
    type: "object",
    properties: {
      target: {
        type: "string",
        description: "검사할 대상 (IP, 도메인, 또는 URL)",
      },
      type: {
        type: "string",
        enum: ["ip", "domain", "url"],
        description: "검사 대상의 타입",
      },
    },
    required: ["target", "type"],
  },
};

export async function handleVirusTotalCheck(args: any) {
  try {
    const params = VirusTotalCheckParamsSchema.parse(args);
    const { target, type } = params;

    console.log(`VirusTotal 검사 시작: ${target} (${type})`);

    const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

    if (!VIRUSTOTAL_API_KEY) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error:
                  "VirusTotal API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.",
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    let response: any;

    if (type === "ip") {
      response = await axios.get(
        `https://www.virustotal.com/api/v3/ip_addresses/${target}`,
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;
      const lastAnalysisResults = attributes.last_analysis_results;

      const maliciousResults = Object.entries(lastAnalysisResults)
        .filter(
          ([_, result]: [string, any]) =>
            result.category === "malicious" || result.category === "suspicious"
        )
        .map(([engine, result]: [string, any]) => ({
          engine,
          result: result.result,
          category: result.category,
        }));

      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      const vtResult = {
        target,
        type,
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? `악성으로 판단됨 (${stats.malicious}개의 엔진에서 탐지)`
          : "안전한 것으로 판단됨",
        analysis_stats: stats,
        detection_ratio: `${stats.malicious}/${Object.values(stats).reduce(
          (sum: number, val: any) => sum + val,
          0
        )}`,
        malicious_results: maliciousResults,
        analysis_results: lastAnalysisResults,
        virustotal_url: `https://www.virustotal.com/gui/ip-address/${target}`,
      };

      console.log(`VirusTotal 검사 완료: ${target} - ${vtResult.threat}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "VirusTotal 검사 완료",
                analysis: vtResult,
                summary: {
                  threat: vtResult.threat,
                  detectionRatio: vtResult.detection_ratio,
                  threatDescription: getThreatDescription(vtResult.threat),
                  recommendation: getVirusTotalRecommendation(vtResult.threat),
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    } else if (type === "domain") {
      response = await axios.get(
        `https://www.virustotal.com/api/v3/domains/${target}`,
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;
      const lastAnalysisResults = attributes.last_analysis_results;

      const maliciousResults = Object.entries(lastAnalysisResults)
        .filter(
          ([_, result]: [string, any]) =>
            result.category === "malicious" || result.category === "suspicious"
        )
        .map(([engine, result]: [string, any]) => ({
          engine,
          result: result.result,
          category: result.category,
        }));

      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      const vtResult = {
        target,
        type,
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? `악성으로 판단됨 (${stats.malicious}개의 엔진에서 탐지)`
          : "안전한 것으로 판단됨",
        analysis_stats: stats,
        detection_ratio: `${stats.malicious}/${Object.values(stats).reduce(
          (sum: number, val: any) => sum + val,
          0
        )}`,
        malicious_results: maliciousResults,
        analysis_results: lastAnalysisResults,
        virustotal_url: `https://www.virustotal.com/gui/domain/${target}`,
      };

      console.log(`VirusTotal 검사 완료: ${target} - ${vtResult.threat}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "VirusTotal 검사 완료",
                analysis: vtResult,
                summary: {
                  threat: vtResult.threat,
                  detectionRatio: vtResult.detection_ratio,
                  threatDescription: getThreatDescription(vtResult.threat),
                  recommendation: getVirusTotalRecommendation(vtResult.threat),
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    } else if (type === "url") {
      // URL 제출 및 분석
      const submitResponse = await axios.post(
        "https://www.virustotal.com/api/v3/urls",
        new URLSearchParams({ url: target }).toString(),
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const analysisId = submitResponse.data.data.id;

      // 분석 결과 가져오기
      response = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      const attributes = response.data.data.attributes;
      const stats = attributes.stats;
      const results = attributes.results;

      const maliciousResults = Object.entries(results)
        .filter(
          ([_, result]: [string, any]) =>
            result.category === "malicious" || result.category === "suspicious"
        )
        .map(([engine, result]: [string, any]) => ({
          engine,
          result: result.result,
          category: result.category,
        }));

      const isMalicious = stats.malicious > 0 || stats.suspicious > 0;

      const vtResult = {
        target,
        type,
        threat: isMalicious ? "malicious" : "none",
        message: isMalicious
          ? `악성으로 판단됨 (${stats.malicious}개의 엔진에서 탐지)`
          : "안전한 것으로 판단됨",
        analysis_stats: stats,
        detection_ratio: `${stats.malicious}/${Object.values(stats).reduce(
          (sum: number, val: any) => sum + val,
          0
        )}`,
        malicious_results: maliciousResults,
        analysis_results: results,
        virustotal_url: `https://www.virustotal.com/gui/url/${encodeURIComponent(
          target
        )}`,
      };

      console.log(`VirusTotal 검사 완료: ${target} - ${vtResult.threat}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "VirusTotal 검사 완료",
                analysis: vtResult,
                summary: {
                  threat: vtResult.threat,
                  detectionRatio: vtResult.detection_ratio,
                  threatDescription: getThreatDescription(vtResult.threat),
                  recommendation: getVirusTotalRecommendation(vtResult.threat),
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error("지원하지 않는 검사 타입입니다");
  } catch (error) {
    console.error("VirusTotal 검사 오류:", error);

    // 404 오류 처리
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "VirusTotal 검사 완료",
                analysis: {
                  target: args.target,
                  type: args.type,
                  threat: "unknown",
                  message: "해당 대상에 대한 정보가 없습니다.",
                  analysis_stats: {
                    malicious: 0,
                    suspicious: 0,
                    harmless: 0,
                    undetected: 0,
                  },
                  detection_ratio: "0/0",
                  virustotal_url: `https://www.virustotal.com/gui/search/${encodeURIComponent(
                    args.target
                  )}`,
                },
                summary: {
                  threat: "unknown",
                  detectionRatio: "0/0",
                  threatDescription: "정보 없음",
                  recommendation: "다른 보안 도구로 추가 검사를 권장합니다",
                },
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다",
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

// 포트 스캔 도구
export const portScanTool: Tool = {
  name: "mcp_port_scan",
  description:
    "nmap을 이용해 지정된 IP 주소의 포트 스캔 및 배너 그래빙을 수행합니다.",
  inputSchema: {
    type: "object",
    properties: {
      ipAddress: {
        type: "string",
        description: "스캔할 IP 주소",
        pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$",
      },
      portRange: {
        type: "string",
        description: "스캔할 포트 범위 (예: 21-25,80,443,8080-8090)",
      },
    },
    required: ["ipAddress"],
  },
};

export async function handlePortScan(args: any) {
  try {
    const params = PortScanParamsSchema.parse(args);
    const { ipAddress, portRange = "21-25,80,443,8080-8090" } = params;

    console.log(`포트 스캔 시작: ${ipAddress}, 포트 범위: ${portRange}`);

    const flaskBaseUrl =
      process.env.FLASK_SERVER_URL || "http://localhost:5001";

    try {
      const startTime = Date.now();
      const portScanResponse = await axios.post(
        `${flaskBaseUrl}/scan`,
        { ip: ipAddress, port_range: portRange, timeout: 10 },
        { timeout: 180000 } // 3분 타임아웃
      );

      const scanDuration = Date.now() - startTime;

      if (portScanResponse.data && portScanResponse.data.success) {
        console.log(
          `포트 스캔 성공: ${ipAddress}, 소요시간: ${scanDuration}ms`
        );

        const scanResult = portScanResponse.data.scan_result;
        const analysis = analyzeScanResults(scanResult);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "포트 스캔 완료",
                  target: ipAddress,
                  portRange,
                  scanResult: portScanResponse.data,
                  analysis,
                  performance: {
                    scanDuration: `${scanDuration}ms`,
                    portsScanned: calculatePortsScanned(portRange),
                  },
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };
      } else {
        throw new Error("포트 스캔이 실패했습니다");
      }
    } catch (scanError) {
      console.error("포트 스캔 오류:", scanError);
      throw new Error("Flask 서버와의 통신에 실패했습니다");
    }
  } catch (error) {
    console.error("포트 스캔 처리 오류:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다",
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

// 네트워크 위협 분석 도구
export const networkThreatAnalysisTool: Tool = {
  name: "mcp_network_threat_analysis",
  description:
    "여러 IP/도메인에 대한 일괄 위험도 분석과 상호 연관성 분석을 수행합니다.",
  inputSchema: {
    type: "object",
    properties: {
      targets: {
        type: "array",
        items: {
          type: "string",
        },
        description: "분석할 IP 주소나 도메인 목록",
        minItems: 1,
      },
    },
    required: ["targets"],
  },
};

export async function handleNetworkThreatAnalysis(args: any) {
  try {
    const params = NetworkThreatAnalysisParamsSchema.parse(args);
    const { targets } = params;

    console.log(`네트워크 위협 분석 시작: ${targets.length}개 대상`);

    const results: any[] = [];
    const summary = {
      total_targets: targets.length,
      malicious_count: 0,
      suspicious_count: 0,
      safe_count: 0,
      error_count: 0,
      high_risk_targets: [] as string[],
      recommendations: [] as string[],
    };

    // 각 대상에 대해 분석 수행
    for (const target of targets) {
      try {
        console.log(`분석 중: ${target}`);

        // IP인지 도메인인지 판단
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(target);

        let analysisResult: any;

        if (isIP) {
          // IP 분석
          const ipResult = await handleAnalyzeIp({ ipAddress: target });
          analysisResult = JSON.parse(ipResult.content[0].text);
        } else {
          // 도메인 분석
          const domainResult = await handleAnalyzeDomain({ domain: target });
          analysisResult = JSON.parse(domainResult.content[0].text);
        }

        if (analysisResult.success) {
          results.push({
            target,
            type: isIP ? "ip" : "domain",
            analysis: analysisResult.analysis || analysisResult.ipAnalysis,
            status: "completed",
          });

          // 위협 레벨에 따른 통계 업데이트
          const threatLevel =
            analysisResult.analysis?.threatLevel ||
            analysisResult.ipAnalysis?.threatLevel;

          if (threatLevel === "높음" || threatLevel === "매우 높음") {
            summary.malicious_count++;
            summary.high_risk_targets.push(target);
          } else if (threatLevel === "중간") {
            summary.suspicious_count++;
          } else {
            summary.safe_count++;
          }
        } else {
          results.push({
            target,
            type: isIP ? "ip" : "domain",
            error: analysisResult.error,
            status: "failed",
          });
          summary.error_count++;
        }

        // API 호출 제한을 위한 짧은 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`${target} 분석 오류:`, error);
        results.push({
          target,
          type: "unknown",
          error: error instanceof Error ? error.message : "분석 실패",
          status: "failed",
        });
        summary.error_count++;
      }
    }

    // 권장사항 생성
    summary.recommendations = generateNetworkThreatRecommendations(
      summary,
      results
    );

    console.log(`네트워크 위협 분석 완료: ${targets.length}개 대상 처리됨`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: "네트워크 위협 분석 완료",
              targets,
              results,
              summary,
              analysis_timestamp: new Date().toISOString(),
              performance: {
                totalTargets: targets.length,
                successfulAnalyses: results.filter(
                  (r) => r.status === "completed"
                ).length,
                failedAnalyses: summary.error_count,
                highRiskFound: summary.high_risk_targets.length,
              },
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    console.error("네트워크 위협 분석 오류:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "알 수 없는 오류가 발생했습니다",
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

// 헬퍼 함수들
function assessIpThreatLevel(geoipData: any, portScanInfo: any): string {
  let threatScore = 0;

  // 지리적 위치 기반 위험도
  const highRiskCountries = ["CN", "RU", "KP", "IR"];
  if (highRiskCountries.includes(geoipData.country_code)) {
    threatScore += 2;
  }

  // 열린 포트 수 기반 위험도
  if (portScanInfo?.scan_result?.open_ports) {
    const openPortsCount = portScanInfo.scan_result.open_ports.length;
    if (openPortsCount > 5) {
      threatScore += 3;
    } else if (openPortsCount > 2) {
      threatScore += 1;
    }
  }

  // ISP 정보 기반 위험도
  if (geoipData.connection?.isp) {
    const isp = geoipData.connection.isp.toLowerCase();
    if (
      isp.includes("hosting") ||
      isp.includes("cloud") ||
      isp.includes("vps")
    ) {
      threatScore += 1;
    }
  }

  if (threatScore >= 4) return "매우 높음";
  if (threatScore >= 2) return "높음";
  if (threatScore >= 1) return "중간";
  return "낮음";
}

function getThreatRecommendation(threatLevel: string): string {
  switch (threatLevel) {
    case "매우 높음":
      return "즉시 차단하고 보안팀에 신고하세요";
    case "높음":
      return "주의깊게 모니터링하고 추가 조사를 권장합니다";
    case "중간":
      return "정기적인 모니터링을 권장합니다";
    default:
      return "현재 위험도가 낮지만 지속적인 관찰이 필요합니다";
  }
}

function getThreatDescription(threat: string): string {
  switch (threat) {
    case "malicious":
      return "악성으로 확인됨";
    case "suspicious":
      return "의심스러운 활동 감지";
    case "none":
      return "안전한 것으로 확인됨";
    case "unknown":
      return "정보 부족으로 판단 불가";
    default:
      return "알 수 없는 상태";
  }
}

function getVirusTotalRecommendation(threat: string): string {
  switch (threat) {
    case "malicious":
      return "즉시 차단하고 연결을 피하세요";
    case "suspicious":
      return "주의하여 접근하고 추가 확인이 필요합니다";
    case "none":
      return "안전하지만 지속적인 모니터링을 권장합니다";
    default:
      return "다른 보안 도구로 추가 검사를 권장합니다";
  }
}

function analyzeScanResults(scanResult: any): any {
  const analysis = {
    riskLevel: "낮음",
    findings: [] as string[],
    recommendations: [] as string[],
    portSummary: {
      total: 0,
      open: 0,
      filtered: 0,
      closed: 0,
    },
  };

  if (scanResult.open_ports) {
    analysis.portSummary.open = scanResult.open_ports.length;
    analysis.portSummary.total += scanResult.open_ports.length;

    // 위험한 포트 체크
    const dangerousPorts = [21, 23, 135, 139, 445, 1433, 3389];
    const foundDangerousPorts = scanResult.open_ports.filter((port: any) =>
      dangerousPorts.includes(port.port)
    );

    if (foundDangerousPorts.length > 0) {
      analysis.riskLevel = "높음";
      analysis.findings.push(
        `위험한 포트가 열려있음: ${foundDangerousPorts
          .map((p: any) => p.port)
          .join(", ")}`
      );
      analysis.recommendations.push("위험한 포트들을 즉시 차단하세요");
    }

    if (scanResult.open_ports.length > 10) {
      analysis.riskLevel = "중간";
      analysis.findings.push("다수의 포트가 열려있음");
      analysis.recommendations.push("불필요한 서비스를 종료하세요");
    }
  }

  if (scanResult.filtered_ports) {
    analysis.portSummary.filtered = scanResult.filtered_ports.length;
    analysis.portSummary.total += scanResult.filtered_ports.length;
  }

  if (scanResult.closed_ports) {
    analysis.portSummary.closed = scanResult.closed_ports.length;
    analysis.portSummary.total += scanResult.closed_ports.length;
  }

  return analysis;
}

function calculatePortsScanned(portRange: string): number {
  const ranges = portRange.split(",");
  let totalPorts = 0;

  ranges.forEach((range) => {
    if (range.includes("-")) {
      const [start, end] = range.split("-").map(Number);
      totalPorts += end - start + 1;
    } else {
      totalPorts += 1;
    }
  });

  return totalPorts;
}

function generateNetworkThreatRecommendations(
  summary: any,
  results: any[]
): string[] {
  const recommendations: string[] = [];

  if (summary.malicious_count > 0) {
    recommendations.push(
      `${summary.malicious_count}개의 고위험 대상이 발견되었습니다. 즉시 차단 조치를 취하세요.`
    );
  }

  if (summary.suspicious_count > 0) {
    recommendations.push(
      `${summary.suspicious_count}개의 의심스러운 대상이 있습니다. 지속적인 모니터링이 필요합니다.`
    );
  }

  if (summary.error_count > 0) {
    recommendations.push(
      `${summary.error_count}개 대상의 분석이 실패했습니다. 다른 도구로 재분석하세요.`
    );
  }

  if (summary.high_risk_targets.length > 0) {
    recommendations.push("방화벽에서 고위험 IP들을 차단하세요.");
    recommendations.push("보안팀에 위협 인텔리전스를 공유하세요.");
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "현재 발견된 위협은 없지만 정기적인 모니터링을 계속하세요."
    );
  }

  return recommendations;
}

// 모든 네트워크 도구들을 내보내기
export const networkTools = [
  analyzeIpTool,
  analyzeDomainTool,
  virusTotalCheckTool,
  portScanTool,
  networkThreatAnalysisTool,
];

export const networkToolHandlers = {
  mcp_analyze_ip: handleAnalyzeIp,
  mcp_analyze_domain: handleAnalyzeDomain,
  mcp_virustotal_check: handleVirusTotalCheck,
  mcp_port_scan: handlePortScan,
  mcp_network_threat_analysis: handleNetworkThreatAnalysis,
};
