import Head from "next/head";
import Link from "next/link";
import ReportLayout from "@/components/ReportLayout";
import { listReports } from "@/utils/reportContent";
import { SITE_URL, SITE_NAME, OG_IMAGE, buildBreadcrumbJsonLd, jsonLdHtml } from "@/utils/seo";

const TITLE = `스팸·피싱 메일 분석 사례 | ${SITE_NAME}`;
const DESCRIPTION =
  "실제로 받은 스팸·피싱 메일을 직접 분석한 사례 모음. 의심 신호, 공격 흐름, 대처법과 핵심 지표를 정리합니다.";

export default function ReportsIndex({ reports }) {
  const isEmpty = reports.length === 0;
  return (
    <ReportLayout>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/reports`} />
        {/* 글이 하나도 없을 때는 빈 목록이 색인되지 않게 막는다 */}
        {isEmpty && <meta name="robots" content="noindex" />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/reports`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdHtml(
            buildBreadcrumbJsonLd([
              { name: "홈", path: "/" },
              { name: "분석 사례", path: "/reports" },
            ])
          )}
        />
      </Head>

      <main className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold leading-tight text-heading dark:text-white">
          스팸·피싱 메일 분석 사례
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-light dark:text-gray-300">{DESCRIPTION}</p>

        {isEmpty ? (
          <p className="mt-12 text-sm text-text-light dark:text-gray-400">
            아직 공개한 분석 사례가 없습니다. 의심 메일은 첫 화면에서 바로 분석할 수 있습니다.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            {reports.map((report) => (
              <li key={report.slug} className="py-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-light dark:text-gray-400">
                  <time dateTime={report.date}>{report.date}</time>
                  {report.audience && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {report.audience}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-bold leading-snug text-heading dark:text-white">
                  <Link href={`/reports/${report.slug}`} className="hover:text-primary">
                    {report.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-light dark:text-gray-300">
                  {report.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </ReportLayout>
  );
}

export async function getStaticProps() {
  return { props: { reports: listReports() } };
}
