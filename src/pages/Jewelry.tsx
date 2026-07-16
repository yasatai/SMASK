import { useEffect } from "react";
import LoadCurtain from "../components/LoadCurtain";
import PageHero from "../components/PageHero";

export default function Jewelry() {
  useEffect(() => { document.title = "ジュエリー制作 ｜ SMASK"; }, []);
  return (
    <>
      <LoadCurtain />
      <main>
        <PageHero
          crumb={<><a href="/">ホーム</a> ／ 事業内容 ／ ジュエリー制作</>}
          eyebrow="Jewelry"
          title="ジュエリー制作"
        />
        <section className="page-body">
          <div className="prose">
            <p className="lead">Pristine Diamondを軸に、ラボグロウンダイヤモンドという新しい選択肢を、これからの価値観にあった形で構想・準備しています。</p>
            <h2>新しい価値観のためのダイヤモンド</h2>
            <p>ダイヤモンドの美しさはそのままに、これからの時代にふさわしい選択肢を。Pristine Diamondを軸としたラボグロウンダイヤモンドは、輝きの本質を守りながら、価値観の変化に寄り添う新しいかたちです。SMASKは、その可能性を、急がず、丁寧に構想・準備しています。</p>
            <h2>構想から、かたちへ</h2>
            <p>一時的な話題性ではなく、時間が経っても意味を持ち続けるものを。デザイン、素材、届け方まで含めて、無理のない形で価値を届けるための準備を進めています。</p>
            <p style={{ marginTop: "2.5rem" }}>
              <a className="btn btn--solid" href="/contact">ジュエリーについて問い合わせる <span aria-hidden="true">→</span></a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
