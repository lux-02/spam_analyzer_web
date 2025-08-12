#!/bin/bash

# 배포 스크립트
# GitHub Actions에서 실행되는 서버 측 배포 로직

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 Starting deployment process..."

# 현재 디렉토리 확인
DEPLOY_DIR="$HOME/apps/spam_analyzer_web"
BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 현재 실행 중인 서버 상태 확인
echo "📊 Checking current server status..."
if pgrep -f "next-server" > /dev/null; then
    echo "✅ Next.js server is running"
    SERVER_RUNNING=true
else
    echo "⚠️  Next.js server is not running"
    SERVER_RUNNING=false
fi

# 기존 파일 백업
echo "💾 Creating backup..."
if [ -d "$DEPLOY_DIR" ]; then
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/spam_analyzer_web-$TIMESTAMP"
    echo "✅ Backup created: $BACKUP_DIR/spam_analyzer_web-$TIMESTAMP"
fi

# 배포 디렉토리로 이동
cd "$DEPLOY_DIR"

# 환경 변수 파일 백업 (덮어쓰기 방지)
if [ -f ".env.local" ]; then
    cp .env.local /tmp/.env.local.backup
    echo "✅ Environment variables backed up"
fi

# 새 코드 추출
echo "📦 Extracting new code..."
tar -xzf ~/deployment.tar.gz

# 환경 변수 파일 복원
if [ -f "/tmp/.env.local.backup" ]; then
    cp /tmp/.env.local.backup .env.local
    rm /tmp/.env.local.backup
    echo "✅ Environment variables restored"
fi

# Node.js 의존성 설치
echo "📚 Installing dependencies..."
npm ci --production --silent

# Next.js 빌드
echo "🔨 Building application..."
npm run build

# 기존 서버 종료
echo "🛑 Stopping existing server..."
pkill -f "next-server" || echo "No server was running"
sleep 3

# 새 서버 시작
echo "🚀 Starting new server..."
nohup npm start > next.log 2>&1 &

# 서버 시작 대기
echo "⏳ Waiting for server to start..."
sleep 5

# 서버 상태 확인
if pgrep -f "next-server" > /dev/null; then
    echo "✅ Server started successfully"
    
    # 헬스 체크
    echo "🏥 Performing health check..."
    for i in {1..5}; do
        if curl -s -f http://localhost:3000 > /dev/null; then
            echo "✅ Health check passed"
            break
        else
            echo "⏳ Attempt $i/5 failed, retrying in 2 seconds..."
            sleep 2
        fi
    done
else
    echo "❌ Server failed to start"
    
    # 로그 출력
    echo "📋 Last 20 lines of server log:"
    tail -20 next.log
    
    # 백업에서 복원
    echo "🔄 Rolling back to previous version..."
    if [ -d "$BACKUP_DIR/spam_analyzer_web-$TIMESTAMP" ]; then
        rm -rf "$DEPLOY_DIR"
        mv "$BACKUP_DIR/spam_analyzer_web-$TIMESTAMP" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
        nohup npm start > next.log 2>&1 &
        echo "✅ Rollback completed"
    fi
    
    exit 1
fi

# 정리
echo "🧹 Cleaning up..."
rm -f ~/deployment.tar.gz

# 오래된 백업 정리 (7일 이상)
find "$BACKUP_DIR" -name "spam_analyzer_web-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is running at: https://darkwinterlab.com"
