import { useEffect, useLayoutEffect, useRef } from "react";
import { prefersReduced } from "../motion";
import { markEntering, markEntered } from "../pageEnter";
import "./LoadCurtain.css";

/** 下層ページの入場カーテン（元 main.js openStage のサブページ分岐を移植） */
export default function LoadCurtain() {
  const ref = useRef<HTMLDivElement>(null);

  /* 描画前に「入場中」を立てる。
     これより先にページ内の演出が始まらないようにするため useEffect ではなく useLayoutEffect。 */
  useLayoutEffect(() => {
    if (!prefersReduced) markEntering();
  }, []);

  useEffect(() => {
    const curtain = ref.current;
    if (!curtain) return;

    if (prefersReduced) {
      curtain.classList.add("is-done");
      markEntered();
      return;
    }

    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => curtain.classList.add("is-open"));
    });

    // 4枚それぞれで transitionend が起きるため、完了処理は一度だけ通す
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      curtain.classList.add("is-done");
      markEntered();          // ここで初めてページ内の演出が動き出す
    };
    curtain.addEventListener("transitionend", finish);
    const t = setTimeout(finish, 1600); // 保険（元実装と同じ）

    return () => {
      cancelAnimationFrame(r1);
      curtain.removeEventListener("transitionend", finish);
      clearTimeout(t);
      markEntered();          // 途中離脱でも「入場中」を残さない
    };
  }, []);

  return (
    <div className="load-curtain" aria-hidden="true" ref={ref}>
      <span></span><span></span><span></span><span></span>
    </div>
  );
}
