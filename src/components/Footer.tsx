import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./Footer.css";

const BASE = import.meta.env.BASE_URL;

/**
 * 全画面クロージング（12-office式：黒で締めず、明るいまま巨大ロゴのアニメで締める）。
 * 巨大ロゴが下からせり上がって決まる。イージングは既存の --ease-expo。
 *
 * ロゴは「文字」と「◆マーク」の2枚に分けて重ねている（2026-07-31 代表指示）。
 * 1枚のPNGだと (1)明るいページで黒・暗いページで白に反転できない
 * (2)ホバーで文字だけ色を変えられない ため。
 * 文字はマスクで塗るので色を自由に変えられ、◆はオレンジのまま残る。
 * ホーム（デスクトップ・フルページ）は Home 側の reveal() が .is-revealed を付与する。
 * 下層ページ／モバイルは、フッターが画面に入ったら IntersectionObserver で始動。
 * ※後日 SVG ロゴに差し替えて「線画ドロー」に発展させる予定（課題）。
 */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let disconnect = () => {};
    const raf = requestAnimationFrame(() => {
      if (document.documentElement.classList.contains("is-fullpage")) return; // ホームは reveal() 任せ
      if (!("IntersectionObserver" in window)) { el.classList.add("is-revealed"); return; }
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(el);
      disconnect = () => io.disconnect();
    });
    return () => { cancelAnimationFrame(raf); disconnect(); };
  }, []);

  return (
    <footer className="site-footer" ref={ref}>
      <div className="footer-stage">
        <a
          className="footer-wordmark" href="/" aria-label="SMASK トップへ戻る"
          style={{
            "--fw-letters": `url(${BASE}assets/logo-letters.png)`,
            "--fw-mark": `url(${BASE}assets/logo-mark.png)`,
          } as CSSProperties}
        >
          <span className="fw-letters" aria-hidden="true"></span>
          <span className="fw-mark" aria-hidden="true"></span>
        </a>
        <span className="footer-lead">価値を見極め、かたちにする。</span>
      </div>

      {/* 巻末インデックス：スクロール導線に乗らない3ページへの入口 */}
      {/* ※コラムは内容の整備待ちのため導線から外している（整備後にリンクを戻す） */}
      <nav className="footer-index" aria-label="サイト案内">
        <a href="/business"><span className="fi-en">Business</span><span className="fi-jp">事業内容</span></a>
        <a href="/works"><span className="fi-en">Works</span><span className="fi-jp">制作実績</span></a>
        <a href="/company"><span className="fi-en">Company</span><span className="fi-jp">会社概要</span></a>
        <a href="/contact"><span className="fi-en">Contact</span><span className="fi-jp">お問い合わせ</span></a>
      </nav>
      <nav className="footer-nav" aria-label="フッター">
        <a href="/">ホーム</a>
        <a href="/privacy">プライバシーポリシー</a>
      </nav>
      <hr className="footer-rule" />
      {/* 著作権表記（2026-07-31 代表指定の文面。年号・末尾のピリオドは入れない） */}
      <p className="footer-copy">©SMASK Co., Ltd. All Rights Reserved</p>
    </footer>
  );
}
