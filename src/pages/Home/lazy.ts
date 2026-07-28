/**
 * トップ（3D Home）の遅延読み込み口。
 * three.js を含む重いバンドルを他ページから切り離すため、App.tsx の lazy() から
 * この import を経由して読み込む（App から直接 import すると循環参照になるため分離）。
 */
export const importHome = () => import("./Home");
