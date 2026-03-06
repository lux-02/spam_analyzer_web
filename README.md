# 네이버 이메일 스팸/피싱 분석기

이메일 원문을 분석하여 스팸/피싱 여부를 분석하는 웹 애플리케이션입니다.

**🌐 라이브 데모**: [https://darkwinterlab.com](https://darkwinterlab.com)  
**🤖 MCP API**: [https://darkwinterlab.com/mcp/](https://darkwinterlab.com/mcp/)

## 기능

- 이메일 헤더 분석 (SPF, DKIM, DMARC 등)
- 발신자 및 경유 서버 추적
- 링크 추출 및 위험도 분석
- 첨부 파일 분석
- LLM(OpenAI API)을 사용한 이메일 내용 분석
- 종합 위험도 평가
- 분석 데이터 서버 비저장(브라우저 세션 기반 결과 확인)

## 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- Python 3.8 이상
- pip (Python 패키지 관리자)

### 환경 변수

LLM 분석(이메일 의도 분석)을 사용하려면 서버 환경변수에 `OPENAI_API_KEY`가 필요합니다. (선택: `OPENAI_MODEL`, 기본값 `gpt-4o-mini`)

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

### 개선사항 (v1.2.0)

이전 버전에서 HyperCLOVAX-SEED 모델 로딩 시 발생하던 문제들을 해결하기 위해 다음과 같은 개선이 적용되었습니다:

1. **다단계 모델 로딩 전략**

   - 기본: HyperCLOVAX-SEED-Text-Instruct-0.5B
   - 대체: EleutherAI/polyglot-ko-1.3b
   - 최종: 로컬 키워드 기반 분석

2. **모델 로딩 옵션 개선**

   - `trust_remote_code=True` 옵션 추가로 차원 불일치 오류 해결
   - `torch_dtype=torch.float32` 명시적 지정
   - `device_map="auto"` 사용으로 자동 장치 할당

3. **의존성 관리 개선**

   - 명확한 버전 지정 및 설치 순서 최적화
   - 필수 패키지 추가: safetensors, regex, tqdm
   - macOS와 M1/M2 호환성 개선

4. **자동 페일오버(Failover) 메커니즘**
   - 모델 로드 실패 시 자동으로 대체 모델로 전환
   - API 통신 불가 시 로컬 키워드 분석으로 대체
   - 모델 상태 확인 엔드포인트 활용

### 알려진 이슈

1. **macOS에서 decord/av 패키지 설치 문제**

   - M1/M2 Mac에서는 decord 패키지 설치가 까다로울 수 있음
   - 선택적 기능이므로 없어도 핵심 기능은 작동함
   - 필요한 경우 conda를 통해 설치 가능: `conda install -c conda-forge decord`

2. **HyperCLOVAX 차원 불일치 오류**

   - 일부 환경에서는 여전히 HyperCLOVAX 모델 차원 불일치 오류가 발생할 수 있음
   - 이 경우 자동으로 대체 모델 또는 키워드 분석으로 전환됨

3. **포트 충돌 (macOS Airplay)**
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

### v1.2.0 - LLM 개선 업데이트 (2023-10-20)

- 다단계 모델 로딩 전략 구현
- LLM 모델 로딩 안정성 향상
- 의존성 관리 개선
- 로컬 키워드 분석 자동 대체 기능

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
