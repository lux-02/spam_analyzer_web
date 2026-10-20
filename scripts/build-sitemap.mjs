// npm run build 직전(prebuild)에 public/sitemap.xml 을 다시 만든다.
// 고정 페이지 + content/reports/*.md 의 머리말(date, updated)을 읽어 분석 사례 주소를 넣는다.
import fs from "fs";
import path from "path";

const SITE_URL = "https://mail.n2f.site";
const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "content", "reports");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const today = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/reports", changefreq: "weekly", priority: "0.8" },
  { loc: "/enterprise", changefreq: "monthly", priority: "0.6" },
  { loc: "/privacy-policy", changefreq: "monthly", priority: "0.3" },
];

const readMeta = (file) => {
  const head = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  (head ? head[1] : "").split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(":");
    if (index > 0) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  });
  return meta;
};

const reports = fs.existsSync(REPORT_DIR)
  ? fs
      .readdirSync(REPORT_DIR)
      .filter((file) => file.endsWith(".md") && SLUG_PATTERN.test(file.replace(/\.md$/, "")))
      .map((file) => {
        const meta = readMeta(path.join(REPORT_DIR, file));
        return {
          loc: `/reports/${file.replace(/\.md$/, "")}`,
          lastmod: meta.updated || meta.date || today,
          changefreq: "monthly",
          priority: "0.7",
        };
      })
  : [];

// 글이 없으면 빈 목록 페이지는 sitemap 에서 뺀다(목록 페이지도 noindex 처리됨)
const pages = [...STATIC_PAGES.filter((page) => page.loc !== "/reports" || reports.length > 0), ...reports];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${pages.length}개 주소 (분석 사례 ${reports.length}개)`);
