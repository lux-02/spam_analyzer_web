#!/bin/bash

# GCP에서 MCP 서버 포함 배포 스크립트

echo "🚀 MCP 서버 포함 배포 시작..."

# 현재 디렉토리 저장
ROOT_DIR=$(pwd)

echo "📦 프로젝트 업데이트..."
git pull origin main

echo "🔨 MCP 서버 빌드..."
cd mcp-server
npm install
npm run build
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
