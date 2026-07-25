import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS, fetchSiteSettings, type SiteSettings } from "./siteSettings";

/**
 * サイト設定を1回だけ取得して各所（フッター・会社概要・お問い合わせ等）へ流す。
 * 取得前・失敗時は DEFAULTS（現行ハードコード値）を返すので表示は常に成立する。
 */
const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    fetchSiteSettings()
      .then(s => { if (alive) setSettings(s); })
      .catch(() => { /* 失敗時も DEFAULTS のまま */ });
    return () => { alive = false; };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = (): SiteSettings => useContext(SiteSettingsContext);
