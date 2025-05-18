import Head from "next/head";
import Link from "next/link";
import Footer from "../components/ui/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white">
      <Head>
        <title>개인정보 처리방침 - NAVER MAIL ANALYZER</title>
        <meta
          name="description"
          content="NAVER MAIL ANALYZER의 개인정보 처리방침"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-heading dark:text-white hover:text-primary">
              📧 NAVER MAIL ANALYZER
            </h1>
          </Link>
        </div>

        <div className="bg-white dark:bg-box shadow-custom rounded-xl p-6 w-full max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-6 text-heading dark:text-white">
            개인정보 처리방침
          </h2>

          <div className="space-y-6 text-text dark:text-text-light">
            <section>
              <h3 className="text-xl font-semibold mb-2">
                1. 수집하는 개인정보 항목
              </h3>
              <p>
                NAVER MAIL ANALYZER는 이메일 분석 서비스 제공을 위해 다음과 같은
                정보를 수집합니다:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>이메일 원문 데이터 (헤더 정보, 본문 내용)</li>
                <li>발신자 정보 (이메일 주소)</li>
                <li>수신자 정보 (이메일 주소)</li>
                <li>이메일 제목</li>
                <li>이메일에 포함된 링크 및 첨부파일 정보</li>
                <li>이메일 전송 경로 정보 (IP 주소)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                2. 개인정보의 수집 및 이용 목적
              </h3>
              <p>수집된 정보는 다음과 같은 목적으로만 이용됩니다:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>이메일의 스팸 및 피싱 여부 분석</li>
                <li>사용자에게 이메일 위험도 평가 결과 제공</li>
                <li>서비스 개선을 위한 통계 데이터 분석</li>
                <li>사용자 요청 시 과거 분석 결과 조회 제공</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                3. 개인정보의 보관 및 파기
              </h3>
              <p>
                수집된 개인정보는 MongoDB 데이터베이스에 암호화되어 저장되며,
                다음과 같은 보관 정책을 따릅니다:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>분석 데이터는 최대 90일간 보관 후 자동 삭제됩니다.</li>
                <li>
                  사용자는 언제든지 특정 분석 데이터의 삭제를 요청할 수
                  있습니다.
                </li>
                <li>
                  서비스 개선을 위한 통계 분석 시에는 개인을 식별할 수 없는
                  형태로 가공된 데이터만 활용됩니다.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                4. 개인정보의 제3자 제공
              </h3>
              <p>
                NAVER MAIL ANALYZER는 사용자의 개인정보를 외부에 제공하지
                않습니다. 단, 법률에 의해 요구되는 경우는 예외로 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">5. 사용자의 권리</h3>
              <p>사용자는 개인정보에 대해 다음과 같은 권리를 가집니다:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>개인정보 열람 요청</li>
                <li>오류 정정 요청</li>
                <li>삭제 요청</li>
                <li>처리 정지 요청</li>
              </ul>
              <p className="mt-2">
                위 권리 행사는 개인정보 보호책임자에게 서면, 전화 또는 이메일로
                연락하여 요청하실 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                6. 개인정보 보호책임자
              </h3>
              <p>개인정보 보호책임자는 다음과 같습니다:</p>
              오윤석{" "}
              <a href="mailto:darkwinterlab@gmail.com">
                darkwinterlab@gmail.com
              </a>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">
                7. 개인정보 처리방침 변경
              </h3>
              <p>
                이 개인정보 처리방침은 2025년 1월 1일부터 적용됩니다. 법령, 정책
                또는 보안기술 변경에 따라 내용의 추가, 삭제 및 수정이 있을
                시에는 변경사항 시행 7일 전에 본 웹사이트를 통해 공지하겠습니다.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
