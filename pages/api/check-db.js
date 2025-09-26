import { checkSupabaseConnection } from "../../utils/supabase";

export default async function handler(req, res) {
  try {
    // Supabase 연결 확인
    const isConnected = await checkSupabaseConnection();

    if (!isConnected) {
      return res.status(500).json({
        connected: false,
        error: "Supabase 연결에 실패했습니다.",
      });
    }

    return res.status(200).json({
      connected: true,
      message: "Supabase 연결이 정상적으로 작동 중입니다.",
      database: "PostgreSQL (Supabase)",
      server: "https://crecmfkspiblkztvicqr.supabase.co",
    });
  } catch (error) {
    console.error("Supabase 연결 확인 중 오류 발생:", error);
    return res.status(500).json({
      connected: false,
      error: "데이터베이스 연결 확인 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
