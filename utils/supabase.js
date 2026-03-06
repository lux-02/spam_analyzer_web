import { createClient } from "@supabase/supabase-js";

const EMAIL_ANALYSIS_TABLE = "email_analysis_results";
const MAX_RECENT_LIMIT = 100;

// Supabase 설정 (환경변수 필수)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const SUPABASE_TTL_DAYS = parsePositiveInt(process.env.SUPABASE_TTL_DAYS, 30);
const SUPABASE_CLEANUP_INTERVAL_MINUTES = parsePositiveInt(
  process.env.SUPABASE_CLEANUP_INTERVAL_MINUTES,
  60
);
const SUPABASE_CLEANUP_INTERVAL_MS =
  SUPABASE_CLEANUP_INTERVAL_MINUTES * 60 * 1000;

// Supabase 클라이언트 생성
let supabase = null;
let lastCleanupAt = 0;

const nowIso = () => new Date().toISOString();

const buildExpiresAt = (ttlDays) => {
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + ttlDays);
  return expiresAt.toISOString();
};

const isMissingExpiresColumnError = (error) => {
  if (!error) return false;

  const message = String(error.message || "").toLowerCase();
  const details = String(error.details || "").toLowerCase();
  const hint = String(error.hint || "").toLowerCase();

  return (
    message.includes("expires_at") ||
    details.includes("expires_at") ||
    hint.includes("expires_at") ||
    error.code === "PGRST204"
  );
};

const isExpired = (expiresAt, nowTimestamp = Date.now()) => {
  if (!expiresAt || typeof expiresAt !== "string") return false;

  const expiresTimestamp = Date.parse(expiresAt);
  if (Number.isNaN(expiresTimestamp)) return false;

  return expiresTimestamp <= nowTimestamp;
};

const getRowExpiresAt = (row) => {
  if (typeof row?.expires_at === "string" && row.expires_at) {
    return row.expires_at;
  }

  const metaExpiresAt = row?.email_data?._meta?.expiresAt;
  if (typeof metaExpiresAt === "string" && metaExpiresAt) {
    return metaExpiresAt;
  }

  return null;
};

const decorateEmailDataWithMeta = (emailData, ttlDays, storedAt, expiresAt) => {
  const safeData =
    emailData && typeof emailData === "object" && !Array.isArray(emailData)
      ? emailData
      : {};

  const existingMeta =
    safeData._meta && typeof safeData._meta === "object" ? safeData._meta : {};

  return {
    ...safeData,
    _meta: {
      ...existingMeta,
      storage: "supabase",
      storedAt,
      expiresAt,
      ttlDays,
    },
  };
};

async function runCleanupIfNeeded(client, { force = false } = {}) {
  if (!client) {
    return { ran: false, deleted: 0, reason: "no_client" };
  }

  const now = Date.now();
  if (!force && now - lastCleanupAt < SUPABASE_CLEANUP_INTERVAL_MS) {
    return { ran: false, deleted: 0, reason: "interval" };
  }

  lastCleanupAt = now;

  const { error, count } = await client
    .from(EMAIL_ANALYSIS_TABLE)
    .delete({ count: "exact" })
    .lt("expires_at", new Date(now).toISOString());

  if (error) {
    if (isMissingExpiresColumnError(error)) {
      return { ran: false, deleted: 0, reason: "expires_column_missing" };
    }

    console.warn("Supabase TTL 정리 오류:", error);
    return { ran: false, deleted: 0, reason: "cleanup_error" };
  }

  return { ran: true, deleted: count || 0, reason: "ok" };
}

async function ensureRetentionSchema(client) {
  try {
    const { error } = await client.rpc("exec_sql", {
      sql: `
        ALTER TABLE ${EMAIL_ANALYSIS_TABLE}
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

        CREATE INDEX IF NOT EXISTS idx_email_analysis_results_expires_at
        ON ${EMAIL_ANALYSIS_TABLE}(expires_at);
      `,
    });

    if (error) {
      // 권한/함수 미설정 환경에서는 스킵
      console.warn("TTL 스키마 보정 스킵:", error.message || error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("TTL 스키마 보정 예외(스킵):", error.message || error);
    return false;
  }
}

export function getSupabaseStorageConfig() {
  return {
    table: EMAIL_ANALYSIS_TABLE,
    ttlDays: SUPABASE_TTL_DAYS,
    cleanupIntervalMinutes: SUPABASE_CLEANUP_INTERVAL_MINUTES,
  };
}

export function getSupabaseClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        "Supabase 환경변수 미설정: SUPABASE_URL/SUPABASE_ANON_KEY 확인 필요"
      );
      return null;
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
}

export async function runSupabaseMaintenance({ force = false } = {}) {
  const client = getSupabaseClient();
  if (!client) {
    return { ran: false, deleted: 0, reason: "no_client" };
  }

  return runCleanupIfNeeded(client, { force });
}

