/**
 * 制作実績のデータ（統合仕様 B）。
 *
 * 掲載の原則：
 *  - CLIENT WORK は仕様で「顧客から公開許可を得た制作実績」と定義されている。
 *    **許可と実内容が揃うまで published: false にしておき、一覧にも詳細にも出さない。**
 *  - IN-HOUSE PROJECT / CONCEPT WORK は自社判断で公開できる。
 *
 * 差し替え手順：下書き（published: false）の各項目を実案件の内容に書き換え、
 * published を true にするだけで一覧・詳細ページの両方に出る。
 */

export type WorkKind = "CLIENT WORK" | "IN-HOUSE PROJECT" | "CONCEPT WORK";

/** 実績詳細ページの1ブロック（統合仕様 B「実績詳細ページ」1〜6・9に対応） */
export type WorkBlock = { no: string; title: string; body: string[] };

export type Work = {
  slug: string;
  kind: WorkKind;
  /** プロジェクト名 */
  title: string;
  /** 制作したWebサイトの種類 */
  type: string;
  year: string;
  /** 制作背景 */
  background: string;
  /** 主な課題 */
  issues: string[];
  /** SMASKの担当範囲 */
  scope: string[];
  /** 実施した内容 */
  done: string[];
  /** 詳細ページ 1〜6 のブロック */
  blocks: WorkBlock[];
  /** 7｜完成したWebサイト。画像が用意できるまでは空配列＝ブロックごと出さない */
  shots: { src: string; alt: string; device: "PC" | "SP" }[];
  /** 9｜公開後。運用・改善を行っている場合だけ書く（空なら出さない） */
  after: string[];
  /** 一覧・詳細に出すか（CLIENT WORK は公開許可が取れるまで false） */
  published: boolean;
};

/** 区分の説明（統合仕様 B「実績の区分」） */
export const KINDS: { name: WorkKind; desc: string }[] = [
  { name: "CLIENT WORK", desc: "顧客から公開許可を得た制作実績です。" },
  { name: "IN-HOUSE PROJECT", desc: "SMASKが自社の事業や運用のために企画・制作したWebサイトです。" },
  { name: "CONCEPT WORK", desc: "提案、構想、自主制作として制作したWebサイトです。" },
];

