import { useEffect, useRef } from "react";
import "./Opening.css";

/**
 * Opening — トップ入場のオープニング演出（セッション初回のみ）。
 * three.js に依存しない軽量な 2D Canvas オーバーレイ。
 * 黒背景 →「右→左へ青い光の波」→ 中央収束 → 会社ロゴが宿る → 溶暗して靄Heroへ接続。
 *
 * 総尺 約4.2s（reduced-motion では波を省略し最大1.5s）。
 * クリック/ホイール/タッチ/キーで即スキップ（0.4sフェードアウト）。
 * 最前面（z-index はローダー 9999 より上）で覆っているだけ＝裏の Loader/Scene3D は進行してよい。
 */

/* ---- タイミング設計（秒）----
   0.0–0.6 : 黒。星屑がフェードイン
   0.6–2.2 : 青い光の波が右→左へ疾走（先頭ヘッド＋残光、粒子ダスト、浮遊クリスタル、カラー光点）
   2.2–3.2 : 中央へ収束 → 赤い菱形が点灯（中心ブルーム）→ 白ワードマーク（ロゴ）が宿る
   3.2–4.2 : ロゴを少し保持 → オーバーレイ全体をフェードアウト（+わずかに拡大） */
const T = {
  WAVE_IN: 0.6,
  WAVE_OUT: 2.7,      // 波の疾走をゆっくりに（1.6s→2.1s）
  CONVERGE_IN: 2.7,
  CONVERGE_OUT: 3.6,
  BLOOM_IN: 2.8,
  BLOOM_PEAK: 3.4,
  LOGO_IN_A: 3.0,
  LOGO_IN_B: 3.6,
  FADE_START: 3.9,
  TOTAL: 4.7,
};
/* reduced-motion 用の短縮タイムライン */
const RM = { LOGO_A: 0.1, LOGO_B: 0.6, FADE_START: 1.0, TOTAL: 1.5 };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ss = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => ss(clamp01((p - a) / (b - a)));

type Crystal = { x: number; y: number; size: number; rot: number; spin: number; ph: number };
type Bokeh = { x: number; y: number; r: number; col: string; dx: number; dy: number; ph: number };
type Star = { x: number; y: number; r: number; tw: number };

