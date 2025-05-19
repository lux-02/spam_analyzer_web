import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ThemeToggle from "../components/ui/ThemeToggle";
import Link from "next/link";
import Footer from "../components/ui/Footer";
import AdBanner from "../components/ui/AdBanner";

export default function Home() {
  const [rawData, setRawData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataConsent, setDataConsent] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rawData.trim()) {
      setError("이메일 원문 데이터를 입력해주세요.");
      return;
    }

    if (!dataConsent) {
      setError("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다.");
      }

      // 결과에서 분석 ID 추출
      const analysisId = data.result?.id;

      // ID가 없으면 오류 처리
      if (!analysisId) {
        throw new Error(
          "분석 결과를 가져오는데 실패했습니다: 분석 ID를 찾을 수 없습니다."
        );
      }

      console.log("분석 완료, 결과 페이지로 이동합니다:", analysisId);

      // 분석 ID로 결과 페이지로 이동
      router.push(`/email/${analysisId}`);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white">
      <Head>
        <title>NAVER MAIL ANALYZER</title>
        <meta name="description" content="이메일 스팸/피싱 분석도구" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-heading dark:text-white">
            NAVER MAIL ANALYZER
          </h1>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-box shadow-custom rounded-xl p-6 w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-heading dark:text-white">
            네이버 메일 분석
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="rawData"
                className="block text-sm font-medium text-text dark:text-text-light mb-2"
              >
                이메일 원문 데이터 (Raw Data)
              </label>
              <textarea
                id="rawData"
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="form-textarea"
                placeholder="이메일 원문 데이터를 붙여넣으세요..."
              />
            </div>

            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="dataConsent"
                  type="checkbox"
                  checked={dataConsent}
                  onChange={(e) => setDataConsent(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="dataConsent"
                  className="text-text-light dark:text-text-light"
                >
                  개인정보 수집 및 이용에 동의합니다.{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    개인정보 처리방침
                  </Link>
                </label>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "분석 중..." : "이메일 분석하기"}
            </button>
          </form>

          <div className="mt-6 text-sm text-text-light space-y-2">
            <p>
              <strong>사용 방법</strong> 분석하려는 이메일의 원문 데이터를 위
              입력창에 붙여넣고 '이메일 분석하기' 버튼을 클릭하세요.
            </p>
            <p>
              <strong>이메일 원문 데이터 확인 방법</strong> 네이버 메일에서
              '더보기'(⋮) &gt; '원문 보기'를 선택하세요.
            </p>
          </div>
        </div>

        <div className="mt-8 w-full max-w-3xl mx-auto">
          <AdBanner slot="1234567890" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
