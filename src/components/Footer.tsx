import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand" href="/">SMASK</a>
      <nav className="footer-nav" aria-label="フッター">
        <a href="/">ホーム</a>
        <a href="/business-precious-metals">貴金属買取</a>
        <a href="/business-jewelry">ジュエリー制作</a>
        <a href="/business-web">Webコンテンツ制作</a>
        <a href="/column">コラム</a>
        <a href="/company">会社概要</a>
        <a href="/contact">お問い合わせ</a>
      </nav>
      <hr className="rule-gold footer-rule" />
      {/* 著作権表記は登記上の社名。年はサイト公開年 */}
      <p className="footer-copy">
        © 2026 <span className="footer-copy-name">株式会社スマスク</span> All Rights Reserved.
      </p>
    </footer>
  );
}
