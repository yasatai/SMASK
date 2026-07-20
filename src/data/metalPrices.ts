/**
 * 貴金属の店頭価格。
 *
 * 現在は未接続（プレースホルダー）。DBやAPIから取得できるようになったら
 * fetchMetalPrices() の中身だけを差し替えれば、表示側の変更は不要。
 *
 * 表示の約束：
 *   - retail / buy / diff が null の間は「—」のまま（カウントアップもしない）
 *   - 値が入るとカウントアップが動き、diff の符号で色が付く（プラス=赤 / マイナス=青）
 */

export type MetalPrice = {
  /** 表示用の英字ラベル */
  en: string;
  /** 表示用の和名 */
  jp: string;
  /** DB側のキー（gold / platinum / silver） */
  key: "gold" | "platinum" | "silver";
  /** 小売価格（税込・円/g）。未取得は null */
  retail: number | null;
  /** 買取価格（税込・円/g）。未取得は null */
  buy: number | null;
  /** 前日比（円。プラスで上昇）。未取得は null */
  diff: number | null;
};

/** 価格が未取得の状態（枠だけを表示する） */
export const EMPTY_PRICES: MetalPrice[] = [
  { en: "GOLD", jp: "金", key: "gold", retail: null, buy: null, diff: null },
  { en: "PLATINUM", jp: "プラチナ", key: "platinum", retail: null, buy: null, diff: null },
  { en: "SILVER", jp: "銀", key: "silver", retail: null, buy: null, diff: null },
];

/**
 * 価格の取得。
 *
 * ▼DB/API 接続時はこの関数だけを実装する（呼び出し側は変更不要）
 *   const res = await fetch("/api/metal-prices");
 *   const rows = await res.json();   // [{ key, retail, buy, diff }, ...]
 *   return EMPTY_PRICES.map(p => ({ ...p, ...rows.find(r => r.key === p.key) }));
 *
 * 取得に失敗した場合は EMPTY_PRICES を返すこと。
 * 誤った数字を出すより「—」のままの方が安全なため。
 */
export async function fetchMetalPrices(): Promise<MetalPrice[]> {
  return EMPTY_PRICES; // 未接続
}
