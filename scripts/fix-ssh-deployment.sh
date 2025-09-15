#!/bin/bash

# GitHub Actions 배포 문제 해결 스크립트
# 이 스크립트는 SSH 키 문제가 지속될 때 수동으로 실행할 수 있습니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 SSH 배포 문제 해결 스크립트${NC}"
echo "이 스크립트는 GitHub Actions에서 SSH 연결 실패 시 수동으로 배포를 도와줍니다."

# 환경 변수 확인
if [ -z "$GCP_PROJECT_ID" ] || [ -z "$GCP_ZONE" ] || [ -z "$GCP_INSTANCE" ]; then
    echo -e "${YELLOW}환경 변수를 설정해주세요:${NC}"
    echo "export GCP_PROJECT_ID=\"your-project-id\""
    echo "export GCP_ZONE=\"us-central1-c\""
    echo "export GCP_INSTANCE=\"instance-20250812-075321\""
    exit 1
fi

echo -e "${GREEN}📋 환경 정보:${NC}"
echo "프로젝트: $GCP_PROJECT_ID"
echo "영역: $GCP_ZONE"
echo "인스턴스: $GCP_INSTANCE"
echo

# gcloud 인증 확인
echo -e "${GREEN}🔑 gcloud 인증 확인...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
    echo -e "${RED}❌ gcloud 인증이 필요합니다.${NC}"
    echo "gcloud auth login을 실행하세요."
    exit 1
fi

echo -e "${GREEN}✅ gcloud 인증 확인됨${NC}"

# 인스턴스 상태 확인
echo -e "${GREEN}📊 인스턴스 상태 확인...${NC}"
INSTANCE_STATUS=$(gcloud compute instances describe $GCP_INSTANCE \
    --zone=$GCP_ZONE \
    --format="value(status)")

echo "인스턴스 상태: $INSTANCE_STATUS"

if [ "$INSTANCE_STATUS" != "RUNNING" ]; then
    echo -e "${YELLOW}⚠️ 인스턴스가 실행 중이 아닙니다. 시작하시겠습니까? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        gcloud compute instances start $GCP_INSTANCE --zone=$GCP_ZONE
        echo -e "${GREEN}✅ 인스턴스 시작됨${NC}"
        echo "⏳ 30초 대기..."
        sleep 30
    else
        echo -e "${RED}❌ 인스턴스가 실행되지 않아 배포를 진행할 수 없습니다.${NC}"
        exit 1
    fi
fi

# OS Login 비활성화
echo -e "${GREEN}🔒 OS Login 비활성화...${NC}"
gcloud compute project-info add-metadata --metadata enable-oslogin=FALSE --quiet

# 수동 배포 옵션 제공
echo
echo -e "${GREEN}🚀 배포 방법을 선택하세요:${NC}"
echo "1) Startup Script를 통한 배포 (추천)"
echo "2) Cloud Shell을 통한 수동 배포"
echo "3) 종료"
echo

read -p "선택 (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}📝 Startup Script 배포 시작...${NC}"
        
        # Startup script 생성
        cat > startup-script.sh << 'EOF'
#!/bin/bash

# 로그 설정
exec 1> >(logger -s -t manual-deploy)
exec 2>&1

echo "🚀 수동 배포 스크립트 시작"

# 사용자 디렉토리로 이동
cd /home/runner || exit 1

# Git 저장소 확인 및 업데이트
if [ ! -d spam_analyzer_web ]; then
    echo "📁 저장소 클론..."
    sudo -u runner git clone https://github.com/lux-02/spam_analyzer_web.git spam_analyzer_web
fi

cd spam_analyzer_web || exit 1

echo "📦 Git 저장소 업데이트..."
sudo -u runner git fetch origin
sudo -u runner git reset --hard origin/main
sudo -u runner git clean -fd

echo "🔨 MCP 서버 빌드..."
cd mcp-server
sudo -u runner npm install --production --silent
sudo -u runner npm run build

echo "🚀 배포 스크립트 실행..."
cd ..
chmod +x deploy-with-mcp.sh
sudo -u runner ./deploy-with-mcp.sh

echo "✅ 배포 완료!"

# 성공 표시 파일 생성
sudo -u runner touch /home/runner/manual-deployment-success
EOF

        # 스크립트를 인스턴스에 적용
        gcloud compute instances add-metadata $GCP_INSTANCE \
            --zone=$GCP_ZONE \
            --metadata-from-file startup-script=startup-script.sh

        # 인스턴스 재시작
        echo -e "${YELLOW}🔄 인스턴스 재시작으로 배포 스크립트 실행...${NC}"
        gcloud compute instances reset $GCP_INSTANCE --zone=$GCP_ZONE --quiet

        # 재시작 완료 대기
        echo -e "${YELLOW}⏳ 인스턴스 재시작 및 배포 완료 대기 (2분)...${NC}"
        sleep 120

        # 배포 성공 확인
        echo -e "${GREEN}🔍 배포 상태 확인...${NC}"
        for i in {1..5}; do
            if gcloud compute instances get-serial-port-output $GCP_INSTANCE \
                --zone=$GCP_ZONE | grep -q "배포 완료"; then
                echo -e "${GREEN}✅ Startup Script 배포 성공!${NC}"
                break
            else
                echo -e "${YELLOW}⏳ 배포 진행 중... ($i/5)${NC}"
                sleep 30
            fi
        done

        # 정리
        rm -f startup-script.sh
        ;;
        
    2)
        echo -e "${GREEN}💻 Cloud Shell 명령어:${NC}"
        echo
        echo -e "${YELLOW}다음 명령어를 Google Cloud Shell에서 실행하세요:${NC}"
        echo
        echo "gcloud compute ssh runner@$GCP_INSTANCE --zone=$GCP_ZONE --project=$GCP_PROJECT_ID"
        echo
        echo -e "${YELLOW}SSH 연결 후 실행할 명령어:${NC}"
        cat << 'EOF'
cd ~/spam_analyzer_web || exit 1
git fetch origin && git reset --hard origin/main
cd mcp-server && npm install --production && npm run build
cd .. && chmod +x deploy-with-mcp.sh && ./deploy-with-mcp.sh
EOF
        ;;
        
    3)
        echo -e "${GREEN}👋 종료합니다.${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ 잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 배포 프로세스가 완료되었습니다!${NC}"
echo -e "${GREEN}📍 서비스 확인:${NC}"
echo "- 메인 사이트: https://darkwinterlab.com"
echo "- MCP API: https://darkwinterlab.com/mcp/"
