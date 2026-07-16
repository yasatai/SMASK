import { useEffect } from "react";
import LoadCurtain from "../components/LoadCurtain";
import PageHero from "../components/PageHero";
import "../styles/company.css";

export default function Company() {
  useEffect(() => { document.title = "会社概要 ｜ SMASK"; }, []);
  return (
    <>
      <LoadCurtain />
      <main>
        <PageHero
          crumb={<><a href="/">ホーム</a> ／ 会社概要</>}
          eyebrow="Company"
          title="会社概要"
        />
        <section className="page-body">
          <div className="prose" style={{ marginBottom: "3.5rem" }}>
            <p className="lead">本質を捉え、無理のない形で価値を届ける。</p>
            <p>SMASKは、貴金属買取・ジュエリー制作・Webコンテンツ制作という異なる事業を通じて、それぞれの領域で価値の本質に向き合っています。扱う対象は異なっても、見ているのは、その価値をどう見極め、どう整え、どう届けるかです。</p>
          </div>
          <div className="info-table">
            <dl>
              <dt>会社名</dt><dd>SMASK</dd>
              <dt>事業内容</dt><dd>貴金属買取／ジュエリー制作／Webコンテンツ制作</dd>
              <dt>所在地</dt><dd>—（掲載情報に差し替えてください）</dd>
              <dt>設立</dt><dd>—</dd>
              <dt>代表者</dt><dd>—</dd>
              <dt>お問い合わせ</dt><dd><a href="/contact" style={{ color: "var(--color-gold-deep)" }}>お問い合わせフォーム →</a></dd>
            </dl>
          </div>
        </section>
      </main>
    </>
  );
}
