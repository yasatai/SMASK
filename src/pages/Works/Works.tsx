import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageAtmos from "../../components/PageAtmos";
import { useReveal } from "../../useReveal";
import { KINDS, publishedWorks } from "../../data/works";
import "./Works.css";

/* 制作実績 一覧（統合仕様 B）。
   掲載可否は data/works.ts の published が持つ（CLIENT WORK は公開許可が要るため下書き）。 */
export default function Works() {
  useEffect(() => { document.title = "制作実績 ｜ SMASK"; }, []);
  /* 背景・演出はトップと同じ暗い世界に揃える（下層ページ共通の作法） */
  useReveal();

  const works = publishedWorks();
  /* 説明を出すのは、実際に掲載がある区分だけ（空の区分の説明は誤解を生む） */
  const kinds = KINDS.filter(k => works.some(w => w.kind === k.name));

  return (
    <>
      <LoadCurtain />
      <PageAtmos />
      <main className="wk-page">

        {/* ============ Hero ============ */}
        <section className="wk-hero">
          <span className="wk-eyebrow" data-reveal>WORKS</span>
          <h1 data-reveal>つくったものと<br />そこに込めた考え。</h1>
          <div className="wk-lead" data-reveal>
            <p>完成したWebサイトだけでなく、事業や課題をどのように理解し、情報、文章、導線、デザインへつなげたのかを紹介します。</p>
            <p>それぞれの制作でSMASKが担当した範囲を明確にし、制作の背景と考え方が分かる実績として掲載します。</p>
          </div>
        </section>

        {/* ============ 実績の区分 ============ */}
        <section className="wk-sec">
          <div className="wk-wrap">
            <span className="wk-eyebrow" data-reveal>CATEGORY</span>
            <h2 className="wk-h2" data-reveal>実績の区分</h2>
            <dl className="wk-kinds" data-reveal-stagger>
              {kinds.map(k => (
                <div className="wk-kind" key={k.name}>
                  <dt>{k.name}</dt>
                  <dd>{k.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ 実績一覧 ============ */}
        <section className="wk-sec">
          <div className="wk-wrap">
            <span className="wk-eyebrow" data-reveal>INDEX</span>
            <h2 className="wk-h2" data-reveal>実績一覧</h2>
            <ul className="wk-list">
              {works.map(w => (
                <li className="wk-item" key={w.slug} data-reveal>
                  <div className="wk-item-head">
                    <span className="wk-item-kind">{w.kind}</span>
                    <span className="wk-item-year">{w.year}</span>
                  </div>
                  <h3 className="wk-item-title">{w.title}</h3>
                  <p className="wk-item-type">{w.type}</p>
                  <p className="wk-item-bg">{w.background}</p>

                  <dl className="wk-item-facts">
                    <div>
                      <dt>主な課題</dt>
                      <dd><ul>{w.issues.map(t => <li key={t}>{t}</li>)}</ul></dd>
                    </div>
                    <div>
                      <dt>担当範囲</dt>
                      <dd className="wk-tags">{w.scope.map(t => <span key={t}>{t}</span>)}</dd>
                    </div>
                    <div>
                      <dt>実施した内容</dt>
                      <dd><ul>{w.done.map(t => <li key={t}>{t}</li>)}</ul></dd>
                    </div>
                  </dl>

                  <a className="wk-cta" href={`/works/${w.slug}`}>この実績の詳細を見る <span aria-hidden="true">→</span></a>
                </li>
              ))}
            </ul>
            {/* 掲載可能な実績が増えるまでの断り書き。空欄で並べるより、状態を書くほうが正確 */}
            <p className="wk-note" data-reveal>
              顧客案件（CLIENT WORK）は、公開の許可をいただけたものから順に掲載します。
            </p>
          </div>
        </section>

        {/* ============ 最終CTA ============ */}
        <section className="wk-sec wk-sec--end">
          <div className="wk-wrap">
            <h2 className="wk-h2 wk-h2--end" data-reveal>同じものをつくるのではなく<br />その事業に合うWebを考えます。</h2>
            <div className="wk-body" data-reveal>
              <p>事業や課題によって、必要なページ、文章、導線、デザインは異なります。</p>
              <p>現在考えていることを伺いながら、必要な制作内容を整理します。</p>
            </div>
            {/* 主導線3本のうち、このページで未提示の「事業内容」を並べる */}
            <div className="wk-actions" data-reveal>
              <a className="wk-cta" href="/contact">制作について相談する <span aria-hidden="true">→</span></a>
              <a className="wk-cta wk-cta--back" href="/business">事業内容を見る <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
