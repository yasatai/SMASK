/**
 * 事業紹介カード「詳細を見る」のズーム遷移の橋渡し。
 *
 * トップの BUSINESS セクションで対象領域へズームイン → 遷移 →
 * 遷移先で同じ領域のアップから引いていく（ズームアウト）演出のために、
 * 「どのカード（gem）から来たか」をページ間で受け渡す。
 *
 * モジュール変数なのでリロードでリセットされる。
 * 直接アクセス時は null ＝ 通常の入場カーテンになる。
 */
export type BizGem = "gold" | "ruby" | "sapphire";

let pending: BizGem | null = null;

/** 出発側（Home）が遷移直前に呼ぶ */
export function setBizArrival(gem: BizGem) {
  pending = gem;
}

/** 到着側が一度だけ受け取る（受け取ったら消える） */
export function takeBizArrival(): BizGem | null {
  const gem = pending;
  pending = null;
  return gem;
}
