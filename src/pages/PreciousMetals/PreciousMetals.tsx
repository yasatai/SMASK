import { useEffect, useState } from "react";
import BizArrival from "../../components/BizArrival";
import { useReveal, useCountUp } from "../../useReveal";
import { EMPTY_PRICES, fetchMetalPrices, type MetalPrice } from "../../data/metalPrices";
import "./PreciousMetals.css";

const BASE = import.meta.env.BASE_URL;

/* ---- Hero背景のローソク足チャート（装飾。実データではない） ---- */
function chartBars() {
  const keys: [number, number][] = [
    [0, 0.28], [8, 0.31], [14, 0.40], [20, 0.53], [24, 0.49], [28, 0.51],
    [34, 0.55], [40, 0.59], [44, 0.70], [47, 0.96], [49, 0.76], [52, 0.85],
    [56, 0.91], [60, 0.81], [64, 0.68], [68, 0.75], [72, 0.71], [76, 0.65],
    [80, 0.57], [84, 0.55],
  ];
  const at = (i: number) => {
    let k = 0;
    while (k < keys.length - 2 && keys[k + 1][0] < i) k++;
    const [x0, y0] = keys[k], [x1, y1] = keys[k + 1];
    const t = x1 === x0 ? 0 : (i - x0) / (x1 - x0);
    const s = t * t * (3 - 2 * t);
    return y0 + (y1 - y0) * s + Math.sin(i * 7.31) * 0.017 + Math.sin(i * 2.17) * 0.011;
  };
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let prev = at(0);
  for (let i = 0; i < 84; i++) {
    const v = at(i + 1);
    out.push({
      o: prev, c: v,
      h: Math.max(prev, v) + 0.014 + Math.abs(Math.sin(i * 3.7)) * 0.02,
      l: Math.min(prev, v) - 0.014 - Math.abs(Math.sin(i * 5.1)) * 0.02,
    });
    prev = v;
  }
  return out;
}

