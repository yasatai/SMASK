/**
 * コラム記事。
 *
 * 管理画面（CMS）から投稿する想定。現在は未接続で、記事0件の状態。
 * 接続時は fetchPosts() の中身だけを差し替えれば、表示側の変更は不要。
 *
 * 表示の約束：
 *   - 記事が0件のときは一覧を出さず、「準備中」の案内を表示する
 *   - カテゴリは記事から自動集計するので、増減しても絞り込みは自動で追従する
 */

export type PostCategory = "貴金属" | "ジュエリー" | "Web" | "お知らせ";

export type Post = {
  /** URLに使う識別子（お知らせIDの文字列。詳細ページはこの値で逆引きする） */
  slug: string;
  /** 記事タイトル */
  title: string;
  /** 一覧に出す要約。未設定なら本文冒頭を使う想定 */
  excerpt: string;
  /** 公開日（YYYY-MM-DD） */
  publishedAt: string;
  /** カテゴリ */
  category: PostCategory;
  /** サムネイル画像のURL。未設定は null（一覧では代替表示） */
  thumbnail: string | null;
};

/** 記事詳細（本文全文つき）。詳細ページ用 */
export type PostDetail = Post & { body: string };

/** 記事が1件も無い状態 */
export const NO_POSTS: Post[] = [];

/**
 * 取得元は管理画面（Laravel）の公開API `GET {VITE_PRICE_API_BASE}/api/public/notices`。
 * 価格API（metalPrices.ts）と同じオリジン・同じ環境変数を使う。
 * 返るのは公開済み（公開日時が到来した分）のみ。
 */
type ApiNotice = { id: number; title: string; category: string; business: string; body: string; published_at: string };
type ApiResponse = { data: ApiNotice[] };

const API_BASE = import.meta.env.VITE_PRICE_API_BASE ?? "";

/** 事業（管理画面の business）→ フロントの絞り込みカテゴリ */
const BUSINESS_TO_CATEGORY: Record<string, PostCategory> = {
  "貴金属": "貴金属",
  "ジュエリー制作": "ジュエリー",
  "Webコンテンツ制作": "Web",
};

/** 本文から一覧用の要約を作る（改行等を詰めて先頭90字＋「…」。空なら空文字） */
function toExcerpt(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (!flat) return "";
  return flat.length > 90 ? flat.slice(0, 90) + "…" : flat;
}

/** published_at(ISO) を YYYY-MM-DD に（端末ローカル日付） */
function toDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toPost(n: ApiNotice): Post {
  return {
    slug: String(n.id),
    title: n.title,
    excerpt: toExcerpt(n.body ?? ""),
    publishedAt: toDate(n.published_at),
    category: BUSINESS_TO_CATEGORY[n.business] ?? "お知らせ",
    thumbnail: null,
  };
}

/** 公開お知らせの取得。未設定/失敗時は空配列（誤った内容を出すより「準備中」が安全） */
async function fetchNotices(): Promise<ApiNotice[]> {
  if (!API_BASE) return [];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${API_BASE}/api/public/notices`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = (await res.json()) as ApiResponse;
    return json.data ?? [];
  } catch {
    return [];
  }
}

/**
 * 記事一覧の取得。取得元・失敗時とも、呼び出し側（Column）は変更不要。
 * 取得に失敗／未接続なら NO_POSTS を返す（0件＝「準備中」表示）。
 */
export async function fetchPosts(): Promise<Post[]> {
  const rows = await fetchNotices();
  if (rows.length === 0) return NO_POSTS;
  return rows.map(toPost);
}

/**
 * 記事詳細の取得。公開一覧から slug（=お知らせID）で逆引きする。
 * 見つからない／未公開／取得失敗のときは null（詳細ページは「記事が見つかりません」）。
 */
export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  const row = (await fetchNotices()).find(n => String(n.id) === slug);
  if (!row) return null;
  return { ...toPost(row), body: row.body ?? "" };
}

/** 日付を 2026.07.17 形式にする */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

/** 記事一覧からカテゴリを集計する（記事のあるものだけ・件数付き） */
export function collectCategories(posts: Post[]): { name: PostCategory; count: number }[] {
  const map = new Map<PostCategory, number>();
  posts.forEach(p => map.set(p.category, (map.get(p.category) ?? 0) + 1));
  return Array.from(map, ([name, count]) => ({ name, count }));
}
