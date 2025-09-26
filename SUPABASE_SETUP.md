# Supabase 데이터베이스 설정 가이드

## 🗄️ **테이블 생성**

Supabase Dashboard에서 다음 SQL을 실행하여 테이블을 생성하세요:

### 1. Supabase 대시보드 접속

- URL: https://supabase.com/dashboard
- 프로젝트: `<YOUR_PROJECT_REF>`

### 2. SQL Editor에서 테이블 생성

SQL Editor 탭으로 이동하여 다음 SQL을 실행:

```sql
-- 이메일 분석 결과 테이블 생성
CREATE TABLE IF NOT EXISTS email_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id VARCHAR(255) UNIQUE NOT NULL,
    email_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_email_analysis_results_analysis_id
ON email_analysis_results(analysis_id);

CREATE INDEX IF NOT EXISTS idx_email_analysis_results_created_at
ON email_analysis_results(created_at DESC);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성 (자동 업데이트 시간 갱신)
DROP TRIGGER IF EXISTS update_email_analysis_results_updated_at ON email_analysis_results;
CREATE TRIGGER update_email_analysis_results_updated_at
    BEFORE UPDATE ON email_analysis_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. RLS (Row Level Security) 설정

```sql
-- RLS 비활성화 (서버에서 관리)
ALTER TABLE email_analysis_results DISABLE ROW LEVEL SECURITY;
```

## 🔑 **환경 변수 설정**

### Vercel 환경 변수

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

```bash
# Supabase 설정
SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>

# 기타 API 키들
GEMINI_API_KEY=your_gemini_api_key_here
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

### 로컬 개발 환경 (.env.local)

```bash
# Supabase 설정
SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>

# 개발 모드
NODE_ENV=development
```

## 🔍 **연결 테스트**

### API 엔드포인트 테스트

```bash
# Supabase 연결 확인
curl http://localhost:3002/api/check-supabase

# 이메일 분석 테스트
curl -X POST http://localhost:3002/api/analyze-email \
  -H "Content-Type: application/json" \
  -d '{"rawData":"From: test@example.com\nTo: user@example.com\nSubject: Test Email\n\nTest content"}'
```

## 💾 **MongoDB에서 Supabase로 마이그레이션**

### 장점

1. **PostgreSQL 기반** - 더 강력한 쿼리 기능
2. **실시간 기능** - 실시간 데이터 동기화
3. **자동 API 생성** - REST/GraphQL API 자동 제공
4. **무료 사용량** - 월 500MB/5만 행 무료
5. **관리 편의성** - 웹 대시보드에서 모든 관리 가능

### 기존 MongoDB 데이터 마이그레이션

```javascript
// 기존 파일 시스템 데이터는 자동으로 Supabase로 마이그레이션됩니다
// getResult() 함수에서 파일 시스템 → Supabase 마이그레이션 자동 처리
```

## 📊 **테이블 구조**

### email_analysis_results 테이블

| 컬럼명      | 타입         | 설명                     |
| ----------- | ------------ | ------------------------ |
| id          | UUID         | 기본 키 (자동 생성)      |
| analysis_id | VARCHAR(255) | 분석 고유 ID (중복 불가) |
| email_data  | JSONB        | 이메일 분석 결과 JSON    |
| created_at  | TIMESTAMP    | 생성 시간 (자동)         |
| updated_at  | TIMESTAMP    | 수정 시간 (자동)         |

### 인덱스

- `idx_email_analysis_results_analysis_id`: analysis_id 검색 최적화
- `idx_email_analysis_results_created_at`: 최신 결과 조회 최적화

## 🚀 **배포 완료 확인**

1. **Supabase 테이블 생성** ✅
2. **환경 변수 설정** ✅
3. **코드 수정 완료** ✅
4. **Vercel 배포** ⏳
5. **기능 테스트** ⏳

모든 설정이 완료되면 MongoDB 없이도 완전히 작동하는 서버리스 애플리케이션이 됩니다!
