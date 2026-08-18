import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { useReveal } from "../../useReveal";
import Scene3D from "./Scene3D";
import Opening from "./Opening";
import "./Home.css";

/**
 * トップ（Home）— 3D の「別世界」ページをサイトの入口に昇格。
 * - 本サイトの世界観（明朝・金・紙色）から意図的に切り離す：漆黒×クローム×虹、Unbounded/Inter
 * - 3D はページ全面固定の Scene3D（スクロールで振り付け）。ダイヤモンドは廃止
 * - WORKS はサンプル（実案件名は代表確認のうえ差し替え）
 * - 独自のカウンター式ローダーで入場（世界の切り替えを演出）
 */

/* ---- 文言（現行 WebContent.tsx と同一） ---- */
/* 統合仕様「5 企業が抱える課題」の主な課題（4項目） */
const CONCERNS: string[] = [
  "強みをうまく言葉にできない",
  "情報が多く、何を優先すべきか分からない",
  "デザインはあるが、行動につながらない",
  "公開後に更新や改善が続かない",
];

/* 統合仕様「6 提供できること」の5工程 */
const SERVICES: [string, string, string][] = [
  ["01", "事業を理解する", "事業や顧客を確認し、何を伝えるべきかを整理します。"],
  ["02", "情報を設計する", "伝える順番とページの役割を整理し、導線を設計します。"],
  ["03", "文章とデザインをつくる", "文章とデザインを、一つのWeb体験として制作します。"],
  ["04", "実装へつなぐ", "画面や機能を実装仕様へ整理し、エンジニアと連携します。"],
  ["05", "公開後を考える", "更新や改善まで見据え、使い続けられるWebを目指します。"],
];

/* 統合仕様「7 SMASKの強み」の4項目（キューブの4側面に対応） */
const STRENGTHS: [string, string, string][] = [
  ["01", "事業から考える", "事業、顧客、目的を理解したうえで、必要なWebを設計します。"],
  ["02", "文章と導線をつなぐ", "何を書くかと、どこへ導くかを一体で考えます。"],
  ["03", "デザインと実装をつなぐ", "デザインの意図を実装仕様へ整理し、制作時のずれを減らします。"],
  ["04", "公開後まで考える", "更新や改善も見据え、事業の中で使い続けられるWebを目指します。"],
];

/* 統合仕様「8 制作の流れ」の6ステップ（航路の6寄港地に対応） */
const PROCESS: [string, string, string][] = [
  ["01", "相談する", "事業、課題、実現したいことを確認します。"],
  ["02", "理解する", "顧客、競合、既存資料を確認し、制作の前提を整理します。"],
  ["03", "設計する", "ページ構成、文章、導線、必要な機能を設計します。"],
  ["04", "制作する", "文章、デザイン、画像などを制作します。"],
  ["05", "実装へつなぐ", "実装仕様を整理し、エンジニアと連携します。"],
  ["06", "公開後を支える", "更新や改善に必要な方法を整理します。"],
];
/* 宇宙の航路：各寄港地の座標（ステージ幅・高さに対する%）。カードは中心から外側へ出す（重なり回避） */
/* 宇宙の航路：各寄港地の座標（ステージ幅・高さに対する%）。
   カードは常に右へ開く（JS側 data-side="r" 固定）。
   ・左列：左の見出し帯より右に置く（node+26px がテキスト右端を越えること）
   ・右列：node + 26px + カード幅(min(17.5rem,26vw)) が画面内に収まる範囲（〜56%）に留めること
   ※中央が空いて見えたため 52〜68% から 40〜56% へ左へ寄せた（2026-07-29 代表指摘） */
const ROUTE_POS: { x: number; y: number }[] = [
  { x: 40, y: 12 }, { x: 56, y: 27 }, { x: 42, y: 42 },
  { x: 56, y: 57 }, { x: 43, y: 72 }, { x: 55, y: 86 },
];

/* ---- SELECTED WORKS（サンプル。実案件名・掲載可否・画像は代表確認のうえ差し替え）
   kind＝統合仕様の「表示区分」（CLIENT WORK／IN-HOUSE PROJECT／CONCEPT WORK） ---- */
