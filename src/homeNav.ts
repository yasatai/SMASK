/**
 * 下層ページのサイドナビからホームの特定セクションへ寄せるための橋渡し。
 * モジュール変数なのでリロードで消える（＝直接アクセス時はホーム先頭から）。
 * 0=先頭は指定不要。1=SMASKとは / 2=事業内容 / 3=SMASKの考え方。
 */
let pending: number | null = null;

export function setHomeSection(section: number) {
  pending = section;
}

export function takeHomeSection(): number | null {
  const s = pending;
  pending = null;
  return s;
}
