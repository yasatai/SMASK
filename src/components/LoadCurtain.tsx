import { useEffect, useRef } from "react";
import { prefersReduced } from "../motion";
import "./LoadCurtain.css";

/** 下層ページの入場カーテン（元 main.js openStage のサブページ分岐を移植） */
export default function LoadCurtain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const curtain = ref.current;
    if (!curtain) return;
    if (prefersReduced) { curtain.classList.add("is-done"); return; }
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => curtain.classList.add("is-open"));
    });
    const onEnd = () => curtain.classList.add("is-done");
    curtain.addEventListener("transitionend", onEnd);
    const t = setTimeout(onEnd, 1600); // 保険（元実装と同じ）
    return () => {
      cancelAnimationFrame(r1);
      curtain.removeEventListener("transitionend", onEnd);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="load-curtain" aria-hidden="true" ref={ref}>
      <span></span><span></span><span></span><span></span>
    </div>
  );
}
