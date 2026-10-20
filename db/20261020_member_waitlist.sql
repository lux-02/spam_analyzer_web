-- 회원 기능 사전등록 (Neon Postgres)
-- Neon 콘솔 > SQL Editor 에서 한 번 실행한다.

CREATE TABLE IF NOT EXISTS member_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL UNIQUE,
  consented_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- 개인정보 처리방침의 보유기간(등록일 또는 재등록일로부터 1년)
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 year')
);

CREATE INDEX IF NOT EXISTS idx_member_waitlist_expires_at
  ON member_waitlist (expires_at);

-- 보유기간이 지난 등록 삭제(주기적으로 수동 실행)
-- DELETE FROM member_waitlist WHERE expires_at < NOW();