/**
 * 이메일 분석 결과 저장
 * @param {string} analysisId - 분석 ID
 * @param {Object} emailData - 이메일 분석 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveEmailAnalysis(analysisId, emailData) {
  try {
    const client = getSupabaseClient();

    if (!client) {
      console.warn(
        "Supabase 클라이언트가 초기화되지 않음 - 환경 변수 확인 필요"
      );
      return false;
    }

    const storedAt = nowIso();
    const expiresAt = buildExpiresAt(SUPABASE_TTL_DAYS);
    const decoratedEmailData = decorateEmailDataWithMeta(
      emailData,
      SUPABASE_TTL_DAYS,
      storedAt,
      expiresAt
    );

    // 쓰기 경로에서 주기적으로 만료 데이터 정리
    await runCleanupIfNeeded(client);

    let { error } = await client.from(EMAIL_ANALYSIS_TABLE).upsert(
      {
        analysis_id: analysisId,
        email_data: decoratedEmailData,
        expires_at: expiresAt,
        updated_at: storedAt,
      },
      {
        onConflict: "analysis_id",
      }
    );

    if (error && isMissingExpiresColumnError(error)) {
      // 과거 스키마( expires_at 없음 )와 호환
      ({ error } = await client.from(EMAIL_ANALYSIS_TABLE).upsert(
        {
          analysis_id: analysisId,
          email_data: decoratedEmailData,
          updated_at: storedAt,
        },
        {
          onConflict: "analysis_id",
        }
      ));
    }

    if (error) {
      console.error("Supabase 저장 오류:", error);
      return false;
    }

    console.log(`Supabase에 분석 결과 저장 완료: ${analysisId}`);
    return true;
  } catch (error) {
    console.error("Supabase 저장 중 예외:", error);
    return false;
  }
}

/**
 * 이메일 분석 결과 조회
 * @param {string} analysisId - 분석 ID
 * @returns {Promise<Object|null>} 분석 결과
 */
export async function getEmailAnalysis(analysisId) {
  try {
    const client = getSupabaseClient();

    if (!client) {
      console.warn("Supabase 클라이언트가 초기화되지 않음");
      return null;
    }

    const { data, error } = await client
      .from(EMAIL_ANALYSIS_TABLE)
      .select("*")
      .eq("analysis_id", analysisId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // 데이터가 없음
        return null;
      }
      console.error("Supabase 조회 오류:", error);
      return null;
    }

    const expiresAt = getRowExpiresAt(data);
    if (isExpired(expiresAt)) {
      await client.from(EMAIL_ANALYSIS_TABLE).delete().eq("analysis_id", analysisId);
      return null;
    }

    return data?.email_data || null;
  } catch (error) {
    console.error("Supabase 조회 중 예외:", error);
    return null;
  }
}

/**
 * 최근 분석 결과 목록 조회
 * @param {number} limit - 가져올 개수 (기본 10개)
 * @returns {Promise<Array>} 최근 분석 결과 목록
 */
export async function getRecentAnalyses(limit = 10) {
  try {
    const client = getSupabaseClient();

    if (!client) {
      return [];
    }

    const safeLimit = Math.min(
      MAX_RECENT_LIMIT,
      Math.max(1, parsePositiveInt(String(limit), 10))
    );

    const baseQuery = client
      .from(EMAIL_ANALYSIS_TABLE)
      .order("created_at", { ascending: false })
      .limit(safeLimit * 2);

    let data = null;
    let error = null;

    ({ data, error } = await baseQuery.select(
      "analysis_id, email_data, created_at, expires_at"
    ));

    if (error && isMissingExpiresColumnError(error)) {
      ({ data, error } = await baseQuery.select(
        "analysis_id, email_data, created_at"
      ));
    }

    if (error) {
      console.error("최근 분석 결과 조회 오류:", error);
      return [];
    }

    const nowTimestamp = Date.now();
    const validRows = (data || []).filter(
      (row) => !isExpired(getRowExpiresAt(row), nowTimestamp)
    );

    return validRows.slice(0, safeLimit);
  } catch (error) {
    console.error("최근 분석 결과 조회 중 예외:", error);
    return [];
  }
}

/**
 * 데이터베이스 연결 상태 확인
 * @returns {Promise<boolean>} 연결 성공 여부
 */
export async function checkSupabaseConnection() {
  try {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    // 간단한 쿼리로 연결 테스트
    const { error } = await client
      .from(EMAIL_ANALYSIS_TABLE)
      .select("count(*)", { count: "exact", head: true });

    // 테이블이 없으면 테이블 생성 시도
    if (error && error.code === "42P01") {
      console.log("테이블이 없음. 생성을 시도합니다.");
      return await createTableIfNotExists(client);
    }

    if (error) {
      console.error("Supabase 연결 테스트 오류:", error);
      return false;
    }

    // 스키마/TTL 보정은 베스트에포트
    await ensureRetentionSchema(client);
    await runCleanupIfNeeded(client);

    return true;
  } catch (error) {
    console.error("Supabase 연결 테스트 오류:", error);
    return false;
  }
}

/**
 * 테이블 생성 함수
 * @param {Object} client - Supabase 클라이언트
 * @returns {Promise<boolean>} 생성 성공 여부
 */
async function createTableIfNotExists(client) {
  try {
    // SQL을 직접 실행하여 테이블 생성
    const { error } = await client.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS ${EMAIL_ANALYSIS_TABLE} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          analysis_id VARCHAR(255) UNIQUE NOT NULL,
          email_data JSONB NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_email_analysis_results_analysis_id
        ON ${EMAIL_ANALYSIS_TABLE}(analysis_id);

        CREATE INDEX IF NOT EXISTS idx_email_analysis_results_created_at
        ON ${EMAIL_ANALYSIS_TABLE}(created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_email_analysis_results_expires_at
        ON ${EMAIL_ANALYSIS_TABLE}(expires_at);
      `,
    });

    if (error) {
      console.error("테이블 생성 실패:", error);
      return false;
    }

    console.log("테이블 생성 성공");
    return true;
  } catch (error) {
    console.error("테이블 생성 중 오류:", error);
    return false;
  }
}
