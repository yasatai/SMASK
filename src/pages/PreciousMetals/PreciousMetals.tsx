import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageHero from "../../components/PageHero";
import "./PreciousMetals.css";

export default function PreciousMetals() {
  useEffect(() => { document.title = "貴金属買取 ｜ SMASK"; }, []);
  return (
    <>
      <LoadCurtain />
      <main>
        <PageHero
          crumb={<><a href="/">ホーム</a> ／ 事業内容 ／ 貴金属買取</>}
          eyebrow="Precious Metals"
          title="貴金属買取"
        />
        <section className="page-body">
          <div className="prose">
            <p className="lead">金・プラチナなどの貴金属を、相場だけでなく状態や背景も踏まえて丁寧に確認し、適正にご案内します。</p>
            <h2>相場だけで決めない、適正な見極め</h2>
            <p>貴金属の価値は、その日の相場だけで決まるものではありません。品位や重量はもちろん、状態、来歴、そして背景にある物語まで含めて確認することで、はじめて適正な価値が見えてきます。SMASKは、目に見える数字の先にある価値まで見つめ、納得のいく形でご案内することを大切にしています。</p>
            <h2>丁寧に、透明に</h2>
            <p>査定の根拠を分かりやすくお伝えし、ご不明な点は一つひとつ確認しながら進めます。急がず、正しく。お客様が安心して価値を託せる時間を目指しています。</p>
            <p style={{ marginTop: "2.5rem" }}>
              <a className="btn btn--solid" href="/contact">買取について相談する <span aria-hidden="true">→</span></a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
