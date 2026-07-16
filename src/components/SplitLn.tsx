import { Fragment } from "react";
import { prefersReduced } from "../motion";

type Segment = { text: string; accent?: boolean };

type Props = {
  segments: Segment[];
  base: number; // 先頭文字のディレイ秒
  step: number; // 1文字ごとの加算秒
};

/**
 * 見出しの1文字ずつ時間差リビール。
 * 元 main.js の splitChars（DOM分割）と同一のDOM構造・ディレイを JSX で生成する。
 * reduced-motion 時は分割せずプレーンな .ln を返す（元実装と同じ）。
 */
export default function SplitLn({ segments, base, step }: Props) {
  if (prefersReduced) {
    return (
      <span className="ln">
        {segments.map((s, i) =>
          s.accent ? <span key={i} className="accent">{s.text}</span> : <Fragment key={i}>{s.text}</Fragment>
        )}
      </span>
    );
  }
  let idx = 0;
  return (
    <span className="ln is-split">
      {segments.map((seg, si) => {
        const chars = seg.text.split("").map(ch => {
          const delay = (base + idx * step).toFixed(3) + "s";
          idx += 1;
          return (
            <span key={idx} className="ch" style={{ transitionDelay: delay }}>
              {ch}
            </span>
          );
        });
        return seg.accent
          ? <span key={si} className="accent">{chars}</span>
          : <Fragment key={si}>{chars}</Fragment>;
      })}
    </span>
  );
}
