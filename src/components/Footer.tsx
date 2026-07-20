import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import "./Footer.css";

const WORD = "SMASK";

/**
 * 全画面クロージング（12-office式：黒で締めず、明るいまま巨大ロゴのアニメで締める）。
 * 巨大ワードマークが下からせり上がって決まる。イージングは既存の --ease-expo。
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
        <a className="footer-wordmark" href="/" aria-label="SMASK トップへ戻る">
          {WORD.split("").map((ch, i) => (
            <span className="fw-ch" key={i} style={{ "--i": i } as CSSProperties}>{ch}</span>
          ))}
        </a>
        <span className="footer-lead">価値を見極め、かたちにする。</span>
      </div>

      {/* 巻末インデックス：スクロール導線に乗らない3ページへの入口 */}
      <nav className="footer-index" aria-label="サイト案内">
        <a href="/column"><span className="fi-en">Column</span><span className="fi-jp">コラム</span></a>
        <a href="/company"><span className="fi-en">Company</span><span className="fi-jp">会社概要</span></a>
        <a href="/contact"><span className="fi-en">Contact</span><span className="fi-jp">お問い合わせ</span></a>
      </nav>
      <nav className="footer-nav" aria-label="フッター">
        <a href="/">ホーム</a>
        <a href="/business-precious-metals">貴金属買取</a>
        <a href="/business-jewelry">ジュエリー制作</a>
        <a href="/business-web">Webコンテンツ制作</a>
        <a href="/privacy">プライバシーポリシー</a>
      </nav>
      <hr className="footer-rule" />
      {/* 著作権表記は登記上の社名。年はサイト公開年 */}
      <p className="footer-copy">
        © 2026 <span className="footer-copy-name">株式会社スマスク</span> All Rights Reserved.
      </p>
    </footer>
  );
}