function PmChart() {
  const data = chartBars();
  const W = 1200, H = 420, cw = W / data.length;
  const y = (v: number) => H * (1 - (v * 0.74 + 0.1));
  return (
    <svg className="pm-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      {data.map((d, i) => {
        const color = d.c >= d.o ? "var(--pm-up)" : "var(--pm-down)";
        const x = i * cw + cw / 2;
        const top = y(Math.max(d.o, d.c)), bot = y(Math.min(d.o, d.c));
        return (
          /* --d：左から右へ順に立ち上がるための時間差 */
          <g key={i} style={{ "--d": `${i * 14}ms` } as React.CSSProperties}>
            <line x1={x} y1={y(d.h)} x2={x} y2={y(d.l)} stroke={color} strokeWidth="1.3" />
            <rect x={x - cw * 0.3} y={top} width={cw * 0.6} height={Math.max(bot - top, 1.5)} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

const MONTHS = ["8月", "9月", "10月", "11月", "12月", "2026", "2月", "3月", "4月", "5月", "6月", "7月"];

/* ---- 線画アイコン ---- */
const IC = {
  home: <path d="M4.5 11 12 5l7.5 6M6.8 9.8V19h10.4V9.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  heart: <path d="M12 19.2s-6.6-4.2-8.2-8C2.6 8.4 4.4 5.6 7.3 5.6c1.9 0 3.4 1.1 4.7 2.9 1.3-1.8 2.8-2.9 4.7-2.9 2.9 0 4.7 2.8 3.5 5.6-1.6 3.8-8.2 8-8.2 8Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  question: <><circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M9.9 9.9a2.2 2.2 0 1 1 3.3 1.9c-.8.5-1.2.9-1.2 1.8v.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="16.4" r=".9" fill="currentColor" /></>,
  shield: <><path d="M12 4.6 5.6 7v4.5c0 3.9 2.6 6.5 6.4 7.9 3.8-1.4 6.4-4 6.4-7.9V7L12 4.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m9.4 11.9 1.9 1.9 3.3-3.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  clock: <><circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7.8v4.4l2.9 1.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  info: <><circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M12 11.2v4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="8.2" r=".95" fill="currentColor" /></>,
  ingot: <path d="m7.4 9.6 9.2 0 3 5.6H4.4l3-5.6Zm2.2 0 .9-2.4h3l.9 2.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  medal: <><circle cx="12" cy="14.4" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M9.4 10.2 8 5.2h8l-1.4 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="12" cy="14.4" r="1.5" fill="currentColor" /></>,
  gemHeart: <path d="M12 19.2s-6.6-4.2-8.2-8C2.6 8.4 4.4 5.6 7.3 5.6c1.9 0 3.4 1.1 4.7 2.9 1.3-1.8 2.8-2.9 4.7-2.9 2.9 0 4.7 2.8 3.5 5.6-1.6 3.8-8.2 8-8.2 8Z" fill="currentColor" />,
  tools: <path d="m5.2 5.2 5.6 5.6M10.8 5.2 5.2 10.8M14.2 14.2 18.8 18.8M18.8 5.2l-4.6 4.6M8.4 15.8 5.2 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  gem: <path d="M8.2 5.6h7.6l3 4.2-6.8 8.6-6.8-8.6 3-4.2Zm-3 4.2h13.6M10.4 5.6 12 18.4l1.6-12.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  trophy: <path d="M8 5.4h8v3.4a4 4 0 0 1-8 0V5.4Zm0 1.2H5.8v1.2a2.4 2.4 0 0 0 2.2 2.4M16 6.6h2.2v1.2a2.4 2.4 0 0 1-2.2 2.4M12 12.8V16m-2.6 2.6h5.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
};
type IcKey = keyof typeof IC;
const Icon = ({ d }: { d: IcKey }) => <svg viewBox="0 0 24 24" className="pm-ic" aria-hidden="true">{IC[d]}</svg>;

/* 価格の枠だけを先に用意し、値は src/data/metalPrices.ts から受け取る。
   未取得の間は「—」のまま（推測の数字は出さない）。 */

const WHO: [IcKey, string][] = [
  ["home", "実家の整理で出てきた金・プラチナを売りたい"],
  ["heart", "使わなくなったジュエリーを適正価格で手放したい"],
  ["question", "手元の貴金属がいくらになるか知りたい"],
  ["shield", "信頼できる相手に安心して売りたい"],
  ["clock", "急いでいないので、じっくり相談したい"],
  ["info", "査定の仕組みや相場について教えてほしい"],
];

const ITEMS: [IcKey, string, string][] = [
  ["ingot", "金（ゴールド）", "K24・K22・K18・K14・K10など各純度"],
  ["medal", "プラチナ", "Pt1000・Pt950・Pt900・Pt850など"],
  ["gemHeart", "銀（シルバー）", "SV1000・SV925・SV950など"],
  ["tools", "その他貴金属", "パラジウム・ロジウム・工業用スクラップ"],
  ["gem", "ジュエリー類", "リング・ネックレス・ブレスレット・ピアス"],
  ["trophy", "金貨・銀貨", "メイプルリーフ・ウィーン・パンダなど"],
];

const APPROACH: [string, string, string][] = [
  ["01", "相場だけで判断しない", "国際相場は参考にしますが、それだけで価値を決めません。状態・背景・用途まで踏まえて確認します。"],
  ["02", "丁寧な確認を大切にする", "査定の過程を丁寧にご説明します。「なぜこの価格なのか」が伝わる対応を心がけています。"],
  ["03", "無理な売り込みをしない", "「売るかどうか」はお客様が決めることです。査定後に断っていただいても、まったく問題ありません。"],
  ["04", "本人確認を適切に行う", "古物営業法に基づき、本人確認書類の提示をお願いしています。安全な取引のためにご協力ください。"],
];

const FLOW: [string, string, string][] = [
  ["01", "お問い合わせ", "まずはお気軽にご連絡ください。持ち込み・郵送どちらにも対応しています。"],
  ["02", "状態の確認", "貴金属の種類・純度・重量・状態を確認します。不明な点はその場でご説明します。"],
  ["03", "査定価格のご提示", "相場と状態を踏まえた査定価格をご提示します。納得いただけない場合はお断りいただけます。"],
  ["04", "本人確認", "古物営業法に基づき、身分証明書の確認をさせていただきます。"],
  ["05", "お支払い", "約定後、原則3営業日以内に指定口座へお振込みします。"],
];

export default function PreciousMetals() {
  const [prices, setPrices] = useState<MetalPrice[]>(EMPTY_PRICES);

  useEffect(() => { document.title = "貴金属買取 ｜ SMASK"; }, []);

  /* 価格の取得（未接続の間は EMPTY_PRICES のまま＝「—」表示） */
  useEffect(() => {
    let alive = true;
    fetchMetalPrices()
      .then(rows => { if (alive) setPrices(rows); })
      .catch(() => { /* 失敗時は「—」のまま。誤った数字を出さない */ });
    return () => { alive = false; };
  }, []);

  useReveal();           // スクロール連動でセクションを表示（フルページ遷移は使わない）
  useCountUp([prices]);  // 価格が入ったタイミングでカウントアップを仕掛け直す

  return (
    <>
      <BizArrival />
      <main className="pm-page">
        {/* ビューポート固定の背景（案2：背景固定・中身がスクロール） */}
        <div className="pm-fixedbg" aria-hidden="true"></div>

        {/* ============ Hero ============ */}
        <section className="pm-hero is-in">
          <PmChart />
          <span className="pm-guideline" aria-hidden="true"></span>
          <div className="pm-hero-copy">
            <span className="pm-eyebrow" style={{ "--d": "900ms" } as React.CSSProperties}>PRECIOUS METALS</span>
            <h1 style={{ "--d": "1040ms" } as React.CSSProperties}>貴金属買取</h1>
            <p style={{ "--d": "1200ms" } as React.CSSProperties}>相場だけでなく、状態や背景も踏まえて丁寧に確認し、<br />適正にご案内します。</p>
          </div>
          <div className="pm-months" aria-hidden="true">
            {MONTHS.map(m => <span key={m}>{m}</span>)}
          </div>
        </section>

        {/* ============ TODAY'S PRICE ============ */}
        <section className="pm-sec">
          <div className="pm-wrap">
            <span className="pm-eyebrow" data-reveal>TODAY'S PRICE</span>
            <h2 className="pm-h2">店頭買取価格（参考）</h2>

            <div className="pm-price-grid">
              {prices.map((m, i) => (
                <article
                  className="pm-price-card"
                  key={m.key}
                  data-reveal
                  data-count-group      /* カード内の3つの数字をまとめて回す */
                  style={{ "--d": `${i * 130}ms` } as React.CSSProperties}
                >
                  <span className="pm-eyebrow">{m.en}</span>
                  <h3>{m.jp}</h3>
                  <span className="pm-price-rule" aria-hidden="true"></span>
                  <dl>
                    <div>
                      <dt>小売価格（税込）</dt>
                      {/* 値が入るまでは data-count を付けない＝「—」のまま動かない */}
                      <dd {...(m.retail !== null && { "data-count": m.retail, "data-unit": "円" })}>—</dd>
                    </div>
                    <div>
                      <dt>買取価格（税込）</dt>
                      <dd {...(m.buy !== null && { "data-count": m.buy, "data-unit": "円" })}>—</dd>
                    </div>
                  </dl>
                  <div className="pm-price-diff">
                    <span>前日比</span>
                    <span
                      className={m.diff === null ? undefined : m.diff >= 0 ? "is-up" : "is-down"}
                      {...(m.diff !== null && {
                        "data-count": Math.abs(m.diff),
                        "data-unit": " 円",
                        "data-sign": m.diff >= 0 ? "+" : "−",
                      })}
                    >—</span>
                  </div>
                  <a className="pm-more" href="#">詳細を見る →</a>
                </article>
              ))}
            </div>
            <p className="pm-note">※参考価格です。実際の買取価格を保証するものではありません。</p>

            <div className="pm-market" data-reveal>
              <h3>相場と背景について</h3>
              <p>貴金属の価格は、国際相場（ドル建て）・為替・需給バランスによって日々変動します。</p>
              <p>SMASKでは、田中貴金属工業の公表価格を参考指標として活用しています。ただし、これはあくまで参考値であり、実際の買取価格は状態・純度・量などによって異なります。</p>
              <p>「今日の相場はいくらか」だけでなく、「なぜその価格なのか」を丁寧にご説明することを大切にしています。</p>
            </div>
          </div>
        </section>

        {/* ============ OVERVIEW ============ */}
        <section className="pm-sec pm-sec--tint">
          <div className="pm-wrap pm-overview">
            <div className="pm-overview-text" data-reveal>
              <span className="pm-eyebrow" data-reveal>OVERVIEW</span>
              <h2 className="pm-h2">貴金属買取について</h2>
              <p>SMASKの貴金属買取は、「価格だけで判断しない」という考えを大切にしています。</p>
              <p>国際相場は参考にしますが、それだけで価値を決めることはしません。貴金属の状態・純度・背景を丁寧に確認し、適正な価格をご案内します。</p>
              <p>査定後に「やっぱり売らない」と決めていただいても、まったく問題ありません。まずはお気軽にご相談ください。</p>
            </div>
            <div
              className="pm-overview-photo" data-reveal
              role="img"
              aria-label="金貨とジュエリー"
              style={{ backgroundImage: `url(${BASE}assets/pm-overview.jpg)` }}
            ></div>
          </div>
        </section>

        {/* ============ FOR WHOM ============ */}
        <section className="pm-sec">
          <div className="pm-wrap">
            <span className="pm-eyebrow" data-reveal>FOR WHOM</span>
            <h2 className="pm-h2">こんな方にご利用いただいています</h2>
            <div className="pm-who-grid">
              {WHO.map(([ic, text], i) => (
                <div
                  className="pm-who-card"
                  key={text}
                  data-reveal
                  style={{ "--d": `${(i % 3) * 130}ms` } as React.CSSProperties}
                >
                  <span className="pm-circle"><Icon d={ic} /></span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ ITEMS ============ */}
        <section className="pm-sec pm-sec--tint">
          <div className="pm-wrap">
            <span className="pm-eyebrow" data-reveal>ITEMS</span>
            <h2 className="pm-h2">買取対象品目</h2>
            <div className="pm-items-grid">
              {ITEMS.map(([ic, title, sub], i) => (
                <div
                  className="pm-item-card"
                  key={title}
                  data-reveal
                  style={{ "--d": `${(i % 3) * 130}ms` } as React.CSSProperties}
                >
                  <span className="pm-circle"><Icon d={ic} /></span>
                  <h3>{title}</h3>
                  <p>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ OUR APPROACH ============ */}
        <section className="pm-sec">
          <div className="pm-wrap">
            <span className="pm-eyebrow" data-reveal>OUR APPROACH</span>
            <h2 className="pm-h2">SMASKの姿勢</h2>
            <div className="pm-approach-grid">
              {APPROACH.map(([num, title, body], i) => (
                <div
                  className="pm-approach-item"
                  key={num}
                  data-reveal
                  style={{ "--d": `${i * 140}ms` } as React.CSSProperties}
                >
                  <span className="pm-approach-num" aria-hidden="true">{num}</span>
                  <div className="pm-approach-body">
                    <h3><span className="pm-dash" aria-hidden="true"></span>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FLOW ============ */}
        <section className="pm-sec pm-sec--tint">
          <div className="pm-wrap">
            <span className="pm-eyebrow" data-reveal>FLOW</span>
            <h2 className="pm-h2">ご利用の流れ</h2>
            {/* 横並び：左から右へ線が伸び、到達順に番号が灯る */}
            <ol className="pm-flow" data-reveal>
              <span className="pm-flow-track" aria-hidden="true"></span>
              {FLOW.map(([num, title, body], i) => (
                <li key={num} style={{ "--d": `${i * 340}ms` } as React.CSSProperties}>
                  <span className="pm-flow-num" aria-hidden="true">{num}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section className="pm-sec pm-contact">
          <div className="pm-wrap">
            <span className="pm-eyebrow" data-reveal>CONTACT</span>
            <h2 className="pm-h2">貴金属取引のご相談はお気軽に</h2>
            <p className="pm-contact-lead" data-reveal>査定だけのご相談も歓迎しています。<br />「売るかどうか迷っている」という段階でも、お気軽にどうぞ。</p>
            <a className="pm-btn" href="/contact" data-reveal>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.6 6.6h16.8v10.8H3.6V6.6Zm.6.6 7.8 6 7.8-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              お問い合わせはこちら
            </a>
          </div>
        </section>

      </main>
    </>
  );
}
