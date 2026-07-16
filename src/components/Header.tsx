import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ヘッダーのスクロール状態（元 main.js: scrollY > 24） */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* デスクトップ：メニュー外クリックでプルダウンを閉じる */
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (window.innerWidth <= 760) return;
      if (!(e.target as Element).closest?.(".has-menu")) setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  /* ルート切替でモバイルナビを閉じる */
  useEffect(() => {
    setNavOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  /* モバイルナビ表示中は背面スクロールを止める（元実装と同じ） */
  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";
    else if (document.body.style.overflow === "hidden") document.body.style.overflow = "";
  }, [navOpen]);

  const current = (p: string) => (pathname === p ? "page" : undefined);

  return (
    <header className={"site-header" + (scrolled ? " is-scrolled" : "")}>
      <a className="brand" href="/">SMASK</a>
      <button
        className="nav-toggle"
        aria-label="メニューを開閉"
        aria-expanded={navOpen}
        aria-controls="site-nav"
        onClick={() => setNavOpen(v => !v)}
      >
        <span></span><span></span><span></span>
      </button>
      <ul className={"nav" + (navOpen ? " is-open" : "")} id="site-nav">
        <li><a className="nav-link" href="/" aria-current={current("/")}>ホーム</a></li>
        <li className="has-menu">
          <button
            className="nav-link"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => setMenuOpen(v => !v)}
          >
            事業内容 <span className="caret" aria-hidden="true"></span>
          </button>
          <div className={"submenu" + (menuOpen ? " is-open" : "")}>
            <a href="/business-precious-metals"><span className="en">Precious Metals</span><span className="jp">貴金属買取</span></a>
            <a href="/business-jewelry"><span className="en">Jewelry</span><span className="jp">ジュエリー制作</span></a>
            <a href="/business-web"><span className="en">Web Content</span><span className="jp">Webコンテンツ制作</span></a>
          </div>
        </li>
        <li><a className="nav-link" href="/column" aria-current={current("/column")}>コラム</a></li>
        <li><a className="nav-link" href="/company" aria-current={current("/company")}>会社概要</a></li>
        <li><a className="nav-link" href="/contact" aria-current={current("/contact")}>お問い合わせ</a></li>
      </ul>
    </header>
  );
}
