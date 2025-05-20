import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
import AdBanner from "@/components/ui/AdBanner";
import { isValidEmailRawData } from "@/utils/validators";

// 이메일 원문 데이터 유효성 검증 함수
// const isValidEmailRawData = (rawData) => {
//   // 필수 이메일 헤더 필드 중 최소 1개 이상 존재하는지 확인
//   const requiredHeaders = [
//     "From:",
//     "To:",
//     "Subject:",
//     "Date:",
//     "Received:",
//     "Message-ID:",
//   ];
//   const foundHeaders = requiredHeaders.filter((header) =>
//     rawData.includes(header)
//   );

//   // 최소 길이 확인 (메일 원문은 보통 수백 바이트 이상)
//   const minLength = 100;

//   // 이메일 본문 구분자가 있는지 확인
//   const hasBodySeparator = rawData.includes("\n\n");

//   // 검증 결과
//   return {
//     isValid:
//       foundHeaders.length >= 1 &&
//       rawData.length > minLength &&
//       hasBodySeparator,
//     reason:
//       foundHeaders.length < 1
//         ? "이메일 헤더 정보가 부족합니다."
//         : rawData.length <= minLength
//         ? "메일 원문 데이터가 너무 짧습니다."
//         : !hasBodySeparator
//         ? "이메일 형식이 올바르지 않습니다."
//         : "",
//   };
// };

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

    // 원문 데이터 유효성 검사
    const validation = isValidEmailRawData(rawData);
    if (!validation.isValid) {
      setError(`올바른 이메일 원문 데이터가 아닙니다: ${validation.reason}`);
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
      router.push(`/naver/email/${analysisId}`);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // 실시간 유효성 검사 결과
  const getValidationHint = () => {
    if (!rawData.trim()) return null;

    const validation = isValidEmailRawData(rawData);
    if (!validation.isValid) {
      return (
        <div className="text-red-500 text-sm mt-1">{validation.reason}</div>
      );
    }
    return (
      <div className="text-green-500 text-sm mt-1">
        올바른 이메일 원문 형식입니다.
      </div>
    );
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
              {getValidationHint()}
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

          {/* 확장 프로그램 설치 카드 */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-3 text-heading dark:text-white">
              확장 프로그램으로 간편하게 사용하기
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 크롬 웹스토어 카드 */}
              <a
                href="https://chromewebstore.google.com/detail/egiihcmplomfonhicnabpifjpgkhcimi?utm_source=item-share-cb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 mb-3">
                  <img
                    src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg"
                    alt="Chrome Web Store"
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                    Chrome 웹스토어
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    크롬 브라우저용 확장 프로그램
                  </p>
                </div>
              </a>

              {/* 네이버 웨일 스토어 카드 */}
              <a
                href="https://store.whale.naver.com/detail/iifpjpbmgopecnfibfnakgobibghhien"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 mb-3">
                  <img
                    src="https://shared-whale.pstatic.net/favicon/store/icon.png"
                    alt="Whale Store"
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-1">
                    웨일 스토어
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    네이버 웨일 브라우저용 확장앱
                  </p>
                </div>
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              브라우저 확장 프로그램을 설치하면 네이버 메일에서 바로 분석할 수
              있습니다
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