export default function Opening({ onDone }: { onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  /* onDone は Home 側で毎レンダリング新しい関数になり得る。ref 経由で参照し、
     useEffect の依存から外して「マウント時1回だけ」にする。
     （裏で走る 0→100 ローダーの setLoaded 再レンダリングで演出が頭から再生＝波が2回、を防ぐ） */
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const overlay = overlayRef.current;
    const cv = canvasRef.current;
    const logo = logoRef.current;
    if (!overlay || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) { onDoneRef.current(); return; }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const END = reduced ? RM.TOTAL : T.TOTAL;
    const FADE = reduced ? RM.FADE_START : T.FADE_START;

    /* ---- キャンバス：DPR対応・リサイズ対応 ---- */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---- 素材の初期化（決定的にばらす） ---- */
    const rnd = (() => { let s = 20260729; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; })();
    const stars: Star[] = Array.from({ length: 90 }, () => ({
      x: rnd(), y: rnd(), r: 0.4 + rnd() * 1.1, tw: rnd() * Math.PI * 2,
    }));
    const crystals: Crystal[] = Array.from({ length: 5 }, (_, i) => ({
      x: 0.15 + rnd() * 0.7, y: 0.2 + rnd() * 0.6,
      size: 26 + rnd() * 34, rot: rnd() * Math.PI, spin: (rnd() - 0.5) * 0.5, ph: i * 1.3,
    }));
    const bokehCols = ["124,212,255", "167,139,250", "255,143,178", "90,220,200"]; // 青・紫・ピンク・ティール
    const bokeh: Bokeh[] = Array.from({ length: 7 }, (_, i) => ({
      x: 0.1 + rnd() * 0.8, y: 0.15 + rnd() * 0.7, r: 60 + rnd() * 120,
      col: bokehCols[i % bokehCols.length], dx: (rnd() - 0.5) * 0.02, dy: (rnd() - 0.5) * 0.02, ph: rnd() * 6,
    }));

    /* ---- 完了処理（多重呼び出しガード） ---- */
    let done = false;
    let raf = 0;
    let skipAt: number | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      cleanupListeners();
      onDoneRef.current();
    };

    /* ---- スキップ：任意の入力で 0.4s フェードアウト ---- */
    const onSkip = () => { if (skipAt === null) skipAt = performance.now(); };
    const skipEvents: [string, AddEventListenerOptions][] = [
      ["click", {}], ["wheel", { passive: true }], ["touchstart", { passive: true }], ["keydown", {}],
    ];
    skipEvents.forEach(([ev, opt]) => window.addEventListener(ev, onSkip, opt));
    const cleanupListeners = () => {
      window.removeEventListener("resize", resize);
      skipEvents.forEach(([ev]) => window.removeEventListener(ev, onSkip));
    };

    /* ---- 波の色（先頭=水色寄りの明るさ, 尾=紫→ピンク） ---- */
    const ribbonRGB = (f: number): string => {
      // f: 0=head, 1=tail
      if (f < 0.5) { // 水色 → 紫
        const k = f / 0.5;
        const r = 124 + (167 - 124) * k, g = 212 + (139 - 212) * k, b = 255 + (250 - 255) * k;
        return `${r | 0},${g | 0},${b | 0}`;
      }
      const k = (f - 0.5) / 0.5; // 紫 → ピンク
      const r = 167 + (255 - 167) * k, g = 139 + (143 - 139) * k, b = 250 + (178 - 250) * k;
      return `${r | 0},${g | 0},${b | 0}`;
    };

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      /* 自己修復：マウント直後にレイアウト未確定で 0 を拾い canvas が 1x1 になった場合の測り直し */
      if ((W <= 1 || cv.width <= 1) && window.innerWidth > 1) resize();
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);

      /* ① 星屑（フェードイン → 波・収束で徐々に退く） */
      const starA = seg(t, 0.0, 0.6) * (1 - seg(t, T.CONVERGE_IN, T.CONVERGE_OUT) * 0.7);
      if (starA > 0.01) {
        ctx.globalCompositeOperation = "source-over";
        for (const s of stars) {
          const tw = 0.55 + 0.45 * Math.sin(t * 1.6 + s.tw);
          ctx.globalAlpha = starA * tw * 0.8;
          ctx.fillStyle = "#dfe8ff";
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      const cx = W / 2, cy = H * 0.5; // ロゴ中心＝赤菱形の中心
      const convP = seg(t, T.CONVERGE_IN, T.CONVERGE_OUT);

      if (!reduced) {
        /* ② カラー光点（ボケ）— 収束時は中央へ寄る */
        ctx.globalCompositeOperation = "lighter";
        for (const b of bokeh) {
          const bx0 = (b.x + b.dx * t) * W, by0 = (b.y + b.dy * t) * H;
          const bx = bx0 + (cx - bx0) * convP;
          const by = by0 + (cy - by0) * convP;
          const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + b.ph);
          const a = (0.05 + 0.06 * pulse) * (0.4 + 0.6 * seg(t, 0.5, 1.4)) * (1 - seg(t, T.CONVERGE_OUT - 0.1, T.CONVERGE_OUT + 0.2));
          if (a > 0.005) {
            const g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
            g.addColorStop(0, `rgba(${b.col},${a.toFixed(3)})`);
            g.addColorStop(1, `rgba(${b.col},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(bx - b.r, by - b.r, b.r * 2, b.r * 2);
          }
        }

        /* ③ 浮遊クリスタル（低ポリ片：菱形。波の先頭が近いと面が光を拾う） */
        const wp = seg(t, T.WAVE_IN, T.WAVE_OUT);
        const headX = W * 1.15 - W * 1.55 * wp; // 右外 → 左外
        const waveActive = t > T.WAVE_IN - 0.05 && t < T.CONVERGE_IN + 0.1;
        ctx.globalCompositeOperation = "source-over";
        for (const c of crystals) {
          const px = c.x * W, py = c.y * H + Math.sin(t * 0.7 + c.ph) * 10;
          const rot = c.rot + c.spin * t;
          const lit = waveActive ? Math.max(0, 1 - Math.abs(px - headX) / (W * 0.22)) : 0;
          const baseA = (0.10 + 0.28 * lit) * (0.5 + 0.5 * seg(t, 0.4, 1.0)) * (1 - convP * 0.8);
          if (baseA <= 0.01) continue;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(rot);
          const s = c.size;
          ctx.beginPath();
          ctx.moveTo(0, -s); ctx.lineTo(s * 0.62, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.62, 0); ctx.closePath();
          const gg = ctx.createLinearGradient(-s, -s, s, s);
          gg.addColorStop(0, `rgba(124,212,255,${(baseA).toFixed(3)})`);
          gg.addColorStop(1, `rgba(167,139,250,${(baseA * 0.4).toFixed(3)})`);
          ctx.fillStyle = gg;
          ctx.fill();
          ctx.strokeStyle = `rgba(210,235,255,${(baseA * (0.5 + lit)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        /* ④ 青い光の波（右→左）：先頭ヘッド＋尾を引く残光（加算合成）＋沿ったダスト */
        if (wp > 0 && wp < 1.0) {
          ctx.globalCompositeOperation = "lighter";
          const bandY = H * 0.47;
          const amp = Math.min(120, H * 0.12);
          const freq = (Math.PI * 2) / (W * 0.6);
          const tail = W * 0.5;
          const steps = 60;
          for (let i = 0; i <= steps; i++) {
            const f = i / steps;                       // 0=head, 1=tail（頭は左・尾は右）
            const x = headX + f * tail;
            if (x < -40 || x > W + 40) continue;
            const y = bandY + Math.sin(x * freq + t * 3.2) * amp * (1 - 0.2 * f);
            const a = (1 - f) * (1 - f);               // 頭ほど明るい
            const rad = 2.4 + (1 - f) * 3.2;
            const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 4);
            g.addColorStop(0, `rgba(${ribbonRGB(f)},${(a * 0.9).toFixed(3)})`);
            g.addColorStop(1, `rgba(${ribbonRGB(f)},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(x - rad * 4, y - rad * 4, rad * 8, rad * 8);
            /* リボン沿いのダスト */
            if (i % 4 === 0 && a > 0.05) {
              const jx = x + (rnd() - 0.5) * 22, jy = y + (rnd() - 0.5) * 26;
              ctx.fillStyle = `rgba(220,240,255,${(a * 0.5).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(jx, jy, 0.8 + rnd() * 1.0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          /* 先頭ヘッドの強い発光 */
          const hy = bandY + Math.sin(headX * freq + t * 3.2) * amp;
          const hr = Math.min(W, H) * 0.10;
          const hg = ctx.createRadialGradient(headX, hy, 0, headX, hy, hr);
          hg.addColorStop(0, "rgba(210,240,255,0.55)");
          hg.addColorStop(0.4, "rgba(124,212,255,0.22)");
          hg.addColorStop(1, "rgba(124,212,255,0)");
          ctx.fillStyle = hg;
          ctx.fillRect(headX - hr, hy - hr, hr * 2, hr * 2);
        }

        /* ⑤ 中央収束 → 赤い菱形が点灯（中心に小さなブルーム） */
        if (convP > 0) {
          ctx.globalCompositeOperation = "lighter";
          const bloom = seg(t, T.BLOOM_IN, T.BLOOM_PEAK);
          const decay = 1 - seg(t, T.FADE_START, T.TOTAL);
          const pulse = 0.85 + 0.15 * Math.sin(t * 7);
          const rr = Math.min(W, H) * (0.05 + 0.05 * bloom) * pulse;
          const a = bloom * 0.6 * decay;
          if (a > 0.005) {
            const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 2.4);
            rg.addColorStop(0, `rgba(255,120,60,${(a).toFixed(3)})`);
            rg.addColorStop(0.35, `rgba(226,74,20,${(a * 0.5).toFixed(3)})`);
            rg.addColorStop(1, "rgba(226,74,20,0)");
            ctx.fillStyle = rg;
            ctx.fillRect(cx - rr * 2.4, cy - rr * 2.4, rr * 4.8, rr * 4.8);
          }
        }
      }

      /* ⑥ ロゴ（DOM）：フェード＋わずかに上昇/スケールで“宿る”。菱形ブルーム先行→ワードマーク */
      if (logo) {
        const lin = reduced ? seg(t, RM.LOGO_A, RM.LOGO_B) : seg(t, T.LOGO_IN_A, T.LOGO_IN_B);
        const rise = (1 - lin) * 14;
        const sc = 0.94 + 0.06 * lin;
        logo.style.opacity = lin.toFixed(3);
        logo.style.transform = `translate(-50%, -50%) translateY(${rise.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      }

      /* ---- オーバーレイのフェードアウト（スキップ or 通常終了） ---- */
      ctx.globalCompositeOperation = "source-over";
      if (skipAt !== null) {
        const k = clamp01((now - skipAt) / 400);
        overlay.style.opacity = (1 - k).toFixed(3);
        overlay.style.transform = `scale(${(1 + 0.04 * k).toFixed(3)})`;
        if (k >= 1) { finish(); return; }
      } else {
        const fade = seg(t, FADE, END);
        overlay.style.opacity = (1 - fade).toFixed(3);
        overlay.style.transform = `scale(${(1 + 0.05 * fade).toFixed(3)})`;
        if (t >= END) { finish(); return; }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      cleanupListeners();
    };
  }, []);

  return (
    <div className="smask-opening" ref={overlayRef} role="presentation">
      <canvas className="smask-opening-canvas" ref={canvasRef} aria-hidden="true" />
      <img
        className="smask-opening-logo"
        ref={logoRef}
        src={`${import.meta.env.BASE_URL}assets/logo-white.png`}
        alt="SMASK"
        width={1024}
        height={512}
        draggable={false}
      />
    </div>
  );
}
