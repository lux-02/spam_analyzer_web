# 🚀 GitHub Actions CI/CD 설정 가이드

## 📋 개요

이 가이드는 GitHub Actions를 사용하여 자동 배포 파이프라인을 설정하는 방법을 설명합니다.

## 🔧 설정 단계

### 1. GitHub Repository Secrets 설정

GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 secrets을 추가해야 합니다:

#### 필수 Secrets:

1. **`GCP_PROJECT_ID`**
   - 값: `confident-trail-468806-t9`
   - 설명: GCP 프로젝트 ID

2. **`GCP_SA_KEY`**
   - 값: GCP 서비스 계정 JSON 키 (전체 내용)
   - 설명: GCP 인증을 위한 서비스 계정 키

3. **`GCP_SSH_PRIVATE_KEY`**
   - 값: GCP 인스턴스 접속용 SSH 개인 키
   - 설명: `gcloud compute ssh`에서 사용하는 SSH 키

### 2. GCP 서비스 계정 생성 및 설정

```bash
# 1. GCP 서비스 계정 생성
gcloud iam service-accounts create github-actions-sa \
    --description="GitHub Actions deployment service account" \
    --display-name="GitHub Actions SA"

# 2. 필요한 권한 부여
gcloud projects add-iam-policy-binding confident-trail-468806-t9 \
    --member="serviceAccount:github-actions-sa@confident-trail-468806-t9.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding confident-trail-468806-t9 \
    --member="serviceAccount:github-actions-sa@confident-trail-468806-t9.iam.gserviceaccount.com" \
    --role="roles/compute.osLogin"

# 3. 서비스 계정 키 생성
gcloud iam service-accounts keys create ~/github-actions-key.json \
    --iam-account=github-actions-sa@confident-trail-468806-t9.iam.gserviceaccount.com
```

### 3. SSH 키 설정

```bash
# 1. SSH 키 생성 (이미 있다면 기존 키 사용)
ssh-keygen -t rsa -b 4096 -C "github-actions@darkwinterlab.com" -f ~/.ssh/github-actions-key

# 2. 공개 키를 GCP 메타데이터에 추가
gcloud compute project-info add-metadata \
    --metadata ssh-keys="github-actions:$(cat ~/.ssh/github-actions-key.pub)"

# 3. 개인 키 내용을 GitHub Secret으로 추가
cat ~/.ssh/github-actions-key
```

### 4. GitHub Secrets 추가 방법

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables > Actions** 선택
4. **New repository secret** 클릭
5. 각 secret을 하나씩 추가:

   - **Name**: `GCP_PROJECT_ID`
     **Secret**: `confident-trail-468806-t9`

   - **Name**: `GCP_SA_KEY`
     **Secret**: `~/github-actions-key.json` 파일의 전체 내용 복사

   - **Name**: `GCP_SSH_PRIVATE_KEY`
     **Secret**: `~/.ssh/github-actions-key` 파일의 전체 내용 복사

## 🔄 배포 프로세스

### 자동 배포 트리거

- **main 브랜치에 push**: 자동 배포 실행
- **Pull Request**: 빌드 테스트만 실행

### 배포 단계

1. **코드 체크아웃**: 최신 코드 가져오기
2. **의존성 설치**: `npm ci` 실행
3. **빌드**: `npm run build` 실행
4. **패키징**: 배포용 tar.gz 파일 생성
5. **서버 업로드**: GCP 인스턴스로 파일 전송
6. **서버 배포**: 
   - 기존 파일 백업
   - 새 코드 추출
   - 의존성 설치
   - 빌드 실행
   - 서버 재시작
7. **헬스 체크**: 배포 성공 여부 확인

### 롤백 기능

- 배포 실패 시 자동으로 이전 버전으로 롤백
- 백업은 7일간 보관

## 📊 모니터링

### 배포 로그 확인

GitHub Actions 탭에서 워크플로우 실행 상태를 확인할 수 있습니다.

### 서버 로그 확인

```bash
# 서버 접속
gcloud compute ssh --zone "us-central1-c" "instance-20250812-075321" --project "confident-trail-468806-t9"

# 배포 로그 확인
cd ~/apps/spam_analyzer_web
tail -f next.log

# 서버 상태 확인
netstat -tlnp | grep 3000
```

## 🛠️ 문제 해결

### 일반적인 문제

1. **SSH 연결 실패**
   - SSH 키가 올바르게 설정되었는지 확인
   - GCP 메타데이터에 공개 키가 추가되었는지 확인

2. **권한 오류**
   - 서비스 계정에 필요한 권한이 부여되었는지 확인
   - IAM 정책이 올바르게 설정되었는지 확인

3. **빌드 실패**
   - 의존성 문제인지 확인
   - Node.js 버전 호환성 확인

### 수동 롤백

```bash
# 서버 접속
gcloud compute ssh --zone "us-central1-c" "instance-20250812-075321" --project "confident-trail-468806-t9"

# 백업 목록 확인
ls ~/backups/

# 특정 백업으로 롤백
cd ~/apps
rm -rf spam_analyzer_web
cp -r ~/backups/spam_analyzer_web-YYYYMMDD-HHMMSS spam_analyzer_web
cd spam_analyzer_web
nohup npm start > next.log 2>&1 &
```

## 🎯 사용법

1. 코드 수정 후 commit & push
2. GitHub Actions가 자동으로 실행
3. 배포 완료 후 https://darkwinterlab.com 에서 확인

## 📝 추가 설정

### 환경별 배포

필요시 staging/production 환경을 분리할 수 있습니다:

- `develop` 브랜치 → staging 서버
- `main` 브랜치 → production 서버

### 알림 설정

Slack이나 Discord 알림을 추가하여 배포 상태를 실시간으로 받을 수 있습니다.
