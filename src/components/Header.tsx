import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { prefersReduced } from "../motion";
import "./Header.css";

/**
 * ヘッダー＝左上ブランド＋左下固定の縦メニュー（12-office式）。
 * トップページのセクション0〜3はメニュー先頭4項目と1:1対応し、
 * 金の短い線（マーカー）が現在地の項目へスライド移動する。
 * Home側とは CustomEvent（smask:section / smask:goto）で同期する。
 */
type SectionItem = { label: string; kind: "section"; section: number; id: string | null };
type BizItem = { label: string; kind: "biz"; section: number };
type PageItem = { label: string; kind: "page"; href: string };
type Item = SectionItem | BizItem | PageItem;

const ITEMS: Item[] = [
  { label: "ホーム", kind: "section", section: 0, id: null },
  { label: "SMASKとは", kind: "section", section: 1, id: "about" },
  { label: "事業内容", kind: "biz", section: 2 },
  { label: "SMASKの考え方", kind: "section", section: 3, id: "approach" },
  { label: "コラム", kind: "page", href: "/column" },
  { label: "会社概要", kind: "page", href: "/company" },
  { label: "お問い合わせ", kind: "page", href: "/contact" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState(0);
  const [marker, setMarker] = useState({ y: 0, on: false });
  const listRef = useRef<HTMLUListElement>(null);

  const isHome = pathname === "/";

  /* 現在地 → メニュー項目 index（-1 は非表示） */
  const markerIdx = (() => {
    if (isHome) return section <= 3 ? section : -1; // フッター画面では消灯
    if (pathname.startsWith("/business-")) return 2;
    const i = ITEMS.findIndex(it => it.kind === "page" && it.href === pathname);
    return i;
  })();

  /* ヘッダーのスクロール状態（元実装どおり） */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Home（フルページ）からのセクション通知を受けてマーカーを動かす */
  useEffect(() => {
    const onSec = (e: Event) => setSection((e as CustomEvent<number>).detail);
    window.addEventListener("smask:section", onSec);
    return () => window.removeEventListener("smask:section", onSec);
  }, []);
  useEffect(() => { setSection(0); }, [pathname]);

  /* マーカー位置の計測（項目の中心へスライド） */
  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const lis = list ? list.querySelectorAll("li") : null;
      const li = lis && markerIdx >= 0 ? (lis[markerIdx] as HTMLElement | undefined) : undefined;
      if (!li) { setMarker(m => ({ ...m, on: false })); return; }
      setMarker({ y: li.offsetTop + li.offsetHeight / 2, on: true });
    };
    measure();
    const t = setTimeout(measure, 600); // Webフォント読み込み後のズレ対策
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [markerIdx, pathname]);

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

  return (
    <>
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
      </header>

      <ul className={"nav" + (navOpen ? " is-open" : "") + (marker.on ? " has-marker" : "")} id="site-nav" ref={listRef}>
        {ITEMS.map(it => {
          if (it.kind === "section") {
            return (
              <li key={it.label}>
                <a className="nav-link" href="/" onClick={e => jump(e, it.section, it.id)}>
                  {it.label}
                </a>
              </li>
            );
          }
          if (it.kind === "biz") {
            return (
              <li key={it.label} className="has-menu">
                <a
                  className="nav-link"
                  href="/"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  onClick={onBiz}
                >
                  事業内容 <span className="caret" aria-hidden="true"></span>
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
            <li key={it.label}>
              <a className="nav-link" href={it.href} aria-current={current(it.href)}>
                {it.label}
              </a>
            </li>
          );
        })}
        <span
          className="nav-marker"
          aria-hidden="true"
          style={{ transform: `translateY(${marker.y}px)`, opacity: marker.on ? undefined : 0 }}
        />
      </ul>
    </>
  );
}
