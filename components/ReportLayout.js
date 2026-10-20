import Link from "next/link";
import Footer from "@/components/ui/Footer";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * /reports 공통 틀. 기업용 베타 페이지와 같은 머리글을 쓴다.
 */
export default function ReportLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-text dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-wide text-heading hover:text-primary dark:text-white"
          >
            NAVER MAIL ANALYZER
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/reports" className="text-text-light hover:text-primary dark:text-gray-300">
              분석 사례
            </Link>
            <Link href="/#analyze" className="btn-primary btn-sm">
              메일 분석하기
            </Link>
            <ThemeToggle />
          </nav>
        </header>
        {children}
      </div>
      <Footer />
    </div>
  );
}