export const WORKS: Work[] = [
  {
    slug: "smask-corporate",
    kind: "IN-HOUSE PROJECT",
    title: "SMASK コーポレートサイト",
    type: "コーポレートサイト",
    year: "2026",
    background:
      "事業をWebコンテンツ制作へ一本化するタイミングで、自社サイトを全面的に作り替えました。",
    issues: [
      "複数の事業ページが並び、何を依頼できる会社なのかが伝わらない",
      "制作の考え方や担当範囲を説明するページがない",
      "公開後に情報を更新し続けられる状態になっていない",
    ],
    scope: ["企画", "情報設計", "文章制作", "デザイン", "実装", "公開後の運用"],
    done: [
      "サイト全体の構成と導線の再設計",
      "全ページの文章制作",
      "トップページの制作（スクロール連動の演出）",
      "管理画面と連携したサイト設定の反映",
    ],
    blocks: [
      {
        no: "1",
        title: "プロジェクト概要",
        body: [
          "Webコンテンツ制作を行う自社（株式会社スマスク）のコーポレートサイトです。",
          "事業の内容が変わったことに合わせ、掲載する情報とサイト全体の構成を作り直しました。",
        ],
      },
      {
        no: "2",
        title: "制作前の課題",
        body: [
          "旧サイトには複数の事業ページが並んでおり、閲覧者から見て何を依頼できる会社なのか判断しづらい状態でした。",
          "制作物の見せ方が中心で、どのような考え方で、どこまで担当するのかを説明する場所がありませんでした。",
        ],
      },
      {
        no: "3",
        title: "制作方針",
        body: [
          "掲載する事業をWebコンテンツ制作に一本化し、情報量を増やす前に何を伝えるかを絞り込みました。",
          "完成物の見た目より、事業を理解してからWebをつくるという進め方が伝わることを優先しました。",
        ],
      },
      {
        no: "4",
        title: "情報・導線設計",
        body: [
          "トップページは、SMASKとは、考え方、実績、課題、提供できること、強み、制作の流れ、会社概要、問い合わせの順に、上から読むだけで理解が進む一本の流れとして設計しました。",
          "下層は事業内容、制作実績、会社概要、お問い合わせに整理し、各セクションから対応する下層ページへ進めるようにしています。",
        ],
      },
      {
        no: "5",
        title: "文章・デザイン",
        body: [
          "見出しと本文の大きさをサイト共通の基準として定義し、セクションごとにばらつかないようにしました。",
          "背景は漆黒と中央の靄で統一し、下層ページでも同じ世界が続くようにしています。",
        ],
      },
      {
        no: "6",
        title: "実装連携",
        body: [
          "Vite、React、TypeScriptで構築し、重い描画を含むトップページだけを遅延読み込みに分けています。",
          "会社名などのサイト設定は管理画面側から取得する構成にし、文言の更新をコード変更なしで行えるようにしました。",
        ],
      },
    ],
    shots: [],
    after: [
      "公開後もセクション単位で内容を見直し、改善を続けています。",
    ],
    published: true,
  },

  {
    slug: "metal-price-admin",
    kind: "IN-HOUSE PROJECT",
    title: "貴金属価格管理システム",
    type: "Webアプリケーション（管理画面）",
    year: "2026",
    background:
      "毎日変動する相場を手作業で更新していた運用を、管理画面から扱えるかたちに置き換えました。",
    issues: [
      "価格の更新に毎日手作業が発生していた",
      "転記の際に入力ミスが起こりうる",
      "公開ページに表示される価格と管理側の値がずれる",
    ],
    scope: ["要件整理", "画面設計", "実装"],
    done: [
      "管理画面（ログイン・価格編集・履歴）の構築",
      "相場情報の自動取得",
      "公開ページへ表示するためのAPI整備",
    ],
    blocks: [
      {
        no: "1",
        title: "プロジェクト概要",
        body: [
          "貴金属の買取価格を管理し、公開ページへ反映するための自社向けWebアプリケーションです。",
          "管理画面と公開ページを分け、価格の管理者だけが更新できる構成にしています。",
        ],
      },
      {
        no: "2",
        title: "制作前の課題",
        body: [
          "相場は毎日変わるため、確認と転記の作業が日々発生していました。",
          "手作業のため入力ミスが起こりやすく、公開ページの表示と実際の値がずれる可能性がありました。",
        ],
      },
      {
        no: "3",
        title: "制作方針",
        body: [
          "毎日必ず発生する作業から自動化し、人の判断が必要な部分だけを画面に残す方針としました。",
          "自動取得が失敗した場合でも手動で更新できるよう、両方の経路を用意しています。",
        ],
      },
      {
        no: "4",
        title: "情報・導線設計",
        body: [
          "管理画面はログイン後すぐ当日の価格を確認でき、そのまま編集へ進める並びにしました。",
          "過去の値を履歴として残し、いつどの値に変えたのかを後から追えるようにしています。",
        ],
      },
      {
        no: "5",
        title: "文章・デザイン",
        body: [
          "毎日使う画面のため装飾を抑え、数値と更新日時が一目で読めることを優先しました。",
          "更新の成否や取得エラーは、次に何をすればよいかが分かる文言で表示しています。",
        ],
      },
      {
        no: "6",
        title: "実装連携",
        body: [
          "管理画面はPHP（Laravel）で構築し、認証を通した管理者のみが操作できるようにしています。",
          "公開ページ側へはAPI経由で値を渡し、表示と管理を切り離しました。",
        ],
      },
    ],
    shots: [],
    after: [],
    published: true,
  },

  /* ---- 以下は下書き。実案件名・内容・公開許可が揃うまで published: false のまま ---- */
  {
    slug: "client-corporate-site",
    kind: "CLIENT WORK",
    title: "（未確定）コーポレートサイト",
    type: "コーポレートサイト",
    year: "2025",
    background: "",
    issues: [],
    scope: [],
    done: [],
    blocks: [],
    shots: [],
    after: [],
    published: false,
  },
  {
    slug: "client-landing-page",
    kind: "CLIENT WORK",
    title: "（未確定）ランディングページ",
    type: "ランディングページ",
    year: "2025",
    background: "",
    issues: [],
    scope: [],
    done: [],
    blocks: [],
    shots: [],
    after: [],
    published: false,
  },
];

export const publishedWorks = () => WORKS.filter(w => w.published);
export const findWork = (slug: string) => publishedWorks().find(w => w.slug === slug);
