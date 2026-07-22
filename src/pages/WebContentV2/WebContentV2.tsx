import { useEffect, useRef, useState } from "react";
import { useReveal } from "../../useReveal";
import Scene3D from "./Scene3D";
import "./WebContentV2.css";

/**
 * Webコンテンツ制作 V2（試作）— trionn.com を構造の参照点にした「別世界」ページ。
 * - 本サイトの世界観（明朝・金・紙色）から意図的に切り離す：漆黒×クローム×虹、Unbounded/Inter
 * - 3D はページ全面固定の Scene3D（スクロールで振り付け）。ダイヤモンドは廃止
 * - 文言は現行 /business-web と同一。WORKS はサンプル（実案件名は代表確認のうえ差し替え）
 * - BizArrival は使わず、独自のカウンター式ローダーで入場（世界の切り替えを演出）
 */

/* ---- 文言（現行 WebContent.tsx と同一） ---- */
const CONCERNS: string[] = [
  "何をしている会社なのか外部に伝わりにくい",
  "強みや実績が整理できていない",
  "問い合わせにつながりにくい",
  "サービス内容がわかりづらい",
  "情報発信の導線が弱い",
  "更新や運用がしづらい",
  "一部の業務が属人的になっている",
];

const SERVICES: [string, string, string][] = [
  [
    "01",
    "企業や事業の伝わり方を整える",
    "企業サイト、サービス紹介ページ、採用ページ、実績・事例ページ、ランディングページなど、目的に応じたWebコンテンツを制作します。情報をただ並べるのではなく、相手に伝わる順番や見せ方を整理し、事業の内容や価値が伝わる構成へ落とし込みます。",
  ],
  [
    "02",
    "問い合わせ導線を整える",
    "サイトを作るだけでは、問い合わせや相談にはつながりません。SMASKでは、ページ構成、導線設計、CTAの配置、スマートフォンでの見やすさ、必要な情報にたどり着きやすさまで見直し、行動につながる流れを整えます。",
  ],
  [
    "03",
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

/* ---- SELECTED WORKS（サンプル。実案件名・掲載可否・画像は代表確認のうえ差し替え） ---- */
type Work = { num: string; title: string; en: string; tags: string[]; year: string; img?: string; hue: number };
const WORKS: Work[] = [
  { num: "01", title: "SMASK コーポレートサイト", en: "SMASK CORPORATE", tags: ["Corporate Site", "Design / Build"], year: "2026", hue: 210 },
  { num: "02", title: "貴金属価格管理システム", en: "PRICE MANAGEMENT", tags: ["Web App", "Admin / API"], year: "2026", hue: 280 },
  { num: "03", title: "不動産会社コーポレートサイト", en: "REAL ESTATE", tags: ["Corporate Site"], year: "2025", hue: 160 },
  { num: "04", title: "外壁塗装サービスLP", en: "EXTERIOR PAINTING", tags: ["Landing Page"], year: "2025", hue: 30 },
];

const MARQUEE = "WEB CONTENT — DESIGN — DEVELOPMENT — OPERATION — ";

/* ---- カウンター式ローダー（trionn の 0→100 の引用）。
   setInterval 駆動＝rAF に依存しない。1秒強で必ず終わる ---- */
function Loader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const doneRef = useRef(false);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / 1100);
      setN(Math.floor(p * 100));
      if (p >= 1 && !doneRef.current) {
        doneRef.current = true;
        window.clearInterval(id);
        onDone();
      }
    }, 24);
    return () => window.clearInterval(id);
  }, [onDone]);
  return (
    <div className={`wc2-loader ${n >= 100 ? "is-done" : ""}`} aria-hidden="true">
      <span className="wc2-loader-num">{n}</span>
      <span className="wc2-loader-bar" style={{ transform: `scaleX(${n / 100})` }}></span>
    </div>
  );
}

