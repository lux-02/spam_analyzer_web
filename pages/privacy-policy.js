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

        <div className="bg-white dark:bg-box shadow-custom rounded-xl p-6 w-full max-w-5xl mx-auto mb-8">
          <h2 className="text-3xl font-bold mb-8 text-heading dark:text-white text-center">
            개인정보 처리방침 / Privacy Policy
          </h2>

          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <p>시행일자 / Effective Date: 2025년 1월 1일 (January 1, 2025)</p>
            <p>최종 수정일 / Last Updated: 2025년 1월 1일 (January 1, 2025)</p>
          </div>

          <div className="space-y-8 text-text dark:text-text-light">
            {/* Section 1 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                1. 수집하는 개인정보 항목 / Personal Information We Collect
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">
                  NAVER MAIL ANALYZER는 이메일 스팸 및 피싱 분석 서비스 제공을 위해 다음과 같은 정보를 수집합니다:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>이메일 헤더 정보:</strong> 발신자 이메일 주소, 수신자 이메일 주소, 이메일 제목, Return-Path, Reply-To, Received 헤더 (경로 및 타임스탬프 포함)</li>
                  <li><strong>이메일 본문:</strong> 전체 이메일 본문 텍스트 및 HTML 콘텐츠</li>
                  <li><strong>링크 정보:</strong> 이메일에 포함된 모든 URL, 도메인 정보, 링크 유효성 검증 결과</li>
                  <li><strong>첨부파일 정보:</strong> 첨부파일 이름, 확장자, 메타데이터 (파일 내용 자체는 수집하지 않음)</li>
                  <li><strong>IP 주소 및 네트워크 데이터:</strong> Received 헤더에서 추출한 발신 IP 주소, 지리적 위치, ISP 정보, DNS 조회 결과</li>
                  <li><strong>인증 정보:</strong> SPF, DKIM, DMARC 검증 결과</li>
                  <li><strong>분석 메타데이터:</strong> 분석 타임스탬프, 고유 분석 ID (UUID), 위험도 점수 및 분류</li>
                  <li><strong>세션 정보:</strong> 사용자 분석 이력 추적을 위한 쿠키 (analysis_ids)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">
                  NAVER MAIL ANALYZER collects the following information to provide email spam and phishing analysis services:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>Email Header Information:</strong> Sender email address, recipient email address, email subject, Return-Path, Reply-To, Received headers (including routing path and timestamps)</li>
                  <li><strong>Email Body:</strong> Full email body text and HTML content</li>
                  <li><strong>Link Information:</strong> All URLs embedded in the email, domain information, link validation results</li>
                  <li><strong>Attachment Information:</strong> Attachment file names, extensions, metadata (file contents are not collected)</li>
                  <li><strong>IP Addresses & Network Data:</strong> Source IP addresses extracted from Received headers, geographic location, ISP information, DNS lookup results</li>
                  <li><strong>Authentication Information:</strong> SPF, DKIM, DMARC validation results</li>
                  <li><strong>Analysis Metadata:</strong> Analysis timestamp, unique analysis ID (UUID), risk scores and classifications</li>
                  <li><strong>Session Information:</strong> Cookies for tracking user analysis history (analysis_ids)</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                2. 개인정보의 수집 및 이용 목적 / Purpose of Collection and Use
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">수집된 정보는 다음과 같은 목적으로만 이용됩니다:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>이메일의 스팸, 피싱, 악성코드 전달 여부 자동 분석</li>
                  <li>이메일 발신자 인증 검증 (SPF, DKIM, DMARC)</li>
                  <li>이메일 링크 및 첨부파일의 악성 여부 검사</li>
                  <li>이메일 전송 경로 추적 및 IP 지리적 위치 분석</li>
                  <li>AI 기반 이메일 의도 분류 (정상/스팸/피싱/악성코드)</li>
                  <li>사용자에게 이메일 위험도 평가 결과 제공</li>
                  <li>과거 분석 결과 조회 및 URL 공유 기능 제공</li>
                  <li>서비스 개선을 위한 익명화된 통계 데이터 분석</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">The collected information is used solely for the following purposes:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Automated analysis of spam, phishing, and malware delivery in emails</li>
                  <li>Verification of email sender authentication (SPF, DKIM, DMARC)</li>
                  <li>Scanning email links and attachments for malicious content</li>
                  <li>Tracking email transmission paths and analyzing IP geographic locations</li>
                  <li>AI-based email intent classification (legitimate/spam/phishing/malware)</li>
                  <li>Providing users with email risk assessment results</li>
                  <li>Providing access to historical analysis results and URL sharing features</li>
                  <li>Analyzing anonymized statistical data for service improvement</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                3. 개인정보의 보관, 보안 및 파기 / Data Storage, Security, and Deletion
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>

                <p className="font-semibold mt-3 mb-2">📦 데이터 저장 방식</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>주 저장소:</strong> Supabase PostgreSQL 데이터베이스에 저장</li>
                  <li><strong>백업 저장소:</strong> 데이터베이스 장애 시 로컬 파일 시스템에 임시 저장</li>
                  <li><strong>데이터 형식:</strong> JSON 형식으로 구조화되어 저장</li>
                </ul>

                <p className="font-semibold mt-3 mb-2">🔒 보안 조치</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>모든 데이터 전송 시 TLS/HTTPS 암호화 적용</li>
                  <li>데이터베이스 접근 자격 증명은 환경 변수로 안전하게 관리</li>
                  <li>API 키는 서버측에만 저장되며 클라이언트에 노출되지 않음</li>
                  <li>세션 쿠키는 HttpOnly 및 SameSite=Lax 플래그로 보호</li>
                  <li>사용자는 본인이 분석한 결과만 조회 가능</li>
                </ul>

                <p className="font-semibold mt-3 mb-2">🗑️ 데이터 보관 및 파기</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>보관 기간:</strong> 분석 데이터는 최대 90일간 보관 후 자동 삭제됩니다</li>
                  <li><strong>즉시 삭제 요청:</strong> 사용자는 언제든지 특정 분석 데이터의 즉시 삭제를 요청할 수 있습니다</li>
                  <li><strong>익명화 처리:</strong> 통계 분석 시에는 개인을 식별할 수 없는 형태로 가공된 데이터만 활용됩니다</li>
                  <li><strong>백업 데이터:</strong> 로컬 파일 시스템 백업도 동일한 90일 보관 정책을 따릅니다</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>

                <p className="font-semibold mt-3 mb-2">📦 Data Storage Methods</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>Primary Storage:</strong> Stored in Supabase PostgreSQL database</li>
                  <li><strong>Backup Storage:</strong> Temporarily stored in local file system during database failures</li>
                  <li><strong>Data Format:</strong> Stored in structured JSON format</li>
                </ul>

                <p className="font-semibold mt-3 mb-2">🔒 Security Measures</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>All data transmission encrypted with TLS/HTTPS</li>
                  <li>Database access credentials securely managed via environment variables</li>
                  <li>API keys stored server-side only and never exposed to clients</li>
                  <li>Session cookies protected with HttpOnly and SameSite=Lax flags</li>
                  <li>Users can only access their own analysis results</li>
                </ul>

                <p className="font-semibold mt-3 mb-2">🗑️ Data Retention and Deletion</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li><strong>Retention Period:</strong> Analysis data is automatically deleted after a maximum of 90 days</li>
                  <li><strong>Immediate Deletion Requests:</strong> Users can request immediate deletion of specific analysis data at any time</li>
                  <li><strong>Anonymization:</strong> Statistical analysis uses only anonymized data that cannot identify individuals</li>
                  <li><strong>Backup Data:</strong> Local file system backups follow the same 90-day retention policy</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                4. 개인정보의 제3자 제공 및 위탁 / Third-Party Sharing and Processing
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">
                  NAVER MAIL ANALYZER는 서비스 제공을 위해 다음과 같은 제3자 서비스를 이용합니다:
                </p>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-3 space-y-3">
                  <div>
                    <p className="font-semibold">🤖 OpenAI API</p>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      <li><strong>제공 정보:</strong> 이메일 본문 텍스트</li>
                      <li><strong>목적:</strong> AI 기반 이메일 의도 분류 (스팸/피싱 여부 판단)</li>
                      <li><strong>처리 방식:</strong> 실시간 API 호출, 저장되지 않음</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">🛡️ VirusTotal API</p>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      <li><strong>제공 정보:</strong> IP 주소 및 URL</li>
                      <li><strong>목적:</strong> 악성 IP 및 URL 평판 검사</li>
                      <li><strong>처리 방식:</strong> 실시간 API 호출</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">🗄️ Supabase</p>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      <li><strong>제공 정보:</strong> 전체 분석 결과 데이터</li>
                      <li><strong>목적:</strong> 데이터베이스 호스팅 및 저장</li>
                      <li><strong>처리 방식:</strong> 암호화된 연결을 통한 저장</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 font-semibold">⚠️ 중요 고지사항</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>위 제3자 서비스 이용은 서비스 제공에 필수적이며, 사용자의 동의 없이는 데이터가 제공되지 않습니다</li>
                  <li>법률에 의해 요구되는 경우를 제외하고는 사용자의 개인정보를 외부에 판매하거나 제공하지 않습니다</li>
                  <li>각 제3자 서비스는 자체 개인정보 처리방침을 따릅니다</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">
                  NAVER MAIL ANALYZER uses the following third-party services to provide its services:
                </p>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-3 space-y-3">
                  <div>
                    <p className="font-semibold">🤖 OpenAI API</p>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      <li><strong>Information Shared:</strong> Email body text only</li>
                      <li><strong>Purpose:</strong> AI-based email intent classification (spam/phishing detection)</li>
                      <li><strong>Processing:</strong> Real-time API calls, not stored</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">🛡️ VirusTotal API</p>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      <li><strong>Information Shared:</strong> IP addresses and URLs</li>
                      <li><strong>Purpose:</strong> Malicious IP and URL reputation checking</li>
                      <li><strong>Processing:</strong> Real-time API calls</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">🗄️ Supabase</p>
                    <ul className="list-disc ml-6 mt-1 text-sm">
                      <li><strong>Information Shared:</strong> Complete analysis result data</li>
                      <li><strong>Purpose:</strong> Database hosting and storage</li>
                      <li><strong>Processing:</strong> Storage via encrypted connections</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 font-semibold">⚠️ Important Notice</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Use of these third-party services is essential for service provision, and data is not shared without user consent</li>
                  <li>We do not sell or provide your personal information to external parties except as required by law</li>
                  <li>Each third-party service follows its own privacy policy</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                5. 사용자의 권리 및 행사 방법 / User Rights and How to Exercise Them
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">사용자는 개인정보에 대해 다음과 같은 권리를 가집니다:</p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>열람 요청:</strong> 본인의 분석 결과 데이터를 확인할 권리</li>
                  <li><strong>정정 요청:</strong> 잘못된 정보의 수정을 요청할 권리</li>
                  <li><strong>삭제 요청:</strong> 특정 분석 결과의 즉시 삭제를 요청할 권리</li>
                  <li><strong>처리 정지 요청:</strong> 개인정보 처리의 일시적 중단을 요청할 권리</li>
                  <li><strong>동의 철회:</strong> 제공한 동의를 언제든지 철회할 권리</li>
                  <li><strong>데이터 이동권:</strong> 본인의 데이터를 다른 서비스로 이동할 권리</li>
                </ul>

                <p className="mt-4 font-semibold">📞 권리 행사 방법</p>
                <p className="mt-2">
                  위 권리 행사는 개인정보 보호책임자에게 다음 방법으로 요청하실 수 있습니다:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>이메일: <a href="mailto:darkwinterlab@gmail.com" className="text-primary underline">darkwinterlab@gmail.com</a></li>
                  <li>웹사이트: <a href="https://darkwinterlab.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://darkwinterlab.com</a></li>
                  <li>처리 기한: 요청 접수 후 7일 이내 처리 (부득이한 사유 시 최대 30일)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">Users have the following rights regarding their personal information:</p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>Right to Access:</strong> Right to view your own analysis result data</li>
                  <li><strong>Right to Rectification:</strong> Right to request correction of inaccurate information</li>
                  <li><strong>Right to Erasure:</strong> Right to request immediate deletion of specific analysis results</li>
                  <li><strong>Right to Restriction:</strong> Right to request temporary suspension of personal information processing</li>
                  <li><strong>Right to Withdraw Consent:</strong> Right to withdraw provided consent at any time</li>
                  <li><strong>Right to Data Portability:</strong> Right to move your data to another service</li>
                </ul>

                <p className="mt-4 font-semibold">📞 How to Exercise Your Rights</p>
                <p className="mt-2">
                  You can exercise the above rights by contacting the Data Protection Officer through the following methods:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Email: <a href="mailto:darkwinterlab@gmail.com" className="text-primary underline">darkwinterlab@gmail.com</a></li>
                  <li>Website: <a href="https://darkwinterlab.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://darkwinterlab.com</a></li>
                  <li>Processing Time: Within 7 days of receiving the request (maximum 30 days in unavoidable circumstances)</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                6. 쿠키 및 추적 기술 / Cookies and Tracking Technologies
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">
                  NAVER MAIL ANALYZER는 다음과 같은 쿠키를 사용합니다:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>필수 쿠키:</strong>
                    <ul className="list-circle ml-6 mt-1 text-sm">
                      <li><code>analysis_ids</code>: 사용자의 분석 이력을 추적하는 쿠키</li>
                      <li>유효 기간: 90일</li>
                      <li>목적: 사용자가 본인이 분석한 이메일 결과에만 접근할 수 있도록 보장</li>
                    </ul>
                  </li>
                  <li><strong>기능 쿠키:</strong>
                    <ul className="list-circle ml-6 mt-1 text-sm">
                      <li>다크모드/라이트모드 테마 설정 (localStorage)</li>
                      <li>목적: 사용자 UI 선호도 저장</li>
                    </ul>
                  </li>
                </ul>
                <p className="mt-3 text-sm">
                  ℹ️ 브라우저 설정에서 쿠키를 거부할 수 있으나, 이 경우 일부 기능이 제한될 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">
                  NAVER MAIL ANALYZER uses the following cookies:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>Essential Cookies:</strong>
                    <ul className="list-circle ml-6 mt-1 text-sm">
                      <li><code>analysis_ids</code>: Cookie tracking user&apos;s analysis history</li>
                      <li>Validity: 90 days</li>
                      <li>Purpose: Ensure users can only access their own email analysis results</li>
                    </ul>
                  </li>
                  <li><strong>Functional Cookies:</strong>
                    <ul className="list-circle ml-6 mt-1 text-sm">
                      <li>Dark/light mode theme settings (localStorage)</li>
                      <li>Purpose: Store user UI preferences</li>
                    </ul>
                  </li>
                </ul>
                <p className="mt-3 text-sm">
                  ℹ️ You can refuse cookies in your browser settings, but some features may be limited.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                7. 개인정보 보호책임자 / Data Protection Officer
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">
                  개인정보 보호 관련 문의사항이 있으시면 아래 담당자에게 연락해 주시기 바랍니다:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-3">
                  <p><strong>책임자:</strong> 오윤석 (Yoon Seok Oh)</p>
                  <p><strong>이메일:</strong> <a href="mailto:darkwinterlab@gmail.com" className="text-primary underline">darkwinterlab@gmail.com</a></p>
                  <p><strong>웹사이트:</strong> <a href="https://darkwinterlab.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://darkwinterlab.com</a></p>
                  <p className="mt-2 text-sm">
                    개인정보 침해에 대한 신고나 상담이 필요한 경우, 아래 기관에 문의하실 수 있습니다:
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                    <li>개인정보침해신고센터: <a href="https://privacy.kisa.or.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">privacy.kisa.or.kr</a> / 국번없이 118</li>
                    <li>개인정보분쟁조정위원회: <a href="https://www.kopico.go.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.kopico.go.kr</a> / 1833-6972</li>
                    <li>대검찰청 사이버범죄수사단: <a href="https://www.spo.go.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.spo.go.kr</a> / 국번없이 1301</li>
                    <li>경찰청 사이버안전국: <a href="https://cyberbureau.police.go.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">cyberbureau.police.go.kr</a> / 국번없이 182</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">
                  If you have any questions regarding personal information protection, please contact the officer below:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-3">
                  <p><strong>Officer:</strong> Yoon Seok Oh (오윤석)</p>
                  <p><strong>Email:</strong> <a href="mailto:darkwinterlab@gmail.com" className="text-primary underline">darkwinterlab@gmail.com</a></p>
                  <p><strong>Website:</strong> <a href="https://darkwinterlab.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://darkwinterlab.com</a></p>
                  <p className="mt-2 text-sm">
                    For reporting or consulting on personal information infringement, you may contact the following organizations (Korea):
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                    <li>Privacy Infringement Report Center: <a href="https://privacy.kisa.or.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">privacy.kisa.or.kr</a> / Call 118</li>
                    <li>Personal Information Dispute Mediation Committee: <a href="https://www.kopico.go.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.kopico.go.kr</a> / 1833-6972</li>
                    <li>Supreme Prosecutors&apos; Office Cybercrime Investigation Unit: <a href="https://www.spo.go.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">www.spo.go.kr</a> / Call 1301</li>
                    <li>National Police Agency Cyber Safety Bureau: <a href="https://cyberbureau.police.go.kr" className="text-primary underline" target="_blank" rel="noopener noreferrer">cyberbureau.police.go.kr</a> / Call 182</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                8. 개인정보 처리방침 변경 / Changes to Privacy Policy
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2">
                  이 개인정보 처리방침은 2025년 1월 1일부터 적용됩니다.
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>법령, 정책 또는 보안기술 변경에 따라 내용의 추가, 삭제 및 수정이 있을 시에는 변경사항 시행 <strong>최소 7일 전</strong>에 본 웹사이트를 통해 공지하겠습니다</li>
                  <li>중요한 변경사항의 경우 <strong>30일 전</strong> 사전 공지를 실시합니다</li>
                  <li>변경된 개인정보 처리방침은 공지 시점부터 본 페이지에서 확인하실 수 있습니다</li>
                  <li>사용자는 변경된 방침에 동의하지 않을 경우 서비스 이용을 중단하고 개인정보 삭제를 요청할 수 있습니다</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2">
                  This Privacy Policy is effective from January 1, 2025.
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>If there are additions, deletions, or modifications due to changes in laws, policies, or security technologies, we will announce them through this website at least <strong>7 days before</strong> the changes take effect</li>
                  <li>For significant changes, we will provide <strong>30 days</strong> advance notice</li>
                  <li>The updated Privacy Policy will be available on this page from the time of announcement</li>
                  <li>If users do not agree with the updated policy, they may discontinue service use and request deletion of personal information</li>
                </ul>
              </div>
            </section>

            {/* Section 9 - Additional Legal Notice */}
            <section className="border-l-4 border-yellow-500 pl-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
              <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">
                9. 추가 법적 고지 / Additional Legal Notice
              </h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">🇰🇷 한국어</h4>
                <p className="mb-2 font-semibold">⚠️ 서비스 이용 시 유의사항</p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>본 서비스는 <strong>교육 및 보안 연구 목적</strong>으로 제공됩니다</li>
                  <li>타인의 이메일을 무단으로 분석하는 것은 불법이며, 사용자는 분석 대상 이메일에 대한 정당한 권한이 있어야 합니다</li>
                  <li>본 서비스의 분석 결과는 참고용이며, 법적 증거로 사용될 수 없습니다</li>
                  <li>서비스 제공자는 분석 결과의 정확성에 대해 보증하지 않으며, 사용자의 판단에 따른 결과에 대해 책임지지 않습니다</li>
                  <li>민감한 개인정보가 포함된 이메일은 분석을 자제하시기 바랍니다</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🇺🇸 English</h4>
                <p className="mb-2 font-semibold">⚠️ Important Service Usage Notice</p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>This service is provided for <strong>educational and security research purposes</strong></li>
                  <li>Analyzing others&apos; emails without authorization is illegal; users must have legitimate authority over the emails being analyzed</li>
                  <li>Analysis results from this service are for reference only and cannot be used as legal evidence</li>
                  <li>The service provider does not guarantee the accuracy of analysis results and is not responsible for consequences of user decisions</li>
                  <li>Please refrain from analyzing emails containing sensitive personal information</li>
                </ul>
              </div>
            </section>

            {/* Footer notice */}
            <div className="mt-8 pt-6 border-t-2 border-gray-300 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                본 개인정보 처리방침에 대해 궁금하신 사항이 있으시면 언제든지 문의해 주시기 바랍니다.<br />
                If you have any questions about this Privacy Policy, please feel free to contact us at any time.
              </p>
              <p className="mt-4 text-sm font-semibold">
                📧 <a href="mailto:darkwinterlab@gmail.com" className="text-primary underline">darkwinterlab@gmail.com</a>
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                © 2025 NAVER MAIL ANALYZER. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
