import { useEffect } from "react";
import BizArrival from "../../components/BizArrival";
import { useReveal } from "../../useReveal";
import GemCanvas from "./GemCanvas";
import "./WebContentV2.css";

/**
 * Webコンテンツ制作ページ V2（試作・trionn.com 参考の 3D + ダーク基調）。
 * - 本番の /business-web はそのまま。こちらは /business-web-v2 のURL直打ちのみ（メニュー非掲載）
 * - 文言は現行 WebContent.tsx と同一。新設は SELECTED WORKS（制作実績）のみ
 * - 実績カードの内容はサンプル（実案件名・掲載可否は代表確認のうえ差し替え）
 */

/* ---- 線画アイコン（現行ページと同じ） ---- */
const IC = {
  eyeOff: (
    <>
      <path d="M4 12s3.2-5 8-5c1.2 0 2.3.3 3.3.8M20 12s-3.2 5-8 5c-1.2 0-2.3-.3-3.3-.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.6 4.6 14.8 14.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  list: (
    <>
      <rect x="4.6" y="4.6" width="14.8" height="14.8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 12.4h8M8 15.8h4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3.4" y="5.8" width="17.2" height="12.4" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.2 7 7.8 5.6L19.8 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.9 9.9a2.2 2.2 0 1 1 3.3 1.9c-.8.5-1.2.9-1.2 1.8v.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r=".9" fill="currentColor" />
    </>
  ),
  send: (
    <>
      <path d="M20.4 4.2 3.6 10.4l6.6 2.6 2.6 6.6 7.6-15.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m4.6 17.8 4.2-4.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  refresh: (
    <>
      <path d="M19 12a7 7 0 0 1-11.9 5M5 12a7 7 0 0 1 11.9-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 4.4v3.2h-3.2M7 19.6v-3.2h3.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8.4" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.6 19.4c0-3.2 2.9-5.4 6.4-5.4s6.4 2.2 6.4 5.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  layout: (
    <>
      <rect x="4.6" y="4.6" width="14.8" height="14.8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.6 9.4h14.8M10.4 9.4v10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  route: (
    <>
      <path d="M7.4 4.6v10a2.6 2.6 0 0 0 2.6 2.6h4a2.6 2.6 0 0 1 2.6 2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 6.8 7.4 4.4l2.4 2.4M14 17.2l2.6 2.4 2.4-2.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3.6v2.2M12 18.2v2.2M20.4 12h-2.2M5.8 12H3.6M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};
type IcKey = keyof typeof IC;
const Icon = ({ d }: { d: IcKey }) => <svg viewBox="0 0 24 24" className="wc2-ic" aria-hidden="true">{IC[d]}</svg>;

/* ---- 文言（現行 WebContent.tsx と同一） ---- */
const CONCERNS: [IcKey, string][] = [
  ["eyeOff", "何をしている会社なのか外部に伝わりにくい"],
  ["list", "強みや実績が整理できていない"],
  ["mail", "問い合わせにつながりにくい"],
  ["help", "サービス内容がわかりづらい"],
  ["send", "情報発信の導線が弱い"],
  ["refresh", "更新や運用がしづらい"],
  ["person", "一部の業務が属人的になっている"],
];

const SERVICES: [IcKey, string, string][] = [
  [
    "layout",
    "企業や事業の伝わり方を整える",
    "企業サイト、サービス紹介ページ、採用ページ、実績・事例ページ、ランディングページなど、目的に応じたWebコンテンツを制作します。情報をただ並べるのではなく、相手に伝わる順番や見せ方を整理し、事業の内容や価値が伝わる構成へ落とし込みます。",
  ],
  [
    "route",
    "問い合わせ導線を整える",
    "サイトを作るだけでは、問い合わせや相談にはつながりません。SMASKでは、ページ構成、導線設計、CTAの配置、スマートフォンでの見やすさ、必要な情報にたどり着きやすさまで見直し、行動につながる流れを整えます。",
  ],
  [
    "gear",
    "運用や業務の流れを整える",
    "Webは公開して終わりではなく、運用しやすいことも重要です。更新しやすい構成づくりに加え、必要に応じて簡易な仕組みの整備や、受付・管理フローの整理など、日々の運用や業務負担を見据えた支援も行います。",
  ],
];

const STRENGTHS: [string, string, string][] = [
  ["01", "事業理解を前提に考える", "SMASKは、制作そのものを目的とせず、事業にとって本当に必要な形を整えることを重視しています。"],
  ["02", "見た目だけでなく運用まで考える", "現場や運用の実情を踏まえ、日々の使いやすさまで含めて設計します。"],
  ["03", "必要以上に複雑にしない", "過不足のない提案を行います。余分な機能や構成を加えず、目的に合った形に整えます。"],
  ["04", "Webと業務のつながりを意識する", "Webサイトと日々の業務フローを切り離さず、全体の流れとして捉えて支援します。"],
];

const PROCESS: [string, string, string][] = [
  ["01", "現状確認", "現在のWebサイトや情報発信の状況、運用方法、感じている課題を確認します。"],
  ["02", "課題整理", "何を改善すべきか、どこを優先すべきかを整理します。"],
  ["03", "構成・方針提案", "目的に応じて、必要なページ構成や導線、実装方針をご提案します。"],
  ["04", "制作・実装", "決定した内容に沿って、ページ制作や必要な仕組みの整備を進めます。"],
  ["05", "公開・運用開始", "公開後の運用を見据えた状態で、無理なくスタートできるよう整えます。"],
  ["06", "必要に応じた改善", "公開して終わりではなく、必要に応じて見直しや改善につなげます。"],
];

/* ---- SELECTED WORKS（※サンプル。実案件名・掲載可否は代表確認のうえ差し替え） ----
   img を指定すればタイポグラフィックカバーの代わりに写真が入る（/assets/works/xxx.jpg 想定） */
type Work = {
  num: string;
  title: string;
  en: string;
  tags: string[];
  year: string;
  img?: string;
  hue: number; // タイポカバーの色相（微差で単調さを避ける）
};
const WORKS: Work[] = [
  { num: "01", title: "SMASK コーポレートサイト", en: "SMASK CORPORATE", tags: ["コーポレートサイト", "企画・設計・実装"], year: "2026", hue: 78 },
  { num: "02", title: "貴金属価格管理システム", en: "PRICE MANAGEMENT", tags: ["業務システム", "管理画面・公開API"], year: "2026", hue: 258 },
  { num: "03", title: "不動産会社コーポレートサイト", en: "REAL ESTATE SITE", tags: ["コーポレートサイト"], year: "2025", hue: 150 },
  { num: "04", title: "外壁塗装サービスLP", en: "EXTERIOR PAINTING LP", tags: ["ランディングページ"], year: "2025", hue: 20 },
];

export default function WebContentV2() {
  useEffect(() => { document.title = "Webコンテンツ制作 ｜ SMASK"; }, []);

  /* ダーク基調ページの間だけ、サイドナビ・ロゴを紙色へ反転（ホームの暗色セクションと同じ仕組み） */
  useEffect(() => {
    document.documentElement.classList.add("is-fp-dark");
    return () => { document.documentElement.classList.remove("is-fp-dark"); };
  }, []);

  useReveal();

  return (
    <>
      <BizArrival />
      <main className="wc2-page">

        {/* ============ Hero（3Dジェム＋巨大タイポ） ============ */}
        <section className="wc2-hero">
          <GemCanvas />
          <div className="wc2-hero-copy">
            <span className="wc2-eyebrow">WEB CONTENT</span>
            <h1>
              <span className="wc2-hero-ln">Webコンテンツ</span>
              <span className="wc2-hero-ln">制作<em>.</em></span>
            </h1>
            <p className="wc2-hero-sub">現場理解をもとに、伝わるWebと業務の流れを整えます。</p>
          </div>
          <div className="wc2-hero-foot" aria-hidden="true">
            <span>CREATE</span><i>·</i><span>CONNECT</span><i>·</i><span>CONVERT</span>
          </div>
        </section>

        {/* ============ APPROACH ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <div className="wc2-head">
              <span className="wc2-eyebrow" data-reveal>APPROACH</span>
              <h2 className="wc2-h2" data-reveal>Web制作を、<br />見た目だけで終わらせない</h2>
            </div>
            <div className="wc2-approach-body">
              <p className="wc2-strong" data-reveal>
                Webサイトは、情報を載せるためだけのものではありません。企業や事業の強みを伝え、必要な相手に安心感を持ってもらい、問い合わせや次の行動につなげるための基盤です。
              </p>
              <p data-reveal>
                SMASKでは、見た目の整ったページを制作するだけではなく、事業内容の伝わりやすさ、情報の整理、導線のわかりやすさ、運用のしやすさまで含めて設計します。制作そのものを目的にするのではなく、事業にとって意味のある形で機能することを重視しています。
              </p>
            </div>
          </div>
        </section>

        {/* ============ SELECTED WORKS（新設・trionnのworksセクション参考） ============ */}
        <section className="wc2-sec wc2-works-sec">
          <div className="wc2-wrap">
            <div className="wc2-head wc2-head--works">
              <span className="wc2-eyebrow" data-reveal>SELECTED WORKS</span>
              <h2 className="wc2-h2" data-reveal>制作の記録<span className="wc2-amp">＆</span>試作</h2>
              <p className="wc2-works-lead" data-reveal>これまでに手がけたWebコンテンツの一部をご紹介します。</p>
            </div>
            <div className="wc2-works-grid">
              {WORKS.map(w => (
                <article className="wc2-work" key={w.num} data-reveal>
                  <div className="wc2-work-cover">
                    {w.img ? (
                      <div className="wc2-cover-art" style={{ backgroundImage: `url(${w.img})` }}></div>
                    ) : (
                      /* 画像が入るまではタイポグラフィックカバー */
                      <div className="wc2-cover-art wc2-cover-art--type" style={{ "--hue": w.hue } as React.CSSProperties}>
                        <span className="wc2-cover-num">{w.num}</span>
                        <span className="wc2-cover-en">{w.en}</span>
                      </div>
                    )}
                  </div>
                  <div className="wc2-work-meta">
                    <h3>{w.title}</h3>
                    <p>
                      {w.tags.map(t => <span key={t}>{t}</span>)}
                      <time>{w.year}</time>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CONCERNS ============ */}
        <section className="wc2-sec wc2-sec--panel">
          <div className="wc2-wrap">
            <div className="wc2-head">
              <span className="wc2-eyebrow" data-reveal>CONCERNS</span>
              <h2 className="wc2-h2" data-reveal>こんなお悩みに対応します</h2>
            </div>
            <ul className="wc2-concerns" data-reveal-stagger>
              {CONCERNS.map(([ic, text]) => (
                <li key={text}>
                  <span className="wc2-concern-ic"><Icon d={ic} /></span>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
            <p className="wc2-concern-note" data-reveal>
              このような課題は、単にページを作るだけでは解決しないことがあります。SMASKは、情報の整理、ページ構成、導線設計、必要に応じた仕組みづくりまで含めて、事業に合った形に整えます。
            </p>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <div className="wc2-head">
              <span className="wc2-eyebrow" data-reveal>SERVICES</span>
              <h2 className="wc2-h2" data-reveal>SMASKが提供できること</h2>
            </div>
            <div className="wc2-services">
              {SERVICES.map(([ic, title, body], i) => (
                <article className="wc2-service" key={title} data-reveal>
                  <span className="wc2-service-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="wc2-service-ic"><Icon d={ic} /></span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ STRENGTHS ============ */}
        <section className="wc2-sec wc2-sec--panel">
          <div className="wc2-wrap">
            <div className="wc2-head">
              <span className="wc2-eyebrow" data-reveal>STRENGTHS</span>
              <h2 className="wc2-h2" data-reveal>SMASKの強み</h2>
            </div>
            <p className="wc2-strengths-lead" data-reveal>
              SMASKは、制作そのものを目的とせず、事業にとって本当に必要な形を整えることを重視しています。現場や運用の実情を踏まえ、見た目だけでなく日々の使いやすさまで含めて、過不足のない提案を行います。
            </p>
            <div className="wc2-strengths" data-reveal-stagger>
              {STRENGTHS.map(([num, title, body]) => (
                <div className="wc2-strength" key={num}>
                  <span className="wc2-strength-num" aria-hidden="true">{num}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROCESS ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <div className="wc2-head">
              <span className="wc2-eyebrow" data-reveal>PROCESS</span>
              <h2 className="wc2-h2" data-reveal>ご相談から制作までの流れ</h2>
            </div>
            <ol className="wc2-process" data-reveal-stagger>
              {PROCESS.map(([num, title, body]) => (
                <li key={num}>
                  <span className="wc2-process-num">{num}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section className="wc2-sec wc2-contact">
          <div className="wc2-wrap">
            <span className="wc2-eyebrow" data-reveal>CONTACT</span>
            <h2 className="wc2-h2" data-reveal>まずはお気軽にご相談ください</h2>
            <p className="wc2-contact-lead" data-reveal>ご要望・ご予算に合わせて柔軟にご対応いたします</p>
            <a className="wc2-btn" href="/contact" data-reveal>
              お問い合わせはこちら
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13.4 5.6 19.8 12l-6.4 6.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          {/* 紙色のフッターへ橋渡しするグラデ帯 */}
          <div className="wc2-bridge" aria-hidden="true"></div>
        </section>

      </main>
    </>
  );
}
