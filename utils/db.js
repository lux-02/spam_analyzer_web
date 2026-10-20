import { neon } from "@neondatabase/serverless";

// Neon Postgres. 접속 문자열은 서버 환경변수에만 두고 브라우저로 내보내지 않는다.
let sql = null;

/**
 * Neon SQL 실행 함수를 돌려준다. DATABASE_URL 이 없으면 null.
 * @returns {Function|null}
 */
export function getSql() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn("DATABASE_URL 미설정: Neon 연결을 건너뜁니다");
      return null;
    }
    sql = neon(databaseUrl);
  }
  return sql;
}
