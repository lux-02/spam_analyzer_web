import Head from "next/head";
import Link from "next/link";
import ReportLayout from "@/components/ReportLayout";
import { getReport, listReports } from "@/utils/reportContent";
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  jsonLdHtml,
} from "@/utils/seo";
import styles from "@/styles/Report.module.css";

export default function ReportPage({ slug, meta, html, related }) {
  const url = `${SITE_URL}/reports/${slug}`;
  const image = meta.image ? `${SITE_URL}${meta.image}` : OG_IMAGE;

  return (
    <ReportLayout>
      <Head>
        <title>{`${meta.title} | ${SITE_NAME}`}</title>
        <meta name="description" content={meta.description} />
        {meta.keywords.length > 0 && <meta name="keywords" content={meta.keywords.join(", ")} />}
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="article:published_time" content={meta.date} />
        <meta property="article:modified_time" content={meta.updated} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={image} />
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(buildArticleJsonLd(slug, meta))} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdHtml(
            buildBreadcrumbJsonLd([
              { name: "홈", path: "/" },
              { name: "분석 사례", path: "/reports" },
              { name: meta.title, path: `/reports/${slug}` },
            ])
          )}
        />
      </Head>

      <main className="mx-auto max-w-3xl">
        <nav aria-label="breadcrumb" className="text-xs text-text-light dark:text-gray-400">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-2">/</span>
          <Link href="/reports" className="hover:text-primary">분석 사례</Link>
        </nav>

        <article className="mt-4">
          <header>
            <h1 className="text-3xl font-extrabold leading-tight text-heading dark:text-white md:text-4xl">
              {meta.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-light dark:text-gray-400">
              <span>오윤석 · {SITE_NAME} 개발자</span>
              <time dateTime={meta.date}>게시 {meta.date}</time>
              {meta.updated !== meta.date && <time dateTime={meta.updated}>수정 {meta.updated}</time>}
              {meta.audience && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {meta.audience}
                </span>
              )}
            </div>
          </header>

          {/* 저장소에 커밋된 Markdown 만 렌더링한다 */}
          <div className={`mt-8 ${styles.prose}`} dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <aside className="mt-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-heading dark:text-white">비슷한 메일을 받으셨나요?</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-light dark:text-gray-300">
            원문을 붙여넣으면 실제 발신 주소, SPF·DKIM·DMARC 인증, 수신 경로, 숨은 링크를 한 화면에서 확인할 수 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/#analyze" className="btn-primary btn-sm">메일 원문 분석하기</Link>
            {meta.blog && (
              <a href={meta.blog} className="btn-outline btn-sm" target="_blank" rel="noopener">
                블로그에서 전문 보기
              </a>
            )}
          </div>
        </aside>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-heading dark:text-white">다른 분석 사례</h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/reports/${item.slug}`} className="text-sm font-semibold text-heading hover:text-primary dark:text-white">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </ReportLayout>
  );
}

export async function getStaticPaths() {
  return { paths: listReports().map((report) => ({ params: { slug: report.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const report = getReport(params.slug);
  if (!report) return { notFound: true };
  const related = listReports()
    .filter((item) => item.slug !== params.slug)
    .slice(0, 3)
    .map(({ slug, title }) => ({ slug, title }));
  return { props: { ...report, related } };
}
