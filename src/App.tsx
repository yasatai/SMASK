import { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import PreciousMetals from "./pages/PreciousMetals/PreciousMetals";
import Jewelry from "./pages/Jewelry/Jewelry";
import WebContent from "./pages/WebContent/WebContent";
import Column from "./pages/Column/Column";
import Company from "./pages/Company/Company";
import Contact from "./pages/Contact/Contact";
import { prefersReduced } from "./motion";
import "./App.css";

const ROUTES = new Set([
  "/",
  "/business-precious-metals",
  "/business-jewelry",
  "/business-web",
  "/column",
  "/company",
  "/contact",
]);

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* ルート切替時は先頭へ（元サイトはページ読み込みで先頭から） */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  /* ---- ページ遷移カーテン（元 main.js の leave-curtain を移植） ---- */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:)/.test(href)) return;
      if (a.host !== window.location.host) return;
      if (!ROUTES.has(a.pathname)) return;
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

  /* ---- 慣性スムーススクロール（元 main.js を移植・lerp 0.085）
     貴金属買取ページは素直なOS標準スクロールにするため対象外 ---- */
  useEffect(() => {
    if (prefersReduced || "ontouchstart" in window) return;
    if (pathname === "/business-precious-metals") return;
    let target = 0;
    let current = 0;
    let raf: number | null = null;
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const loop = () => {
      // ルート遷移などで外部からスクロール位置が飛んだら追従をやめる
      if (Math.abs(window.scrollY - current) > 2) { raf = null; return; }
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        window.scrollTo({ top: current, behavior: "auto" });
        raf = null;
        return;
      }
      window.scrollTo({ top: current, behavior: "auto" });
      raf = requestAnimationFrame(loop);
    };
    const onWheel = (e: WheelEvent) => {
      if (window.__smaskFullpage) return;        // フルページモードがホイールを所有
      if (e.ctrlKey) return;                     // ピンチズームはネイティブのまま
      if (document.body.style.overflow === "hidden") return; // イントロ/メニュー表示中
      e.preventDefault();
      if (raf === null) { current = window.scrollY; target = current; }
      target += e.deltaY;
      if (target < 0) target = 0;
      if (target > maxScroll()) target = maxScroll();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business-precious-metals" element={<PreciousMetals />} />
        <Route path="/business-jewelry" element={<Jewelry />} />
        <Route path="/business-web" element={<WebContent />} />
        <Route path="/column" element={<Column />} />
        <Route path="/company" element={<Company />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </>
  );
}
