# SMASK コーポレートサイト（React + TypeScript 版）

`Web/` の静的サイトを Vite + React 19 + TypeScript に移植したものです。
**アニメーション・色・フォントは元サイトから変更していません。**

## コマンド

```bash
npm install      # 初回のみ
npm run dev      # 開発サーバー（http://localhost:5173）
npm run build    # 型チェック + 本番ビルド（dist/ に出力）
npm run preview  # ビルド結果の確認
```

## 画像の差し替え

`public/assets/` に配置します（`hero.jpg` / `about.jpg` / `business.jpg` / `approach.jpg`）。
詳細は `public/assets/README.txt` を参照。

## 構成

```
src/
  main.tsx            エントリ（tokens.css / style.css を読み込み）
  App.tsx             ルーティング + ページ遷移カーテン + 慣性スクロール
  motion.ts           prefers-reduced-motion 判定（共有）
  styles/
    tokens.css        デザイントークン（元ファイルをそのまま移植）
    style.css         全スタイル（元ファイルをそのまま移植・画像パスのみ調整）
    company.css       会社概要の表（元 company.html の <style> を移植）
  components/
    Header.tsx        共通ヘッダー（プルダウン / モバイルドロワー）
    Footer.tsx        共通フッター
    LoadCurtain.tsx   下層ページの入場カーテン
    PageHero.tsx      下層ページのページヘッダー
    SplitLn.tsx       見出しの1文字ずつ時間差リビール
  pages/
    Home.tsx          トップ（オープニング / フルページ・セクション遷移）
    PreciousMetals.tsx / Jewelry.tsx / WebContent.tsx
    Column.tsx / Company.tsx / Contact.tsx
```

## 元サイトとの挙動対応

| 元（Web/js/main.js） | React 版 |
|---|---|
| オープニング演出（毎回再生） | `Home.tsx` の effect |
| フルページ・ピン留めセクション遷移（PC） | `Home.tsx` の effect（ドットナビ・キー操作・内部スクロール対応込み） |
| 見出しの文字分割リビール | `SplitLn.tsx`（同一のDOM構造・ディレイをJSXで生成） |
| 慣性スムーススクロール | `App.tsx` の effect |
| ページ遷移カーテン | `App.tsx` の effect（React Router の navigate に接続） |
| 下層ページ入場カーテン | `LoadCurtain.tsx` |
| スクロール連動リビール（モバイル） | `Home.tsx` の IntersectionObserver |
| prefers-reduced-motion 抑制 | すべて対応（`motion.ts`） |
