import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import BizArrival from "../../components/BizArrival";
import { useReveal } from "../../useReveal";
import { EMPTY_PRICES, fetchMetalPrices, type MetalPrice } from "../../data/metalPrices";
import "./MetalDetail.css";

/**
 * 金・プラチナ・銀の買取価格 詳細ページ（/business-precious-metals/:metal）。
 * テスト公開版（test-smask.com）の各詳細ページを文言そのままに再現。
 * 「純度別買取価格」の表は公開API（管理画面）の品位別価格で埋まる。
 * 未公開の金属は品位名だけ並べて「— 円」（推測の数字は出さない）。
 */

type MetalKey = "gold" | "platinum" | "silver";

const META: Record<MetalKey, {
  eyebrow: string;
  title: string;
  scrap: string;
  /** API未取得時に枠だけ見せるための品位名（テスト公開版と同じ並び） */
  fallback: string[];
}> = {
  gold: {
    eyebrow: "GOLD DETAIL",
    title: "金の買取価格",
    scrap: "金スクラップ",
    fallback: ["K24", "K22", "K21.6", "K20", "K18", "K14", "K10", "K9"],
  },
  platinum: {
    eyebrow: "PLATINUM DETAIL",
    title: "プラチナの買取価格",
    scrap: "Ptスクラップ",
    fallback: ["Pt1000", "Pt950", "Pt900", "Pt850"],
  },
  silver: {
    eyebrow: "SILVER DETAIL",
    title: "銀の買取価格",
    scrap: "銀スクラップ",
    fallback: ["Sv1000", "Sv925"],
  },
};

/** 注意書き（全金属共通・テスト公開版の文言そのまま） */
const NOTES: React.ReactNode[] = [
  "前日比は、土日・祝日を除く前営業日の午前9時50分の価格と比較して算出しています。",
  "地金価格は営業日の午前9時50分時点の価格で、午前10時前後に更新致します。この時刻以外にも価格が変動する事がありますが、その場合は、価格が変動した時刻にあわせて当サイトの地金価格も更新します。",
  "業者価格を適用されたい場合には、別途、業者であることの確認書類の提示が必要となりますのでご相談下さいませ。",
  "金インゴットの一部において偽物が流通していることが確認できたことから、海外ブランド（100g以上）インゴットのお買取りは現在、行っておりません。",
  "国内ブランドのインゴットに関しても、状況により、お買取りが出来ない場合がございますので、必ずお問い合わせ下さいませ。",
  <>
    当社では税関が公表する
    {/* TODO: リンク先URLは要確認（暫定で税関トップ） */}
    <a href="https://www.customs.go.jp/" target="_blank" rel="noopener noreferrer">金密輸図鑑</a>
    に該当するもの又は類似するものの買い取りは致しかねます。
  </>,
];

const yen = (n: number | null) =>
  n === null ? "—" : n.toLocaleString();

export default function MetalDetail() {
  const { metal } = useParams();
  const key = (metal ?? "") as MetalKey;
  const meta = META[key];

  const [prices, setPrices] = useState<MetalPrice[]>(EMPTY_PRICES);

  useEffect(() => {
    if (meta) document.title = `${meta.title} ｜ SMASK`;
  }, [meta]);

  /* 価格の取得（一覧ページと同じ入口。失敗時は「—」のまま） */
  useEffect(() => {
    let alive = true;
    fetchMetalPrices()
      .then(rows => { if (alive) setPrices(rows); })
      .catch(() => { /* 失敗時は「—」のまま */ });
    return () => { alive = false; };
  }, []);

  useReveal([key]);

  if (!meta) return <Navigate to="/business-precious-metals" replace />;

  const m = prices.find(p => p.key === key)!;
  /* API取得済みなら実データ、未取得なら品位名だけの枠 */
  const rows: { name: string; price: number | null }[] =
    m.purities.length > 0
      ? m.purities
      : meta.fallback.map(name => ({ name, price: null }));

  return (
    <>
      <BizArrival />
      <main className="md-page">
        {/* ============ ページヘッダー ============ */}
        <header className="md-head">
          <span className="md-eyebrow" data-reveal>{meta.eyebrow}</span>
          <h1 data-reveal>{meta.title}</h1>
          <span className="md-dash" aria-hidden="true"></span>
        </header>

        <div className="md-wrap">
          {/* 印刷（ブラウザの印刷ダイアログを開く） */}
          <div className="md-print-row" data-reveal>
            <button type="button" className="md-print-btn" onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8V4.8h10V8M7 16.4H5.2V9.6h13.6v6.8H17M7 13.6h10v5.6H7v-5.6Z"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              相場情報を印刷
            </button>
          </div>

          {/* ============ 店頭買取価格 ============ */}
          <section className="md-sec">
            <h2 className="md-h2" data-reveal>店頭買取価格(参考)</h2>
            <article className="md-card" data-reveal>
              <span className="md-eyebrow">{m.en}</span>
              <h3>{m.jp}</h3>
              <dl>
                <div>
                  <dt>店頭小売価格（税込）</dt>
                  <dd>{yen(m.retail)} <small>円</small></dd>
                </div>
                <div>
                  <dt>店頭買取価格（税込）</dt>
                  <dd>{yen(m.buy)} <small>円</small></dd>
                </div>
                <div>
                  <dt>前日比</dt>
                  <dd className={m.diff === null ? undefined : m.diff >= 0 ? "is-up" : "is-down"}>
                    {m.diff === null ? "—" : `${m.diff >= 0 ? "+" : "−"}${Math.abs(m.diff).toLocaleString()}`} <small>円</small>
                  </dd>
                </div>
              </dl>
            </article>
          </section>

          {/* ============ 純度別買取価格 ============ */}
          <section className="md-sec">
            <h2 className="md-h2" data-reveal>純度別買取価格</h2>
            <div className="md-table" data-reveal role="table" aria-label={`${meta.scrap}の純度別買取価格`}>
              <div className="md-tr md-tr--head" role="row">
                <span role="columnheader">{meta.scrap}</span>
                <span role="columnheader">買取価格（税込）</span>
              </div>
              {rows.map(r => (
                <div className="md-tr" role="row" key={r.name}>
                  <span role="cell">{r.name}</span>
                  <span role="cell" className="md-price">{yen(r.price)} <small>円</small></span>
                </div>
              ))}
            </div>
          </section>

          {/* ============ ご注意 ============ */}
          <section className="md-sec">
            <aside className="md-notice" data-reveal>
              <h2>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 11v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="7.9" r="1" fill="currentColor" />
                </svg>
                ご注意
              </h2>
              <ul>
                {NOTES.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </aside>
          </section>

          {/* ============ ホームへ戻る ============ */}
          <div className="md-back" data-reveal>
            <a href="/" className="md-back-btn">ホームへ戻る</a>
          </div>
        </div>
      </main>
    </>
  );
}
