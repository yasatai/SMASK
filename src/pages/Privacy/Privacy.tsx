import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import "./Privacy.css";

/* 各条項。body は段落、list は箇条書き（どちらも任意） */
type Article = { title: string; body?: string[]; list?: string[] };

const ARTICLES: Article[] = [
  {
    title: "基本方針",
    body: [
      "株式会社スマスク（以下「当社」といいます）は、お客様の個人情報保護の重要性を認識し、個人情報の保護に関する法律（以下「個人情報保護法」といいます）を遵守するとともに、以下のプライバシーポリシー（以下「本ポリシー」といいます）に従い、適切な取扱いと保護に努めます。",
    ],
  },
  {
    title: "第1条（個人情報の定義）",
    body: [
      "本ポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項に定義される、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別できるもの、または個人識別符号が含まれるものを指します。",
    ],
  },
  {
    title: "第2条（個人情報の取得）",
    body: ["当社は、以下の方法により個人情報を取得いたします。"],
    list: [
      "買取サービスご利用時の申込書・本人確認書類からの取得",
      "お問い合わせフォームからの取得",
      "電話・メール・郵送による取得",
      "その他、適法かつ公正な手段による取得",
    ],
  },
  {
    title: "第3条（個人情報の利用目的）",
    body: ["当社は、取得した個人情報を以下の目的で利用いたします。"],
    list: [
      "貴金属買取サービスの提供および契約の履行",
      "古物営業法に基づく本人確認および記録の保管",
      "お客様からのお問い合わせへの対応",
      "サービス向上のための統計データの作成（個人を特定できない形式）",
      "法令に基づく義務の履行",
      "その他、お客様の同意を得た目的",
    ],
  },
  {
    title: "第4条（個人情報の第三者提供）",
    body: ["当社は、以下の場合を除き、お客様の個人情報を第三者に提供いたしません。"],
    list: [
      "お客様の同意がある場合",
      "法令に基づく場合",
      "人の生命、身体または財産の保護のために必要がある場合",
      "公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合",
      "国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合",
    ],
  },
  {
    title: "第5条（個人情報の安全管理）",
    body: ["当社は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために、以下の措置を講じます。"],
    list: [
      "個人情報保護管理責任者の設置",
      "従業員に対する個人情報保護教育の実施",
      "個人情報へのアクセス制限および記録の保持",
      "個人情報を含む書類・記録媒体の適切な保管および廃棄",
    ],
  },
  {
    title: "第6条（個人情報の開示・訂正・削除）",
    body: [
      "お客様は、当社が保有する自己の個人情報について、開示、訂正、追加、削除、利用停止または消去（以下「開示等」といいます）を請求することができます。開示等をご希望される場合は、当社所定の方法にてお申し出ください。",
    ],
  },
];
/* 第7条〜第9条は体裁が異なる（窓口の字下げ・外部リンク）ため、下のJSXで個別に組む */

export default function Privacy() {
  useEffect(() => { document.title = "プライバシーポリシー ｜ SMASK"; }, []);

  return (
    <>
      <LoadCurtain />
      <main className="pv-page">

        {/* ============ 見出し ============ */}
        <section className="pv-head">
          <div className="pv-wrap">
            <div className="pv-title">
              <span className="pv-title-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="5.6" y="10.4" width="12.8" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8.6 10.4V8a3.4 3.4 0 0 1 6.8 0v2.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="14.6" r="1.1" fill="currentColor" />
                </svg>
              </span>
              <h1>プライバシーポリシー</h1>
            </div>
            <p className="pv-lead">株式会社スマスクの個人情報保護方針をご確認ください。</p>
          </div>
        </section>

        {/* ============ 本文 ============ */}
        <section className="pv-sec">
          <div className="pv-wrap">
            <article className="pv-panel">

              {ARTICLES.map(a => (
                <section className="pv-article" key={a.title}>
                  <h2>{a.title}</h2>
                  {a.body?.map(p => <p key={p}>{p}</p>)}
                  {a.list && (
                    <ul>
                      {a.list.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </section>
              ))}

              {/* 第7条：窓口だけ体裁が異なるため個別に組む */}
              <section className="pv-article">
                <h2>第7条（お問い合わせ窓口）</h2>
                <p>個人情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください。</p>
                <div className="pv-desk">
                  <p>株式会社スマスク　個人情報保護管理責任者</p>
                  <p>お問い合わせフォーム：当社ウェブサイトお問い合わせページより</p>
                </div>
              </section>

              <section className="pv-article">
                <h2>第8条（プライバシーポリシーの変更）</h2>
                <p>当社は、法令の変更や事業内容の変更等に伴い、本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当社ウェブサイトに掲載した時点で効力を生じるものとします。</p>
              </section>

              <section className="pv-article">
                <h2>第9条（アクセス解析ツール・Cookieの利用）</h2>
                <p>
                  当社は、サービス向上を目的として、Google LLC が提供するGoogle Analytics 4（GA4）を使用しています。GA4はCookieを使用して匿名のトラフィックデータを収集します。収集されるデータにはIPアドレスが含まれますが、個人を特定するものではありません。Googleのデータ収集・処理方法については
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleプライバシーポリシー</a>
                  をご参照ください。Cookieの使用を希望されない場合は、ブラウザの設定によりCookieを無効にすることができます。
                </p>
              </section>

              {/* 制定日・改定日 */}
              <footer className="pv-dates">
                <p>制定日：2024年1月1日</p>
                <p>最終改定日：2024年1月1日</p>
              </footer>

            </article>

            {/* 読み終えたあとの戻り先。App側の遷移カーテンが効くよう通常のリンクで置く */}
            <div className="pv-back">
              <a className="pv-back-btn" href="/">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.6 11.4 12 5.2l7.4 6.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.9 10.2V19h10.2v-8.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                ホームに戻る
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
