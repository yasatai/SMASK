import { useEffect, useRef } from "react";
import { prefersReduced } from "../motion";
import "./PageAtmos.css";

/**
 * 下層ページ共通の「暗い世界」の背景（2026-07-31 代表指示）。
 *
 * トップ（3D Home）の Hero と同じ世界観＝漆黒・中央の青い靄・丸い星屑・周辺のヴィネット。
 * ただしトップの Scene3D は three.js（631KB / gzip 162KB）を抱えており、
 * スクロールの振り付けもトップのセクション構成に強く結びついている。
 * そのため下層ページ用にはこの 2D キャンバス版を用意し、見た目だけを寄せる。
 *
 * 使い方（今後の新規ページも同じ）：
 *   <PageAtmos /> を main の直前に置くだけ。
 *   マウント中は html に .is-dark-page が付き、PageAtmos.css が
 *   サイト共通トークン（紙色・墨色・金）をダーク側へ差し替える。
 *   ヘッダー／フッター／入場カーテンはトークン経由なので自動で追従する。
 */

/* 青い靄の粒。ox/oy=中心からのずれ、ax/ay=ゆらぎ幅、sp=速さ（すべて画面比）。
   a（濃さ）はトップの Hero より抑えている：下層は靄の中心の上を本文が流れ続けるため、
   トップと同じ濃さだと本文（--color-ink-soft）のコントラストが 2.6:1 まで落ちる。
   この値で最明部でも本文 6.0:1／見出し 11.2:1 を確保している。 */
const BLOBS = [
  { hex: "#2f6fd6", r: 0.60, ox: -0.05, oy: -0.02, ax: 0.045, ay: 0.030, sp: 0.055, ph: 0.0, a: 0.19 },
  { hex: "#17a3c9", r: 0.40, ox:  0.07, oy:  0.05, ax: 0.055, ay: 0.040, sp: 0.072, ph: 1.9, a: 0.13 },
  { hex: "#5a3ec8", r: 0.46, ox:  0.02, oy: -0.09, ax: 0.050, ay: 0.035, sp: 0.045, ph: 3.6, a: 0.11 },
  { hex: "#0e3f8a", r: 0.86, ox:  0.00, oy:  0.02, ax: 0.030, ay: 0.020, sp: 0.032, ph: 5.1, a: 0.14 },
];

/* 靄は毎フレーム radial-gradient を作ると重い。一度だけ焼いて拡大表示する */
function makeBlob(hex: string): HTMLCanvasElement {
  const s = document.createElement("canvas");
  s.width = s.height = 256;
  const c = s.getContext("2d")!;
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, hex);
  g.addColorStop(0.28, hex + "99");
  g.addColorStop(0.58, hex + "3d");
  g.addColorStop(1, hex + "00");
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  return s;
}

type Dust = { x: number; y: number; r: number; a: number; vx: number; vy: number; tw: number };

export default function PageAtmos() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-dark-page");

    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return () => root.classList.remove("is-dark-page");

    const sprites = BLOBS.map(b => makeBlob(b.hex));
    let w = 0, h = 0, dust: Dust[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* 星屑の数は面積に比例（狭い画面で密になりすぎないように上限を置く） */
      const n = Math.round(Math.min(170, (w * h) / 9000));
      dust = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.5,
        a: 0.12 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 3.4,   /* px/秒 */
        vy: -1.2 - Math.random() * 4.2,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number, dt: number) => {
      const sy = window.scrollY || 0;
      ctx.clearRect(0, 0, w, h);

      /* 靄：加算合成で重ねる。スクロールでゆっくり上へ流す（弱い視差） */
      ctx.globalCompositeOperation = "lighter";
      const base = Math.min(w, h);
      BLOBS.forEach((b, i) => {
        const cx = w * 0.5 + w * b.ox + Math.sin(t * b.sp + b.ph) * w * b.ax;
        const cy = h * 0.46 + h * b.oy + Math.cos(t * b.sp * 0.84 + b.ph) * h * b.ay - sy * 0.015;
        const R = base * b.r * (1 + Math.sin(t * b.sp * 0.7 + b.ph) * 0.05);
        ctx.globalAlpha = b.a;
        ctx.drawImage(sprites[i], cx - R, cy - R, R * 2, R * 2);
      });

      /* 星屑：丸い点（トップの Scene3D と同じ理由で四角にしない）＋ゆっくり明滅 */
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#dfe8ff";
      const off = sy * 0.03;
      for (const d of dust) {
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.y < -2) d.y = h + 2; else if (d.y > h + 2) d.y = -2;
        if (d.x < -2) d.x = w + 2; else if (d.x > w + 2) d.x = -2;
        const y = ((d.y - off) % h + h) % h;
        ctx.globalAlpha = d.a * (0.55 + 0.45 * Math.sin(t * 1.1 + d.tw));
        ctx.beginPath();
        ctx.arc(d.x, y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    draw(0, 0);   /* 初回は同期で1枚描く（rAF開始までの一瞬、背景が真っ黒になるのを防ぐ） */

    /* 動きを減らす設定では、この1枚を静止画として使う */
    if (prefersReduced) {
      const onResizeStill = () => { resize(); draw(0, 0); };
      window.addEventListener("resize", onResizeStill);
      return () => {
        window.removeEventListener("resize", onResizeStill);
        root.classList.remove("is-dark-page");
      };
    }

    let raf = 0, prev = 0, t = 0;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      if (!prev) prev = ms;
      const dt = Math.min((ms - prev) / 1000, 0.05);   /* タブ復帰時の飛びを抑える */
      prev = ms;
      t += dt;
      draw(t, dt);
    };
    raf = requestAnimationFrame(loop);

    /* 非表示タブでは回さない */
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { prev = 0; raf = requestAnimationFrame(loop); }
    };
    const onResize = () => resize();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      root.classList.remove("is-dark-page");
    };
  }, []);

  return (
    <div className="page-atmos" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
