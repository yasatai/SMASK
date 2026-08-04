import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";

const BASE = import.meta.env.BASE_URL;

/**
 * サイト共通ヘッダー。左上にロゴ＋上部バーのページナビ（ページリンクのみ）。
 * トップ（3D Home）は html.wc2-page-active でヘッダー自体を隠すため、
 * ヘッダーは全ページ上部バー方式（nav--bar）で統一している。
 * 現在地判定は pathname 一致のみ。
 */
type PageItem = { label: string; en: string; href: string };

/* 統合仕様のグローバルナビ：TOP／事業内容／制作実績／コラム／会社概要／話しましょう
   ※コラムは内容の整備待ちのため導線から外している
     （整備後に会社概要の手前へ { label:"コラム", en:"Column", href:"/column" } を戻す） */
const ITEMS: PageItem[] = [
  { label: "ホーム", en: "Home", href: "/" },
  { label: "事業内容", en: "Business", href: "/business" },
  { label: "制作実績", en: "Works", href: "/works" },
  { label: "会社概要", en: "Company", href: "/company" },
  { label: "お問い合わせ", en: "Contact", href: "/contact" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const isHome = pathname === "/";

  /* ルート切替でモバイルナビを閉じる */
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  /* 下層ページ（デスクトップ）はページ側の「左サイドナビ用余白」を解除するため
     html に nav-top を付ける（CSSは min-width:761 でのみ効かせる）。 */
  useEffect(() => {
    document.documentElement.classList.toggle("nav-top", !isHome);
    return () => document.documentElement.classList.remove("nav-top");
  }, [isHome]);

  /* モバイルナビ表示中は背面スクロールを止める */
  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";
    else if (document.body.style.overflow === "hidden") document.body.style.overflow = "";
  }, [navOpen]);

  /* 現在地判定は pathname 一致のみ。コラム詳細(/column/:slug)もコラムを点灯 */
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <div className="site-headerbar" aria-hidden="true"></div>
      <a className="site-logo" href="/" aria-label="SMASK ホーム">
        <img src={`${BASE}assets/logo.jpg`} alt="SMASK" width="1024" height="512" />
      </a>
      <button
        className="nav-toggle"
        aria-label="メニューを開閉"
        aria-expanded={navOpen}
        aria-controls="site-nav"
        onClick={() => setNavOpen(v => !v)}
      >
        <span></span><span></span><span></span>
      </button>

      <ul className={"nav nav--bar" + (navOpen ? " is-open" : "")} id="site-nav">
        {ITEMS.map(it => {
          const here = isCurrent(it.href) ? " is-here" : "";
          return (
            <li key={it.href} className={"nav-page" + here}>
              <a
                className="nav-link"
                href={it.href}
                aria-current={isCurrent(it.href) ? "page" : undefined}
              >
                <span className="nl-jp">{it.label}</span>
                <span className="nl-en" aria-hidden="true">{it.en}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
