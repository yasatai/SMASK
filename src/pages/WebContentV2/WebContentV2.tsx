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

  /* このページはフルスクリーン演出のため、ヘッダー（ロゴ・ナビ・バー）を常時非表示。
     ダーク基調用の is-fp-dark も付ける（他要素のダーク対応のため残す） */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-fp-dark", "wc2-chrome-off");
    return () => { root.classList.remove("is-fp-dark", "wc2-chrome-off"); };
  }, []);

  /* ローダー表示中はスクロールを止める */
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [loaded]);

  useReveal();

  /* ---- PS2オープニングのスクロール演出 ----
     最初は映像＋SCROLLヒントのみ。スクロールに同期して文字が順に立ち上がり
     （戻せば逆再生）、ダイブ終盤で文字が退場 → 終端で完全暗転 →
     ヒーローを抜けて半画面ぶんで幕が明け、次セクションが始まる */
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".wc2-hero");
    const black = blackoutRef.current;
    if (!hero || !black) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tag = hero.querySelector<HTMLElement>(".wc2-hero-tag");
    const h1 = hero.querySelector<HTMLElement>(".wc2-hero-h1");
    const lines = Array.from(hero.querySelectorAll<HTMLElement>(".wc2-hl > span"));
    const sub = hero.querySelector<HTMLElement>(".wc2-hero-sub");
    const hint = hero.querySelector<HTMLElement>(".wc2-hero-scroll");
    let raf = 0;
    const ss = (t: number) => t * t * (3 - 2 * t);   // smoothstep
    const seg = (p: number, a: number, b: number) => ss(Math.min(1, Math.max(0, (p - a) / (b - a))));
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const len = Math.max(1, hero.offsetHeight - vh);
      const p = Math.min(1, Math.max(0, window.scrollY / len));

      if (!reduced) {
        /* 文字はスクロールに同期して段階的に立ち上がる（スクラブ＝戻すと逆再生）。
           〜30%で文字が完成 → 35%からダイブ開始（Scene3D の diveP=0.35 と対応）。
           前半はカメラが動かない「文字だけのスクロール」になる */
        const out = 1 - seg(p, 0.56, 0.72);          // ダイブ終盤の退場
        if (tag) tag.style.opacity = (seg(p, 0.05, 0.14) * out).toFixed(3);
        if (h1) h1.style.opacity = out.toFixed(3);
        lines.forEach((ln, i) => {
          const lp = seg(p, 0.08 + i * 0.05, 0.20 + i * 0.05);
          ln.style.transform = `translateY(${((1 - lp) * 110).toFixed(1)}%)`;
        });
        if (sub) sub.style.opacity = (seg(p, 0.18, 0.30) * out).toFixed(3);
        /* SCROLLヒントは最初から見えていて、動き出したら退く */
        if (hint) hint.style.opacity = (1 - seg(p, 0.04, 0.12)).toFixed(3);
      }

      /* 暗転：ダイブ終盤(72%〜)で立ち上がり、終端で1。抜けたら0.55画面ぶんで明ける */
      const rise = ss(Math.min(1, Math.max(0, (p - 0.72) / 0.28)));
      const past = Math.max(0, (window.scrollY - len) / (vh * 0.55));
      const o = Math.max(0, Math.min(1, rise - past));
      black.style.opacity = o.toFixed(3);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- ピン留め画面（APPROACH→白の転調→WORKS）のスクロール演出 ----
     1本のピン区間で全部を連続再生（スクラブ式・戻せば逆再生）：
       3〜20% : 見出しの染色（fill側が担当）
      20〜30% : 本文フェードイン
      30〜52% : 白帯が「下から上へ」立ち上がり画面が白に
      46〜56% : WORKS タイトルが中央にフェードイン
      56〜66% : タイトルが上へ移動
      62〜100%: カードが横から順にスライドイン（trionn 準拠） */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ap = document.querySelector<HTMLElement>(".wc2-approach-sec");
    if (!ap) return;
    const apCols = ap.querySelector<HTMLElement>(".wc2-approach-cols");
    const stripes = Array.from(ap.querySelectorAll<HTMLElement>(".wc2-stripes span"));
    const head = ap.querySelector<HTMLElement>(".wc2-worksreveal-head");
    const track = ap.querySelector<HTMLElement>(".wc2-worksreveal-track");
    const wipe = ap.querySelector<HTMLElement>(".wc2-wipe");
    const aurora = document.querySelector<HTMLElement>(".wc2-aurora");
    let raf = 0;
    const ss = (t: number) => t * t * (3 - 2 * t);
    const seg = (p: number, a: number, b: number) => ss(Math.min(1, Math.max(0, (p - a) / (b - a))));
    /* ピン区間の進行度：0=固定開始, 1=固定解除 */
    const pinP = (el: HTMLElement) => {
      const len = Math.max(1, el.offsetHeight - window.innerHeight);
      const top = el.getBoundingClientRect().top + window.scrollY;
      return Math.min(1, Math.max(0, (window.scrollY - top) / len));
    };
    const tick = () => {
      raf = 0;
      const p = pinP(ap);
      if (apCols) apCols.style.opacity = seg(p, 0.20, 0.30).toFixed(3);
      /* 白帯：一番下（i=5）から順に立ち上がる。各帯は自分の下辺から伸びる */
      stripes.forEach((s, i) => {
        const order = stripes.length - 1 - i;   // 下の帯ほど先
        s.style.transform = `scaleY(${seg(p, 0.30 + order * 0.035, 0.46 + order * 0.035).toFixed(3)})`;
      });
      /* WORKS：タイトルが中央でフェードイン → 上へ移動（文字は上） */
      if (head) {
        head.style.opacity = seg(p, 0.46, 0.55).toFixed(3);
        const up = seg(p, 0.55, 0.64) * window.innerHeight * 0.32;   // 上へ 32vh
        head.style.transform = `translateY(calc(-50% - ${up.toFixed(1)}px))`;
      }
      /* カードのトラック：タイトルが上がった後に、下段で横スクロールして流れる。
         開始時は先頭カードを画面右端に、終端は末尾カードを左端まで送りきる
         （右側が空いて次セクションへの余白になる）。95%で送り終え残りは静止＝余裕 */
      if (track) {
        const prog = seg(p, 0.58, 0.72);
        const first = track.querySelector<HTMLElement>(".wc2-work");
        const last = track.querySelector<HTMLElement>(".wc2-work:last-child");
        const cardW = first ? first.getBoundingClientRect().width : 380;
        const padL = parseFloat(getComputedStyle(track).paddingLeft) || 72;
        const startX = Math.max(0, track.clientWidth - cardW - padL - 24); // 先頭カードを右端へ
        const endX = last ? padL - last.offsetLeft : -(track.scrollWidth - track.clientWidth); // 末尾カードを左端へ
        const x = startX + (endX - startX) * prog;
        track.style.transform = `translateX(${x.toFixed(1)}px)`;
        track.style.opacity = seg(p, 0.60, 0.68).toFixed(3);
      }
      /* 次セクションへの転換＝CONCERNS（trionn の Selected work→OUR SERVICES 準拠）：
         暗色オーロラの面が「背景＋文字ごと1枚のパネル」で右から左へスライドインし、
         WORKS を覆う。文字はパネルの一部なので一緒に右→左へ流れる（74%〜90%）。以降は静止 */
      if (wipe) {
        const wp = seg(p, 0.74, 0.90);
        wipe.style.transform = `translateX(${((1 - wp) * 100).toFixed(2)}%)`;
      }
      /* パネルが覆うのと同時にオーロラ背景がフェードイン（以降の暗色セクションの世界） */
      if (aurora) aurora.style.opacity = seg(p, 0.78, 0.94).toFixed(3);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- 見出しのスクロール染色（.wc2-fill） ----
     暗色セクションの見出しを1文字ずつ<span>に分割し、スクロールに同期して
     灰色→白へ読む順に染めていく（スクラブ＝戻すと色も引く）。
     グラデーションの<em>は1かたまりとして扱い、順番が来たら浮かび上がる */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heads = Array.from(document.querySelectorAll<HTMLElement>(".wc2-fill"));
    if (!heads.length) return;

    /* 分割：テキストノード→1文字span、要素（em等）→そのまま1ユニット */
    const units: HTMLElement[][] = heads.map(head => {
      const list: HTMLElement[] = [];
      Array.from(head.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          for (const ch of node.textContent ?? "") {
            const s = document.createElement("span");
            s.className = "wc2-fc";
            s.textContent = ch;
            frag.appendChild(s);
            list.push(s);
          }
          head.replaceChild(frag, node);
        } else if (node instanceof HTMLElement && node.tagName !== "BR") {
          node.classList.add("wc2-fc");
          list.push(node);
        }
      });
      list.forEach(u => { u.style.opacity = "0.22"; });   // 初期状態＝薄い（染まる前）
      return list;
    });

    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      heads.forEach((head, hi) => {
        const r = head.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        /* ピン留めセクション内の見出しは、画面位置が固定で動かないため
           ピン区間の進行度（6%〜66%）で染める。通常セクションは画面位置基準 */
        const pin = head.closest<HTMLElement>(".wc2-pin");
        let p: number;
        if (pin) {
          /* 統合ピンの前半（3〜20%）で染まりきる。以降は白の転調→WORKSが使う */
          const len = Math.max(1, pin.offsetHeight - vh);
          const top = pin.getBoundingClientRect().top + window.scrollY;
          const pp = Math.min(1, Math.max(0, (window.scrollY - top) / len));
          p = Math.min(1, Math.max(0, (pp - 0.03) / 0.17));
        } else {
          /* 見出しが画面下88%に入ってから、55%の高さぶんで染まりきる */
          p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.55)));
        }
        const list = units[hi];
        const f = p * list.length;
        list.forEach((u, i) => {
          const c = Math.min(1, Math.max(0, f - i));
          u.style.opacity = (0.22 + 0.78 * c).toFixed(3);
        });
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- 右→左スライドイン（.wc2-inright） ----
     捲れで暗転したあとの次セクションの文字が、スクロールに同期して右から入ってくる */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>(".wc2-inright"));
    if (!items.length) return;
    let raf = 0;
    const ss = (t: number) => t * t * (3 - 2 * t);
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top > vh + 60 || r.bottom < -60) return;
        /* 画面下86%に入ってから42%の高さぶんで着地。要素ごとに少し時間差 */
        const prog = ss(Math.min(1, Math.max(0, (vh * 0.86 - r.top) / (vh * 0.42) - i * 0.08)));
        el.style.transform = `translateX(${((1 - prog) * 16).toFixed(2)}vw)`;
        el.style.opacity = prog.toFixed(3);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

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
        {/* 白のあとの暗色セクション用：イリデッセンス（薄膜の虹）のオーロラ背景。
           捲れと同時にフェードインし以降ずっと漂う（JSがopacityを駆動） */}
        <div className="wc2-aurora" aria-hidden="true"></div>
        <div className="wc2-cursor-dot" ref={dotRef} aria-hidden="true"></div>
        <div className="wc2-cursor-ring" ref={ringRef} aria-hidden="true"></div>

        {/* ============ HERO：PS2オープニング（縦に長い区間＝靄へのダイブ） ============ */}
        <section className="wc2-hero">
          <div className="wc2-hero-sticky">
            <div className="wc2-wrap wc2-hero-copy" ref={heroCopyRef}>
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
          </div>
        </section>

        {/* ダイブ終端の完全暗転幕（スクロール駆動） */}
        <div className="wc2-blackout" ref={blackoutRef} aria-hidden="true"></div>

        {/* ============ APPROACH＋白の転調：ひと続きのピン留め画面 ============
             前半＝文字の染色→本文フェード（帯は画面上部に常駐）。
             後半＝固定したまま白帯が「下から上へ」伸びて画面全体が白になり、
             白になりかけで WORKS の見出しがフェードイン ============ */}
        <section className="wc2-sec wc2-approach-sec wc2-pin">
          <div className="wc2-pin-sticky">
            {/* 帯：ピン画面の上部に常駐（文字の染色中も見えている） */}
            <div className="wc2-marquee wc2-marquee--pin" aria-hidden="true">
              <div className="wc2-marquee-track">
                <span>{MARQUEE.repeat(4)}</span>
                <span>{MARQUEE.repeat(4)}</span>
              </div>
            </div>
            <div className="wc2-wrap">
              <span className="wc2-label">( 01 ) — APPROACH</span>
              <h2 className="wc2-h2 wc2-fill">Web制作を、<br /><em>見た目だけ</em>で終わらせない</h2>
              <div className="wc2-cols wc2-approach-cols">
                <p className="wc2-lead">
                  Webサイトは、情報を載せるためだけのものではありません。企業や事業の強みを伝え、必要な相手に安心感を持ってもらい、問い合わせや次の行動につなげるための基盤です。
                </p>
                <p>
                  SMASKでは、見た目の整ったページを制作するだけではなく、事業内容の伝わりやすさ、情報の整理、導線のわかりやすさ、運用のしやすさまで含めて設計します。制作そのものを目的にするのではなく、事業にとって意味のある形で機能することを重視しています。
                </p>
              </div>
            </div>
            {/* 白の転調：下の帯から順に立ち上がる（APPROACHの文字ごと呑み込む） */}
            <div className="wc2-stripes" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            {/* WORKS：タイトルは中央→上へ移動（文字は上）。カードは下段で横スクロールして
               左→右に流れる（trionn 準拠）。全てスクロール同期 */}
            <div className="wc2-worksreveal">
              <div className="wc2-worksreveal-head">
                <span className="wc2-label">( 02 ) — WORKS</span>
                <h2 className="wc2-h2">Selected work<span className="wc2-amp">&amp;</span>explorations</h2>
                <a className="wc2-viewall" href="#works">VIEW ALL PROJECTS <span aria-hidden="true">→</span></a>
              </div>
              <div className="wc2-worksreveal-track">
                {WORKS.map(w => (
                  <article className="wc2-work" key={w.num}>
                    <div className="wc2-work-inner">
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
                    </div>
                  </article>
                ))}
              </div>
            </div>
            {/* 次セクションへの転換＝CONCERNS：暗色オーロラが右から捲れ、
               その面に載った文字（見出し・チップ）も一緒に revealed される（clip-path が両方を切り出す） */}
            <div className="wc2-wipe">
              <div className="wc2-wipe-inner">
                <span className="wc2-label">( 03 ) — CONCERNS</span>
                <h2 className="wc2-h2">こんなお悩みに対応します</h2>
                <ul className="wc2-chips">
                  {CONCERNS.map(text => <li key={text}>{text}</li>)}
                </ul>
                <p className="wc2-note">
                  このような課題は、単にページを作るだけでは解決しないことがあります。SMASKは、情報の整理、ページ構成、導線設計、必要に応じた仕組みづくりまで含めて、事業に合った形に整えます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SERVICES：大きな行（trionnのサービス列の引用） ============ */}
        <section className="wc2-sec wc2-services-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 04 ) — SERVICES</span>
            <h2 className="wc2-h2 wc2-fill">SMASKが提供できること</h2>
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
        <section className="wc2-sec wc2-strengths-sec">
          <div className="wc2-wrap">
            <span className="wc2-label" data-reveal>( 05 ) — STRENGTHS</span>
            <h2 className="wc2-h2 wc2-fill">SMASKの強み</h2>
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
            <h2 className="wc2-h2 wc2-fill">ご相談から制作までの流れ</h2>
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
