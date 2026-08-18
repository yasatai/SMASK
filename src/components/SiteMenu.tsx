import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./SiteMenu.css";

/**
 * サイト共通メニュー（2026-08-01 代表指示）。
 * 下層ページの上部ヘッダーバーを廃止し、全ページでトップと同じ右上のMENUに統一した。
 *
 * - トップ（"/"）：セクションジャンプ＋別ページへの導線
 * - 下層ページ：セクションが存在しないため、別ページへの導線だけを出す
 *   （先頭に「TOP」を足してトップへ戻れるようにする）
 */

interface MenuItem {
  label: string;
  id: string;
}

/* トップの実セクションと1対1で対応させること（セクションを増やしたらここにも足す） */
const MENU_ITEMS: MenuItem[] = [
  { label: "TOP", id: "wc2-hero" },   /* 旧「HERO」（FB-2で改称） */
  { label: "ABOUT", id: "wc2-about-sec" },
  { label: "APPROACH", id: "wc2-approach-sec" },
  { label: "WORKS", id: "wc2-works" },
  { label: "CONCERNS", id: "wc2-concerns" },
  { label: "SERVICES", id: "wc2-services" },
  { label: "STRENGTHS", id: "wc2-strengths-sec" },
  { label: "PROCESS", id: "wc2-route-sec" },
  /* COLUMN セクションは内容の整備待ちのため一旦削除（復活時はここにも戻す） */
  { label: "COMPANY", id: "wc2-company" },
  { label: "CONTACT", id: "wc2-contact-pin" },
];

/* ページ遷移項目（同一ページ内ジャンプではなく別ページへ）。
   通常の <a href> にして App の leave-curtain 遷移演出に委ねる。 */
interface PageLink {
  label: string;
  en: string;
  href: string;
}

/* ※コラムは内容の整備待ちのため導線から外している（整備後に { label:"コラム", en:"COLUMN", href:"/column" } を戻す） */
const PAGE_LINKS: PageLink[] = [
  { label: "事業内容", en: "BUSINESS", href: "/business" },
  { label: "制作実績", en: "WORKS", href: "/works" },
  { label: "会社概要", en: "COMPANY", href: "/company" },
  { label: "お問い合わせ", en: "CONTACT", href: "/contact" },
];

/* 下層ページではトップへ戻る導線が要る（トップではセクションの「TOP」が担う） */
const HOME_LINK: PageLink = { label: "トップ", en: "TOP", href: "/" };

export default function SiteMenu() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const sections = isHome ? MENU_ITEMS : [];
  const pages = isHome ? PAGE_LINKS : [HOME_LINK, ...PAGE_LINKS];

  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  /* ページを移ったらメニューを閉じる */
  useEffect(() => { setIsOpen(false); }, [pathname]);

  /* メニュー選択時のセクションジャンプ */
  const onMenuClick = (id: string) => {
    const el = document.querySelector<HTMLElement>(`#${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  /* スクロール位置に応じてアクティブセクションを更新 */
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => {
      let current = "";
      for (const item of MENU_ITEMS) {
        const el = document.querySelector<HTMLElement>(`#${item.id}`);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 2) {
          current = item.id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  /* メニューを閉じる（リンククリック以外） */
  useEffect(() => {
    if (!isOpen) return;
    const onBackdropClick = (e: MouseEvent) => {
      if ((e.target as Element).classList.contains("wc2-menu-backdrop")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", onBackdropClick);
    return () => document.removeEventListener("click", onBackdropClick);
  }, [isOpen]);

  return (
    <>
      <button
        className="wc2-menu-toggle"
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>MENU</span>
        <span className="wc2-menu-icon" aria-hidden="true">≡</span>
      </button>

      {isOpen && (
        <>
          <div className="wc2-menu-backdrop" aria-hidden="true"></div>
          <nav className="wc2-menu-nav" role="navigation">
            <ul className="wc2-menu-list">
              {sections.map((item) => (
                <li key={item.id}>
                  <button
                    className={`wc2-menu-item ${activeSection === item.id ? "is-active" : ""}`}
                    onClick={() => onMenuClick(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* 別ページへの導線（ページ内ジャンプと視覚的に区切る）。
                下層ページはセクションが無いので見出しの罫線も出さない */}
            <p className={"wc2-menu-heading" + (sections.length ? "" : " is-bare")}>PAGES</p>
            <ul className="wc2-menu-list wc2-menu-pages">
              {pages.map((p) => (
                <li key={p.href}>
                  <a
                    className="wc2-menu-item wc2-menu-page"
                    href={p.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="wc2-menu-page-jp">{p.label}</span>
                    <span className="wc2-menu-page-en" aria-hidden="true">{p.en}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
