# GCP에서 MCP 서버 배포 및 실행 가이드

## 1. GCP Cloud Shell 또는 SSH 접속

### Cloud Shell 사용:

```bash
# GCP Console에서 Cloud Shell 활성화
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### SSH로 인스턴스 접속:

```bash
gcloud compute ssh YOUR_INSTANCE_NAME --zone=YOUR_ZONE
```

## 2. 프로젝트 코드 업데이트 (필요시)

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/spam_analyzer_web/mcp-server

# Git에서 최신 코드 풀 (필요시)
git pull origin main

# 또는 코드를 직접 업로드했다면 생략
```

## 3. 의존성 설치 및 빌드

```bash
# Node.js 패키지 설치
npm install

# TypeScript 빌드
npm run build

# 환경 변수 설정 (필요시)
export MONGODB_URI="mongodb://localhost:27017/spam_analyzer"
export VIRUSTOTAL_API_KEY="your_virustotal_api_key"
export GEMINI_API_KEY="your_gemini_api_key"
export FLASK_SERVER_URL="http://localhost:5001"
export MCP_SERVER_PORT="3001"
export MCP_SERVER_HOST="0.0.0.0"
```

## 4. 방화벽 규칙 설정

```bash
# MCP 서버 포트(3001) 개방
gcloud compute firewall-rules create allow-mcp-server \
    --allow tcp:3001 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow MCP Server on port 3001"

# 기존 방화벽 규칙 확인
gcloud compute firewall-rules list | grep mcp
```

## 5. HTTP 모드로 MCP 서버 실행

### 방법 1: 직접 실행

```bash
# HTTP 모드로 서버 시작
HTTP_MODE=true npm start

# 또는 개발 모드로 실행
HTTP_MODE=true npm run dev
```

### 방법 2: 스크립트 사용

```bash
# HTTP 서버 시작 스크립트 실행
npm run start:http

# 또는 Node.js로 직접 실행
node start-http-server.js
```

### 방법 3: PM2로 데몬 실행 (추천)

```bash
# PM2 설치 (global)
npm install -g pm2

# PM2로 서버 시작
pm2 start start-http-server.js --name "mcp-server"

# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs mcp-server

# 서버 재시작
pm2 restart mcp-server

# 서버 중지
pm2 stop mcp-server
```

## 6. 서버 상태 확인

```bash
# 로컬에서 헬스 체크
curl http://localhost:3001/health

# 외부에서 헬스 체크 (EXTERNAL_IP는 실제 GCP 인스턴스 IP)
curl http://EXTERNAL_IP:3001/health

# 도구 목록 확인
curl http://EXTERNAL_IP:3001/tools

# JSON-RPC 엔드포인트 테스트
curl -X POST http://EXTERNAL_IP:3001/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'
```

## 7. 도메인 설정 (darkwinterlab.com)

### nginx 프록시 설정 (이미 설정되어 있다면):

```bash
# nginx 설정 확인
sudo nginx -t

# nginx 재시작
sudo systemctl restart nginx

# nginx 상태 확인
sudo systemctl status nginx
```

### SSL 인증서 갱신 (필요시):

```bash
# Let's Encrypt 인증서 갱신
sudo certbot renew

# nginx 재로드
sudo systemctl reload nginx
```

## 8. 모니터링 및 로그

```bash
# 실시간 로그 모니터링
pm2 logs mcp-server --lines 50

# 시스템 자원 사용량 확인
pm2 monit

# 서버 상태 JSON으로 확인
pm2 jlist
```

## 9. 자동 시작 설정

```bash
# PM2를 시스템 서비스로 등록
pm2 startup

# 현재 프로세스 저장
pm2 save

# 부팅 시 자동 시작 확인
sudo systemctl status pm2-YOUR_USER
```

## 10. 문제 해결

### 포트 충돌 해결:

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :3001

# 프로세스 종료
sudo kill -9 PID
```

### 방화벽 확인:

```bash
# 방화벽 상태 확인
sudo ufw status

# 포트 개방 (Ubuntu/Debian)
sudo ufw allow 3001

# 방화벽 재시작
sudo ufw reload
```

### 도메인 DNS 확인:

```bash
# DNS 조회
nslookup darkwinterlab.com

# 연결 테스트
curl -I https://darkwinterlab.com/mcp/health
```

## 11. 클로드 연결 테스트

MCP 서버가 올바르게 실행되면 다음 URL을 클로드에 추가하세요:

**Remote MCP URL**: `https://darkwinterlab.com/mcp/jsonrpc`

클로드 설정에서:

1. Settings > Connectors 이동
2. "Add custom connector" 클릭
3. URL 입력: `https://darkwinterlab.com/mcp/jsonrpc`
4. "Add" 클릭

## 환경 변수 설정 파일

필요한 경우 `.env` 파일을 생성하여 환경 변수를 관리하세요:

```bash
# .env 파일 생성
cat > .env << EOF
HTTP_MODE=true
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/spam_analyzer
VIRUSTOTAL_API_KEY=your_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_SERVER_URL=http://localhost:5001
LOG_LEVEL=info
EOF
```
