# 네이버 이메일 스팸/피싱 분석기

이메일 원문을 분석하여 스팸/피싱 여부를 분석하는 웹 애플리케이션입니다.

**🌐 라이브 데모**: [https://mail.n2f.site](https://mail.n2f.site)

## 기능

- 이메일 헤더 분석 (SPF, DKIM, DMARC 등)
- 발신자 및 경유 서버 추적
- 링크 추출 및 위험도 분석
- 첨부 파일 분석
- LLM(OpenAI API)을 사용한 이메일 내용 분석
- 종합 위험도 평가
- 분석 데이터 서버 비저장(브라우저 세션 기반 결과 확인)

## 개인정보/저장 정책 요약

- 이메일 원문과 분석 결과는 서버 DB에 저장하지 않습니다.
- 결과 페이지 표시는 브라우저 `sessionStorage`에 임시 저장된 데이터로 동작합니다.
- 브라우저 세션이 종료되면 기존 결과 링크가 더 이상 열리지 않을 수 있습니다.

## 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- Python 3.8 이상
- pip (Python 패키지 관리자)

### 환경 변수

LLM 분석(이메일 의도 분석)을 사용하려면 서버 환경변수에 `OPENAI_API_KEY`가 필요합니다. (선택: `OPENAI_MODEL`, 기본값 `gpt-4o-mini`)

### 개인정보/저장 정책

- 분석 결과(이메일 원문 포함)는 서버 데이터베이스에 저장하지 않습니다.
- 웹앱은 분석 결과를 브라우저 `sessionStorage`에 저장한 뒤 결과 페이지로 이동합니다.
- 확장앱은 결과 페이지를 열고 같은 브라우저 세션에 분석 결과를 전달합니다.
- URL만 복사해도 다른 브라우저나 다른 세션에서 동일 결과가 재현되지 않도록 설계했습니다.
- 브라우저 세션 종료 또는 저장 데이터 삭제 시 결과는 복구되지 않습니다.

### 설치 및 실행 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/naver-mail-analyzer.git
cd naver-mail-analyzer
```

2. Node.js 의존성 설치

```bash
npm install
```

3. 서버 실행

맥/리눅스:

```bash
chmod +x run-servers.sh
./run-servers.sh
```

윈도우:

```bash
run-servers.bat
```

4. 브라우저에서 열기

```
http://localhost:3000
```

## LLM 모델 관련 문제 해결

현재 LLM 분석은 OpenAI API 기반으로 동작합니다.

### 점검 항목

1. `OPENAI_API_KEY` 설정 여부
2. `OPENAI_MODEL` 설정값 유효성(미설정 시 `gpt-4o-mini`)
3. 외부 API 호출 가능한 네트워크 환경 여부

### 알려진 이슈

1. **포트 충돌 (macOS Airplay)**
   - macOS에서 Flask의 기본 포트(5000)가 AirPlay와 충돌할 수 있음
   - 현재 포트 5001로 변경하여 해결

## 상세 분석 방법

### 사용 방법

1. 네이버 메일에서 분석하려는 이메일 선택
2. 더보기(⋮) > 원문 보기 선택
3. 전체 원문 데이터 복사
4. 이 애플리케이션의 입력창에 붙여넣기
5. "이메일 분석하기" 버튼 클릭
6. 분석 결과 확인

## 버전 변경 내역

### v1.2.0 - LLM/OpenAI 운영 안정화 (2023-10-20)

- OpenAI 기반 의도 분석 운영 정비
- 모델 호환성 및 폴백 로직 개선
- 개인정보 보호 정책과 결과 전달 방식 정비

### v1.1.0 - 결과 저장 구조 개선 (2023-10-10)

- 분석 결과 조회 안정성 개선
- 개인정보 보호 정책 강화

### v1.0.0 - 최초 릴리스 (2023-10-01)

- 기본 분석 기능 구현
- Next.js 및 TailwindCSS 기반 UI
- 이메일 원문 파싱 및 분석
- 결과 조회 기능

## 🚀 자동 배포

이 프로젝트는 GitHub Actions를 통해 GCP에 자동 배포됩니다.

### 배포 트리거

- `main` 브랜치에 push 시 자동 배포
- 수동 배포: GitHub Actions 탭에서 "Run workflow" 클릭

### 배포 구성

- **메인 웹앱**: Next.js (포트 3000)
- **Flask API**: Python Flask (포트 5001)
- **MCP 서버**: TypeScript (포트 3001)
- **웹 서버**: Nginx (포트 80/443)

### 배포 문제 해결

GitHub Actions 배포가 실패하는 경우 다음 방법들을 시도해보세요:

#### 1. SSH 연결 문제 해결

```bash
# 환경 변수 설정
export GCP_PROJECT_ID="confident-trail-468806-t9"
export GCP_INSTANCE="instance-20250812-075321"
export GCP_ZONE="us-central1-c"

# 수동 배포 스크립트 실행
./scripts/fix-ssh-deployment.sh
```

#### 2. 일반적인 문제들

**SSH Permission Denied:**

- SSH 키 전파 시간 부족 (자동으로 대기 시간 조정됨)
- OS Login 설정 충돌 (자동으로 비활성화됨)
- 인스턴스 상태 확인 (RUNNING 상태 확인)

**Cloud Storage 권한 문제:**

- 버킷 생성 권한 부족 시 대안 방법 사용
- Startup Script를 통한 배포로 자동 전환

**네트워크 연결 문제:**

- 인스턴스 방화벽 규칙 확인
- 외부 IP 할당 상태 확인

### 배포 상태 확인

- **GitHub Actions**: 배포 진행 상황 확인
- **라이브 사이트**: https://darkwinterlab.com
- **MCP API**: https://darkwinterlab.com/mcp/health

### 클로드 MCP 연결

클로드에서 다음 URL로 Custom Connector 추가:

```
https://darkwinterlab.com/mcp/jsonrpc
```

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다.
