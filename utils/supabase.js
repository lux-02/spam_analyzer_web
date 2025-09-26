import { createClient } from "@supabase/supabase-js";

// Supabase 설정 (환경변수 필수)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Supabase 클라이언트 생성
let supabase = null;

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

    // 데이터 삽입 또는 업데이트
    const { data, error } = await client.from("email_analysis_results").upsert(
      {
        analysis_id: analysisId,
        email_data: emailData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "analysis_id",
      }
    );

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
      .from("email_analysis_results")
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

    const { data, error } = await client
      .from("email_analysis_results")
      .select("analysis_id, email_data, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("최근 분석 결과 조회 오류:", error);
      return [];
    }

    return data || [];
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

    // 간단한 쿼리로 연결 테스트 (테이블이 없어도 연결은 확인 가능)
    const { data, error } = await client
      .from("email_analysis_results")
      .select("count(*)", { count: "exact", head: true });

    // 테이블이 없으면 테이블 생성 시도
    if (error && error.code === "42P01") {
      console.log("테이블이 없음. 생성을 시도합니다.");
      return await createTableIfNotExists(client);
    }

    return !error;
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
        CREATE TABLE IF NOT EXISTS email_analysis_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          analysis_id VARCHAR(255) UNIQUE NOT NULL,
          email_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_analysis_results_analysis_id 
        ON email_analysis_results(analysis_id);
        
        CREATE INDEX IF NOT EXISTS idx_email_analysis_results_created_at 
        ON email_analysis_results(created_at DESC);
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
