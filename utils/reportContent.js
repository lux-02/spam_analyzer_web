import fs from "fs";
import path from "path";
import { marked } from "marked";

// 분석 사례 글은 content/reports/<slug>.md 로 둔다. getStaticProps 에서만 부른다(서버 전용).
//
// 파일 맨 위 머리말(--- 사이)에 아래 키를 적는다. 값은 한 줄, keywords 는 쉼표로 구분.
//   title:       검색 결과에 나갈 제목 (필수)
//   description: 검색 결과 설명, 120~160자 권장 (필수)
//   date:        첫 게시일 YYYY-MM-DD (필수)
//   updated:     마지막 수정일 YYYY-MM-DD (없으면 date)
//   audience:    목록에 붙는 대상 표시. 예) 일반 사용자, 보안 실무자
//   blog:        블로그 전문 주소 (있으면 글 아래에 연결)
//   image:       대표 이미지 경로. public 아래 기준, 예) /reports/<slug>/cover.png
//   keywords:    핵심 검색어, 쉼표 구분
// 본문은 Markdown. 이미지는 public/reports/<slug>/ 에 두고 /reports/<slug>/파일명 으로 건다.

const CONTENT_DIR = path.join(process.cwd(), "content", "reports");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REQUIRED_KEYS = ["title", "description", "date"];

function parseFrontMatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: 머리말(--- 블록)이 없습니다`);

  const meta = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(":");
    if (index > 0) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  });

  const missing = REQUIRED_KEYS.filter((key) => !meta[key]);
  if (missing.length) throw new Error(`${file}: 머리말에 ${missing.join(", ")} 이(가) 없습니다`);

  return {
    meta: {
      title: meta.title,
      description: meta.description,
      date: meta.date,
      updated: meta.updated || meta.date,
      audience: meta.audience || "",
      blog: meta.blog || "",
      image: meta.image || "",
      keywords: meta.keywords ? meta.keywords.split(",").map((word) => word.trim()).filter(Boolean) : [],
    },
    body: match[2],
  };
}

function reportFiles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ file, slug: file.replace(/\.md$/, "") }))
    .filter(({ slug }) => SLUG_PATTERN.test(slug));
}

/**
 * 목록용 메타데이터. 최신 글이 먼저.
 * @returns {{ slug: string, title: string, description: string, date: string, updated: string, audience: string, image: string }[]}
 */
export function listReports() {
  return reportFiles()
    .map(({ file, slug }) => {
      const { meta } = parseFrontMatter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"), file);
      return { slug, ...meta };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 글 하나. 본문 Markdown 을 HTML 로 바꿔 돌려준다(저장소에 커밋된 글만 읽으므로 신뢰한다).
 * @param {string} slug
 * @returns {{ slug: string, meta: Object, html: string } | null}
 */
export function getReport(slug) {
  const entry = reportFiles().find((item) => item.slug === slug);
  if (!entry) return null;
  const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(CONTENT_DIR, entry.file), "utf8"), entry.file);
  return { slug, meta, html: marked.parse(body, { gfm: true }) };
}
