-- 기업용 베타 사전신청 저장 테이블 (Neon Postgres)
-- Neon 콘솔 > SQL Editor 에서 한 번 실행한다.
-- 앱은 서버에서만 DATABASE_URL 로 접속하므로 브라우저에 노출되는 키가 없다.

CREATE TABLE IF NOT EXISTS enterprise_beta_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization VARCHAR(100) NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  contact_email VARCHAR(254) NOT NULL,
  daily_volume VARCHAR(20) NOT NULL,
  integrations TEXT[] NOT NULL DEFAULT '{}',
  ioc_formats TEXT[] NOT NULL DEFAULT '{}',
  message VARCHAR(2000),
  consented_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- 개인정보 처리방침의 보유기간(신청일로부터 1년)
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 year')
);

CREATE INDEX IF NOT EXISTS idx_enterprise_beta_requests_created_at
  ON enterprise_beta_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enterprise_beta_requests_expires_at
  ON enterprise_beta_requests (expires_at);

-- 보유기간이 지난 신청 삭제(주기적으로 수동 실행)
-- DELETE FROM enterprise_beta_requests WHERE expires_at < NOW();
