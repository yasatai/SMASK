import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadCurtain from "../../components/LoadCurtain";
import { fetchPostBySlug, formatDate, type PostDetail } from "../../data/posts";
import "./ColumnPost.css";

/**
 * コラム記事 詳細ページ（/column/:slug）。
 * slug はお知らせID。公開API（管理画面）から公開分を取り、ID一致の記事を表示する。
 * 直接URLアクセスでも動くよう、モジュール変数ではなく毎回APIから引く。
 * 見つからない／未公開／取得失敗のときは「記事が見つかりません」＋一覧へ戻る導線（404で固めない）。
 * デザインは本サイトのトーン（紙色・明朝）を流用。派手な新演出は付けない。
 */
export default function ColumnPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  /* 記事の取得（slug＝お知らせID で逆引き） */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPostBySlug(slug ?? "")
      .then(row => { if (alive) setPost(row); })
      .catch(() => { if (alive) setPost(null); }) /* 失敗時は見つからない扱い（誤った内容を出さない） */
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    document.title = post ? `${post.title} ｜ SMASK` : "コラム ｜ SMASK";
  }, [post]);

  /* 本文は素テキスト。改行で段落に分けて可読性を上げる */
  const paragraphs = post ? post.body.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      <LoadCurtain />
      <main className="cp-page">
        <div className="cp-wrap">

          {loading ? (
            <p className="cp-loading">読み込んでいます…</p>
          ) : post ? (
            <article className="cp-article">
              <header className="cp-head">
                <span className="cp-eyebrow">COLUMN</span>
                <h1 className="cp-title">{post.title}</h1>
                <div className="cp-meta">
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  )}
                  <span className="cp-cat">{post.category}</span>
                </div>
                <span className="cp-dash" aria-hidden="true"></span>
              </header>

              <div className="cp-body">
                {paragraphs.length > 0
                  ? paragraphs.map((p, i) => <p key={i} className="cp-p">{p}</p>)
                  : <p className="cp-p cp-body-empty">本文は準備中です。</p>}
              </div>

              <div className="cp-back">
                <a href="/column" className="cp-back-btn">コラム一覧へ戻る</a>
              </div>
            </article>
          ) : (
            <div className="cp-notfound">
              <h1 className="cp-nf-title">記事が見つかりません</h1>
              <p className="cp-nf-text">
                お探しの記事は公開が終了したか、まだ公開されていない可能性があります。
              </p>
              <a href="/column" className="cp-back-btn">コラム一覧へ戻る</a>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
