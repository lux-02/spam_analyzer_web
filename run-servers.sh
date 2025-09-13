#!/bin/bash

# 환경 설정
export FLASK_API_URL=http://0.0.0.0:5001/analyze
export FLASK_PORT=5001
export HTTP_MODE=true
export MCP_SERVER_PORT=3001
export MCP_SERVER_HOST=0.0.0.0

# 현재 디렉토리 저장
ROOT_DIR=$(pwd)

# Flask 서버 백그라운드로 실행
echo "🚀 Flask 서버 시작 중... (포트: 5001)"
cd flask-server
python app.py &
FLASK_PID=$!

# MCP 서버 백그라운드로 실행
echo "🚀 MCP 서버 시작 중... (포트: 3001)"
cd $ROOT_DIR/mcp-server
# 의존성이 설치되어 있지 않다면 설치
if [ ! -d "node_modules" ]; then
  echo "📦 MCP 서버 의존성 설치 중..."
  npm install
fi
# 빌드가 없다면 빌드
if [ ! -d "dist" ]; then
  echo "🔨 MCP 서버 빌드 중..."
  npm run build
fi
npm run start:http &
MCP_PID=$!

# NextJS 디렉토리로 이동
cd $ROOT_DIR

# NextJS 서버 실행 (빌드된 버전 사용)
echo "🚀 Next.js 서버 시작 중..."
if command -v npm &> /dev/null; then
  npm run start &
else
  # npm이 없을 경우 node로 직접 실행
  node node_modules/next/dist/bin/next start -H 0.0.0.0 -p 3000 &
fi
NEXT_PID=$!

echo "✅ 세 서버가 모두 실행 중입니다:"
echo "- Flask 서버: http://0.0.0.0:5001"
echo "- Next.js 서버: http://0.0.0.0:3000"
echo "- MCP 서버: http://0.0.0.0:3001"

# Ctrl+C로 모든 서버 종료
function cleanup {
  echo "🛑 서버 종료 중..."
  kill $FLASK_PID
  kill $MCP_PID
  kill $NEXT_PID
  exit 0
}

trap cleanup INT
echo "서버를 종료하려면 Ctrl+C를 누르세요."

# 모든 서버가 실행 중인 동안 대기
wait 