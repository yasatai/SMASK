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
  /** URLに使う識別子（例: value-beyond-price） */
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

/** 記事が1件も無い状態 */
export const NO_POSTS: Post[] = [];

/**
 * 記事一覧の取得。
 *
 * ▼CMS接続時はこの関数だけを実装する（呼び出し側は変更不要）
 *   const res = await fetch("/api/posts?status=published");
 *   const rows = await res.json();
 *   return rows.map(r => ({
 *     slug: r.slug, title: r.title, excerpt: r.excerpt,
 *     publishedAt: r.published_at, category: r.category,
 *     thumbnail: r.thumbnail_url ?? null,
 *   }));
 *
 * 取得に失敗した場合は NO_POSTS を返すこと。
 * 古い記事や誤った内容を出すより、「準備中」の方が安全なため。
 */
export async function fetchPosts(): Promise<Post[]> {
  return NO_POSTS; // 未接続
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
