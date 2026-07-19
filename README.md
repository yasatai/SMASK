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

CSSは「1ファイル = 1つの担当範囲」に分割し、**ページはフォルダ単位（.tsx と .css を同居）**にしている。

```
src/
  main.tsx              エントリ。共通CSS（tokens → base）を App より先に読み込む
  App.tsx / App.css     ルーティング + 慣性スクロール ／ ページ遷移カーテン
  motion.ts             prefers-reduced-motion 判定（共有）
  styles/
    tokens.css          デザイントークン（色・フォント・余白・イージング）
    base.css            リセット / 共通タイポ / .wrap / .eyebrow / .btn / focus / reduced-motion
  components/
    Header.tsx + Header.css          ヘッダー・左下固定ナビ・現在地マーカー
    Footer.tsx + Footer.css          共通フッター
    LoadCurtain.tsx + LoadCurtain.css 下層ページの入場カーテン
    PageHero.tsx + PageHero.css       下層ページ共通の見出し／本文組み（page-hero / prose）
    SplitLn.tsx                       見出しの文字分割（スタイルは Home.css 側）
  pages/
    Home/Home.tsx + Home.css                     トップ専用（オープニング/フルページ/Hero/各セクション）
    PreciousMetals/PreciousMetals.tsx + .css     貴金属買取
    Jewelry/Jewelry.tsx + .css                   ジュエリー制作
    WebContent/WebContent.tsx + .css             Webコンテンツ制作
    Column/Column.tsx + Column.css               コラム一覧
    Company/Company.tsx + Company.css            会社概要（情報テーブル）
    Contact/Contact.tsx + Contact.css            お問い合わせ（フォーム）
```

### CSSの読み込み順（重要）

`main.tsx` で `tokens.css → base.css` を **App より先に** import している。
これにより「共通 → コンポーネント → ページ」の順に適用され、ページ側の指定が後勝ちになる。
共通CSSの import をこの位置から動かすと、上書き関係が崩れるので注意。

### どこに書くか

| 追加したいもの | 書く場所 |
|---|---|
| 色・フォント・余白の定義値 | `styles/tokens.css` |
| 全ページ共通（ボタン等） | `styles/base.css` |
| ヘッダー / フッター等の共通部品 | `components/<名前>.css` |
| 下層ページ共通の本文組み | `components/PageHero.css` |
| 特定ページだけの装飾 | `pages/<ページ>/<ページ>.css` |

※ 事業3ページ（貴金属買取・ジュエリー制作・Webコンテンツ制作）は現状すべて共通スタイルで成立しているため、
CSSファイルは用意してあるが中身は空（固有指定を足す場所として確保）。

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
