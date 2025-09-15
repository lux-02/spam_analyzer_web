#!/bin/bash

# GCP에서 MCP 서버 포함 배포 스크립트
set -euo pipefail

echo "🚀 MCP 서버 포함 배포 시작..."

# 현재 디렉토리 저장
ROOT_DIR=$(pwd)

echo "📦 프로젝트 업데이트..."
git pull origin main

echo "🔨 MCP 서버 빌드..."
cd mcp-server

# npm 로그 폴더 초기화
LOGDIR="$HOME/.npm/_logs"
rm -rf "$LOGDIR" || true
mkdir -p "$LOGDIR"

# 의존성 설치
if [ -f package-lock.json ]; then
  npm ci || {
    echo "❌ npm ci 실패. 로그 출력:"; ls -l "$LOGDIR" || true;
    tail -n +1 -v "$LOGDIR"/* 2>/dev/null || true;
    exit 1;
  }
else
  npm install || {
    echo "❌ npm install 실패. 로그 출력:"; ls -l "$LOGDIR" || true;
    tail -n +1 -v "$LOGDIR"/* 2>/dev/null || true;
    exit 1;
  }
fi

# 빌드
npm run build || {
  echo "❌ npm run build 실패. 로그 출력:"; ls -l "$LOGDIR" || true;
  tail -n +1 -v "$LOGDIR"/* 2>/dev/null || true;
  exit 1;
}

# 로컬 pm2 보장 및 MCP 서버 재시작
if ! npm ls pm2 --depth=0 >/dev/null 2>&1; then
  npm i pm2 --save
fi

ENTRY=""
[ -f ./start-http-server.js ] && ENTRY=./start-http-server.js
[ -z "$ENTRY" ] && [ -f ./dist/index.js ] && ENTRY=./dist/index.js
[ -z "$ENTRY" ] && { echo "❌ 엔트리 파일 미발견"; exit 1; }

npx pm2 delete mcp-server 2>/dev/null || true
npx pm2 start "$ENTRY" --name mcp-server
npx pm2 save
sleep 5
curl -f http://localhost:3001/health

cd $ROOT_DIR

echo "🐳 Docker 컨테이너 재시작..."
docker-compose down
docker-compose up --build -d

echo "⏳ 서버 시작 대기 중..."
sleep 30

echo "🧪 서비스 상태 확인..."

# Next.js 서버 확인
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Next.js 서버: 정상"
else
    echo "❌ Next.js 서버: 실패"
fi

# Flask 서버 확인
if curl -f http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ Flask 서버: 정상"
else
    echo "❌ Flask 서버: 실패"
fi

# MCP 서버 확인
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ MCP 서버: 정상"
else
    echo "❌ MCP 서버: 실패"
fi

echo "🎉 배포 완료!"
echo ""
echo "📍 서비스 URL:"
echo "- 메인 웹사이트: https://darkwinterlab.com"
echo "- Next.js: http://localhost:3000"
echo "- Flask API: http://localhost:5001"
echo "- MCP API: http://localhost:3001"
echo "- MCP API (외부): https://darkwinterlab.com/mcp/"
