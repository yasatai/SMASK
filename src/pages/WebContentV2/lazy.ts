/**
 * Webコンテンツ制作（3D版）の遅延読み込み口。
 * App.tsx の lazy() と、Home の遷移演出中の先読みで同じ import を共有するためのモジュール。
 * （App から直接 export すると Home ⇄ App の循環参照になるため分離している）
 */
export const importWebContentV2 = () => import("./WebContentV2");
