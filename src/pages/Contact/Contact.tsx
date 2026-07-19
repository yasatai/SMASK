import { useEffect } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageHero from "../../components/PageHero";
import "./Contact.css";

export default function Contact() {
  useEffect(() => { document.title = "お問い合わせ ｜ SMASK"; }, []);
  return (
    <>
      <LoadCurtain />
      <main>
        <PageHero
          crumb={<><a href="/">ホーム</a> ／ お問い合わせ</>}
          eyebrow="Contact"
          title="お問い合わせ"
        />
        <section className="page-body">
          <div className="prose" style={{ marginBottom: "3rem", textAlign: "center" }}>
            <p>貴金属買取・ジュエリー制作・Webコンテンツ制作について、お気軽にご連絡ください。<br />内容を確認のうえ、担当者よりご返信いたします。</p>
          </div>
          <form className="form" action="#" method="post" noValidate>
            <div className="field">
              <label htmlFor="name">お名前 <span className="req">必須</span></label>
              <input id="name" name="name" type="text" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">メールアドレス <span className="req">必須</span></label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="topic">お問い合わせ内容</label>
              <select id="topic" name="topic" defaultValue="precious-metals">
                <option value="precious-metals">貴金属買取について</option>
                <option value="jewelry">ジュエリー制作について</option>
                <option value="web">Webコンテンツ制作について</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="message">メッセージ <span className="req">必須</span></label>
              <textarea id="message" name="message" required></textarea>
            </div>
            <div style={{ textAlign: "center", marginTop: ".6rem" }}>
              <button className="btn btn--solid" type="submit">送信する <span aria-hidden="true">→</span></button>
            </div>
            <p className="empty-note" style={{ padding: "1rem 0 0" }}>※ 送信機能は未接続のサンプルです。実際のフォーム送信先に接続してご利用ください。</p>
          </form>
        </section>
      </main>
    </>
  );
}
