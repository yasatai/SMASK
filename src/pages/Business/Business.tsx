import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageAtmos from "../../components/PageAtmos";
import { useReveal } from "../../useReveal";
import "./Business.css";

/* 統合仕様 A「事業内容」の6工程。
   見出しは仕様の改行位置を保つが、行末の「、」は落とす（共通ルール②「行末に『、』を
   残さない」。残すと useJaTypography が改行そのものを取り消し、1行に潰れる）。
   本文は1文1段落。 */
const STEPS: { no: string; head: [string, string]; body: [string, string] }[] = [
  {
    no: "01",
    head: ["Webをつくる前に", "事業を理解する。"],
    body: [
      "事業やサービス、顧客、競合、既存サイトや社内資料を確認し、制作の前提を整理します。",
      "企業の中では当たり前になっている価値や強みを見つけ、Webで何を伝えるべきかを明確にします。",
    ],
  },
  {
    no: "02",
    head: ["伝える内容を選び", "伝わる順番に整える。"],
    body: [
      "誰に、何を、どのページで伝えるのかを整理し、サイト全体の構成と導線を設計します。",
      "問い合わせ、採用、資料閲覧など、目的に応じて次の行動へ進みやすい流れをつくります。",
    ],
  },
  {
    no: "03",
    head: ["伝えたいことを", "読まれる言葉へ。"],
    body: [
      "ヒアリングや既存資料をもとに、ヒーローコピー、見出し、本文、CTA、FAQなど、Webサイトに必要な文章を構築します。",
      "企業側の言葉をそのまま並べるのではなく、読み手が理解しやすい表現へ整理します。",
    ],
  },
  {
    no: "04",
    head: ["情報の意味を", "画面の体験へ変える。"],
    body: [
      "情報の優先順位と導線をもとに、企業やサービスの価値が伝わる画面を設計します。",
      "見た目の美しさだけでなく、読みやすさ、使いやすさ、スマートフォンでの見え方まで考えて制作します。",
    ],
  },
  {
    no: "05",
    head: ["デザインの意図を", "実装できる仕様へ。"],
    body: [
      "画面構成、機能、表示状態、レスポンシブ、操作時の動きなどを実装仕様へ整理します。",
      "エンジニアと連携し、デザインと実際のWebサイトにずれが生まれにくい状態をつくります。",
    ],
  },
  {
    no: "06",
    head: ["公開して終わらない", "使い続けられるWebへ。"],
    body: [
      "情報更新、コンテンツ追加、アクセス状況の確認、導線の見直しなど、公開後の運用も考えて設計します。",
      "案件に必要な範囲を整理し、Webサイトを事業の中で継続して活用できる状態を目指します。",
    ],
  },
];

/* 対応する制作（統合仕様 A） */
const WORKS: string[] = [
  "コーポレートサイト",
  "サービスサイト",
  "採用サイト",
  "ランディングページ",
  "既存サイトのリニューアル",
  "Webサイト内の文章・コンテンツ制作",
  "公開後の運用・改善",
];

/* 各工程の英字ラベル。日本語見出しの意味を短く言い直す（装飾ではなく索引） */
const STEP_EN = ["UNDERSTAND", "STRUCTURE", "WRITE", "DESIGN", "BUILD", "OPERATE"];

export default function Business() {
  useEffect(() => { document.title = "事業内容 ｜ SMASK"; }, []);
  /* 背景・演出はトップと同じ暗い世界に揃える（下層ページ共通の作法） */
  useReveal();

  return (
    <>
      <LoadCurtain />
      <PageAtmos />
      <main className="bz-page">

        {/* ============ Hero ============ */}
        <section className="bz-hero">
          <span className="bz-eyebrow" data-reveal>BUSINESS</span>
          <h1 data-reveal>伝わるWebを<br />動かすまで。</h1>
          <div className="bz-lead" data-reveal>
            <p>SMASKは、事業を理解するところから、情報整理、文章、導線、デザイン、実装連携、公開後の運用までをつなぐWebコンテンツ制作会社です。</p>
            <p>見た目を整えるだけではなく、誰に何を伝え、どの行動につなげるのかを考え、事業に使えるWebサイトを制作します。</p>
          </div>
          <a className="bz-cta" href="/contact" data-reveal>制作について相談する <span aria-hidden="true">→</span></a>
        </section>

        {/* ============ 6工程 ============
            理解 → 設計 → 文章 → デザイン → 実装 → 公開後 の順序そのものが内容なので、
            番号を振り、縦の線でつないで「流れ」として見せる。 */}
        <section className="bz-sec bz-sec--steps">
          <div className="bz-wrap">
            <ol className="bz-steps">
              {STEPS.map((s, i) => (
                <li className="bz-step" key={s.no} data-reveal>
                  <div className="bz-step-mark">
                    <span className="bz-step-no">{s.no}</span>
                    <span className="bz-step-en">{STEP_EN[i]}</span>
                  </div>
                  <div className="bz-step-body">
                    <h2 className="bz-h2">{s.head[0]}<br />{s.head[1]}</h2>
                    <div className="bz-body">
                      {s.body.map(t => <p key={t}>{t}</p>)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ 対応する制作 ============ */}
        <section className="bz-sec">
          <div className="bz-wrap">
            <span className="bz-eyebrow" data-reveal>WHAT WE MAKE</span>
            <h2 className="bz-h2 bz-h2--sec" data-reveal>対応する制作</h2>
            <ul className="bz-works" data-reveal-stagger>
              {WORKS.map(w => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </section>

        {/* ============ 最終CTA ============ */}
        <section className="bz-sec bz-sec--end">
          <div className="bz-wrap">
            <h2 className="bz-h2 bz-h2--sec" data-reveal>何をつくるかが<br />まだ決まっていなくても大丈夫です。</h2>
            <div className="bz-body" data-reveal>
              <p>現在の事業や課題を伺いながら、必要なページ、内容、制作範囲を整理します。</p>
            </div>
            {/* 主導線3本（事業内容を知る／制作実績を確認する／相談する）のうち、
                このページで未提示の「制作実績」を並べて次の一手を切らさない */}
            <div className="bz-actions" data-reveal>
              <a className="bz-cta" href="/contact">制作について相談する <span aria-hidden="true">→</span></a>
              <a className="bz-cta bz-cta--sub" href="/works">制作実績を見る <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