export default function WebContentV2() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { document.title = "Webコンテンツ制作 ｜ SMASK"; }, []);

  /* ダークページの間だけサイドナビ・ロゴを紙色へ反転 */
  useEffect(() => {
    document.documentElement.classList.add("is-fp-dark");
    return () => { document.documentElement.classList.remove("is-fp-dark"); };
  }, []);

  /* ローダー表示中はスクロールを止める */
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [loaded]);

  useReveal();

  /* カスタムカーソル（ドット＋遅れて追う輪）。タッチ環境・reduced-motion では出さない */
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ("ontouchstart" in window || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = dotRef.current, ring = ringRef.current;
    if (!dot || !ring) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      const t = e.target as Element;
      const hot = !!t.closest("a, button, .wc2-work");
      dot.classList.toggle("is-hot", hot);
      ring.classList.toggle("is-hot", hot);
    };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <main className={`wc2-page ${loaded ? "is-ready" : ""}`}>
        <Scene3D />
        <div className="wc2-cursor-dot" ref={dotRef} aria-hidden="true"></div>
        <div className="wc2-cursor-ring" ref={ringRef} aria-hidden="true"></div>

        {/* ============ HERO：巨大ステートメント ============ */}
        <section className="wc2-hero">
          <div className="wc2-wrap">
            <p className="wc2-hero-tag"><i>●</i> SMASK — WEB CONTENT STUDIO</p>
            <h1 className="wc2-hero-h1">
              <span className="wc2-hl"><span>伝わるWebを、</span></span>
              <span className="wc2-hl wc2-hl--grad"><span>動かすまで。</span></span>
            </h1>
            <p className="wc2-hero-sub">現場理解をもとに、伝わるWebと業務の流れを整えます。</p>
            <div className="wc2-hero-scroll" aria-hidden="true">
              <span>SCROLL</span>
              <i></i>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="wc2-marquee" aria-hidden="true">
          <div className="wc2-marquee-track">
            <span>{MARQUEE.repeat(4)}</span>
            <span>{MARQUEE.repeat(4)}</span>
          </div>
        </div>

        {/* ============ APPROACH ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 01 ) — APPROACH</span>
            <h2 className="wc2-h2" data-reveal>Web制作を、<br /><em>見た目だけ</em>で終わらせない</h2>
            <div className="wc2-cols">
              <p className="wc2-lead" data-reveal>
                Webサイトは、情報を載せるためだけのものではありません。企業や事業の強みを伝え、必要な相手に安心感を持ってもらい、問い合わせや次の行動につなげるための基盤です。
              </p>
              <p data-reveal>
                SMASKでは、見た目の整ったページを制作するだけではなく、事業内容の伝わりやすさ、情報の整理、導線のわかりやすさ、運用のしやすさまで含めて設計します。制作そのものを目的にするのではなく、事業にとって意味のある形で機能することを重視しています。
              </p>
            </div>
          </div>
        </section>

        {/* ============ SELECTED WORKS（trionn: Selected work & explorations） ============ */}
        <section className="wc2-sec wc2-works-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 02 ) — WORKS</span>
            <h2 className="wc2-h2" data-reveal>Selected work<span className="wc2-amp">&amp;</span>explorations</h2>
            <div className="wc2-works-grid">
              {WORKS.map(w => (
                <article className="wc2-work" key={w.num} data-reveal>
                  <div className="wc2-work-cover">
                    {w.img ? (
                      <div className="wc2-cover-art" style={{ backgroundImage: `url(${w.img})` }}></div>
                    ) : (
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
            <p className="wc2-works-note" data-reveal>※ 掲載内容はサンプルです（実案件へ差し替え予定）</p>
          </div>
        </section>

        {/* ============ CONCERNS ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 03 ) — CONCERNS</span>
            <h2 className="wc2-h2" data-reveal>こんなお悩みに対応します</h2>
            <ul className="wc2-chips" data-reveal-stagger>
              {CONCERNS.map(text => <li key={text}>{text}</li>)}
            </ul>
            <p className="wc2-note" data-reveal>
              このような課題は、単にページを作るだけでは解決しないことがあります。SMASKは、情報の整理、ページ構成、導線設計、必要に応じた仕組みづくりまで含めて、事業に合った形に整えます。
            </p>
          </div>
        </section>

        {/* ============ SERVICES：大きな行（trionnのサービス列の引用） ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 04 ) — SERVICES</span>
            <h2 className="wc2-h2" data-reveal>SMASKが提供できること</h2>
          </div>
          <div className="wc2-rows">
            {SERVICES.map(([num, title, body]) => (
              <div className="wc2-row" key={num} data-reveal>
                <div className="wc2-wrap wc2-row-in">
                  <span className="wc2-row-num">{num}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ STRENGTHS ============ */}
        <section className="wc2-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 05 ) — STRENGTHS</span>
            <h2 className="wc2-h2" data-reveal>SMASKの強み</h2>
            <p className="wc2-lead wc2-lead--solo" data-reveal>
              SMASKは、制作そのものを目的とせず、事業にとって本当に必要な形を整えることを重視しています。現場や運用の実情を踏まえ、見た目だけでなく日々の使いやすさまで含めて、過不足のない提案を行います。
            </p>
            <div className="wc2-strengths" data-reveal-stagger>
              {STRENGTHS.map(([num, title, body]) => (
                <div className="wc2-strength" key={num}>
                  <span className="wc2-strength-num">{num}</span>
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
            <span className="wc2-label" data-reveal>( 06 ) — PROCESS</span>
            <h2 className="wc2-h2" data-reveal>ご相談から制作までの流れ</h2>
            <ol className="wc2-steps" data-reveal-stagger>
              {PROCESS.map(([num, title, body]) => (
                <li key={num}>
                  <span className="wc2-step-num">{num}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ CONTACT：巨大CTA ============ */}
        <section className="wc2-sec wc2-contact">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 07 ) — CONTACT</span>
            <a className="wc2-talk" href="/contact" data-reveal>
              <span className="wc2-talk-main">話しましょう<em>.</em></span>
              <span className="wc2-talk-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 19 19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </a>
            <p className="wc2-contact-lead" data-reveal>まずはお気軽にご相談ください。ご要望・ご予算に合わせて柔軟にご対応いたします。</p>
          </div>
          <div className="wc2-bridge" aria-hidden="true"></div>
        </section>
      </main>
    </>
  );
}
