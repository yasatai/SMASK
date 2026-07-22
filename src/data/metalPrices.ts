/**
 * 貴金属の店頭価格。
 *
 * 取得元は管理画面（Laravel）の公開API `GET {VITE_PRICE_API_BASE}/api/public/prices`。
 * 開発時＝ローカル管理画面(127.0.0.1:8000) / 本番＝admin.test-smask.com（.env.* で切替）。
 *
 * 表示の約束：
 *   - retail / buy / diff が null の間は「—」のまま（カウントアップもしない）
 *   - 値が入るとカウントアップが動き、diff の符号で色が付く（プラス=赤 / マイナス=青）
 *
 * ※現状、管理画面が持つのは「品位ごとの買取価格」のみ（小売・前日比は未管理）。
 *   運用が固まるまで表示は現状維持とし、buy に代表純度（K24/Pt1000/SV1000）の
 *   買取価格を入れる。retail / diff はデータが無いため null（＝「—」）のまま。
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

/** 公開API `/api/public/prices` のレスポンス形 */
type ApiPurity = { name: string; price: string };
type ApiMetal = { code: string; name: string; updated_at: string; prices: ApiPurity[] };
type ApiResponse = { data: ApiMetal[] };

const API_BASE = import.meta.env.VITE_PRICE_API_BASE ?? "";

/**
 * 価格の取得。取得元・失敗時とも、呼び出し側（PreciousMetals）は変更不要。
 * 取得に失敗したら EMPTY_PRICES を返す（誤った数字を出すより「—」のままが安全）。
 */
export async function fetchMetalPrices(): Promise<MetalPrice[]> {
  if (!API_BASE) return EMPTY_PRICES;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${API_BASE}/api/public/prices`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return EMPTY_PRICES;

    const json = (await res.json()) as ApiResponse;
    const byCode = new Map((json.data ?? []).map(m => [m.code, m]));

    return EMPTY_PRICES.map(p => {
      const metal = byCode.get(p.key);
      const top = metal?.prices?.[0]; // 先頭＝最高純度（K24 / Pt1000 / SV1000）
      if (!top) return p;             // 未公開の金属は「—」のまま
      const buy = Number(top.price);
      return { ...p, buy: Number.isFinite(buy) ? buy : null };
    });
  } catch {
    return EMPTY_PRICES;
  }
}
