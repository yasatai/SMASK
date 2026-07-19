import type { ReactNode } from "react";
import "./PageHero.css";

type Props = {
  crumb: ReactNode;   // 例: <>ホーム ／ 事業内容 ／ 貴金属買取</>
  eyebrow: string;    // 英字ラベル
  title: string;      // 見出し
};

/** 下層ページ共通のページヘッダー */
export default function PageHero({ crumb, eyebrow, title }: Props) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <p className="crumb">{crumb}</p>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
    </section>
  );
}
