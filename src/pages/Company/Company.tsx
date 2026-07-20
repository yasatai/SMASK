import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import "./Company.css";

/* VISION：目指しているかたち */
const VISION: [string, string][] = [
  [
    "本質を見極める",
    "表面的な価格や見た目だけでなく、その背景にある価値・文脈・意味まで丁寧に確認します。「なぜその価値があるのか」を理解することが、すべての出発点です。",
  ],
  [
    "価値が正しく伝わる社会へ",
    "価値があっても、伝わらなければ届きません。情報を整理し、導線を設計し、受け取る側にとって自然な形に整えることを大切にしています。",
  ],
  [
    "持続できる事業の形",
    "一度きりの取引ではなく、長く続けられる関係を大切にします。信頼は積み重ねによって生まれるものだと考えています。",
  ],
  [
    "誠実な取引の積み重ね",
    "急いで形にするのではなく、準備が整った状態で、正しい方法で届けます。「できること」と「できないこと」を明確にし、誠実に向き合います。",
  ],
];

/* 会社情報。事業内容は複数行のため配列で持つ */
const PROFILE: [string, string | string[]][] = [
  ["会社名", "株式会社スマスク"],
  ["代表者", "若林　晃行"],
  ["設立", "2013年5月26日"],
  ["資本金", "990万円"],
  [
    "事業内容",
    [
      "貴金属・ジュエリー等の買取事業",
      "ジュエリーの企画・オーダーメイド制作事業",
      "Webサイト及びデジタルコンテンツの企画・制作事業",
    ],
  ],
  ["古物商許可番号", "神奈川県公安委員会許可　第452780017461号"],
];

export default function Company() {
  useEffect(() => { document.title = "会社概要 ｜ SMASK"; }, []);
  /* スクロール連動の演出は付けない（素直に読める状態） */

  return (
    <>
      <LoadCurtain />
      <main className="cp-page">

        {/* ============ Hero ============ */}
        <section className="cp-hero">
          <span className="cp-eyebrow">COMPANY</span>
          <h1>会社概要</h1>
        </section>

        {/* ============ VISION ============ */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <span className="cp-eyebrow">VISION</span>
            <h2 className="cp-h2">目指しているかたち</h2>
            <div className="cp-vision">
              {VISION.map(([title, body]) => (
                <div className="cp-vision-item" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 会社情報 ============ */}
        <section className="cp-sec cp-sec--profile">
          <div className="cp-wrap">
            <dl className="cp-profile">
              {PROFILE.map(([label, value]) => (
                <div className="cp-row" key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {Array.isArray(value)
                      ? value.map(line => <span key={line}>{line}</span>)
                      : value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

      </main>
    </>
  );
}
