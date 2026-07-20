import { useEffect, useRef, useState } from "react";
import LoadCurtain from "../../components/LoadCurtain";
import "./Contact.css";

/* ---- 線画アイコン ---- */
const IconClock = () => (
  <svg viewBox="0 0 24 24" className="ct-ic" aria-hidden="true">
    <circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7.8v4.4l2.9 1.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" className="ct-ic" aria-hidden="true">
    <path d="M12 4.6 5.6 7v4.5c0 3.9 2.6 6.5 6.4 7.9 3.8-1.4 6.4-4 6.4-7.9V7L12 4.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m9.4 11.9 1.9 1.9 3.3-3.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ご相談内容（複数選択可） */
const TOPIC_GROUPS: { label: string; items: string[] }[] = [
  { label: "貴金属買取", items: ["金（ゴールド）", "プラチナ", "銀（シルバー）", "その他貴金属"] },
  { label: "Webコンテンツ制作", items: ["企業・サービスサイト制作", "問い合わせ・導線改善", "運用・業務改善"] },
  { label: "ジュエリー製作", items: ["Pristine Diamondについて", "ジュエリー製作全般について"] },
  { label: "その他", items: ["その他"] },
];

const INQUIRY_TYPES = [
  "貴金属について",
  "ジュエリー制作について",
  "Webコンテンツについて",
  "その他",
];

/* 想定取引規模は金額ではなく重量（貴金属買取が主のため） */
const SCALES = [
  "100g未満",
  "100〜500g",
  "500〜1,000g",
  "1,000〜5,000g",
  "5,000g以上",
];

const MAX_MESSAGE = 500;

type Errors = string[];

export default function Contact() {
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [scale, setScale] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = "お問い合わせ ｜ SMASK"; }, []);

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
    if (!inquiryType) e.push("お問い合わせ種別を選択してください。");
    if (!message.trim()) e.push("お問い合わせ内容を入力してください。");
    if (!agreed) e.push("プライバシーポリシーへの同意が必要です。");
    return e;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (e.length) {
      // エラーが出たら、その位置まで戻して気づけるようにする
      requestAnimationFrame(() => errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return;
    }
    /* 送信先は未接続。実装時はここで API へ POST する */
  };

  return (
    <>
      <LoadCurtain />
      <main className="ct-page">

        {/* ============ Hero（暗色） ============ */}
        <section className="ct-hero">
          <span className="ct-hero-eyebrow">CONTACT US</span>
          <h1>お問い合わせ</h1>
          <p>取引相談・ご質問など、お気軽にお問い合わせください。</p>
        </section>

        {/* ============ 対応時間・安心の取引 ============ */}
        <section className="ct-sec ct-sec--tint">
          <div className="ct-wrap ct-info">
            <div className="ct-info-card">
              <span className="ct-info-ic"><IconClock /></span>
              <div>
                <h2>対応時間</h2>
                <p>平日 9:00〜18:00</p>
                <p>土日祝日は翌営業日対応</p>
              </div>
            </div>
            <div className="ct-info-card">
              <span className="ct-info-ic"><IconShield /></span>
              <div>
                <h2>安心の取引</h2>
                <p>古物商許可取得済み</p>
                <p>透明性の高い売買</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ フォーム ============ */}
        <section className="ct-sec">
          <div className="ct-wrap">
            <span className="ct-eyebrow">INQUIRY FORM</span>
            <h2 className="ct-h2">お問い合わせ</h2>
            <p className="ct-required-note"><span className="ct-req">※</span> は必須項目です</p>

            <form className="ct-form" onSubmit={onSubmit} noValidate>

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
                    id="tel" name="tel" type="tel" autoComplete="tel"
                    placeholder="03-0000-0000"
                    value={tel} onChange={e => setTel(e.target.value)}
                  />
                </div>
              </div>

              {/* お問い合わせ種別 */}
              <div className="ct-field">
                <label htmlFor="inquiryType">お問い合わせ種別 <span className="ct-req">※</span></label>
                <select
                  id="inquiryType" name="inquiryType"
                  className={errors.length && !inquiryType ? "is-error" : undefined}
                  value={inquiryType} onChange={e => setInquiryType(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {INQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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

              {/* 想定取引規模 */}
              <div className="ct-field">
                <label htmlFor="scale">想定取引規模</label>
                <select id="scale" name="scale" value={scale} onChange={e => setScale(e.target.value)}>
                  <option value="">選択してください（任意）</option>
                  {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* お問い合わせ内容 */}
              <div className="ct-field">
                <label htmlFor="message">お問い合わせ内容 <span className="ct-req">※</span></label>
                <textarea
                  id="message" name="message" rows={6} maxLength={MAX_MESSAGE}
                  placeholder="取引内容・数量・ご要望などをご記入ください。"
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

              {/* 送信 */}
              <div className="ct-submit">
                <button className="ct-btn" type="submit">送信する</button>
              </div>
            </form>

            {/* メールアドレス */}
            <div className="ct-mail">
              <span className="ct-mail-label">メールアドレス</span>
              <a href="mailto:contact@smask.co.jp">contact@smask.co.jp</a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
