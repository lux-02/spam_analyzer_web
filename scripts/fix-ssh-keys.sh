#!/bin/bash

# SSH 키 문제 해결 스크립트
# GitHub Actions에서 SSH 연결 실패 시 사용

set -e

echo "🔧 SSH 키 문제 해결 스크립트"
echo "================================="

# 환경 변수 확인
if [ -z "$GCP_PROJECT_ID" ] || [ -z "$GCP_INSTANCE" ] || [ -z "$GCP_ZONE" ]; then
    echo "❌ 필수 환경 변수가 설정되지 않았습니다:"
    echo "   GCP_PROJECT_ID: ${GCP_PROJECT_ID:-'NOT SET'}"
    echo "   GCP_INSTANCE: ${GCP_INSTANCE:-'NOT SET'}"
    echo "   GCP_ZONE: ${GCP_ZONE:-'NOT SET'}"
    exit 1
fi

echo "📋 설정 정보:"
echo "   프로젝트: $GCP_PROJECT_ID"
echo "   인스턴스: $GCP_INSTANCE"
echo "   지역: $GCP_ZONE"
echo ""

# SSH 키 디렉토리 생성
echo "📁 SSH 디렉토리 설정..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 기존 SSH 키 확인
if [ -f ~/.ssh/google_compute_engine ]; then
    echo "✅ 기존 SSH 키 발견"
else
    echo "❌ SSH 키가 없습니다. 새로 생성합니다..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/google_compute_engine -N "" -C "github-actions@$(date +%Y%m%d)"
    echo "✅ 새 SSH 키 생성 완료"
fi

# 공개 키 생성
echo "🔑 공개 키 생성..."
ssh-keygen -y -f ~/.ssh/google_compute_engine > ~/.ssh/google_compute_engine.pub
chmod 600 ~/.ssh/google_compute_engine ~/.ssh/google_compute_engine.pub

# 현재 프로젝트 메타데이터의 SSH 키 확인
echo "🔍 현재 SSH 키 메타데이터 확인..."
CURRENT_KEYS=$(gcloud compute project-info describe \
    --format="value(commonInstanceMetadata.items[key=ssh-keys].value)" 2>/dev/null || echo "")

# 새 키 추가
echo "🔗 SSH 키를 프로젝트 메타데이터에 추가..."
NEW_KEY="runner:$(cat ~/.ssh/google_compute_engine.pub)"

if echo "$CURRENT_KEYS" | grep -q "runner:"; then
    echo "⚠️  기존 runner 키 발견. 교체합니다..."
    # 기존 runner 키 제거 후 새 키 추가
    echo "$CURRENT_KEYS" | grep -v "runner:" > temp_keys.txt
    echo "$NEW_KEY" >> temp_keys.txt
else
    echo "➕ 새 runner 키 추가..."
    echo "$CURRENT_KEYS" > temp_keys.txt
    echo "$NEW_KEY" >> temp_keys.txt
fi

# 빈 줄 제거
grep -v "^$" temp_keys.txt > final_keys.txt || true

# 메타데이터 업데이트
echo "📝 프로젝트 메타데이터 업데이트..."
gcloud compute project-info add-metadata --metadata-from-file ssh-keys=final_keys.txt

# SSH 설정 파일 생성
echo "⚙️  SSH 설정 파일 생성..."
cat > ~/.ssh/config << EOF
Host gcp-*
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 10
    ConnectTimeout 30
    IdentityFile ~/.ssh/google_compute_engine

Host $GCP_INSTANCE
    HostName $GCP_INSTANCE
    User runner
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 10
    ConnectTimeout 30
    IdentityFile ~/.ssh/google_compute_engine
EOF
chmod 600 ~/.ssh/config

# OS Login 설정 확인 및 비활성화
echo "🔒 OS Login 설정 확인..."
OSLOGIN_STATUS=$(gcloud compute project-info describe \
    --format="value(commonInstanceMetadata.items[key=enable-oslogin].value)" 2>/dev/null || echo "")

if [ "$OSLOGIN_STATUS" = "TRUE" ] || [ "$OSLOGIN_STATUS" = "true" ]; then
    echo "⚠️  OS Login이 활성화되어 있습니다. 비활성화합니다..."
    gcloud compute project-info add-metadata --metadata enable-oslogin=FALSE
    echo "✅ OS Login 비활성화 완료"
else
    echo "✅ OS Login이 이미 비활성화되어 있습니다"
fi

# SSH 키 전파 대기
echo "⏳ SSH 키 전파 대기 (90초)..."
for i in {1..18}; do
    echo -n "."
    sleep 5
done
echo ""

# 연결 테스트
echo "🧪 SSH 연결 테스트..."
for attempt in 1 2 3 4 5; do
    echo "🔗 연결 시도 $attempt/5..."
    
    if gcloud compute ssh runner@$GCP_INSTANCE \
        --zone=$GCP_ZONE \
        --ssh-key-file=~/.ssh/google_compute_engine \
        --command="echo '✅ SSH 연결 성공! 서버 시간: \$(date)'" \
        --quiet; then
        echo "🎉 SSH 연결 테스트 성공!"
        break
    else
        echo "❌ 연결 실패 (시도 $attempt/5)"
        if [ $attempt -lt 5 ]; then
            echo "30초 후 재시도..."
            sleep 30
        else
            echo "🚨 모든 연결 시도가 실패했습니다!"
            echo ""
            echo "🔧 문제 해결 방법:"
            echo "1. 인스턴스가 실행 중인지 확인:"
            echo "   gcloud compute instances list --filter=\"name=$GCP_INSTANCE\""
            echo ""
            echo "2. 방화벽 규칙 확인:"
            echo "   gcloud compute firewall-rules list --filter=\"name~ssh\""
            echo ""
            echo "3. 인스턴스 로그 확인:"
            echo "   gcloud compute instances get-serial-port-output $GCP_INSTANCE --zone=$GCP_ZONE"
            echo ""
            echo "4. 수동 SSH 키 추가:"
            echo "   gcloud compute instances add-metadata $GCP_INSTANCE --zone=$GCP_ZONE \\"
            echo "     --metadata ssh-keys=\"runner:\$(cat ~/.ssh/google_compute_engine.pub)\""
            exit 1
        fi
    fi
done

# 정리
echo "🧹 임시 파일 정리..."
rm -f temp_keys.txt final_keys.txt

echo ""
echo "✅ SSH 키 설정 완료!"
echo "🔑 SSH 키 정보:"
echo "   개인 키: ~/.ssh/google_compute_engine"
echo "   공개 키: ~/.ssh/google_compute_engine.pub"
echo "   설정 파일: ~/.ssh/config"
echo ""
echo "🚀 이제 다음 명령어로 연결할 수 있습니다:"
echo "   gcloud compute ssh runner@$GCP_INSTANCE --zone=$GCP_ZONE"
