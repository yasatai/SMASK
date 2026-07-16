import { useEffect } from "react";
import LoadCurtain from "../components/LoadCurtain";
import PageHero from "../components/PageHero";

export default function Column() {
  useEffect(() => { document.title = "コラム ｜ SMASK"; }, []);
  return (
    <>
      <LoadCurtain />
      <main>
        <PageHero
          crumb={<><a href="/">ホーム</a> ／ コラム</>}
          eyebrow="Column"
          title="コラム"
        />
        <section className="page-body">
          <div className="col-list">
            <a className="col-item" href="#">
              <time dateTime="2026-06-20">2026.06.20</time>
              <div><span className="tag">貴金属</span><h3>価格の先にある価値 — 貴金属を「見極める」ということ</h3></div>
            </a>
            <a className="col-item" href="#">
              <time dateTime="2026-05-14">2026.05.14</time>
              <div><span className="tag">ジュエリー</span><h3>ラボグロウンダイヤモンドという、新しい選択肢について</h3></div>
            </a>
            <a className="col-item" href="#">
              <time dateTime="2026-04-02">2026.04.02</time>
              <div><span className="tag">Web</span><h3>「伝わる」を設計する — 見た目の先にある仕事</h3></div>
            </a>
            <p className="empty-note">※ 掲載記事はサンプルです。実際の記事に差し替えてご利用ください。</p>
          </div>
        </section>
      </main>
    </>
  );
}
