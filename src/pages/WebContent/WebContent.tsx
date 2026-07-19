import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageHero from "../../components/PageHero";
import "./WebContent.css";

export default function WebContent() {
  useEffect(() => { document.title = "Webコンテンツ制作 ｜ SMASK"; }, []);
  return (
    <>
      <LoadCurtain />
      <main>
        <PageHero
          crumb={<><a href="/">ホーム</a> ／ 事業内容 ／ Webコンテンツ制作</>}
          eyebrow="Web Content"
          title="Webコンテンツ制作"
        />
        <section className="page-body">
          <div className="prose">
            <p className="lead">見た目を整えるだけでなく、事業の伝わり方、情報整理、導線設計、運用のしやすさまで含めて整えます。</p>
            <h2>「伝わる」まで整える</h2>
            <p>美しいデザインは出発点にすぎません。何を伝え、どう導くか。情報の整理と導線の設計まで踏み込むことで、はじめて事業の価値が正しく伝わります。SMASKは、見た目の先にある「伝わり方」そのものを設計します。</p>
            <h2>つくって終わりにしない</h2>
            <p>公開後も無理なく運用し続けられること。更新のしやすさ、育てやすさまで含めて考え、長く機能する形を目指します。急がず、正しく始め、時間が経っても意味を持ち続けるものを。</p>
            <p style={{ marginTop: "2.5rem" }}>
              <a className="btn btn--solid" href="/contact">Web制作について相談する <span aria-hidden="true">→</span></a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
