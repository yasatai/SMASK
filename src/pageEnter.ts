/**
 * ページ入場の完了を伝える仕組み。
 *
 * 下層ページは入場カーテン（LoadCurtain）が開き切ってから中身が見える。
 * カーテンの裏でアニメーションが走り終わってしまうと「開いた時にはもう終わっている」
 * ことになるため、演出はこの完了通知を待ってから始動させる。
 *
 * ルート要素の .is-entering が「カーテンが降りている最中」を表す。
 */
const ENTERED = "smask:entered";
const ENTERING_CLASS = "is-entering";

/** カーテンが降り始めた（＝中身をまだ動かさない）ことを記録する */
export function markEntering() {
  document.documentElement.classList.add(ENTERING_CLASS);
}

/** カーテンが開き切った。演出の始動を全体に通知する */
export function markEntered() {
  const root = document.documentElement;
  if (!root.classList.contains(ENTERING_CLASS)) return; // 二重通知を防ぐ
  root.classList.remove(ENTERING_CLASS);
  window.dispatchEvent(new Event(ENTERED));
}

/**
 * 入場完了後にコールバックを実行する。
 * カーテンが無いページ／既に開き切っている場合は即実行。
 * @returns 待機を取り消す関数
 */
export function whenEntered(cb: () => void): () => void {
  if (!document.documentElement.classList.contains(ENTERING_CLASS)) {
    cb();
    return () => {};
  }
  const on = () => cb();
  window.addEventListener(ENTERED, on, { once: true });
  return () => window.removeEventListener(ENTERED, on);
}
