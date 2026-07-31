import { useState, useEffect } from "react";
import "./WebContentV2Menu.css";

interface MenuItem {
  label: string;
  id: string;
}

/* トップの実セクションと1対1で対応させること（セクションを増やしたらここにも足す） */
const MENU_ITEMS: MenuItem[] = [
  { label: "HERO", id: "wc2-hero" },
  { label: "ABOUT", id: "wc2-about-sec" },
  { label: "APPROACH", id: "wc2-approach-sec" },
  { label: "WORKS", id: "wc2-works" },
  { label: "CONCERNS", id: "wc2-concerns" },
  { label: "SERVICES", id: "wc2-services" },
  { label: "STRENGTHS", id: "wc2-strengths-sec" },
  { label: "PROCESS", id: "wc2-route-sec" },
  { label: "COLUMN", id: "wc2-column" },
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

const PAGE_LINKS: PageLink[] = [
  { label: "会社概要", en: "COMPANY", href: "/company" },
  { label: "コラム", en: "COLUMN", href: "/column" },
  { label: "お問い合わせ", en: "CONTACT", href: "/contact" },
];

export default function WebContentV2Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

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
              {MENU_ITEMS.map((item) => (
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

            {/* 別ページへの導線（ページ内ジャンプと視覚的に区切る） */}
            <p className="wc2-menu-heading">PAGES</p>
            <ul className="wc2-menu-list wc2-menu-pages">
              {PAGE_LINKS.map((p) => (
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
