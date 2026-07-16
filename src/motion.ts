/* 共有モーション設定（元 js/main.js の reduce 判定を踏襲） */
export const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

declare global {
  interface Window {
    /** フルページモード有効時にホイール制御の所有権を示すフラグ（元実装と同名） */
    __smaskFullpage?: boolean;
  }
}
