import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { prefersReduced } from "../motion";
import "./Header.css";

const BASE = import.meta.env.BASE_URL;

/**
 * ヘッダーバーは持たず、左上に会社ロゴ＋左端固定のサイドメニュー（12-office式）。
 * デスクトップでは日本語ラベルを縦書きにし、下に英語サブラベルを添える。
 * 現在地の項目には縦の金バーが立ち上がる（li.is-here）。
 * トップページのセクション0〜3はメニュー先頭4項目と1:1対応し、
 * Home側とは CustomEvent（smask:section / smask:goto）で同期する。
 */
type SectionItem = { label: string; en: string; kind: "section"; section: number; id: string | null };
type BizItem = { label: string; en: string; kind: "biz"; section: number };
type PageItem = { label: string; en: string; kind: "page"; href: string };
type Item = SectionItem | BizItem | PageItem;

const ITEMS: Item[] = [
  { label: "ホーム", en: "Home", kind: "section", section: 0, id: null },
  { label: "SMASKとは", en: "About", kind: "section", section: 1, id: "about" },
  { label: "事業内容", en: "Business", kind: "biz", section: 2 },
  { label: "SMASKの考え方", en: "Approach", kind: "section", section: 3, id: "approach" },
  { label: "コラム", en: "Column", kind: "page", href: "/column" },
  { label: "会社概要", en: "Company", kind: "page", href: "/company" },
  { label: "お問い合わせ", en: "Contact", kind: "page", href: "/contact" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState(0);

  const isHome = pathname === "/";

  /* 現在地 → メニュー項目 index（-1 は非表示） */
  const hereIdx = (() => {
    if (isHome) return section <= 3 ? section : -1; // フッター画面では消灯
    if (pathname.startsWith("/business-")) return 2;
    return ITEMS.findIndex(it => it.kind === "page" && it.href === pathname);
  })();

  /* Home（フルページ）からのセクション通知を受けて現在地を更新 */
  useEffect(() => {
    const onSec = (e: Event) => setSection((e as CustomEvent<number>).detail);
    window.addEventListener("smask:section", onSec);
    return () => window.removeEventListener("smask:section", onSec);
  }, []);
  useEffect(() => { setSection(0); }, [pathname]);

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

  /* モバイルナビ表示中は背面スクロールを止める */
  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";
    else if (document.body.style.overflow === "hidden") document.body.style.overflow = "";
  }, [navOpen]);

  const closeDrawer = () => {
    setNavOpen(false);
    if (document.body.style.overflow === "hidden") document.body.style.overflow = "";
  };

  /* セクション項目クリック：ホーム上ではフルページ遷移／スクロール移動 */
  const jump = (e: ReactMouseEvent, sectionIdx: number, id: string | null) => {
    if (!isHome) return; // 下層ページでは App の遷移カーテンで "/" へ
    e.preventDefault();
    if (window.__smaskFullpage) {
      window.dispatchEvent(new CustomEvent("smask:goto", { detail: sectionIdx }));
    } else if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    }
    closeDrawer();
  };

  /* 事業内容：モバイルはプルダウン開閉、デスクトップはセクションへ（サブメニューはホバー） */
  const onBiz = (e: ReactMouseEvent) => {
    if (window.innerWidth <= 760) {
      e.preventDefault();
      setMenuOpen(v => !v);
      return;
    }
    jump(e, 2, "business");
  };

  const current = (p: string) => (pathname === p ? "page" : undefined);

  const labelSpans = (it: Item) => (
    <>
      <span className="nl-jp">{it.label}</span>
      <span className="nl-en" aria-hidden="true">{it.en}</span>
    </>
  );

  return (
    <>
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

      <ul className={"nav" + (navOpen ? " is-open" : "")} id="site-nav">
        {ITEMS.map((it, idx) => {
          const here = idx === hereIdx ? " is-here" : "";
          if (it.kind === "section") {
            return (
              <li key={it.label} className={here || undefined}>
                <a className="nav-link" href="/" onClick={e => jump(e, it.section, it.id)}>
                  {labelSpans(it)}
                </a>
              </li>
            );
          }
          if (it.kind === "biz") {
            return (
              <li key={it.label} className={"has-menu" + here}>
                <a
                  className="nav-link"
                  href="/"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  onClick={onBiz}
                >
                  {labelSpans(it)} <span className="caret" aria-hidden="true"></span>
                </a>
                <div className={"submenu" + (menuOpen ? " is-open" : "")}>
                  <a href="/business-precious-metals"><span className="en">Precious Metals</span><span className="jp">貴金属買取</span></a>
                  <a href="/business-jewelry"><span className="en">Jewelry</span><span className="jp">ジュエリー制作</span></a>
                  <a href="/business-web"><span className="en">Web Content</span><span className="jp">Webコンテンツ制作</span></a>
                </div>
              </li>
            );
          }
          return (
            <li key={it.label} className={here || undefined}>
              <a className="nav-link" href={it.href} aria-current={current(it.href)}>
                {labelSpans(it)}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
