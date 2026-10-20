-- IP별 하루 분석 횟수 (Neon Postgres)
-- Neon 콘솔 > SQL Editor 에서 한 번 실행한다.
-- IP 원문은 저장하지 않는다. 날짜별 솔트를 섞은 SHA-256 해시만 남기므로 날짜가 바뀌면 같은 IP 끼리도 이어지지 않는다.

CREATE TABLE IF NOT EXISTS analysis_daily_usage (
  ip_hash CHAR(64) NOT NULL,
  usage_date DATE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ip_hash, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_analysis_daily_usage_date
  ON analysis_daily_usage (usage_date);

-- 개인정보 처리방침의 보유기간(기록일로부터 7일)이 지난 기록 삭제(주기적으로 수동 실행)
-- DELETE FROM analysis_daily_usage WHERE usage_date < CURRENT_DATE - INTERVAL '7 days';