type Work = { num: string; kind: string; title: string; en: string; tags: string[]; year: string; img?: string; hue: number };
const WORKS: Work[] = [
  { num: "01", kind: "IN-HOUSE PROJECT", title: "SMASK コーポレートサイト", en: "SMASK CORPORATE", tags: ["Corporate Site", "Design / Build"], year: "2026", hue: 210 },
  { num: "02", kind: "IN-HOUSE PROJECT", title: "貴金属価格管理システム", en: "PRICE MANAGEMENT", tags: ["Web App", "Admin / API"], year: "2026", hue: 280 },
  { num: "03", kind: "CLIENT WORK", title: "不動産会社コーポレートサイト", en: "REAL ESTATE", tags: ["Corporate Site"], year: "2025", hue: 160 },
  { num: "04", kind: "CLIENT WORK", title: "外壁塗装サービスLP", en: "EXTERIOR PAINTING", tags: ["Landing Page"], year: "2025", hue: 30 },
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

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  /* ---- オープニング演出：セッション初回のみ再生 ----
     sessionStorage に印が無ければ再生対象。再生開始と同時に印を付け、
     2回目以降（同一セッション）は一切描画しない（従来どおり 0→100 ローダー→本編）。
     SSR/非対応環境は安全側で「再生しない」。 */
  const [introDone, setIntroDone] = useState(() => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) return true;
      if (sessionStorage.getItem("smask-opening-seen")) return true;
      sessionStorage.setItem("smask-opening-seen", "1");
      return false;
    } catch {
      return true;
    }
  });

  useEffect(() => { document.title = "SMASK ｜ 価値を見極め、かたちにする。"; }, []);

  /* このページはフルスクリーン演出のため、ヘッダー（ロゴ・ナビ・バー）を常時非表示。
     ダーク基調用の is-fp-dark も付ける（他要素のダーク対応のため残す） */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-fp-dark", "wc2-chrome-off", "wc2-page-active");
    return () => { root.classList.remove("is-fp-dark", "wc2-chrome-off", "wc2-page-active"); };
  }, []);

  /* スクロール抑制：ローダー表示中 かつ オープニング再生中は止める。
     Loader(約1.1s) が先に終わってもオープニング(約4.2s)が続く間はロックを維持する（競合回避） */
  useEffect(() => {
    const lock = !loaded || !introDone;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loaded, introDone]);

  /* ---- スムーススクロール（trionn と同じ Lenis）：入力に即反応しつつ滑らか。
     scrollY を読む各演出（Hero/大ピン/キューブ/航路/ワープ）はそのまま動く。
     タッチ端末・reduced-motion では無効（ネイティブに任せる） ---- */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ("ontouchstart" in window || !matchMedia("(pointer: fine)").matches) return;
    const lenis = new Lenis({
      lerp: 0.14,          // 追従の速さ（大きいほど即反応・小さいほど滑らか）
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  useReveal();

  /* ---- PS2オープニングのスクロール演出 ----
     最初は映像＋SCROLLヒントのみ。スクロールに同期して文字が順に立ち上がり
     （戻せば逆再生）、ダイブ終盤で文字が退場 → 終端で完全暗転 →
     ヒーローを抜けて半画面ぶんで幕が明け、次セクションが始まる */
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  /* CONCERNS→SERVICES 転換：白い点への吸い込み進行度（ピン効果が書き、点キャンバスが読む） */
  const convergeRef = useRef(0);
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".wc2-hero");
    const black = blackoutRef.current;
    if (!hero || !black) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tag = hero.querySelector<HTMLElement>(".wc2-hero-tag");
    const h1 = hero.querySelector<HTMLElement>(".wc2-hero-h1");
    const lines = Array.from(hero.querySelectorAll<HTMLElement>(".wc2-hl > span"));
    const sub = hero.querySelector<HTMLElement>(".wc2-hero-sub");
    const lead = hero.querySelector<HTMLElement>(".wc2-hero-lead");
    const hint = hero.querySelector<HTMLElement>(".wc2-hero-scroll");
    const cta = hero.querySelector<HTMLElement>(".wc2-hero-cta");
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
        if (lead) lead.style.opacity = (seg(p, 0.22, 0.34) * out).toFixed(3);
        if (cta) cta.style.opacity = (seg(p, 0.26, 0.38) * out).toFixed(3);
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
    const wipeInner = ap.querySelector<HTMLElement>(".wc2-wipe-inner");
    const bpDraw = ap.querySelector<HTMLElement>(".wc2-bp-draw");
    const bpDots = ap.querySelector<HTMLElement>(".wc2-bp-dots");
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
    const seed = ap.querySelector<HTMLElement>(".wc2-c2s-seed");
    const white = ap.querySelector<HTMLElement>(".wc2-c2s-white");
    const svcEmerge = ap.querySelector<HTMLElement>(".wc2-c2s-services .wc2-c2s-emerge");
    const svcRows = Array.from(ap.querySelectorAll<HTMLElement>(".wc2-c2s-services .wc2-row"));
    /* カード帯の寸法は毎フレーム測らずキャッシュする。
       測定（getBoundingClientRect / clientWidth / getComputedStyle / offsetLeft）と
       transform の書き込みを毎フレーム往復すると強制同期レイアウトが起きて、
       横スクロールががくつく。サイズが変わった時だけ ResizeObserver で測り直す */
    const trackGeo = { startX: 0, endX: 0 };
    const measureTrack = () => {
      if (!track) return;
      const first = track.querySelector<HTMLElement>(".wc2-work");
      const last = track.querySelector<HTMLElement>(".wc2-work:last-child");
      const cardW = first ? first.getBoundingClientRect().width : 380;
      const padL = parseFloat(getComputedStyle(track).paddingLeft) || 72;
      trackGeo.startX = Math.max(0, track.clientWidth - cardW - padL - 24); // 先頭カードを右端へ
      trackGeo.endX = last ? padL - last.offsetLeft : -(track.scrollWidth - track.clientWidth); // 末尾カードを左端へ
    };
    /* 爆発的な拡大：オーバーシュートして落ち着く（back-ease-out） */
    const backOut = (t: number) => { const c1 = 2.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const tick = () => {
      raf = 0;
      const praw = pinP(ap);
      /* 既存コンテンツ（〜CONCERNS表示）は前半 0〜56% に圧縮。後半 56〜100% を転換に使う */
      const p = Math.min(1, praw / 0.56);
      const pT = Math.max(0, (praw - 0.56) / 0.44);
      if (apCols) apCols.style.opacity = seg(p, 0.20, 0.30).toFixed(3);
      /* 白帯：一番下（i=5）から順に立ち上がる。各帯は自分の下辺から伸びる */
      stripes.forEach((s, i) => {
        const order = stripes.length - 1 - i;   // 下の帯ほど先
        s.style.transform = `scaleY(${seg(p, 0.30 + order * 0.035, 0.46 + order * 0.035).toFixed(3)})`;
      });
      /* WORKS：タイトルが中央でフェードイン → 上へ移動（文字は上）。
         モバイルは上部ボタンに掛からないよう上昇量を控えめに */
      if (head) {
        head.style.opacity = seg(p, 0.46, 0.55).toFixed(3);
        /* 見出しが上がりきった位置＝中心 (0.5 - upFactor)vh。使える帯は 0〜40vh（下はカード帯）
           なので中心は 0.20vh＝upFactor 0.30 が最適。0.32 だと上に寄りすぎて頭が切れる */
        const upFactor = window.innerWidth < 680 ? 0.26 : 0.30;
        const up = seg(p, 0.55, 0.64) * window.innerHeight * upFactor;
        head.style.transform = `translateY(calc(-50% - ${up.toFixed(1)}px))`;
      }
      /* カードのトラック：タイトルが上がった後に、下段で横スクロールして流れる。
         開始時は先頭カードを画面右端に、終端は末尾カードを左端まで送りきる
         （右側が空いて次セクションへの余白になる）。95%で送り終え残りは静止＝余裕 */
      if (track) {
        /* 保険：初回計測がレイアウト確定前で空振りした場合（ResizeObserver 非対応環境など）
           でも、ここで一度だけ測り直して正しい位置から始められるようにする */
        if (trackGeo.endX === 0) measureTrack();
        const prog = seg(p, 0.58, 0.72);
        const x = trackGeo.startX + (trackGeo.endX - trackGeo.startX) * prog;
        track.style.transform = `translateX(${x.toFixed(1)}px)`;
        /* カードは移動を始める前に不透明にしきる。ここが遅いと、定位置に来ても
           白地が透けて「触れないもの」に見える（旧: 0.60→0.68 で定位置でもまだ約50%） */
        track.style.opacity = seg(p, 0.50, 0.585).toFixed(3);
      }
      /* 次セクションへの転換＝CONCERNS（trionn と差別化：背景が先→あとで文字）：
         ① 暗色オーロラの「背景パネル」が右から左へスライドインし WORKS を覆う（70%〜82%）
         ② 覆いきってから、文字だけが右→左へ流れて現れる（84%〜96%）。以降は静止して読ませる */
      if (wipe) {
        const wp = seg(p, 0.70, 0.82);
        wipe.style.transform = `translateX(${((1 - wp) * 100).toFixed(2)}%)`;
      }
      /* 設計図の線が左→右に引かれていく（見当・寸法・表題欄も一緒に描かれる） */
      if (bpDraw) {
        const dp = seg(p, 0.82, 0.94);
        bpDraw.style.clipPath = `inset(0 ${((1 - dp) * 100).toFixed(1)}% 0 0)`;
      }
      /* 線を描き終えたあと、白い点をフェードイン */
      if (bpDots) bpDots.style.opacity = seg(p, 0.92, 1.0).toFixed(3);
      if (wipeInner) {
        const tp = seg(p, 0.86, 0.98);
        wipeInner.style.transform = `translateX(${((1 - tp) * 20).toFixed(2)}vw)`;
        wipeInner.style.opacity = tp.toFixed(3);
      }
      /* 設計図グリッド背景：CONCERNSでフェードイン → SERVICES転換の完了とともにフェードアウト（以降のセクションでは消す） */
      if (aurora) aurora.style.opacity = (seg(p, 0.72, 0.86) * (1 - seg(pT, 0.6, 1.0))).toFixed(3);

      /* ===== CONCERNS → SERVICES 転換（後半 pT 0〜1）===== */
      /* ① 文字がはける（左へ流れて消える） */
      if (wipeInner && pT > 0) {
        const ex = seg(pT, 0.0, 0.16);
        wipeInner.style.transform = `translateX(${(-ex * 26).toFixed(1)}vw)`;
        wipeInner.style.opacity = (1 - ex).toFixed(3);
      }
      /* ② 左から白い「種」の点がスッと現れて中央へ */
      if (seed) {
        const s = seg(pT, 0.10, 0.28);
        seed.style.opacity = s.toFixed(3);
        seed.style.transform = `translate(-50%,-50%) translateX(${((1 - s) * -46).toFixed(1)}vw)`;
      }
      /* ③ 動いていた白い点が、その種にどんどん吸い込まれていく（点キャンバスが読む） */
      convergeRef.current = seg(pT, 0.24, 0.48);
      /* ④ 種から白い円が広がって背景が白に（早めに完了させる） */
      if (white) {
        const w = seg(pT, 0.46, 0.62);
        white.style.clipPath = `circle(${(w * 80).toFixed(1)}vmax at 50% 50%)`;
      }
      /* ⑤ 白の直後、SERVICES 全体が中央から爆発的に拡大して現れる → 静止して読ませる */
      if (svcEmerge) {
        const e = Math.min(1, Math.max(0, (pT - 0.60) / 0.14));   // 0.60〜0.74 で一気に
        svcEmerge.style.opacity = seg(pT, 0.60, 0.68).toFixed(3);
        svcEmerge.style.transform = `scale(${(0.2 + 0.8 * backOut(e)).toFixed(3)})`;
      }
      /* ⑥ 次セクションへ：SERVICESの行が SV-03 から順に左へフェードアウト（85%〜100%）→ 真っ白 */
      svcRows.forEach((row, i) => {
        const order = svcRows.length - 1 - i;          // 最後の行から先に消す
        /* ずらし量は行数で割って全体の幅を一定に保つ（固定0.04だと行が増えたとき
           最後の行が pT=1 までに消えきらない） */
        const step = svcRows.length > 1 ? 0.10 / (svcRows.length - 1) : 0;
        const out = seg(pT, 0.84 + order * step, 0.94 + order * step);
        row.style.transform = `translateX(${(-out * 30).toFixed(1)}vw)`;
        row.style.opacity = (1 - out).toFixed(3);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onResize = () => { measureTrack(); onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    /* 測り直したら必ず描き直す（初回はレイアウト確定前で 0 を拾うため、
       ResizeObserver の初回発火で正しい寸法に更新される） */
    const ro = track ? new ResizeObserver(() => { measureTrack(); onScroll(); }) : null;
    if (track && ro) ro.observe(track);
    measureTrack();
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
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
          /* 統合ピン：コンテンツは前半56%に圧縮（転換に後半を空ける）。その中の3〜20%で染まる */
          const len = Math.max(1, pin.offsetHeight - vh);
          const top = pin.getBoundingClientRect().top + window.scrollY;
          const pp = Math.min(1, Math.max(0, (window.scrollY - top) / len));
          const pC = Math.min(1, pp / 0.56);
          p = Math.min(1, Math.max(0, (pC - 0.03) / 0.17));
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

  /* ---- STRENGTHS：白いキューブが上から落ちて転がり→展開→内容が現れる（ピン進行度で駆動） ---- */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pin = document.querySelector<HTMLElement>(".wc2-str-pin");
    if (!pin) return;
    const cube = pin.querySelector<HTMLElement>(".wc2-cube");
    const cubeWrap = pin.querySelector<HTMLElement>(".wc2-cube-wrap");
    const shadow = pin.querySelector<HTMLElement>(".wc2-cube-shadow");
    const head = pin.querySelector<HTMLElement>(".wc2-str-head");
    let raf = 0;
    const ss = (t: number) => t * t * (3 - 2 * t);
    const seg = (p: number, a: number, b: number) => ss(Math.min(1, Math.max(0, (p - a) / (b - a))));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);          // ease-out（落下）
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const len = Math.max(1, pin.offsetHeight - vh);
      const top = pin.getBoundingClientRect().top + window.scrollY;
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / len));

      /* overshoot（バウンド）付き ease：着地・回転の“カチッ”を出す */
      const back = (t: number) => { const c = 1.70158; return t <= 0 ? 0 : t >= 1 ? 1 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

      /* 見出しとキューブの配置。広い画面は「見出し｜約2cm｜キューブ」を中央のまとまりに。
         狭い画面（モバイル）は横に収まらないので縦積み（見出し上・中央／キューブ下・中央）にする */
      const vw = window.innerWidth;
      const mobile = vw < 680;
      const rs = mobile
        ? 0.58
        : Math.max(0.6, Math.min(1, (vw - 760) / 680 * 0.4 + 0.6));  // 狭い画面はキューブ縮小
      const GAP = 76;                                                 // ≈2cm
      const cubeHalf = 150 * rs;                                      // 静止時（rotateY=0）の半幅px
      const hw = head ? head.offsetWidth : 380;                       // 見出しの実測幅
      const groupLeft = Math.max(24, (vw - (hw + GAP + cubeHalf * 2)) / 2);
      const cubeCenterPx = groupLeft + hw + GAP + cubeHalf;
      /* デスクトップ＝中央まとまりの右側／モバイル＝画面中央（縦積み） */
      const xEnd = mobile ? 0 : (cubeCenterPx - vw / 2) / vw * 100;
      const headLeft = mobile ? (vw - hw) / 2 : groupLeft;
      const headExtraY = mobile ? -14 : 0;                            // モバイルは見出しをやや上へ（上部ボタンは避ける）(vh)
      const cubeYFinal = mobile ? 22 : 0;                             // モバイルはキューブを下へ(vh)

      /* ① 見出しが上から投げられてバウンド着地（0.00〜0.16） */
      if (head) {
        const hb = back(seg(p, 0.00, 0.16));                          // overshoot で放り込まれた感
        head.style.left = `${headLeft.toFixed(0)}px`;
        head.style.opacity = seg(p, 0.00, 0.08).toFixed(3);
        head.style.transform = `translateY(calc(-50% + ${(headExtraY + (1 - hb) * -58).toFixed(1)}vh))`;
      }

      /* ② 斜め右上から落下＋転がり（0.08〜0.36）→ 中央のまとまりの右側に着地、着地で軽くバウンド */
      if (cube && cubeWrap) {
        const drop = seg(p, 0.08, 0.36);
        const roll = ease(drop);                                      // 0→1
        const x = xEnd + (1 - roll) * 34;                            // 右上から定位置へ（画面中央基準）
        const y = (1 - roll) * -76 + cubeYFinal * roll;              // 上から。モバイルは見出しの下(cubeYFinal)へ着地
        const settle = drop > 0.84 ? Math.sin((drop - 0.84) / 0.16 * Math.PI) * 5 : 0;  // 着地バウンド
        cubeWrap.style.transform = `translate(${x.toFixed(1)}vw, ${(y + settle).toFixed(1)}vh)`;

        /* ③ 90°ずつの回転ショーケース：01→02→03→04（各ステップ overshoot でカチッ） */
        const s1 = back(seg(p, 0.40, 0.52));
        const s2 = back(seg(p, 0.56, 0.68));
        const s3 = back(seg(p, 0.72, 0.84));
        const showRY = -90 * (s1 + s2 + s3);                          // 0 → -270（4側面を順に正面へ）

        const tumble = 1 - roll;                                      // 落下中だけ効く 1→0
        const rx = -13 * roll + 26 * tumble;                          // 着地時 -13°の見下ろし＋落下中の余分な傾き
        const ry = showRY - 540 * tumble;                             // 落下中は転がり、着地で showRY に収束
        const rz = tumble * -24;                                      // 斜め落下の傾き（着地で0）
        cube.style.transform = `rotateZ(${rz.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) scale(${rs.toFixed(3)})`;

        /* 床の設置影：Xはキューブに追従、落下で濃く/大きく、着地でキュッと締まる */
        if (shadow) {
          const sc = (0.42 + roll * 0.6 - Math.max(0, settle) * 0.03) * rs;
          shadow.style.transform = `translate(${x.toFixed(1)}vw, calc(${(158 * rs).toFixed(0)}px + ${(cubeYFinal * roll).toFixed(1)}vh)) scale(${sc.toFixed(3)})`;
          shadow.style.opacity = (roll * 0.85).toFixed(3);
        }
      }
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

  /* ---- PROCESS：宇宙の航路（彗星が 01→06 を巡り、到達した寄港地が点灯・走破線が伸びる） ---- */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pin = document.querySelector<HTMLElement>(".wc2-route-pin");
    if (!pin) return;
    const world = pin.querySelector<HTMLElement>(".wc2-route-world");
    const stations = Array.from(pin.querySelectorAll<HTMLElement>(".wc2-station"));
    const comet = pin.querySelector<HTMLElement>(".wc2-comet");
    const base = pin.querySelector<SVGPolylineElement>(".wc2-route-base");
    const trail = pin.querySelector<SVGPolylineElement>(".wc2-route-trail");
    const N = ROUTE_POS.length;

    /* ---- 寄港地の配置をレイアウトから計算する ----
       カードは左右交互（外向き）に開くのが基本。ただし左開きのカードは左上の見出し帯と
       ぶつかるため、「見出しの右端＋カード幅」が収まる場合だけ交互にし、
       収まらない狭い画面では全て右開きにフォールバックする。
       x は毎回計算するので、以降の描画（線・彗星）も pos を参照する。 */
    const pos = ROUTE_POS.map((p) => ({ ...p }));
    const stageEl = pin.querySelector<HTMLElement>(".wc2-route-stage");
    const headEl = pin.querySelector<HTMLElement>(".wc2-route-head");
    const layout = () => {
      /* transform の影響を受けない layout 値で測る（world が縮小されているため） */
      const stageW = stageEl?.offsetWidth || window.innerWidth;
      const cardW = Math.min(384, window.innerWidth * 0.26);
      const headRight = headEl ? headEl.offsetLeft + headEl.offsetWidth : 0;
      const NODE = 26;                                  // ノードとカードの隙間（CSSと対）
      const areaL = headRight + 32;                     // 見出しの右にとる最小の間隔
      const areaR = stageW - 16;
      const leftX = areaL + cardW + NODE;               // 左開きカードの左端が areaL に来るノード位置
      const rightX = areaR - cardW - NODE;              // 右開きカードの右端が areaR に来るノード位置
      const alt = rightX - leftX >= 80;                 // 左右交互に置けるだけの幅があるか
      stations.forEach((el, i) => {
        const isL = i % 2 === 0;
        pos[i].y = ROUTE_POS[i].y;
        pos[i].x = alt ? ((isL ? leftX : rightX) / stageW) * 100 : ROUTE_POS[i].x;
        el.dataset.side = alt ? (isL ? "l" : "r") : "r";
        el.style.left = `${pos[i].x.toFixed(2)}%`;
        el.style.top = `${pos[i].y}%`;
      });
      if (base) base.setAttribute("points", pos.map((n) => `${n.x.toFixed(2)},${n.y}`).join(" "));
    };
    layout();

    let raf = 0;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const ss = (t: number) => t * t * (3 - 2 * t);
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const len = Math.max(1, pin.offsetHeight - vh);
      const top = pin.getBoundingClientRect().top + window.scrollY;
      const p = clamp01((window.scrollY - top) / len);

      /* ★ セクション転換：先頭で暗黒からワープイン（奥から迫り＋ピントが合う）、末尾はクリーンにフェードアウト（→CONTACTで中心から出現） */
      const intro = ss(clamp01(p / 0.14));
      const outro = ss(clamp01((p - 0.86) / 0.14));
      if (world) {
        world.style.opacity = (intro * (1 - outro)).toFixed(3); // 末尾で背景ごとフェードアウト
        const scale = 0.5 + 0.5 * intro - 0.06 * outro;        // 奥(0.5)→定位置(1)→軽く引く(0.94)
        const blur = (1 - intro) * 12;                         // イン時だけボケ→クリアに（アウトはボケなし）
        world.style.transform = `scale(${scale.toFixed(3)})`;
        world.style.filter = `blur(${blur.toFixed(1)}px)`;
      }

      /* 彗星の航行は中盤（0.14〜0.88）に割り当て、イン/アウトの余白を確保 */
      const travel = clamp01((p - 0.14) / 0.74);
      const seg = travel * (N - 1);                             // 進行度（0〜N-1）
      const ci = Math.min(N - 1, Math.floor(seg));
      const cf = seg - ci;
      const a = pos[ci];
      const b = pos[Math.min(N - 1, ci + 1)];
      const cx = a.x + (b.x - a.x) * cf;                        // 彗星の現在位置（%）
      const cy = a.y + (b.y - a.y) * cf;

      if (comet) { comet.style.left = `${cx.toFixed(2)}%`; comet.style.top = `${cy.toFixed(2)}%`; }
      /* 走破線：通過済みノード＋彗星の先端まで */
      if (trail) {
        const pts: string[] = [];
        for (let i = 0; i <= ci; i++) pts.push(`${pos[i].x.toFixed(2)},${pos[i].y}`);
        pts.push(`${cx.toFixed(2)},${cy.toFixed(2)}`);
        trail.setAttribute("points", pts.join(" "));
      }
      /* 各寄港地：接近で点灯し、以降は点灯・カードとも維持（文言を消さない） */
      stations.forEach((el, i) => {
        const reveal = clamp01((seg - (i - 0.6)) / 0.6);       // i の0.6手前から点灯 →到達で1
        el.style.setProperty("--op", (0.14 + 0.86 * reveal).toFixed(3));
        const pulse = Math.max(0, 1 - Math.abs(seg - i) / 0.5); // 到達付近だけ波紋
        el.style.setProperty("--pulse", pulse.toFixed(3));
        const cardR = clamp01((seg - (i - 0.5)) / 0.5);        // 到達手前で1→以降ずっと表示維持
        el.style.setProperty("--card", cardR.toFixed(3));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    /* 幅が変わると「交互に置けるか」の判定と各xが変わるので、リサイズで配置し直す */
    const onResize = () => { layout(); onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    /* 見出しの実寸が確定してから配置を確定させる（初回はレイアウト確定前で 0 を拾うため） */
    const ro = headEl ? new ResizeObserver(() => { layout(); onScroll(); }) : null;
    if (headEl && ro) ro.observe(headEl);
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- 設計図の白い点：グリッド線の上を、交点で進路を変えながら自由に動く ---- */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.querySelector<HTMLCanvasElement>(".wc2-bp-dots");
    const host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const G = 34;                          // 細方眼の間隔（見えている方眼の網と一致＝必ず線の上）
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      const r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    /* マウント直後はレイアウト未確定で 0 を拾うことがある（canvas が 1x1 になる）。
       少し遅らせて測り直し＋窓リサイズにも追従 */
    const lateResize = window.setTimeout(resize, 120);
    window.addEventListener("resize", resize);

    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const cols = () => Math.floor(W / G);
    const rows = () => Math.floor(H / G);
    const ri = (n: number) => Math.floor(Math.random() * n);
    type Dot = { x: number; y: number; dx: number; dy: number; tx: number; ty: number; spd: number };
    const inB = (x: number, y: number) => x >= 0 && x <= cols() * G && y >= 0 && y <= rows() * G;
    /* 交点に着いたら次の目標へ。細方眼だと毎マス曲がるとガタつくので、
       基本は直進（85%）、たまに交点で90°曲がる。必ず線の上を辿る */
    const retarget = (o: Dot) => {
      if ((o.dx !== 0 || o.dy !== 0) && Math.random() < 0.85 && inB(o.x + o.dx * G, o.y + o.dy * G)) {
        o.tx = o.x + o.dx * G; o.ty = o.y + o.dy * G;   // 直進
        return;
      }
      const opts = DIRS
        .filter(d => !(d[0] === -o.dx && d[1] === -o.dy))
        .filter(d => inB(o.x + d[0] * G, o.y + d[1] * G));
      const d = opts.length ? opts[ri(opts.length)] : [-o.dx, -o.dy];
      o.dx = d[0]; o.dy = d[1];
      o.tx = o.x + d[0] * G; o.ty = o.y + d[1] * G;
    };
    const N = 14;                          // 控えめな数
    const dots: Dot[] = [];
    for (let i = 0; i < N; i++) {
      const gx = ri(cols() + 1) * G, gy = ri(rows() + 1) * G;
      const d0 = DIRS[ri(4)];
      const o: Dot = { x: gx, y: gy, dx: d0[0], dy: d0[1], tx: gx, ty: gy, spd: 34 + Math.random() * 46 };
      retarget(o);
      dots.push(o);
    }

    let raf = 0, last = 0, disposed = false;
    const frame = (t: number) => {
      if (disposed) return;
      /* 自己修復：バッファと実サイズがずれていたら測り直す（1x1 対策） */
      const needW = Math.round((host.clientWidth || 0) * dpr);
      if (host.clientWidth > 0 && Math.abs(cv.width - needW) > 2) resize();
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#eef2ff";
      ctx.shadowColor = "rgba(170,205,255,.9)";
      ctx.shadowBlur = 7;
      const cvg = convergeRef.current;          // 0=通常, 1=完全に中央へ吸い込み
      const cx = W / 2, cy = H / 2;
      dots.forEach(o => {
        const mx = o.tx - o.x, my = o.ty - o.y;
        const dist = Math.hypot(mx, my);
        const step = o.spd * dt;
        if (dist <= step || dist === 0) { o.x = o.tx; o.y = o.ty; retarget(o); }
        else { o.x += (mx / dist) * step; o.y += (my / dist) * step; }
        /* 吸い込み：描画位置を中央へ寄せる（論理位置＝線上は保ったまま見た目だけ収束） */
        const dx = cvg > 0 ? o.x + (cx - o.x) * cvg : o.x;
        const dy = cvg > 0 ? o.y + (cy - o.y) * cvg : o.y;
        ctx.beginPath(); ctx.arc(dx, dy, 1.6, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    frame(0);                              // 凍結環境でも1枚は描く
    return () => {
      disposed = true; cancelAnimationFrame(raf);
      window.clearTimeout(lateResize); window.removeEventListener("resize", resize);
      ro.disconnect();
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

  /* ---- セクション転換のワープ・カーテン：継ぎ目でハイパースペースが被さり、縦スクロールを隠して次を出す ---- */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.querySelector<HTMLCanvasElement>(".wc2-warp");
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    /* 放射状に流れる星（角度・開始半径・太さ・色相を固定生成） */
    const STARS = Array.from({ length: 150 }, (_, i) => ({
      ang: (i * 2.399963) % (Math.PI * 2),          // 黄金角でばらける
      r0: 0.02 + ((i * 53) % 100) / 100 * 0.5,      // 開始半径（画面短辺比）
      w: 0.6 + ((i * 17) % 10) / 10 * 1.6,
      hue: [200, 210, 190, 0][i % 4],               // 青系＋たまに白
      sat: [70, 60, 80, 0][i % 4],
    }));

    let w = 1, h = 1, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cv.clientWidth || window.innerWidth;
      h = cv.clientHeight || window.innerHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
    };
    resize();

    /* 継ぎ目（大きなセクションの上端＝ハンドオフ位置）を収集 */
    let seams: number[] = [];
    const collectSeams = () => {
      /* ワープ・カーテンは STRENGTHS→PROCESS(航路) の継ぎ目だけで発火する。
         Hero→APPROACH（Heroのダイブ→暗転）／SERVICES→STRENGTHS（キューブ落下）／CONTACT（別演出）は除外 */
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".wc2-route-sec")
      );
      seams = els.map((el) => el.getBoundingClientRect().top + window.scrollY).sort((a, b) => a - b);
    };
    collectSeams();

    let raf = 0;
    const draw = () => {
      raf = 0;
      if (cv.width !== Math.round(w * dpr) || w <= 1) resize();   // 自己修復
      const vh = window.innerHeight || 1;                          // 0除算回避（NaN防止）
      const y = window.scrollY;
      /* 各継ぎ目への近さから強度を算出（ハンドオフ手前で最大＝縦スクロールを隠す） */
      let intensity = 0;
      for (const s of seams) {
        const peak = s - vh * 0.5;                                 // 継ぎ目の平坦スクロール中央
        const d = Math.abs(y - peak) / (vh * 0.5);                 // ±0.5vh で 0..1
        intensity = Math.max(intensity, Math.max(0, 1 - d));
      }
      const t = intensity * intensity * (3 - 2 * intensity);       // smoothstep

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!(t > 0.001) || w <= 1) { return; }                      // NaN・未確定サイズは描画しない

      const cx = w / 2, cy = h / 2;
      const minSide = Math.min(w, h);
      /* 覆い（縦スクロールを隠す暗幕）＋中心の発光 */
      ctx.fillStyle = `rgba(4,6,12,${(t * 0.9).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minSide * 0.7);
      glow.addColorStop(0, `rgba(150,200,255,${(t * 0.5).toFixed(3)})`);
      glow.addColorStop(0.4, `rgba(90,150,255,${(t * 0.12).toFixed(3)})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      /* 星が中心から放射状に流れる（強度で伸びる／スクロールでわずかに回る） */
      const spin = y * 0.0006;
      const streak = minSide * (0.18 + 0.9 * t);                   // 伸び
      ctx.lineCap = "round";
      for (const st of STARS) {
        const a = st.ang + spin;
        const dx = Math.cos(a), dy = Math.sin(a);
        const r1 = st.r0 * minSide + streak * 0.15;
        const r2 = r1 + streak * (0.4 + st.r0);                    // 外側ほど長い尾
        const col = st.sat === 0 ? `rgba(255,255,255,${(t * 0.95).toFixed(3)})` : `hsla(${st.hue},${st.sat}%,72%,${(t * 0.9).toFixed(3)})`;
        ctx.strokeStyle = col;
        ctx.lineWidth = st.w * (0.6 + t);
        ctx.beginPath();
        ctx.moveTo(cx + dx * r1, cy + dy * r1);
        ctx.lineTo(cx + dx * r2, cy + dy * r2);
        ctx.stroke();
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onResize = () => { resize(); collectSeams(); onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    const heal = window.setTimeout(onResize, 200);                 // マウント直後の 1x1 対策
    draw();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(heal);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- CONTACT：PROCESSがフェードアウトした後、中心から「話しましょう」が拡大して出現 ---- */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pin = document.querySelector<HTMLElement>(".wc2-contact-pin");
    if (!pin) return;
    const inner = pin.querySelector<HTMLElement>(".wc2-contact-inner");
    if (!inner) return;
    let raf = 0;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    /* back-ease-out：中心からポンッと出るオーバーシュート */
    const back = (t: number) => { const c = 1.70158; return t <= 0 ? 0 : t >= 1 ? 1 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
    const tick = () => {
      raf = 0;
      const len = Math.max(1, pin.offsetHeight - window.innerHeight);
      const top = pin.getBoundingClientRect().top + window.scrollY;
      const p = clamp01((window.scrollY - top) / len);
      const e = back(clamp01(p / 0.45));                      // 前半で出現、以降は静止
      inner.style.opacity = clamp01(p / 0.30).toFixed(3);
      inner.style.transform = `scale(${(0.4 + 0.6 * e).toFixed(3)})`;
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

  return (
    <>
      {!introDone && <Opening onDone={() => setIntroDone(true)} />}
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <main className={`wc2-page ${loaded ? "is-ready" : ""}`}>
        <Scene3D />
        {/* 白のあとの暗色セクション用：設計図グリッド（製図台）の背景。
           以降の暗色セクションの世界。opacity は捲れと同時に JS が 0→1 */}
        <div className="wc2-aurora" aria-hidden="true"></div>
        <div className="wc2-cursor-dot" ref={dotRef} aria-hidden="true"></div>
        <div className="wc2-cursor-ring" ref={ringRef} aria-hidden="true"></div>

        {/* ============ HERO：PS2オープニング（縦に長い区間＝靄へのダイブ） ============ */}
        <section id="wc2-hero" className="wc2-hero">
          <div className="wc2-hero-sticky">
            <div className="wc2-wrap wc2-hero-copy" ref={heroCopyRef}>
              <p className="wc2-hero-tag"><i>●</i> SMASK — WEB CONTENT STUDIO</p>
              {/* 1行組み（2026-07-31 代表決定）。虹色は後半「かたちにする。」だけに掛ける */}
              <h1 className="wc2-hero-h1">
                <span className="wc2-hl">
                  <span>価値を見極め、<i className="wc2-hl-tail">かたちにする。</i></span>
                </span>
              </h1>
              <p className="wc2-hero-sub">伝わるWebを、動かすまで。</p>
              <p className="wc2-hero-lead">
                SMASKは、事業を理解し、情報・文章・導線・デザイン・実装・運用をつなぐWebコンテンツ制作会社です。<br />
                企業やサービスが持つ価値を整理し、相手に伝わり、次の行動へ進みやすいWebを設計します。
              </p>
              {/* T-1で保留していたHero CTA。事業内容(P-A)・制作実績(P-B)が揃ったので配線 */}
              <div className="wc2-hero-cta">
                <a href="/business">事業内容を見る <span aria-hidden="true">→</span></a>
                <a href="/works">制作実績を見る <span aria-hidden="true">→</span></a>
              </div>
              <div className="wc2-hero-scroll" aria-hidden="true">
                <span>SCROLL</span>
                <i></i>
              </div>
            </div>
          </div>
        </section>

        {/* ダイブ終端の完全暗転幕（スクロール駆動） */}
        <div className="wc2-blackout" ref={blackoutRef} aria-hidden="true"></div>

        {/* ============ ABOUT：SMASKとは（Hero と APPROACH の間・通常スクロール） ============
             暗転が明けて最初に読ませる導入。3Dの靄の上に浮かぶ透過セクション。
             入場は data-reveal / data-reveal-stagger（他セクションと同じ流儀）。
             3Dのスクロール振り付け（ピン留め）は足さない（普通のスクロールセクション） */}
        <section id="wc2-about-sec" className="wc2-sec wc2-about-sec">
          <div className="wc2-wrap wc2-about-copy">
            <span className="wc2-label" data-reveal>( 01 ) — ABOUT</span>
            {/* ルール（行末に「、」を残さない）：デザイン改行の読点は落とし、改行が間を担う */}
            <h2 className="wc2-h2 wc2-about-head" data-reveal>Webをつくる前に<br /><em>事業を理解する。</em></h2>
            {/* 本文：1文1段落（「。」の後に文を続けない）。.wc2-page p に負けないようスコープ指定 */}
            <div className="wc2-about-body" data-reveal-stagger>
              <p>Webサイトは、情報を並べ、見た目を整えるだけでは、事業の価値まで十分に伝えられません。</p>
              <p>誰に、何を、どの順番で伝えるのか。その出発点は、会社や事業を深く理解することです。</p>
              <p>SMASKは、企業が持つ価値や強みをともに整理し、文章、導線、デザイン、実装仕様へ一貫してつなげます。</p>
            </div>
            {/* 会社概要へ：App の leave-curtain 遷移に委譲（通常アンカー） */}
            <a className="wc2-about-cta" href="/company" data-reveal>SMASKについて <span aria-hidden="true">→</span></a>
          </div>
        </section>

        {/* ============ APPROACH＋白の転調：ひと続きのピン留め画面 ============
             前半＝文字の染色→本文フェード（帯は画面上部に常駐）。
             後半＝固定したまま白帯が「下から上へ」伸びて画面全体が白になり、
             白になりかけで WORKS の見出しがフェードイン ============ */}
        <section id="wc2-approach-sec" className="wc2-sec wc2-approach-sec wc2-pin">
          <div className="wc2-pin-sticky">
            {/* 帯：ピン画面の上部に常駐（文字の染色中も見えている） */}
            <div className="wc2-marquee wc2-marquee--pin" aria-hidden="true">
              <div className="wc2-marquee-track">
                <span>{MARQUEE.repeat(4)}</span>
                <span>{MARQUEE.repeat(4)}</span>
              </div>
            </div>
            <div className="wc2-wrap">
              <span className="wc2-label">( 02 ) — APPROACH</span>
              {/* ルール②（行末に「、」を残さない）：デザイン改行の読点は落とし、改行が間を担う */}
              <h2 className="wc2-h2 wc2-fill">情報を選び・つなぎ<br /><em>伝わる流れに整える。</em></h2>
              {/* .wc2-approach-cols は JS が opacity を駆動する容器（クラス名は変更しない）。
                  中身だけ「本文2文 ＋ 3小項目（見極める/つなぐ/動かす）」に組み替える */}
              <div className="wc2-approach-cols">
                <div className="wc2-approach-body">
                  <p>大切なのは、情報の量ではなく、何を選び、どの順番でつなぐかです。</p>
                  <p>SMASKは、必要な情報を見極め、理解しやすい流れへ組み直し、次の行動へ進みやすいWebを設計します。</p>
                </div>
                <ul className="wc2-approach-points">
                  <li>
                    <h3>見極める</h3>
                    <p>伝えるべき価値と、情報の優先順位を整理します。</p>
                  </li>
                  <li>
                    <h3>つなぐ</h3>
                    <p>文章、導線、デザイン、実装仕様を分断せず、一貫したWebサイトへまとめます。</p>
                  </li>
                  <li>
                    <h3>動かす</h3>
                    <p>公開を終点にせず、更新や改善まで考え、事業の中で使われ続けるWebを目指します。</p>
                  </li>
                </ul>
              </div>
            </div>
            {/* 白の転調：下の帯から順に立ち上がる（APPROACHの文字ごと呑み込む） */}
            <div className="wc2-stripes" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            {/* WORKS：タイトルは中央→上へ移動（文字は上）。カードは下段で横スクロールして
               左→右に流れる（trionn 準拠）。全てスクロール同期 */}
            <div id="wc2-works" className="wc2-worksreveal">
              {/* 見出し左／本文・CTA右の2カラム。カード帯（top:40vh）と固定MENUボタンに
                  挟まれた帯（約200px）に収めるための構成 */}
              <div className="wc2-worksreveal-head">
                <div className="wc2-works-headmain">
                  <span className="wc2-label">( 03 ) — WORKS</span>
                  {/* ルール②（行末に「、」を残さない） */}
                  <h2 className="wc2-h2">つくったものと<br /><em>そこに込めた考え。</em></h2>
                </div>
                <div className="wc2-works-headside">
                  <p>制作したWebサイトと、それぞれの事業や課題に対して、どのような考え方で設計したのかを紹介します。</p>
                  <p>完成した画面だけでなく、SMASKが担当した範囲も明確に掲載します。</p>
                  {/* TODO: 制作実績ページ（P-B）作成時に href を差し替える */}
                  <a className="wc2-viewall" href="/works">制作実績を見る <span aria-hidden="true">→</span></a>
                </div>
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
                        {/* 表示区分（統合仕様） */}
                        <span className="wc2-work-kind">{w.kind}</span>
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
              {/* 設計図の“描画”レイヤー：太グリッド・見当・寸法・表題欄。
                  clip-path で左→右に「線が引かれていく」（JS駆動） */}
              <div className="wc2-bp-draw" aria-hidden="true">
                <span className="wc2-bp-reg tl"></span><span className="wc2-bp-reg tr"></span>
                <span className="wc2-bp-reg bl"></span><span className="wc2-bp-reg br"></span>
                <div className="wc2-bp-dim"><b>W 1440</b></div>
                <div className="wc2-bp-title">
                  <div><span>SHEET</span><span>04 / CONCERNS</span></div>
                  <div><span>SCALE</span><span>1 : 1</span></div>
                  <div><span>REV</span><span>A — 2026.07</span></div>
                </div>
              </div>
              {/* 線を描き終わったあと、グリッド線の上を白い点が自由に動く（数は控えめ） */}
              <canvas className="wc2-bp-dots" aria-hidden="true"></canvas>
              {/* CONCERNS→SERVICES 転換：左から現れる「種」の白点と、そこから広がる白い円 */}
              <span className="wc2-c2s-seed" aria-hidden="true"></span>
              <div className="wc2-c2s-white" aria-hidden="true"></div>
              {/* 白が弾けた直後、SERVICES 全体が中央から爆発的に現れる（白の上） */}
              <div id="wc2-services" className="wc2-c2s-services">
                <div className="wc2-c2s-emerge">
                  <div className="wc2-wrap wc2-services-headwrap">
                    <span className="wc2-label">( 05 ) — SERVICES</span>
                    {/* ルール②（行末に「、」を残さない） */}
                    <h2 className="wc2-h2">事業の理解から<br /><em>公開後の改善まで。</em></h2>
                    <div className="wc2-services-body">
                      <p>SMASKは、事業理解、情報整理、文章、導線、デザイン、実装連携、運用までを一つの流れとして考えます。</p>
                      <p>必要な工程をつなぎ、伝える内容と実際のWebサイトにずれが生まれないように制作します。</p>
                    </div>
                  </div>
                  <div className="wc2-rows">
                    {SERVICES.map(([num, title, body]) => (
                      <div className="wc2-row" key={num}>
                        <span className="wc2-row-rule" aria-hidden="true"></span>
                        <div className="wc2-wrap wc2-row-in">
                          {/* 接頭辞「SV-」は外し、番号だけ残す（FB-9・2026-08-01 代表指示）。
                              この列は .wc2-row-in の3列グリッド（5rem/1fr/1.2fr）の1列目。
                              消すと見出しが番号の列に入り込んで崩れるので、必ず要素は置くこと */}
                          <span className="wc2-row-num">{num}</span>
                          <h3>{title}</h3>
                          <p>{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="wc2-wrap wc2-services-ctawrap">
                    {/* TODO: 事業内容ページ（P-A）作成時に href を差し替える */}
                    <a className="wc2-services-cta" href="/business">事業内容を見る <span aria-hidden="true">→</span></a>
                  </div>
                </div>
              </div>
              <div id="wc2-concerns" className="wc2-wipe-inner">
                <span className="wc2-label wc2-eyebrow-iri"><i></i>( 04 ) — CONCERNS</span>
                {/* ルール②（行末に「、」を残さない） */}
                <h2 className="wc2-h2">企業の中にある価値を<br /><em>伝わるかたちへ。</em></h2>
                <div className="wc2-concerns-body">
                  <p>事業やサービスに価値があっても、伝える内容や順番が整理されていなければ、Webを見た人に十分に届きません。</p>
                  <p>SMASKは、企業の中にある情報を整理し、理解しやすく、次の行動へ進みやすいかたちへ整えます。</p>
                </div>
                <ul className="wc2-chips">
                  {CONCERNS.map((text, i) => <li key={text} data-n={`C-0${i + 1}`}>{text}</li>)}
                </ul>
                <a className="wc2-concerns-cta" href="/contact">制作について相談する <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STRENGTHS：見出しが上から投げられてバウンド／4側面に強みを持つ白キューブが落ちて回転ショーケース ============ */}
        <section id="wc2-strengths-sec" className="wc2-sec wc2-strengths-sec">
          <div className="wc2-str-pin">
            <div className="wc2-str-stage">
              {/* 左：見出し（上から投げられたようにバウンドして着地） */}
              <div className="wc2-str-head">
                <span className="wc2-label">( 06 ) — STRENGTHS</span>
                {/* ルール②（行末に「、」を残さない） */}
                {/* キューブが真横にいるため1行あたりを短くし3行に割る＝Tier1(110px)でも構図が保てる */}
                <h2 className="wc2-h2">分けてつくらず<br /><em>つないで<br />仕上げる。</em></h2>
                <div className="wc2-str-body">
                  <p>SMASKは、事業理解、文章、導線、デザイン、実装を別々に考えません。</p>
                  <p>各工程をつなぎ、伝える内容と実際のWebサイトが一貫するように制作します。</p>
                </div>
                {/* TODO: 事業内容ページ（P-A）作成時に href を差し替える */}
                <a className="wc2-str-cta" href="/business">SMASKの制作について見る <span aria-hidden="true">→</span></a>
                <span className="wc2-str-hint" aria-hidden="true">SCROLL — キューブが回転し、4つの強みが順に現れます</span>
              </div>
              {/* 床の設置影（落下・着地に合わせて濃く/大きく） */}
              <div className="wc2-cube-shadow" aria-hidden="true"></div>
              {/* 右：4側面（01〜04）に強みを刻んだ白キューブ。斜め上から落ちて転がり、90°ずつ回転して各面を見せる */}
              <div className="wc2-cube-wrap" aria-hidden="true">
                <div className="wc2-cube">
                  {STRENGTHS.map(([num, title, body], i) => (
                    <span className={`wc2-face wc2-face-str ${["wc2-face-front", "wc2-face-right", "wc2-face-back", "wc2-face-left"][i]}`} key={num}>
                      <b className="wc2-fn">{num}</b>
                      <b className="wc2-ft">{title}</b>
                      <span className="wc2-fb">{body}</span>
                    </span>
                  ))}
                  <span className="wc2-face wc2-face-top"><span className="wc2-fmark">SMASK</span></span>
                  <span className="wc2-face wc2-face-bottom"></span>
                </div>
              </div>
              {/* reduced-motion 用フォールバック：通常グリッド */}
              <div className="wc2-str-grid wc2-str-grid--fb">
                {STRENGTHS.map(([num, title, body]) => (
                  <div className="wc2-str-item" key={num}>
                    <span className="wc2-str-num">{num}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROCESS：宇宙の航路（スクロールで彗星が 01→06 を巡り、寄港地が点灯） ============ */}
        <section id="wc2-route-sec" className="wc2-sec wc2-route-sec">
          <div className="wc2-route-pin">
            <div className="wc2-route-stage">
              {/* ワープイン/アウト用ラッパ（ピン先頭で暗転→出現、末尾でズームアウト） */}
              <div className="wc2-route-world">
                <div className="wc2-route-head">
                  <span className="wc2-label">( 07 ) — PROCESS</span>
                  {/* ルール②（行末に「、」を残さない） */}
                  <h2 className="wc2-h2">話すところから<br /><em>公開後まで。</em></h2>
                  <div className="wc2-route-body">
                    <p>要件が固まっていない段階でも、まずは事業や課題についてお聞かせください。</p>
                    <p>対話を通じて必要な情報を整理し、案件に合った進め方を組み立てます。</p>
                  </div>
                  {/* TODO: 事業内容ページ（P-A）作成時に href を差し替える */}
                  <a className="wc2-route-cta" href="/business">制作の進め方を見る <span aria-hidden="true">→</span></a>
                  <span className="wc2-route-hint" aria-hidden="true">SCROLL — 航路をたどって 01 → 06</span>
                </div>
                {/* 航路：薄い全体線＋発光する走破線（座標は%、非スケール描画） */}
                <svg className="wc2-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline className="wc2-route-base" points="" fill="none" />
                  <polyline className="wc2-route-trail" points="" fill="none" />
                </svg>
                {/* 6つの寄港地（JSで座標・点灯を駆動） */}
                {PROCESS.map(([num, title, body], i) => (
                  <div className="wc2-station" data-i={i} key={num}>
                    <span className="wc2-st-node" aria-hidden="true"><i></i></span>
                    <div className="wc2-st-card">
                      <span className="wc2-st-num">{num}</span>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                  </div>
                ))}
                {/* 走る彗星 */}
                <div className="wc2-comet" aria-hidden="true"><span className="wc2-comet-tail"></span></div>
              </div>
              {/* reduced-motion フォールバック：通常のステップ一覧 */}
              <ol className="wc2-steps wc2-steps--fb">
                {PROCESS.map(([num, title, body]) => (
                  <li key={num}>
                    <span className="wc2-step-num">{num}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============ COMPANY：会社概要への導線（通常スクロールの透過セクション） ============ */}
        <section id="wc2-company" className="wc2-sec wc2-company-sec">
          <div className="wc2-wrap wc2-company-copy">
            <span className="wc2-label" data-reveal>( 08 ) — COMPANY</span>
            {/* ルール②（行末に「、」を残さない） */}
            <h2 className="wc2-h2 wc2-company-head" data-reveal>Webを<br /><em>事業に使えるかたちへ。</em></h2>
            <div className="wc2-company-body" data-reveal-stagger>
              <p>株式会社スマスクは、事業を理解し、情報、文章、導線、デザイン、実装、運用をつなぐWebコンテンツ制作会社です。</p>
              <p>企業やサービスが持つ価値を整理し、次の行動へ進みやすいWebサイトを制作します。</p>
            </div>
            <a className="wc2-company-cta" href="/company" data-reveal>会社概要を見る <span aria-hidden="true">→</span></a>
          </div>
        </section>

        {/* ============ CONTACT：PROCESSがフェードアウト→中心から「話しましょう」が出現（巨大CTA） ============ */}
        <section className="wc2-sec wc2-contact">
          <div id="wc2-contact-pin" className="wc2-contact-pin">
            <div className="wc2-contact-stage">
              <div className="wc2-wrap wc2-contact-inner">
                {/* 会社概要(08)の追加に伴い繰り下げ。※コラムセクション復活時は 09→10 に戻すこと */}
                <span className="wc2-label">( 09 ) — CONTACT</span>
                <a className="wc2-talk" href="/contact">
                  <span className="wc2-talk-main"><em>話</em>しましょう</span>
                  <span className="wc2-talk-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 19 19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </a>
                <div className="wc2-contact-body">
                  <p>新しいWebサイトの制作、既存サイトの見直し、文章や導線の整理など、現在考えていることをお聞かせください。</p>
                  <p>まだ要件が固まっていない段階でも、事業や課題について伺いながら、必要な内容をともに整理します。</p>
                </div>
                <a className="wc2-contact-cta" href="/contact">制作について相談する <span aria-hidden="true">→</span></a>
                {/* 自社ロゴ（暗色背景用に反転＋色相補正＋screenで白背景を透過） */}
                <img
                  className="wc2-contact-logo"
                  src={`${import.meta.env.BASE_URL}assets/logo.jpg`}
                  alt="SMASK"
                  width="1024"
                  height="512"
                />
              </div>
            </div>
          </div>
          <div className="wc2-bridge" aria-hidden="true"></div>
        </section>

        {/* セクション転換のワープ・カーテン（継ぎ目でハイパースペースが被さって縦スクロールを隠す） */}
        <canvas className="wc2-warp" aria-hidden="true"></canvas>
      </main>
    </>
  );
}
