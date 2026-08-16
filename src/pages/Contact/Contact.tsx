import { useEffect, useRef, useState } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import PageAtmos from "../../components/PageAtmos";
import { useReveal } from "../../useReveal";
import "./Contact.css";

/* ご相談内容（複数選択可）。
   事業をWebコンテンツ制作へ一本化したため、貴金属買取・ジュエリー製作の項目は削除した。
   あわせて「お問い合わせ種別」と「想定取引規模」（重量＝貴金属買取前提）も廃止。 */
const TOPIC_GROUPS: { label: string; items: string[] }[] = [
  { label: "Webコンテンツ制作", items: ["企業・サービスサイト制作", "問い合わせ・導線改善", "運用・業務改善"] },
  { label: "その他", items: ["その他"] },
];

const MAX_MESSAGE = 500;

/* 送信先は価格・お知らせと同じ公開API（同一オリジン・新環境変数は作らない） */
const API_BASE = import.meta.env.VITE_PRICE_API_BASE ?? "";

type Errors = string[];

export default function Contact() {
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState(""); // ハニーポット（人は触らない・botよけ）
  const [errors, setErrors] = useState<Errors>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = "お問い合わせ ｜ SMASK"; }, []);
  /* 背景・演出は他の下層ページと同じ暗い世界に揃える（下層ページ共通の作法） */
  useReveal();

  const toggleTopic = (name: string) => {
    setTopics(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  /* 未入力の項目を上から順に並べる（画像の並びに合わせる） */
  const validate = (): Errors => {
    const e: Errors = [];
    if (!company.trim()) e.push("会社名を入力してください。");
    if (!person.trim()) e.push("担当者名を入力してください。");
    if (!email.trim()) e.push("メールアドレスを入力してください。");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.push("メールアドレスの形式が正しくありません。");
    // 電話番号は任意。入力がある場合のみ、数字（区切りのハイフン・空白・括弧は可）で
    // 10〜11桁（固定電話10桁・携帯11桁）かをチェックする。
    if (tel.trim()) {
      const telDigits = tel.replace(/[-\s()]/g, "");
      if (!/^\d+$/.test(telDigits)) e.push("電話番号は数字でご入力ください。");
      else if (telDigits.length < 10 || telDigits.length > 11) e.push("電話番号は10〜11桁でご入力ください（固定電話10桁・携帯11桁）。");
    }
    if (!message.trim()) e.push("お問い合わせ内容を入力してください。");
    if (!agreed) e.push("プライバシーポリシーへの同意が必要です。");
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    // 送信直前にもクライアントバリデーションを実行する
    const e = validate();
    setErrors(e);
    if (e.length) {
      // エラーが出たら、その位置まで戻して気づけるようにする
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE}/api/public/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          company: company.trim(), person: person.trim(), email: email.trim(), tel: tel.trim(),
          topics, message: message.trim(), agreed,
          website, // ハニーポット
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSubmitted(true);
    } catch {
      setSubmitError("送信に失敗しました。お手数ですが、時間をおいて再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <LoadCurtain />
      <PageAtmos />
      <main className="ct-page">

        {/* ============ Hero ============ */}
        <section className="ct-hero">
          <span className="ct-eyebrow" data-reveal>CONTACT</span>
          <h1 data-reveal>話しましょう。</h1>
          <div className="ct-lead" data-reveal>
            <p>新しいWebサイトの制作や、既存サイトの見直しについて、現在考えていることをお聞かせください。</p>
            <p>要件が固まっていない段階でも、事業や課題を伺いながら必要な内容を整理します。</p>
          </div>
        </section>

        {/* ============ フォーム ============ */}
        <section className="ct-sec">
          <div className="ct-wrap">
            <span className="ct-eyebrow" data-reveal>INQUIRY FORM</span>
            <h2 className="ct-h2" data-reveal>お問い合わせフォーム</h2>
            <p className="ct-required-note" data-reveal><span className="ct-req">※</span> は必須項目です</p>

            {submitted ? (
              <div className="ct-thanks" role="status">
                <h3>送信が完了しました</h3>
                <p>お問い合わせありがとうございます。担当者より順次ご連絡いたしますので、いましばらくお待ちください。</p>
                <a href="/" className="ct-home-btn">ホームへ戻る</a>
                {/* 送信後は行き止まりにしない。返信を待つ間に見てもらえる主導線2本を置く */}
                <div className="ct-thanks-links">
                  <a href="/business">事業内容を見る</a>
                  <a href="/works">制作実績を見る</a>
                </div>
              </div>
            ) : (
            <form className="ct-form" onSubmit={onSubmit} noValidate>

              {/* ハニーポット（視覚非表示・スクリーンリーダー非対象・自動補完オフ。bot対策） */}
              <div className="ct-hp" aria-hidden="true">
                <label htmlFor="website">Webサイト（入力しないでください）</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
                  value={website} onChange={e => setWebsite(e.target.value)} />
              </div>

              {/* 会社名 / 担当者名 */}
              <div className="ct-row">
                <div className="ct-field">
                  <label htmlFor="company">会社名 <span className="ct-req">※</span></label>
                  <input
                    id="company" name="company" type="text" autoComplete="organization"
                    placeholder="株式会社〇〇"
                    value={company} onChange={e => setCompany(e.target.value)}
                  />
                </div>
                <div className="ct-field">
                  <label htmlFor="person">担当者名 <span className="ct-req">※</span></label>
                  <input
                    id="person" name="person" type="text" autoComplete="name"
                    placeholder="山田 太郎"
                    value={person} onChange={e => setPerson(e.target.value)}
                  />
                </div>
              </div>

              {/* メール / 電話 */}
              <div className="ct-row">
                <div className="ct-field">
                  <label htmlFor="email">メールアドレス <span className="ct-req">※</span></label>
                  <input
                    id="email" name="email" type="email" autoComplete="email"
                    placeholder="example@company.co.jp"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="ct-field">
                  <label htmlFor="tel">電話番号</label>
                  <input
                    id="tel" name="tel" type="tel" autoComplete="tel" inputMode="tel"
                    className={errors.length > 0 && tel.trim() !== "" && !/^\d{10,11}$/.test(tel.replace(/[-\s()]/g, "")) ? "is-error" : undefined}
                    placeholder="03-0000-0000"
                    value={tel} onChange={e => setTel(e.target.value)}
                  />
                </div>
              </div>

              {/* ご相談内容 */}
              <fieldset className="ct-topics">
                <legend>ご相談内容（複数選択可）</legend>
                {TOPIC_GROUPS.map(group => (
                  <div className="ct-topic-group" key={group.label}>
                    <h3>{group.label}</h3>
                    <div className="ct-checks">
                      {group.items.map(item => {
                        const id = `topic-${group.label}-${item}`;
                        return (
                          <label className="ct-check" key={id} htmlFor={id}>
                            <input
                              id={id} type="checkbox" name="topics" value={item}
                              checked={topics.includes(item)}
                              onChange={() => toggleTopic(item)}
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </fieldset>

              {/* お問い合わせ内容 */}
              <div className="ct-field">
                <label htmlFor="message">お問い合わせ内容 <span className="ct-req">※</span></label>
                <textarea
                  id="message" name="message" rows={6} maxLength={MAX_MESSAGE}
                  placeholder="現在の課題、つくりたいもの、公開時期のご希望などをご記入ください。"
                  value={message} onChange={e => setMessage(e.target.value)}
                ></textarea>
                <span className="ct-count">{message.length} / {MAX_MESSAGE}文字</span>
              </div>

              {/* 個人情報の取り扱い */}
              <div className="ct-privacy">
                <h3>個人情報の取り扱いについて</h3>
                <p>
                  ご入力いただいた個人情報は、お問い合わせへの回答および取引に関するご連絡のみに使用いたします。
                  第三者への提供は行いません。詳細は<a href="/privacy">プライバシーポリシー</a>をご確認ください。
                </p>
                <label className="ct-check ct-check--agree" htmlFor="agree">
                  <input
                    id="agree" type="checkbox" name="agree"
                    checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  />
                  <span>個人情報の取り扱いに同意する <span className="ct-req">※</span></span>
                </label>
              </div>

              {/* エラー表示 */}
              {errors.length > 0 && (
                <div className="ct-errors" ref={errorRef} role="alert" tabIndex={-1}>
                  <p className="ct-errors-title">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 7.6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="16" r=".9" fill="currentColor" />
                    </svg>
                    入力内容をご確認ください
                  </p>
                  <ul>
                    {errors.map(e => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              )}

              {/* 送信エラー */}
              {submitError && (
                <div className="ct-errors" role="alert" tabIndex={-1}>
                  <p className="ct-errors-title">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 7.6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="16" r=".9" fill="currentColor" />
                    </svg>
                    {submitError}
                  </p>
                </div>
              )}

              {/* 送信 */}
              <div className="ct-submit">
                <button className="ct-btn" type="submit" disabled={submitting}>{submitting ? "送信中…" : "送信する"}</button>
              </div>
            </form>
            )}
          </div>
        </section>

      </main>
    </>
  );
}
