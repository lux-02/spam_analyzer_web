#!/bin/bash

# 환경 설정
export FLASK_API_URL=http://0.0.0.0:5001/analyze
export FLASK_PORT=5001

# 현재 디렉토리 저장
ROOT_DIR=$(pwd)

# Flask 서버 백그라운드로 실행
echo "🚀 Flask 서버 시작 중... (포트: 5001)"
cd flask-server
python app.py &
FLASK_PID=$!

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

echo "✅ 두 서버가 모두 실행 중입니다:"
echo "- Flask 서버: http://0.0.0.0:5001"
echo "- Next.js 서버: http://0.0.0.0:3000"

# Ctrl+C로 두 서버 모두 종료
function cleanup {
  echo "🛑 서버 종료 중..."
  kill $FLASK_PID
  kill $NEXT_PID
  exit 0
}

trap cleanup INT
echo "서버를 종료하려면 Ctrl+C를 누르세요."

# 두 서버가 모두 실행 중인 동안 대기
wait 