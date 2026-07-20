import { useEffect } from "react";
import { prefersReduced } from "./motion";
import { whenEntered } from "./pageEnter";

/**
 * スクロール連動の表示制御（下層ページ共通）。
 *
 * IntersectionObserver は速いスクロールや End キーでの一気移動を取りこぼすことがあり、
 * そのままだと要素が opacity:0 のまま残って「本文が読めない」状態になる。
 * そこで IO（気持ちの良いタイミング用）＋ スクロール監視（取りこぼしの安全網）の二段構えにする。
 */

/** 渡された要素を「一度だけ」処理する */
function observeOnce(
  elements: HTMLElement[],
  activate: (el: HTMLElement) => void,
  ioOptions: IntersectionObserverInit,
  /** 安全網の発火ライン（画面高に対する割合。1 = 画面下端） */
  sweepRatio = 0.9
) {
  const pending = new Set(elements);
  if (!pending.size) return () => {};

  const fire = (el: HTMLElement) => {
    if (!pending.has(el)) return;
    pending.delete(el);
    activate(el);
  };

  // 動きを減らす設定・非対応環境では、演出なしで即表示（内容は必ず読める）
  if (prefersReduced || !("IntersectionObserver" in window)) {
    Array.from(pending).forEach(fire);
    return () => {};
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      fire(entry.target as HTMLElement);
    });
  }, ioOptions);
  pending.forEach(el => io.observe(el));

  /* --- 安全網：画面に入った／通り過ぎた要素を確実に拾う --- */
  let ticking = false;
  const sweep = () => {
    ticking = false;
    if (!pending.size) return;
    const line = window.innerHeight * sweepRatio;
    Array.from(pending).forEach(el => {
      if (el.getBoundingClientRect().top < line) {
        io.unobserve(el);
        fire(el);
      }
    });
    if (!pending.size) detachSweep();
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  };
  const detachSweep = () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  sweep(); // 初期表示ぶん

  return () => {
    io.disconnect();
    detachSweep();
  };
}

const $ = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel));

/**
 * 画面に入った要素に .is-in を付ける（入場カーテンが開いてから始動）。
 * - [data-reveal]         … その要素自体をフェードアップ
 * - [data-reveal-stagger] … コンテナに .is-in を付け、CSS 側で子を時間差表示（カード列など）
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    let stop = () => {};
    const cancelWait = whenEntered(() => {
      stop = observeOnce(
        $("[data-reveal], [data-reveal-stagger]"),
        el => el.classList.add("is-in"),
        { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
      );
    });
    return () => { cancelWait(); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * [data-count] の数字を 0 から実値まで回す（3桁区切り・符号・単位対応）。
 *
 * [data-count-group] を付けた親（例：価格カード）があれば、その単位でまとめて発火する。
 * 数字ごとに監視すると、カード下部の「前日比」だけ取り残される（＝カード内で表示がちぐはぐになる）ため。
 */
export function useCountUp(deps: unknown[] = []) {
  useEffect(() => {
    const frames = new Set<number>();

    const render = (el: HTMLElement, n: number) => {
      const sign = el.dataset.sign ?? "";
      const unit = el.dataset.unit ?? "";
      el.textContent = sign + Math.round(n).toLocaleString() + unit;
    };

    const startOne = (el: HTMLElement) => {
      const target = Number(el.dataset.count ?? 0);
      if (prefersReduced) { render(el, target); return; }
      const dur = 1200;
      let t0: number | null = null;
      const step = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        render(el, target * (1 - Math.pow(1 - p, 4))); // ease-out-quart
        if (p < 1) frames.add(requestAnimationFrame(step));
      };
      render(el, 0);
      frames.add(requestAnimationFrame(step));
    };

    /* 数字は「見られている時」に回したい。読み込み直後は Hero に目が向いているので、
       発火ラインを画面中央あたりまで引き上げ、スクロールされてから始動させる。 */
    const io: IntersectionObserverInit = { threshold: 0, rootMargin: "0px 0px -45% 0px" };
    const SWEEP = 0.55;

    let stops: Array<() => void> = [];
    const cancelWait = whenEntered(() => {
      const groups = $("[data-count-group]");
      // グループに属さない単独の数字も取りこぼさない
      const loose = $("[data-count]").filter(el => !el.closest("[data-count-group]"));

      if (groups.length) {
        stops.push(observeOnce(
          groups,
          group => group.querySelectorAll<HTMLElement>("[data-count]").forEach(startOne),
          io, SWEEP
        ));
      }
      if (loose.length) {
        stops.push(observeOnce(loose, startOne, io, SWEEP));
      }
    });

    return () => {
      cancelWait();
      stops.forEach(fn => fn());
      stops = [];
      frames.forEach(cancelAnimationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
