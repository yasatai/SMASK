import "./Header.css";

const BASE = import.meta.env.BASE_URL;

/**
 * 左上の会社ロゴのみ。
 * 上部ヘッダーバーと横並びナビは廃止し、全ページで右上のMENU（SiteMenu）に統一した
 * （2026-08-01 代表指示・FB-2）。背景を全画面で見せるための措置でもある。
 */
export default function Header() {
  return (
    <a className="site-logo" href="/" aria-label="SMASK ホーム">
      <img src={`${BASE}assets/logo.jpg`} alt="SMASK" width="1024" height="512" />
    </a>
  );
}
