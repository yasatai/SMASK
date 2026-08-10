import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
/* トップ（3D Home）は three.js ごと遅延読み込みし、他ページのバンドルに影響させない */
import { importHome } from "./pages/Home/lazy";
const Home = lazy(importHome);
import Business from "./pages/Business/Business";
import Column from "./pages/Column/Column";
import ColumnPost from "./pages/Column/ColumnPost";
import Company from "./pages/Company/Company";
import Contact from "./pages/Contact/Contact";
import Privacy from "./pages/Privacy/Privacy";
import Works from "./pages/Works/Works";
import WorkDetail from "./pages/Works/WorkDetail";
import { prefersReduced } from "./motion";
import { useJaTypography } from "./useJaTypography";
import { SiteSettingsProvider } from "./data/SiteSettingsContext";
import "./App.css";

/* ページ遷移カーテンの対象ルート（情報ページ間ナビ用）。
   トップは 3D Home が自前の演出を持つが、他ページから "/" へ戻る導線のために含める。 */
const ROUTES = new Set([
  "/",
  "/business",
  "/works",
  "/column",
  "/company",
  "/contact",
  "/privacy",
]);

/* 可変部分を持つルート（実績詳細・コラム記事）。ROUTES と同じく自前で遷移させる */
const DYNAMIC_ROUTES = [/^\/works\/[^/]+$/, /^\/column\/[^/]+$/];

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* ルート切替時は先頭へ（元サイトはページ読み込みで先頭から） */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  /* 日本語のレスポンシブ改行整形（「。」後で改行／行末に「、」を残さない）。
     全ページ有効。per-char アニメ見出し（.wc2-fill/.wc2-hl/.wc2-dim-big/.wc2-marquee）は
     ヘルパー側の SKIP で除外しているので、本文テキストのみ整形される */
  useJaTypography(true);

  /* ---- ページ遷移カーテン（元 main.js の leave-curtain を移植） ---- */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:)/.test(href)) return;
      if (a.host !== window.location.host) return;
      /* 実績詳細のような動的URLも自前で遷移させる。
         ここで拾わないとブラウザが素の href（例 /works/xxx）へ全画面遷移し、
         サブパス配信（GitHub Pages の /SMASK/）では404になる。 */
      if (!ROUTES.has(a.pathname) && !DYNAMIC_ROUTES.some(re => re.test(a.pathname))) return;
      e.preventDefault();
      if (a.pathname === window.location.pathname) return;
      if (prefersReduced) { navigate(a.pathname); return; }
      const c = document.createElement("div");
      c.className = "leave-curtain";
      for (let k = 0; k < 4; k++) c.appendChild(document.createElement("span"));
      document.body.appendChild(c);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => c.classList.add("is-closing"));
      });
      setTimeout(() => {
        navigate(a.pathname);
        // 次ページの入場カーテン（intro / load-curtain）が被った後に撤去
        setTimeout(() => c.remove(), 80);
      }, 780);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return (
    <SiteSettingsProvider>
      <Header />
      <Routes>
        {/* トップ＝3D Home。チャンク読み込み中は黒地を敷く（白の一瞬を出さない） */}
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="wc2-boot" aria-hidden="true"></div>}>
              <Home />
            </Suspense>
          }
        />
        {/* 旧 /business-web はトップへ昇格。ブックマーク等の保険リダイレクト */}
        <Route path="/business-web" element={<Navigate to="/" replace />} />
        <Route path="/business" element={<Business />} />
        <Route path="/column" element={<Column />} />
        <Route path="/column/:slug" element={<ColumnPost />} />
        <Route path="/company" element={<Company />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:slug" element={<WorkDetail />} />
      </Routes>
      <Footer />
    </SiteSettingsProvider>
  );
}
