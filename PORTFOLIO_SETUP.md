# 🎨 포트폴리오 파일 관리 시스템 설정 가이드

## 📋 개요

Notion 파일 만료 문제를 해결하기 위한 GCP Cloud Storage 기반 포트폴리오 관리 시스템입니다.

## 🚀 추천 솔루션: GCP Cloud Storage

### 장점

- ✅ 파일 만료 없음 (영구 저장)
- ✅ Global CDN 자동 연동 (빠른 로딩)
- ✅ 99.999999999% 내구성
- ✅ 비용 효율적 (GB당 $0.02/월)
- ✅ 무제한 확장성

## 🛠️ 설정 방법

### 1. GCP 프로젝트 생성

```bash
# GCP Console에서 새 프로젝트 생성
# https://console.cloud.google.com/
```

### 2. Cloud Storage 버킷 생성

```bash
# 버킷 이름: your-portfolio-bucket
# 지역: asia-northeast3 (서울)
# 스토리지 클래스: Standard
```

### 3. 서비스 계정 생성

```bash
# IAM > 서비스 계정 > 새 서비스 계정 생성
# 역할: Storage Object Admin
# 키 파일 다운로드 (JSON)
```

### 4. 환경 변수 설정

`.env.local` 파일 생성:

```env
# GCP Cloud Storage 설정
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-portfolio-bucket
GOOGLE_CLOUD_KEY_FILE=./service-account-key.json

# 또는 JSON 문자열로 직접 입력
# GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

### 5. 서비스 계정 키 파일 배치

```bash
# 프로젝트 루트에 service-account-key.json 파일 배치
# .gitignore에 추가하여 버전 관리에서 제외
```

## 📂 파일 구조

```
spam_analyzer_web/
├── components/
│   ├── Scene3D.js          # 3D 포트폴리오 뷰어
│   └── FileUpload.js       # 파일 업로드 컴포넌트
├── pages/
│   ├── admin.js           # 관리자 인터페이스
│   └── api/
│       └── upload.js      # 파일 업로드 API
├── service-account-key.json # GCP 인증 키 (gitignore)
└── .env.local             # 환경 변수 (gitignore)
```

## 🎯 사용 방법

### 1. 관리자 페이지 접속

```bash
http://localhost:3000/admin
```

### 2. 포트폴리오 추가

1. 제목과 설명 입력
2. 파일 드래그 앤 드롭 또는 클릭하여 업로드
3. 저장 버튼 클릭

### 3. Scene3D에 적용

1. "Scene3D로 내보내기" 버튼 클릭
2. 클립보드에 복사된 JSON 데이터를 Scene3D.js의 portfolioData에 붙여넣기

## 💰 비용 예상

### GCP Cloud Storage 요금 (서울 리전)

- 저장: $0.02 per GB/월
- 네트워크 송신: $0.12 per GB (아시아)
- 작업 요금: 거의 무료

### 예시 비용 (월 기준)

- 포트폴리오 파일 10GB: $0.20
- 월 1000회 조회: ~$0.10
- **총 월 비용: 약 $0.30 (400원)**

## 🔧 고급 설정 (선택사항)

### CDN 최적화

```javascript
// Cloud Storage 버킷에 Cloud CDN 연결
// 전 세계 빠른 속도로 파일 제공
```

### 이미지 최적화

```javascript
// Cloud Functions로 이미지 리사이징 자동화
// WebP 포맷 자동 변환
```

### 버전 관리

```javascript
// 파일 버전 관리 활성화
// 실수로 삭제된 파일 복구 가능
```

## 🆚 다른 방법과의 비교

| 방법               | 장점              | 단점          | 비용 | 복잡도 |
| ------------------ | ----------------- | ------------- | ---- | ------ |
| **GCP Storage** ⭐ | 안정성, 성능, CDN | GCP 의존성    | 낮음 | 중간   |
| Notion API         | 편리한 관리       | 제한, 만료    | 없음 | 낮음   |
| File DB            | 완전 제어         | 높은 유지비용 | 높음 | 높음   |

## 🔍 문제 해결

### 업로드 실패 시

1. 서비스 계정 권한 확인
2. 버킷 이름 정확성 확인
3. 환경 변수 설정 확인

### CORS 에러 시

```bash
# 버킷 CORS 설정
gsutil cors set cors.json gs://your-bucket-name
```

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. GCP 콘솔에서 API 활성화 상태
2. 서비스 계정 권한 설정
3. 환경 변수 정확성
4. 네트워크 연결 상태
