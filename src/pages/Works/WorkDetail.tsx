import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import LoadCurtain from "../../components/LoadCurtain";
import PageAtmos from "../../components/PageAtmos";
import { useReveal } from "../../useReveal";
import { findWork } from "../../data/works";
import "./Works.css";

/* 実績詳細（統合仕様 B「実績詳細ページ」1〜9）。
   7｜完成したWebサイト と 9｜公開後 は、内容がある実績だけ表示する
   （仕様で「行っている場合だけ掲載」とされているため、空の見出しは出さない）。 */
export default function WorkDetail() {
  const { slug } = useParams();
  const work = slug ? findWork(slug) : undefined;

  useEffect(() => {
    if (work) document.title = `${work.title} ｜ 制作実績 ｜ SMASK`;
  }, [work]);
  useReveal([slug]);

  /* 未公開・存在しないslugは一覧へ戻す */
  if (!work) return <Navigate to="/works" replace />;

  return (
    <>
      <LoadCurtain />
      <PageAtmos />
      <main className="wk-page wk-detail">

        {/* ============ Hero ============ */}
        <section className="wk-hero wk-hero--detail">
          <span className="wk-eyebrow" data-reveal>{work.kind}</span>
          <h1 data-reveal>{work.title}</h1>
          <p className="wk-detail-meta" data-reveal>{work.type}　/　{work.year}</p>
        </section>

        {/* ============ 1〜6 ============ */}
        <section className="wk-sec">
          <div className="wk-wrap">
            <ol className="wk-blocks">
              {work.blocks.map(b => (
                <li className="wk-block" key={b.no} data-reveal>
                  <div className="wk-block-mark">
                    <span className="wk-block-no">{b.no}</span>
                  </div>
                  <div className="wk-block-body">
                    <h2 className="wk-h2 wk-h2--block">{b.title}</h2>
                    <div className="wk-body">
                      {b.body.map(t => <p key={t}>{t}</p>)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ 7｜完成したWebサイト（画像がある実績のみ） ============ */}
        {work.shots.length > 0 && (
          <section className="wk-sec">
            <div className="wk-wrap">
              <span className="wk-eyebrow" data-reveal>SCREENS</span>
              <h2 className="wk-h2" data-reveal>完成したWebサイト</h2>
              <ul className="wk-shots" data-reveal-stagger>
                {work.shots.map(s => (
                  <li className={`wk-shot wk-shot--${s.device.toLowerCase()}`} key={s.src}>
                    <img src={s.src} alt={s.alt} loading="lazy" />
                    <span>{s.device}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ============ 8｜担当範囲 ============ */}
        <section className="wk-sec">
          <div className="wk-wrap">
            <span className="wk-eyebrow" data-reveal>SCOPE</span>
            <h2 className="wk-h2" data-reveal>担当範囲</h2>
            {/* 仕様：実際に担当した作業だけを並べる */}
            <ul className="wk-scope" data-reveal-stagger>
              {work.scope.map(t => <li key={t}>{t}</li>)}
            </ul>
            <div className="wk-body" data-reveal>
              <p>実施した内容：{work.done.join("、")}。</p>
            </div>
          </div>
        </section>

        {/* ============ 9｜公開後（該当する実績のみ） ============ */}
        {work.after.length > 0 && (
          <section className="wk-sec">
            <div className="wk-wrap">
              <span className="wk-eyebrow" data-reveal>AFTER RELEASE</span>
              <h2 className="wk-h2" data-reveal>公開後</h2>
              <div className="wk-body" data-reveal>
                {work.after.map(t => <p key={t}>{t}</p>)}
              </div>
            </div>
          </section>
        )}

        {/* ============ 最終CTA ============ */}
        <section className="wk-sec wk-sec--end">
          <div className="wk-wrap">
            <h2 className="wk-h2 wk-h2--end" data-reveal>同じものをつくるのではなく<br />その事業に合うWebを考えます。</h2>
            <div className="wk-body" data-reveal>
              <p>事業や課題によって、必要なページ、文章、導線、デザインは異なります。</p>
            </div>
            <div className="wk-actions" data-reveal>
              <a className="wk-cta" href="/contact">制作について相談する <span aria-hidden="true">→</span></a>
              <a className="wk-cta wk-cta--back" href="/works">実績一覧へ戻る <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
