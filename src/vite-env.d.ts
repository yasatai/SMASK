/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 貴金属価格API（管理画面）のベースURL。開発/本番で .env.* により切替 */
  readonly VITE_PRICE_API_BASE?: string;
}
