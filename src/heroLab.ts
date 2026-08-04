/**
 * トップFV（Hero）の配置・改行の比較用スイッチ（**検証専用・確定したら丸ごと削除する**）。
 *
 *   ?pos=left | center | left-bottom | center-bottom
 *   ?br=2 | 1 | 3
 *
 * 2軸は独立して切り替えられる（配置を変えながら改行だけ試す、が出来るように）。
 * 選択は localStorage に持つ。サイト内リンクでクエリが落ちても保たれる。
 *
 * 削除手順（確定したら）：
 *   1. このファイル、src/styles/hero-lab.css、src/components/HeroLab.tsx を削除
 *   2. App.tsx の import と <HeroLab /> を削除
 *   3. Home.tsx の HERO_LINES 参照を、採用した1案のJSXへ戻す
 *   4. 採用した配置を Home.css の .wc2-hero-* 本体へ本移植する
 */

export type HeroPos = "left" | "center" | "left-bottom" | "center-bottom";
export type HeroBr = "2" | "1" | "3";

export const HERO_POS: { id: HeroPos; label: string; note: string }[] = [
  { id: "left",          label: "左（現行）",   note: "左寄せ・上下中央" },
  { id: "center",        label: "中央",         note: "中央寄せ・上下中央" },
  { id: "left-bottom",   label: "左・下",       note: "左寄せ・下寄せ（靄を上に大きく見せる）" },
  { id: "center-bottom", label: "中央・下",     note: "中央寄せ・下寄せ" },
];

export const HERO_BR: { id: HeroBr; label: string; note: string }[] = [
  { id: "2", label: "2行（現行）", note: "価値を見極め、／かたちにする。" },
  { id: "1", label: "1行",         note: "価値を見極め、かたちにする。" },
  { id: "3", label: "3行",         note: "価値を／見極め、／かたちにする。" },
];

/** 見出しの行構成。grad=虹色にする範囲（"all"＝行全体／"tail"＝行の後半だけ） */
export type HeroLine = { text: string; grad?: "all" } | { head: string; tail: string };

export const HERO_LINES: Record<HeroBr, HeroLine[]> = {
  "2": [{ text: "価値を見極め、" }, { text: "かたちにする。", grad: "all" }],
  "1": [{ head: "価値を見極め、", tail: "かたちにする。" }],
  "3": [{ text: "価値を" }, { text: "見極め、" }, { text: "かたちにする。", grad: "all" }],
};

const KEY_POS = "smask-hero-pos";
const KEY_BR = "smask-hero-br";

const pick = <T extends string>(q: string | null, saved: string | null, allow: readonly T[], def: T): T => {
  if (q && (allow as readonly string[]).includes(q)) return q as T;
  if (saved && (allow as readonly string[]).includes(saved)) return saved as T;
  return def;
};

export function currentPos(): HeroPos {
  const q = new URLSearchParams(location.search).get("pos");
  return pick(q, localStorage.getItem(KEY_POS), HERO_POS.map(p => p.id), "left");
}
export function currentBr(): HeroBr {
  const q = new URLSearchParams(location.search).get("br");
  return pick(q, localStorage.getItem(KEY_BR), HERO_BR.map(b => b.id), "2");
}

export function applyHero(pos: HeroPos, br: HeroBr) {
  localStorage.setItem(KEY_POS, pos);
  localStorage.setItem(KEY_BR, br);
  document.documentElement.dataset.heroPos = pos;
  document.documentElement.dataset.heroBr = br;
}

/** 改行を変えると行の数（＝スクロール振り付けの対象）が変わるので、確実に再読み込みする */
export function switchHero(pos: HeroPos, br: HeroBr) {
  applyHero(pos, br);
  const url = new URL(location.href);
  url.searchParams.set("pos", pos);
  url.searchParams.set("br", br);
  location.replace(url.toString());
}
