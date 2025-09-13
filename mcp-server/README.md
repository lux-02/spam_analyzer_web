# Spam Analyzer MCP Server

이메일 보안 분석을 위한 MCP (Model Context Protocol) 서버입니다.

## 기능

### 이메일 분석 도구

- **mcp_email_analyze_headers**: 이메일 헤더 분석 (SPF, DKIM, DMARC 검증)
- **mcp_email_analyze_content**: 이메일 본문, 링크, 첨부파일 분석
- **mcp_email_calculate_risk**: 위험도 점수 계산 (0-100)
- **mcp_email_analyze_intent**: AI 기반 이메일 의도 분석
- **mcp_comprehensive_email_analysis**: 종합 이메일 분석

### 네트워크 분석 도구

- **mcp_analyze_ip**: IP 주소 지리적 위치 및 포트 스캔
- **mcp_analyze_domain**: 도메인 DNS 조회 및 IP 분석
- **mcp_virustotal_check**: VirusTotal API 위험도 검사
- **mcp_port_scan**: nmap 포트 스캔 및 배너 그래빙
- **mcp_network_threat_analysis**: 다중 대상 위협 분석

### 데이터 관리 도구

- **mcp_save_analysis_result**: 분석 결과 MongoDB 저장
- **mcp_get_analysis_result**: 저장된 분석 결과 조회
- **mcp_get_recent_analyses**: 최근 분석 결과 목록
- **mcp_export_analysis_report**: 보고서 내보내기 (JSON/Markdown)
- **mcp_get_analysis_statistics**: 분석 통계 조회

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp env.example .env
# .env 파일을 편집하여 필요한 API 키와 설정을 입력하세요
```

필수 환경 변수:

- `MONGODB_URI`: MongoDB 연결 문자열
- `VIRUSTOTAL_API_KEY`: VirusTotal API 키
- `GEMINI_API_KEY`: Google Gemini API 키
- `FLASK_SERVER_URL`: Flask 서버 URL (포트 스캔용)

### 3. 빌드

```bash
npm run build
```

### 4. 실행

#### STDIO 모드 (MCP 클라이언트용)

```bash
npm start
```

#### HTTP 서버 모드

```bash
HTTP_MODE=true npm start
```

또는

```bash
npm run dev  # 개발 모드
```

## HTTP API 사용법

HTTP 모드에서 실행할 때 다음 엔드포인트들을 사용할 수 있습니다:

### 서버 상태 확인

```bash
curl http://localhost:3001/health
```

### 도구 목록 조회

```bash
curl http://localhost:3001/tools
```

### 개별 도구 실행

```bash
curl -X POST http://localhost:3001/tools/mcp_email_analyze_headers \
  -H "Content-Type: application/json" \
  -d '{
    "rawEmailData": "Received: from example.com..."
  }'
```

### 종합 이메일 분석

```bash
curl -X POST http://localhost:3001/tools/mcp_comprehensive_email_analysis \
  -H "Content-Type: application/json" \
  -d '{
    "rawEmailData": "전체 이메일 원문 데이터..."
  }'
```

### IP 주소 분석

```bash
curl -X POST http://localhost:3001/tools/mcp_analyze_ip \
  -H "Content-Type: application/json" \
  -d '{
    "ipAddress": "8.8.8.8"
  }'
```

### VirusTotal 검사

```bash
curl -X POST http://localhost:3001/tools/mcp_virustotal_check \
  -H "Content-Type: application/json" \
  -d '{
    "target": "example.com",
    "type": "domain"
  }'
```

### 일괄 도구 실행

```bash
curl -X POST http://localhost:3001/tools/batch \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "tool": "mcp_analyze_ip",
        "args": {"ipAddress": "8.8.8.8"}
      },
      {
        "tool": "mcp_virustotal_check",
        "args": {"target": "example.com", "type": "domain"}
      }
    ]
  }'
```

### API 문서 조회

```bash
curl http://localhost:3001/docs
```

## MCP 클라이언트 설정

### Claude Desktop 설정

Claude Desktop에서 사용하려면 `claude_desktop_config.json`에 다음을 추가하세요:

```json
{
  "mcpServers": {
    "spam-analyzer": {
      "command": "node",
      "args": ["/path/to/spam_analyzer_web/mcp-server/dist/index.js"],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017/spam_analyzer",
        "VIRUSTOTAL_API_KEY": "your_api_key",
        "GEMINI_API_KEY": "your_api_key",
        "FLASK_SERVER_URL": "http://localhost:5001"
      }
    }
  }
}
```

### 기타 MCP 클라이언트

다른 MCP 클라이언트에서는 STDIO 모드로 서버를 실행하고 프로세스와 통신하세요.

## 개발

### 개발 모드 실행

```bash
npm run dev
```

### 감시 모드 실행

```bash
npm run watch
```

### TypeScript 컴파일

```bash
npm run build
```

## 사용 예시

### 1. 피싱 이메일 종합 분석

```javascript
const response = await fetch(
  "http://localhost:3001/tools/mcp_comprehensive_email_analysis",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawEmailData: `Received: from suspicious-sender.com (1.2.3.4)
From: security@bank.com
To: user@example.com
Subject: Urgent: Verify Your Account
...`,
    }),
  }
);

const result = await response.json();
console.log("위험도 점수:", result.result.risk.score);
console.log("AI 분석:", result.result.llmAnalysis.category);
```

### 2. 네트워크 위협 분석

```javascript
const response = await fetch(
  "http://localhost:3001/tools/mcp_network_threat_analysis",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targets: ["192.168.1.1", "suspicious-domain.com", "8.8.8.8"],
    }),
  }
);

const result = await response.json();
console.log("고위험 대상:", result.summary.high_risk_targets);
```

### 3. 분석 결과 저장 및 조회

```javascript
// 분석 결과 저장
await fetch("http://localhost:3001/tools/mcp_save_analysis_result", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    analysisData: analysisResult,
  }),
});

// 저장된 결과 조회
const savedResult = await fetch(
  "http://localhost:3001/tools/mcp_get_analysis_result",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysisId: "analysis-id-here",
    }),
  }
);
```

## 문제 해결

### 포트 스캔이 작동하지 않는 경우

1. Flask 서버가 실행 중인지 확인하세요
2. `FLASK_SERVER_URL` 환경 변수가 올바른지 확인하세요
3. nmap이 시스템에 설치되어 있는지 확인하세요

### VirusTotal 검사가 실패하는 경우

1. `VIRUSTOTAL_API_KEY`가 올바른지 확인하세요
2. API 호출 한도를 초과하지 않았는지 확인하세요

### AI 분석이 작동하지 않는 경우

1. `GEMINI_API_KEY`가 설정되어 있는지 확인하세요
2. 네트워크 연결이 정상인지 확인하세요
3. API 키에 Gemini 2.0 Flash 모델 액세스 권한이 있는지 확인하세요

### MongoDB 연결 오류

1. MongoDB 서버가 실행 중인지 확인하세요
2. `MONGODB_URI`가 올바른지 확인하세요
3. 네트워크 접근 권한이 있는지 확인하세요

## 라이선스

MIT License
