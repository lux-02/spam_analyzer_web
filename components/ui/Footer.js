import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-text-light dark:text-gray-400">
      <p className="mb-2">
        © 2025 NAVER MAIL ANALYZER - 이메일 분석 데이터는 안전한 데이터베이스에
        저장됩니다.
      </p>
      <p>
        <Link href="/privacy-policy" className="text-primary hover:underline">
          개인정보 처리방침
        </Link>
      </p>
    </footer>
  );
}
