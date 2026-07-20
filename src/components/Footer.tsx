import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand" href="/">SMASK</a>
      {/* 巻末インデックス：スクロール導線に乗らない3ページへの大きな入口。
          トップの全画面フッターが「本編4章のあとの巻末案内」になる */}
      <nav className="footer-index" aria-label="サイト案内">
        <a href="/column"><span className="fi-en">Column</span><span className="fi-jp">コラム</span></a>
        <a href="/company"><span className="fi-en">Company</span><span className="fi-jp">会社概要</span></a>
        <a href="/contact"><span className="fi-en">Contact</span><span className="fi-jp">お問い合わせ</span></a>
      </nav>
      <nav className="footer-nav" aria-label="フッター">
        <a href="/">ホーム</a>
        <a href="/business-precious-metals">貴金属買取</a>
        <a href="/business-jewelry">ジュエリー制作</a>
        <a href="/business-web">Webコンテンツ制作</a>
        <a href="/privacy">プライバシーポリシー</a>
      </nav>
      <hr className="rule-gold footer-rule" />
      {/* 著作権表記は登記上の社名。年はサイト公開年 */}
      <p className="footer-copy">
        © 2026 <span className="footer-copy-name">株式会社スマスク</span> All Rights Reserved.
      </p>
    </footer>
  );
}
