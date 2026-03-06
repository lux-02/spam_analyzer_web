import {
  checkSupabaseConnection,
  getSupabaseClient,
} from "../../utils/supabase";

const supabaseUrl = process.env.SUPABASE_URL || null;

export default async function handler(req, res) {
  try {
    const client = getSupabaseClient();

    if (!client) {
      return res.status(500).json({
        connected: false,
        error: "Supabase 클라이언트 초기화 실패",
      });
    }

    // 연결 테스트
    const isConnected = await checkSupabaseConnection();

    if (!isConnected) {
      // 테이블이 없을 수도 있으니 생성해보기
      try {
        const { error: createError } = await client.rpc(
          "create_email_analysis_table",
          {}
        );

        if (createError && !createError.message.includes("already exists")) {
          console.log("테이블 생성 시도:", createError);
        }
      } catch (createErr) {
        console.log("테이블 생성 시도 중 오류:", createErr);
      }
    }

    // 다시 연결 테스트
    const finalConnectionCheck = await checkSupabaseConnection();

    return res.status(200).json({
      connected: finalConnectionCheck,
      message: finalConnectionCheck
        ? "Supabase 연결이 정상적으로 작동 중입니다."
        : "Supabase 연결에 문제가 있습니다.",
      url: supabaseUrl,
      analysisStorage: "disabled",
      note: "개인정보 보호를 위해 이메일 분석 결과는 서버에 저장하지 않습니다.",
    });
  } catch (error) {
    console.error("Supabase 연결 확인 중 오류 발생:", error);
    return res.status(500).json({
      connected: false,
      error: "Supabase 연결 확인 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
