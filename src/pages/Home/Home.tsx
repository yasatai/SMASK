import { useEffect, useRef } from "react";
import SplitLn from "../../components/SplitLn";
import { prefersReduced } from "../../motion";
import "./Home.css";

/**
 * トップページ。
 * 元 js/main.js の挙動（オープニング → フルページ・ピン留めセクション遷移／
 * モバイルはスクロール＋IntersectionObserver リビール）を ref + effect で忠実に移植。
 * クラスの付け外しはすべて元実装と同じ classList 操作で行う。
 */
export default function Home() {
  const introRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = "SMASK ｜ 価値を見極め、かたちにする";
    const cleanups: Array<() => void> = [];
    const intro = introRef.current!;
    const hero = heroRef.current!;

    /* ---- オープニング（ホームを開くたびに毎回再生・元実装どおり） ---- */
    if (prefersReduced) {
      intro.classList.add("is-done");
      hero.classList.add("is-ready");
    } else {
      document.body.style.overflow = "hidden";
      const t1 = setTimeout(() => {
        intro.classList.add("is-parting");
        hero.classList.add("is-ready");
      }, 2400);
      const t2 = setTimeout(() => {
        intro.classList.add("is-done");
        document.body.style.overflow = "";
      }, 3900);
      cleanups.push(() => {
        clearTimeout(t1);
        clearTimeout(t2);
        document.body.style.overflow = "";
      });
    }

    /* ---- フルページ（PC）か通常スクロール（タッチ/狭幅/reduce）かを判定 ---- */
    const fullpage =
      !prefersReduced && !("ontouchstart" in window) && window.innerWidth >= 900;

    if (fullpage) {
      const panels = Array.from(
        mainRef.current!.querySelectorAll<HTMLElement>(".panel")
      );
      const sections: HTMLElement[] = [hero, ...panels];
      const footer = document.querySelector<HTMLElement>(".site-footer");
      if (footer) sections.push(footer);

      window.__smaskFullpage = true;
      document.documentElement.classList.add("is-fullpage");
      sections.forEach(s => s.classList.add("fp-section"));

      /* 遷移カーテン */
      const curtain = document.createElement("div");
      curtain.className = "fp-curtain";
      for (let k = 0; k < 4; k++) curtain.appendChild(document.createElement("span"));
      document.body.appendChild(curtain);

      /* ドットナビ */
      const dots = document.createElement("nav");
      dots.className = "fp-nav";
      dots.setAttribute("aria-label", "セクション");
      sections.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "セクション " + (i + 1));
        b.addEventListener("click", () => goTo(i));
        dots.appendChild(b);
      });
      document.body.appendChild(dots);
      const dotBtns = Array.from(dots.querySelectorAll("button"));

      let current = 0;
      let animating = false;
      let wheelLock = 0;
      const timers = new Set<number>();

      const setActive = (i: number) => {
        sections.forEach((s, idx) => {
          const on = idx === i;
          s.classList.toggle("is-active", on);
          if (!on) {
            s.classList.remove("is-revealed");
            if (s === hero) s.classList.remove("is-ready");
            const w = s.querySelector(".wrap");
            if (w) w.scrollTop = 0;
          }
        });
        dotBtns.forEach((b, idx) => b.classList.toggle("is-active", idx === i));
        /* 暗色フッター上ではナビ・ドットの色を反転 */
        document.documentElement.classList.toggle(
          "is-fp-dark", footer !== null && sections[i] === footer
        );
        /* 左下メニューのマーカーへ現在地を通知 */
        window.dispatchEvent(new CustomEvent("smask:section", { detail: i }));
      };

      const reveal = (i: number) => {
        const s = sections[i];
        void s.offsetWidth; // reflow：再訪時に演出をやり直すため
        if (s === hero) s.classList.add("is-ready");
        else s.classList.add("is-revealed");
      };

      const goTo = (i: number) => {
        if (animating || i === current || i < 0 || i >= sections.length) return;
        animating = true;
        curtain.classList.add("is-closing");
        const t1 = window.setTimeout(() => {
          setActive(i);
          current = i;
          curtain.classList.remove("is-closing");
          void curtain.offsetWidth;
          curtain.classList.add("is-opening");
          reveal(i);
          const t2 = window.setTimeout(() => {
            curtain.classList.remove("is-opening");
            animating = false;
            wheelLock = Date.now(); // トラックパッド慣性の吸収
          }, 1000);
          timers.add(t2);
        }, 920);
        timers.add(t1);
      };

      setActive(0); // hero の is-ready はイントロ側が付与

      /* 画面より背が高いセクションは内部スクロールを先に消化 */
      const canScrollInside = (el: HTMLElement, dy: number) => {
        const sc = el.querySelector(".wrap");
        if (!sc || sc.scrollHeight <= sc.clientHeight + 1) return false;
        if (dy > 0) return sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1;
        return sc.scrollTop > 0;
      };

      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey) return; // ピンチズームはネイティブ
        if (!intro.classList.contains("is-done")) { e.preventDefault(); return; }
        if (canScrollInside(sections[current], e.deltaY)) return;
        e.preventDefault();
        if (animating) return;
        const now = Date.now();
        if (now - wheelLock < 400) return;
        if (Math.abs(e.deltaY) < 24) return;
        wheelLock = now;
        goTo(current + (e.deltaY > 0 ? 1 : -1));
      };
      window.addEventListener("wheel", onWheel, { passive: false });

      const onKey = (e: KeyboardEvent) => {
        if (animating) return;
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
          e.preventDefault(); goTo(current + 1);
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          e.preventDefault(); goTo(current - 1);
        } else if (e.key === "End") { e.preventDefault(); goTo(sections.length - 1); }
        else if (e.key === "Home") { e.preventDefault(); goTo(0); }
      };
      window.addEventListener("keydown", onKey);

      /* 左下メニューからのセクション遷移を受け付ける */
      const onGoto = (e: Event) => goTo((e as CustomEvent<number>).detail);
      window.addEventListener("smask:goto", onGoto);

      /* SCROLL 表示クリックで次へ */
      const hint = hero.querySelector<HTMLElement>(".hero-scroll");
      const onHint = () => goTo(1);
      if (hint) {
        hint.style.cursor = "pointer";
        hint.addEventListener("click", onHint);
      }

      /* デスクトップ⇔モバイルの境界を跨いだら再初期化（元実装どおり） */
      const onResize = () => {
        if (window.innerWidth < 900) window.location.reload();
      };
      window.addEventListener("resize", onResize);

      cleanups.push(() => {
        timers.forEach(t => clearTimeout(t));
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("smask:goto", onGoto);
        if (hint) { hint.removeEventListener("click", onHint); hint.style.cursor = ""; }
        curtain.remove();
        dots.remove();
        document.documentElement.classList.remove("is-fullpage", "is-fp-dark");
        sections.forEach(s =>
          s.classList.remove("fp-section", "is-active", "is-revealed")
        );
        delete window.__smaskFullpage;
      });
    } else {
      /* ---- 通常スクロールモード：セクションのカーテンリビール（元実装どおり） ---- */
      const panels = mainRef.current!.querySelectorAll<HTMLElement>(".panel");
      if (prefersReduced || !("IntersectionObserver" in window)) {
        panels.forEach(p => p.classList.add("is-revealed"));
      } else {
        const io = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
        );
        panels.forEach(p => io.observe(p));
        cleanups.push(() => io.disconnect());
      }
    }

    return () => cleanups.forEach(fn => fn());
  }, []);

  return (
    <>
      {/* オープニング */}
      <div className="intro" ref={introRef} aria-hidden="true">
        <div className="intro-panels"><span></span><span></span><span></span><span></span></div>
        <div className="intro-stage">
          <div className="intro-word" aria-label="SMASK">
            <span>S</span><span>M</span><span>A</span><span>S</span><span>K</span>
          </div>
          <div className="intro-rule">
            <i className="intro-gem intro-gem--ruby"></i>
            <i className="intro-gem intro-gem--sapphire"></i>
          </div>
          <p className="intro-tag">価値を見極め、かたちにする</p>
        </div>
      </div>

      <main ref={mainRef}>
        {/* HERO */}
        <section className="hero" ref={heroRef}>
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow fade-up">SMASK</span>
              <h1>
                <span className="hl">
                  <SplitLn base={0.15} step={0.045} segments={[{ text: "価値を見極め、" }]} />
                </span>
                <span className="hl">
                  <SplitLn base={0.45} step={0.045} segments={[{ text: "かたち", accent: true }, { text: "にする。" }]} />
                </span>
              </h1>
              <p className="hero-sub fade-up">
                貴金属買取、ジュエリー制作、Webコンテンツ制作。SMASKは、<br className="sub-br" />
                それぞれ異なる領域で、価値の本質を見極め、必要な形に整え、社会へ届けていきます。
              </p>
            </div>
          </div>
          <span className="hero-scroll" aria-hidden="true"><span className="line"></span>SCROLL</span>
        </section>

        {/* ABOUT */}
        <section className="panel" id="about">
          <div className="panel-bg" aria-hidden="true"></div>
          <div className="curtain" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div className="wrap">
            <div className="sec-head reveal-item">
              <span className="eyebrow">About SMASK</span>
              <h2><SplitLn base={0.14} step={0.045} segments={[{ text: "SMASKとは" }]} /></h2>
            </div>
            <div className="about-grid">
              <div className="about-lead reveal-item">
                <h2><span className="en eyebrow">Our Belief</span>目に見える価格の、<br />その先を見つめて。</h2>
              </div>
              <div className="about-body reveal-item">
                <p>SMASKは、目に見える価格だけでなく、その背景にある価値や流れまで見つめながら、事業を組み立てています。</p>
                <ul className="about-list">
                  <li>貴金属の価値を見極めること。</li>
                  <li>新しい価値観を持つジュエリーを構想し、形にしていくこと。</li>
                  <li>情報や導線を整え、伝わる形にすること。</li>
                </ul>
                <p>異なる事業に見えても、その根底には「本質を捉え、無理のない形で価値を届ける」という共通した考えがあります。</p>
              </div>
            </div>
          </div>
        </section>

        {/* OUR BUSINESS */}
        <section className="panel panel--tint" id="business">
          <div className="panel-bg" aria-hidden="true"></div>
          <div className="curtain" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div className="wrap">
            <div className="sec-head reveal-item">
              <span className="eyebrow">Our Business</span>
              <h2><SplitLn base={0.14} step={0.045} segments={[{ text: "事業紹介" }]} /></h2>
              <p className="lead">異なる領域で、価値の本質に向き合う3つの事業。</p>
            </div>
            <div className="biz-grid">
              <article className="biz-card reveal-item" data-gem="gold">
                <span className="num">01</span>
                <span className="en">Precious Metals</span>
                <h3>貴金属買取</h3>
                <p>金・プラチナなどの貴金属を、相場だけでなく状態や背景も踏まえて丁寧に確認し、適正にご案内します。</p>
                <a className="biz-link" href="/business-precious-metals">詳細を見る <span className="arrow" aria-hidden="true">→</span></a>
              </article>
              <article className="biz-card reveal-item" data-gem="ruby">
                <span className="num">02</span>
                <span className="en">Jewelry</span>
                <h3>ジュエリー制作</h3>
                <p>Pristine Diamondを軸に、ラボグロウンダイヤモンドという新しい選択肢を、これからの価値観にあった形で構想・準備しています。</p>
                <a className="biz-link" href="/business-jewelry">詳細を見る <span className="arrow" aria-hidden="true">→</span></a>
              </article>
              <article className="biz-card reveal-item" data-gem="sapphire">
                <span className="num">03</span>
                <span className="en">Web Content</span>
                <h3>Webコンテンツ制作</h3>
                <p>見た目を整えるだけでなく、事業の伝わり方、情報整理、導線設計、運用のしやすさまで含めて整えます。</p>
                <a className="biz-link" href="/business-web">詳細を見る <span className="arrow" aria-hidden="true">→</span></a>
              </article>
            </div>
          </div>
        </section>

        {/* OUR APPROACH */}
        <section className="panel" id="approach">
          <div className="panel-bg" aria-hidden="true"></div>
          <div className="curtain" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div className="wrap">
            <div className="sec-head reveal-item">
              <span className="eyebrow">Our Approach</span>
              <h2><SplitLn base={0.14} step={0.045} segments={[{ text: "SMASKの考え方" }]} /></h2>
            </div>
            <div className="approach-intro reveal-item">
              <p>SMASKは、見た目だけの整い方や、一時的な話題性だけを追いません。何を残し、何を整え、どう届けるべきかを見ながら、事業ごとに無理のない形をつくっていきます。</p>
            </div>
            <div className="approach-grid">
              <div className="approach-item">
                <span className="idx">01</span>
                <div><h3>本質を見極める</h3><p>表面的な価値や見た目だけでなく、その背景にある価値・文脈・意味まで確認します。</p></div>
              </div>
              <div className="approach-item">
                <span className="idx">02</span>
                <div><h3>必要以上に複雑にしない</h3><p>整理されていない情報は伝わりません。シンプルで機能する形を選びます。</p></div>
              </div>
              <div className="approach-item">
                <span className="idx">03</span>
                <div><h3>現実に根ざして形にする</h3><p>理想だけでなく、現場の実態に合った形で進めます。急がず、正しく始めます。</p></div>
              </div>
              <div className="approach-item">
                <span className="idx">04</span>
                <div><h3>長く機能する価値を考える</h3><p>一時的な話題性より、時間が経っても意味を持ち続けるものを大切にします。</p></div>
              </div>
            </div>
            <div className="approach-close reveal-item">
              <hr className="rule-gold" style={{ marginBottom: "2rem" }} />
              <p>事業は違っても、向き合っているのは価値そのものです。</p>
              <p>貴金属、ジュエリー、情報。扱う対象は異なっても、SMASKが見ているのは、その本質をどう見極め、どう整え、どう届けるかです。</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
