import { useEffect } from "react";
import BizArrival from "../../components/BizArrival";
import "./Jewelry.css";

const BASE = import.meta.env.BASE_URL;

/* ---- 線画アイコン（ラボグロウンダイヤモンドの3つの特徴） ---- */
const IC = {
  sparkle: (
    <>
      <path d="M12 4.4 13.5 9l4.6 1.5L13.5 12 12 16.6 10.5 12 5.9 10.5 10.5 9 12 4.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18.4 15.2l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M6.2 15.6l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.8v4.4l2.9 1.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  leaf: (
    <>
      <path d="M19 5.4c0 7.2-3.6 11.4-8.6 11.4A4.8 4.8 0 0 1 5.6 12c0-4.4 4.6-6.6 13.4-6.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17.4 7.2C12.6 9.4 9 12.6 6.6 18.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};
type IcKey = keyof typeof IC;
const Icon = ({ d }: { d: IcKey }) => <svg viewBox="0 0 24 24" className="jw-ic" aria-hidden="true">{IC[d]}</svg>;

const FEATURES: [IcKey, string, string][] = [
  [
    "sparkle",
    "現代の技術で生まれたダイヤモンド",
    "ラボグロウンダイヤモンドは、現代の技術によって生まれたダイヤモンドです。採掘による歴史や希少性とは異なる価値観のもとで、高い透明感や華やかな存在感を、より身近なファッションとして楽しめる選択肢として注目されています。",
  ],
  [
    "clock",
    "これからの時間に寄り添う選択肢",
    "SMASKでは、ラボグロウンダイヤモンドを一時的な話題としてではなく、これからの時代に合ったジュエリーのかたちとして捉えています。過去に価値を預けるのではなく、これからの時間の中で自分らしく身につけていく。その",
  ],
  [
    "leaf",
    "採掘を前提としない新しいかたち",
    "採掘を前提としない新しい選択肢であること、価格と見た目のバランスを取りやすいことも、ラボグロウンダイヤモンドの魅力のひとつです。遠かったダイヤモンドを、もっと身近なファッションへ。SMASKは、",
  ],
];

export default function Jewelry() {
  useEffect(() => { document.title = "ジュエリー制作 ｜ SMASK"; }, []);
  /* スクロール連動の演出は一旦なし（マークアップの data-reveal は残してあるので、
     useReveal() を戻すだけで再開できる） */

  return (
    <>
      <BizArrival />
      <main className="jw-page">
        {/* ビューポート固定の背景（案2：背景固定・中身がスクロール） */}
        <div className="jw-fixedbg" aria-hidden="true"></div>

        {/* ============ Hero ============ */}
        <section className="jw-hero">
          <div className="jw-hero-copy">
            <span className="jw-eyebrow">JEWELRY</span>
            <h1>ジュエリー製作</h1>
            <p className="jw-hero-en">Pristine Diamond</p>
            <p className="jw-hero-sub">まだ刻まれていない物語を纏うために。</p>
            <span className="jw-hero-rule" aria-hidden="true"></span>
            <p className="jw-hero-lead">
              ラボグロウンダイヤモンドという、新しい選択肢を。与えられた歴史をまとうのではなく、これからの時間とともに価値を深めていくジュエリーを、SMASKは構想しています。
            </p>
          </div>
          <span className="jw-hero-mark" aria-hidden="true"></span>
        </section>

        {/* ============ Pristine Diamondとは ============ */}
        <section className="jw-sec">
          <div className="jw-wrap jw-about">
            <div className="jw-about-text">
              <span className="jw-eyebrow" data-reveal>PRISTINE DIAMOND</span>
              <h2 className="jw-h2">Pristine Diamondとは</h2>
              <p className="jw-strong" data-reveal>Pristine Diamondは、SMASKが考える新しいダイヤモンドの価値観です。</p>
              <p data-reveal>完成された物語を受け取るのではなく、身につける人の時間や選択によって価値を深めていく。</p>
              <p data-reveal>ラボグロウンダイヤモンドの持つ明快さと、これから意味を宿していく余白を、SMASKはこの言葉に込めています。</p>
              <p data-reveal>天然ダイヤモンドが長い時間の中で語られてきた価値を持つ一方で、Pristine Diamondは、これからの生き方や感性に寄り添う輝きとして存在します。</p>
              <blockquote className="jw-quote" data-reveal>
                過去を飾るためではなく、これからを纏うためのダイヤモンドです。
              </blockquote>
            </div>
            <figure className="jw-about-fig" data-reveal>
              <div
                className="jw-photo"
                role="img"
                aria-label="ラボグロウンダイヤモンド"
                style={{ backgroundImage: `url(${BASE}assets/jw-diamond.jpg)` }}
              ></div>
              <figcaption>Lab Grown Diamond — Pristine Diamond</figcaption>
            </figure>
          </div>
        </section>

        {/* ============ ラボグロウンダイヤモンド ============ */}
        <section className="jw-sec jw-sec--tint">
          <div className="jw-wrap">
            <span className="jw-eyebrow" data-reveal>LAB GROWN DIAMOND</span>
            <h2 className="jw-h2">ラボグロウンダイヤモンドという、新しい選択肢</h2>
            <p className="jw-body" data-reveal>
              ラボグロウンダイヤモンドは、現代の技術によって生まれたダイヤモンドです。採掘による歴史や希少性とは異なる価値観のもとで、高い透明感や華やかな存在感を、より身近なファッションとして楽しめる選択肢として注目されています。SMASKでは、ラボグロウンダイヤモンドを一時的な話題としてではなく、これからの時代に合ったジュエリーのかたちとして捉えています。過去に価値を預けるのではなく、これからの時間の中で自分らしく身につけていく。その考え方に、ラボグロウンダイヤモンドは自然に重なります。また、採掘を前提としない新しい選択肢であること、価格と見た目のバランスを取りやすいことも、ラボグロウンダイヤモンドの魅力のひとつです。遠かったダイヤモンドを、もっと身近なファッションへ。SMASKは、その入口をつくりたいと考えています。
            </p>
            <div className="jw-feature-grid">
              {FEATURES.map(([ic, title, body], i) => (
                <div
                  className="jw-feature"
                  key={title}
                  data-reveal
                  style={{ "--d": `${i * 130}ms` } as React.CSSProperties}
                >
                  <span className="jw-circle"><Icon d={ic} /></span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SMASKのジュエリー製作 ============ */}
        <section className="jw-sec">
          <div className="jw-wrap">
            <span className="jw-eyebrow" data-reveal>JEWELRY MAKING</span>
            <h2 className="jw-h2">SMASKのジュエリー製作</h2>
            <div className="jw-making">
              <figure className="jw-making-fig" data-reveal>
                <div
                  className="jw-photo jw-photo--tall"
                  role="img"
                  aria-label="ラボグロウンダイヤモンドのリングとピアス"
                  style={{ backgroundImage: `url(${BASE}assets/jw-making.jpg)` }}
                ></div>
              </figure>
              <div className="jw-making-text">
                <p data-reveal>SMASKでは、ラボグロウンダイヤモンドを用いたジュエリーの受注製作を予定しています。</p>
                <p data-reveal>現在は、ベースとなるデザインや展開内容を整理しながら、準備を進めている段階です。まずは、Pristine Diamondという価値観をかたちにし、今後順次ご案内していきます。</p>
                <p data-reveal>華やかさを持ちながら、過剰になりすぎないこと。日常の延長でも身につけられ、必要な場面ではしっかりと存在感を持つこと。SMASKは、そうしたバランスを大切にしながら製作を進めます。</p>
                <p data-reveal>メンズラインや、存在感のあるスタイルにも対応しながら、ラボグロウンダイヤモンドの魅力を、現代の感覚に合うジュエリーとして届けていきます。</p>
                <p data-reveal>
                  <span className="jw-status">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 7.8v4.4l2.9 1.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    現在準備中です
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 御徒町の製作背景 ============ */}
        <section className="jw-sec jw-sec--wide">
          <div
            className="jw-band"
            role="img"
            aria-label="御徒町の製作現場"
            data-reveal
            style={{ backgroundImage: `url(${BASE}assets/jw-atelier.jpg)` }}
          ></div>
          <div className="jw-wrap jw-bg">
            <div className="jw-bg-head">
              <span className="jw-eyebrow" data-reveal>BACKGROUND</span>
              <h2 className="jw-h2">御徒町の製作背景を<br />もとに</h2>
            </div>
            <div className="jw-bg-text">
              <p className="jw-strong" data-reveal>SMASKのジュエリー製作は、御徒町の製作背景をもとに進めています。</p>
              <p data-reveal>ラボグロウンダイヤモンド、地金、加工。それぞれの工程において、協力体制のある環境を活かしながら、試作と検討を重ねています。</p>
              <p data-reveal>まだ大規模な展開ではありませんが、実際に形にしていける体制をもとに、受注製作をスタートする準備を進めています。</p>
              <p data-reveal>机上の構想だけではなく、実際の製作背景があること。それが、SMASKのジュエリーづくりの土台です。</p>
              <blockquote className="jw-quote" data-reveal>
                華やかさだけでなく、形にできる現実性も含めて、無理のない形で少しずつ育てていきます。
              </blockquote>
            </div>
          </div>
        </section>

        {/* ============ 受注製作を予定しています ============ */}
        <section className="jw-sec jw-status-sec">
          <div className="jw-wrap jw-narrow">
            <span className="jw-tick" aria-hidden="true"></span>
            <span className="jw-eyebrow" data-reveal>CURRENT STATUS</span>
            <h2 className="jw-h2">受注製作を予定しています</h2>
            <div className="jw-panel" data-reveal>
              <p>SMASKでは、ラボグロウンダイヤモンドを用いた受注製作を予定しています。</p>
              <p>現在は、ベースデザインや展開内容を整理しながら、順次ご案内できるよう準備を進めています。</p>
              <p>まずは、Pristine Diamondという価値観をかたちにしながら、今後の展開につなげていきます。</p>
            </div>
            <span className="jw-tick" aria-hidden="true"></span>
          </div>
        </section>

        {/* ============ 輝きを、より立体的に ============ */}
        <section className="jw-sec">
          <div className="jw-wrap jw-expr">
            <div className="jw-expr-text">
              <span className="jw-eyebrow" data-reveal>EXPRESSION</span>
              <h2 className="jw-h2">輝きを、より立体的に<br />伝えるために</h2>
              <p className="jw-strong" data-reveal>ジュエリーは、静止画だけでは伝わりきらない魅力があります。</p>
              <p data-reveal>SMASKでは、質感や立体感、光の入り方がより伝わるよう、3D表現や回転表示なども視野に入れながら、見せ方を検討しています。</p>
              <p data-reveal>まだ数は多くありませんが、ひとつひとつの輝きが伝わるように。ただ並べるのではなく、きちんと伝わる見せ方も含めて整えていきます。</p>
              <p className="jw-note" data-reveal>—— 3D EXPRESSION — COMING SOON</p>
            </div>
            <div className="jw-expr-media">
              <figure className="jw-expr-main" data-reveal>
                <div
                  className="jw-photo"
                  role="img"
                  aria-label="ダイヤモンドの輝き"
                  style={{ backgroundImage: `url(${BASE}assets/jw-brilliance.jpg)` }}
                ></div>
                <figcaption>LIGHT &amp; DEPTH — PRISTINE DIAMOND</figcaption>
              </figure>
              <div className="jw-expr-sub">
                <div
                  className="jw-photo"
                  role="img"
                  aria-label="リングの展示"
                  data-reveal
                  style={{ backgroundImage: `url(${BASE}assets/jw-ring.jpg)` }}
                ></div>
                <div
                  className="jw-photo"
                  role="img"
                  aria-label="ダイヤモンドのカット"
                  data-reveal
                  style={{ backgroundImage: `url(${BASE}assets/jw-cut.jpg)` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMING SOON ============ */}
        <section className="jw-sec jw-coming">
          <div className="jw-wrap jw-narrow">
            <span className="jw-tick" aria-hidden="true"></span>
            <span className="jw-eyebrow" data-reveal>COMING SOON</span>
            <h2 className="jw-h2">詳細は順次ご案内予定です</h2>
            <span className="jw-rule-short" aria-hidden="true"></span>
            <p data-reveal>Pristine Diamondに関する情報や今後の展開については、順次ご案内していきます。</p>
            <span className="jw-tick" aria-hidden="true"></span>
          </div>
        </section>

      </main>
    </>
  );
}
