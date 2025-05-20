import Head from "next/head";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Footer from "@/components/ui/Footer";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-text dark:text-white">
      <Head>
        <title>API 문서 - NAVER MAIL ANALYZER</title>
        <meta name="description" content="개발자를 위한 API 문서" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">NAVER MAIL ANALYZER</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API 문서</h1>
          <p className="text-gray-600 dark:text-gray-400">
            네이버 메일 분석기의 API를 사용하여 확장앱을 개발하는 방법을
            안내합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            외부 분석 API
          </h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">요청 정보</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-4">
              <p className="mb-2 font-mono">POST /api/external-analyze</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                이메일 원문 데이터를 분석하고 결과 페이지 URL을 반환합니다.
              </p>

              <h4 className="font-semibold mb-2">요청 헤더</h4>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-600">
                      <th className="p-2 text-left">헤더명</th>
                      <th className="p-2 text-left">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-mono">Content-Type</td>
                      <td className="p-2">application/json</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold mb-2">요청 본문 (JSON)</h4>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto mb-4">
                {`{
  "rawData": "From: sender@example.com\\nTo: recipient@example.com\\nSubject: Test Email\\n\\nThis is a test email body.",
  "apiKey": "your_api_key_here" // 추후 인증 방식이 변경될 수 있습니다
}`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">응답 정보</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h4 className="font-semibold mb-2">성공 응답 (200 OK)</h4>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto mb-4">
                {`{
  "success": true,
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "resultUrl": "https://your-domain.com/naver/email/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "message": "분석이 완료되었습니다."
}`}
              </pre>

              <h4 className="font-semibold mb-2">
                오류 응답 (400 Bad Request)
              </h4>
              <pre className="bg-gray-800 text-red-400 p-4 rounded-md overflow-x-auto">
                {`{
  "error": "올바른 이메일 원문 데이터가 아닙니다: 이메일 헤더 정보가 부족합니다."
}`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">코드 예제</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <h4 className="font-semibold mb-2">JavaScript (Fetch API)</h4>
              <pre className="bg-gray-800 text-blue-400 p-4 rounded-md overflow-x-auto">
                {`// 이메일 원문 데이터 분석 요청
async function analyzeEmail(rawData) {
  try {
    const response = await fetch('https://your-domain.com/api/external-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawData: rawData,
        apiKey: 'your_api_key_here' // 추후 인증 방식이 변경될 수 있습니다
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '분석 중 오류가 발생했습니다.');
    }
    
    // 분석 결과 페이지 URL
    const resultUrl = data.resultUrl;
    
    // 분석 결과 페이지로 이동하거나 URL을 사용자에게 제공
    window.open(resultUrl, '_blank');
    
    return data;
  } catch (error) {
    console.error('API 오류:', error);
    throw error;
  }
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">주의사항</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                API 사용량은 제한될 수 있으며, 대량 사용 시 별도 협의가
                필요합니다.
              </li>
              <li>
                사용자 개인정보가 포함된 데이터를 전송할 때는 개인정보보호법을
                준수해야 합니다.
              </li>
              <li>API 사양은 사전 공지 없이 변경될 수 있습니다.</li>
              <li>
                실제 운영 환경에서는 HTTPS를 사용하여 안전하게 데이터를 전송해야
                합니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            문의 및 지원
          </h2>
          <p className="mb-4">
            API 사용에 관한 문의사항이나 기술 지원이 필요하시면 아래 연락처로
            문의해 주세요.
          </p>
          <p className="font-semibold">
            이메일:{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-500 hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
