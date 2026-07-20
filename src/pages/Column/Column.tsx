import { useEffect, useMemo, useState } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import {
  NO_POSTS, fetchPosts, formatDate, collectCategories,
  type Post, type PostCategory,
} from "../../data/posts";
import "./Column.css";

type Filter = "すべて" | PostCategory;

export default function Column() {
  const [posts, setPosts] = useState<Post[]>(NO_POSTS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("すべて");

  useEffect(() => { document.title = "コラム ｜ SMASK"; }, []);

  /* 記事の取得（未接続の間は0件＝「準備中」表示） */
  useEffect(() => {
    let alive = true;
    fetchPosts()
      .then(rows => { if (alive) setPosts(rows); })
      .catch(() => { /* 失敗時も0件のまま。誤った内容を出さない */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  /* カテゴリは記事から自動集計。記事が増減しても絞り込みが追従する */
  const categories = useMemo(() => collectCategories(posts), [posts]);
  const shown = useMemo(
    () => (filter === "すべて" ? posts : posts.filter(p => p.category === filter)),
    [posts, filter]
  );

  /* 記事が消えて選択中のカテゴリが無くなったら「すべて」に戻す */
  useEffect(() => {
    if (filter !== "すべて" && !categories.some(c => c.name === filter)) setFilter("すべて");
  }, [categories, filter]);

  const hasPosts = posts.length > 0;

  return (
    <>
      <LoadCurtain />
      <main className="cl-page">

        {/* ============ Hero ============ */}
        <section className="cl-hero">
          <span className="cl-eyebrow">COLUMN</span>
          <h1>コラム</h1>
          <p>貴金属・ジュエリー・Webの現場で考えていることを、少しずつ綴っていきます。</p>
          <span className="cl-hero-mark" aria-hidden="true"></span>
        </section>

        <section className="cl-sec">
          <div className="cl-wrap">

            {/* ---- カテゴリ絞り込み（記事があるときだけ） ---- */}
            {hasPosts && (
              <nav className="cl-filter" aria-label="カテゴリ">
                <button
                  type="button"
                  className={"cl-chip" + (filter === "すべて" ? " is-active" : "")}
                  aria-pressed={filter === "すべて"}
                  onClick={() => setFilter("すべて")}
                >
                  すべて<span className="cl-chip-n">{posts.length}</span>
                </button>
                {categories.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className={"cl-chip" + (filter === c.name ? " is-active" : "")}
                    aria-pressed={filter === c.name}
                    onClick={() => setFilter(c.name)}
                  >
                    {c.name}<span className="cl-chip-n">{c.count}</span>
                  </button>
                ))}
              </nav>
            )}

            {/* ---- 記事一覧 / 準備中 ---- */}
            {loading ? (
              <p className="cl-loading">読み込んでいます…</p>
            ) : hasPosts ? (
              <>
                <ul className="cl-list">
                  {shown.map(p => (
                    <li key={p.slug}>
                      <a className="cl-item" href={`/column/${p.slug}`}>
                        <span
                          className={"cl-thumb" + (p.thumbnail ? "" : " is-empty")}
                          aria-hidden="true"
                          style={p.thumbnail ? { backgroundImage: `url(${p.thumbnail})` } : undefined}
                        ></span>
                        <span className="cl-body">
                          <span className="cl-meta">
                            <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
                            <span className="cl-cat">{p.category}</span>
                          </span>
                          <span className="cl-title">{p.title}</span>
                          {p.excerpt && <span className="cl-excerpt">{p.excerpt}</span>}
                          <span className="cl-more">続きを読む <span aria-hidden="true">→</span></span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                {shown.length === 0 && (
                  <p className="cl-loading">このカテゴリの記事はまだありません。</p>
                )}
              </>
            ) : (
              /* 記事0件：一覧の枠は出さず、準備中の案内にする */
              <div className="cl-empty">
                <span className="cl-empty-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5.5 4.5h9.2l4.3 4.3v10.7H5.5V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M14.4 4.6v4.4h4.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M8.4 12.4h7.2M8.4 15.6h4.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <h2 className="cl-empty-title">記事を準備しています</h2>
                <p className="cl-empty-text">
                  貴金属の見極め方、ラボグロウンダイヤモンドの考え方、Webの伝わり方など、SMASKが日々向き合っていることを記事にしてお届けする予定です。公開まで、いましばらくお待ちください。
                </p>
                <a className="cl-empty-link" href="/contact">
                  お問い合わせはこちら <span aria-hidden="true">→</span>
                </a>
              </div>
            )}

          </div>
        </section>

      </main>
    </>
  );
}
