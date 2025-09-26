# Vercel 배포 가이드

## 🚀 Vercel 배포 설정

### 1. Vercel 계정 설정

1. [Vercel](https://vercel.com)에 가입
2. GitHub 계정 연동
3. 프로젝트 import

### 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

```bash
# 필수 환경 변수
SUPABASE_URL=https://ghuldvpkwkjhsxbocfgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWxkdnBrd2tqaHN4Ym9jZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MDcyNDMsImV4cCI6MjA0Mjk4MzI0M30.mhgqD-w7AuZN5llX6Ps0fYfKtJ7n8Jz8DjWPiQKaR0s
GEMINI_API_KEY=your_gemini_api_key_here
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# 선택 사항 (인증 사용 시)
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 3. MongoDB Atlas 설정

1. [MongoDB Atlas](https://cloud.mongodb.com/) 무료 계정 생성
2. 클러스터 생성 (M0 Sandbox - 무료)
3. Database User 생성
4. Network Access에서 IP 허용 (0.0.0.0/0 - 모든 IP 허용)
5. Connection String 복사하여 `MONGODB_URI`에 설정

### 4. API 키 발급

#### Google Gemini API

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 생성
3. `GEMINI_API_KEY`에 설정

#### VirusTotal API (선택사항)

1. [VirusTotal](https://www.virustotal.com/gui/join-us) 가입
2. API 키 발급
3. `VIRUSTOTAL_API_KEY`에 설정

### 5. 배포 과정

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 자동 배포 완료

## 🔧 제거된 기능들

### ❌ 포트 스캔 기능

- **이유**: nmap, 네트워크 도구가 서버리스에서 불가능
- **대안**: VirusTotal에서 네트워크 정보 확인
- **영향**: 사용자 대부분이 미사용하는 기능

### ❌ Flask 백엔드

- **이유**: 별도 서버 운영 비용 절감
- **대안**: Next.js API Routes로 모든 기능 통합
- **영향**: VT Graph 생성 불가 (VirusTotal 웹사이트 직접 이용)

### ❌ MCP 서버

- **이유**: Claude 연동을 위한 별도 서버
- **대안**: 웹 인터페이스를 통한 이메일 분석 계속 지원
- **영향**: Claude 연동 불가, 하지만 핵심 기능은 유지

## ✅ 유지되는 핵심 기능들

### 📧 이메일 스팸 분석 (100% 유지)

- 이메일 헤더 분석
- 본문 내용 분석
- Gemini AI 의도 분석
- 위험도 점수 계산
- 3D 시각화

### 🗺️ 지리적 정보 (100% 유지)

- IP 위치 추적
- 경로 시각화
- 대화형 지도

### 🔍 VirusTotal 연동 (90% 유지)

- IP/도메인 검사
- 분석 결과 표시
- 외부 링크로 상세 정보

### 💾 데이터 저장 (100% 유지)

- MongoDB를 통한 분석 결과 저장
- 최근 분석 결과 조회
- 통계 정보

## 💰 비용 비교

### 기존 GCP 배포

- **Compute Engine**: $30-50/월
- **MongoDB 호스팅**: $10-20/월
- **네트워크 비용**: $5-10/월
- **총 비용**: $45-80/월

### Vercel 배포

- **Vercel Pro**: $20/월 (필요시, 프리티어로도 충분)
- **MongoDB Atlas**: $0/월 (M0 Sandbox)
- **외부 API**: $0-5/월
- **총 비용**: $0-25/월

### 💡 절약 효과: 월 $20-55 (60-90% 절약)

## 🎯 배포 후 확인사항

1. **기본 기능 테스트**

   - 이메일 분석 기능
   - 데이터베이스 연결
   - API 응답 속도

2. **성능 모니터링**

   - Vercel Analytics 설정
   - 에러 로그 확인
   - 응답 시간 측정

3. **사용자 경험**
   - 페이지 로딩 속도
   - 모바일 호환성
   - SEO 최적화

## 📞 문제 해결

### 자주 발생하는 문제들

#### MongoDB 연결 오류

```bash
# 체크리스트:
1. Atlas 클러스터가 활성화되어 있는지 확인
2. IP 화이트리스트 설정 (0.0.0.0/0)
3. Connection String 정확성 확인
4. 사용자 권한 확인
```

#### API 키 오류

```bash
# 체크리스트:
1. 환경 변수명 정확성 확인
2. API 키 유효성 확인
3. 할당량 확인
4. 권한 설정 확인
```

#### 빌드 오류

```bash
# 해결 방법:
1. `npm run build` 로컬 테스트
2. package.json 의존성 확인
3. 환경 변수 누락 확인
4. TypeScript 오류 수정
```

## 🔄 롤백 계획

만약 문제가 발생하면:

1. Git에서 이전 버전으로 되돌리기
2. GCP 인스턴스 재활성화
3. 환경 변수 복원
4. 서비스 재시작

## 📈 향후 개선 계획

1. **성능 최적화**

   - ISR(Incremental Static Regeneration) 적용
   - 이미지 최적화
   - 코드 분할

2. **기능 확장**

   - PWA(Progressive Web App) 지원
   - 실시간 알림
   - 사용자 대시보드

3. **모니터링 강화**
   - Sentry 에러 추적
   - 성능 메트릭 수집
   - 사용자 분석
