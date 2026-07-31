import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageAtmos from "../../components/PageAtmos";
import { useReveal } from "../../useReveal";
import { useSiteSettings } from "../../data/SiteSettingsContext";
import "./Company.css";

/* 制作で大切にしていること（統合仕様 D）。旧・買取事業前提のVISIONから差し替え */
const VALUES: [string, string][] = [
  ["事業を理解する", "ページやデザインを先に決めるのではなく、事業、顧客、目的を理解することから始めます。"],
  ["情報を整理する", "企業の中にある情報を選び、誰に何を伝えるべきかを整理します。"],
  ["工程をつなぐ", "文章、導線、デザイン、実装仕様を分断せず、一貫したWebサイトへまとめます。"],
  ["公開後を考える", "公開を完成とせず、更新や改善を含めて、事業の中で使われ続ける状態を目指します。"],
];

/* 対応領域（統合仕様 D） */
const FIELDS: string[] = [
  "コーポレートサイト",
  "サービスサイト",
  "採用サイト",
  "ランディングページ",
  "Webサイトのリニューアル",
  "Webサイト内の文章・コンテンツ制作",
  "公開後の運用・改善",
];

/* 会社情報。事業内容は複数行のため配列で持つ。
   ※事業はWebコンテンツ制作に一本化したため、旧・貴金属/ジュエリーの記載と
     それに紐づく古物商許可番号は掲載しない（統合仕様の削除方針） */
const PROFILE: [string, string | string[]][] = [
  ["会社名", "株式会社スマスク"],
  ["代表者", "代表取締役　若林　晃行"],
  ["所在地", "神奈川県相模原市"],
  ["設立", "2013年5月26日"],
  ["資本金", "990万円"],
  ["事業内容", ["Webコンテンツ制作", "Webサイトの企画、情報設計、文章制作、デザイン、実装連携、運用支援"]],
];

export default function Company() {
  const { company_name } = useSiteSettings();
  useEffect(() => { document.title = "会社概要 ｜ SMASK"; }, []);
  /* 背景・演出はトップと同じ世界観に揃える（2026-07-31 代表指示）。
     PageAtmos が漆黒＋青い靄＋星屑を敷き、useReveal が下から上へのフェードインを付ける。 */
  useReveal();
  /* 会社名だけはサイト設定から差し替え（他項目はコピー扱いで対象外） */
  const profile = PROFILE.map(([label, value]) => label === "会社名" ? [label, company_name] as const : [label, value] as const);

  return (
    <>
      <LoadCurtain />
      <PageAtmos />
      <main className="cp-page">

        {/* ============ Hero ============ */}
        <section className="cp-hero">
          <span className="cp-eyebrow" data-reveal>COMPANY</span>
          {/* ルール②（行末に「、」を残さない） */}
          <h1 data-reveal>Webを<br />事業に使えるかたちへ。</h1>
          <div className="cp-lead" data-reveal>
            <p>株式会社スマスクは、事業を理解し、情報、文章、導線、デザイン、実装、運用をつなぐWebコンテンツ制作会社です。</p>
            <p>企業やサービスが持つ価値を整理し、相手に伝わり、次の行動へ進みやすいWebを設計します。</p>
          </div>
        </section>

        {/* ============ SMASKについて ============ */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <span className="cp-eyebrow" data-reveal>ABOUT</span>
            <h2 className="cp-h2" data-reveal>価値を見極め<br />かたちにする。</h2>
            <div className="cp-body" data-reveal>
              <p>企業やサービスの中には、まだ言葉やWebのかたちになっていない価値があります。</p>
              <p>SMASKは、対話や調査を通じてその価値を整理し、文章、導線、デザイン、実装仕様へつなげます。</p>
              <p>Webだけを切り離して考えず、事業の見え方と、選ばれるまでの流れを整えます。</p>
            </div>
          </div>
        </section>

        {/* ============ 私たちの事業 ============ */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <span className="cp-eyebrow" data-reveal>BUSINESS</span>
            <h2 className="cp-h2" data-reveal>Webコンテンツ制作</h2>
            <div className="cp-body" data-reveal>
              <p>Webサイトの企画、情報設計、文章制作、導線設計、Webデザイン、実装連携、公開後の運用支援を行います。</p>
              <p>コーポレートサイト、サービスサイト、採用サイト、ランディングページなど、事業や目的に合わせたWebを制作します。</p>
            </div>
            {/* TODO: 事業内容ページ（P-A）作成時に href を差し替える */}
            <a className="cp-cta" href="#business" data-reveal>事業内容を見る <span aria-hidden="true">→</span></a>
          </div>
        </section>

        {/* ============ 制作で大切にしていること ============ */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <span className="cp-eyebrow" data-reveal>VALUES</span>
            <h2 className="cp-h2" data-reveal>制作で大切にしていること</h2>
            <div className="cp-vision" data-reveal-stagger>
              {VALUES.map(([title, body]) => (
                <div className="cp-vision-item" key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 会社情報 ============ */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <span className="cp-eyebrow" data-reveal>PROFILE</span>
            <h2 className="cp-h2" data-reveal>会社情報</h2>
            <dl className="cp-profile" data-reveal>
              {profile.map(([label, value]) => (
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

        {/* ============ 対応領域 ============ */}
        <section className="cp-sec">
          <div className="cp-wrap">
            <span className="cp-eyebrow" data-reveal>FIELDS</span>
            <h2 className="cp-h2" data-reveal>対応領域</h2>
            <ul className="cp-fields" data-reveal-stagger>
              {FIELDS.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>
        </section>

        {/* ============ 最終CTA ============ */}
        <section className="cp-sec cp-sec--end">
          <div className="cp-wrap">
            <h2 className="cp-h2" data-reveal>会社のことを知ったうえで<br />次は事業について話しましょう。</h2>
            <div className="cp-body" data-reveal>
              <p>新しいWebサイトの制作や、既存サイトの見直しについて、現在考えていることをお聞かせください。</p>
              <p>要件が固まっていない段階でも、事業や課題を伺いながら必要な内容を整理します。</p>
            </div>
            <a className="cp-cta cp-cta--main" href="/contact" data-reveal>制作について相談する <span aria-hidden="true">→</span></a>
          </div>
        </section>

      </main>
    </>
  );
}
