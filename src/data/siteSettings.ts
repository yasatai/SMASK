/**
 * サイト共通の会社情報・連絡先。
 * 取得元は管理画面（Laravel）の公開API `GET {VITE_PRICE_API_BASE}/api/public/settings`。
 * 価格・お知らせと同じオリジン・同じ環境変数を使う（新環境変数は作らない）。
 *
 * DEFAULTS は現行HPのハードコード値。未設定/失敗時は DEFAULTS を返すので、
 * APIが無くても表示は現状のまま（＝絶対に壊れない）。
 */

export type SiteSettings = {
  site_name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  business_hours: string;
  public_url: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "SMASK",
  company_name: "株式会社スマスク",
  phone: "",
  email: "contact@smask.co.jp",
  address: "",
  business_hours: "平日 9:00〜18:00",
  public_url: "https://test-smask.com",
};

type ApiResponse = { data: Partial<SiteSettings> };

const API_BASE = import.meta.env.VITE_PRICE_API_BASE ?? "";

/** null/空の項目は DEFAULTS で補う（欠損しても表示が崩れない） */
const merge = (partial: Partial<SiteSettings>): SiteSettings => {
  const out = { ...DEFAULT_SETTINGS };
  (Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]).forEach(key => {
    const value = partial[key];
    if (typeof value === "string" && value.trim() !== "") out[key] = value;
  });
  return out;
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!API_BASE) return DEFAULT_SETTINGS;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${API_BASE}/api/public/settings`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return DEFAULT_SETTINGS;
    const json = (await res.json()) as ApiResponse;
    return merge(json.data ?? {});
  } catch {
    return DEFAULT_SETTINGS;
  }
}
