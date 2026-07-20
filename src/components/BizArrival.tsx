import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LoadCurtain from "./LoadCurtain";
import { prefersReduced } from "../motion";
import { markEntering, markEntered } from "../pageEnter";
import { takeBizArrival, type BizGem } from "../bizTransition";
import "./BizArrival.css";

/**
 * 事業ページの入場演出。
 *
 * トップの「詳細を見る」ズーム遷移で来たときは、
 * 同じ背景画像・同じ領域のアップから引いていき（ズームアウト）、ページを見せる。
 * 直接アクセスやリロードのときは通常の入場カーテン（LoadCurtain）にフォールバック。
 */
export default function BizArrival() {
  // 受け取りは一度きり。reduced-motion 時はフラグを消費した上で通常入場にする
  const [gem] = useState<BizGem | null>(() => {
    const g = takeBizArrival();
    return prefersReduced ? null : g;
  });

  if (!gem) return <LoadCurtain />;
  return <ZoomOut gem={gem} />;
}

function ZoomOut({ gem }: { gem: BizGem }) {
  const ref = useRef<HTMLDivElement>(null);

  /* 描画前に「入場中」を立て、ページ側の演出（貴金属買取のチャート等）を待たせる */
  useLayoutEffect(() => {
    markEntering();
  }, []);

  useEffect(() => {
    const el = ref.current!;
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add("is-out"));
    });
    const t = window.setTimeout(() => {
      el.classList.add("is-gone");
      markEntered();          // ここからページ内の演出が動き出す
    }, 1250);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t);
      markEntered();          // 途中離脱でも「入場中」を残さない
    };
  }, []);

  return <div ref={ref} className={`biz-arrival biz-arrival--${gem}`} aria-hidden="true" />;
}
