import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 日本語のレスポンシブ改行を整えるヘルパー。ルート切替ごとに本文テキストを走査する。
 *
 *  - ルール①（変な位置での改行／行頭に助詞が来ない）
 *      → CSS の `word-break: auto-phrase`（App.css）に任せる。JS では何もしない。
 *  - ルール②（行末に「、」を残さない）
 *      → 「、」の直後に WORD JOINER を挟み、そこで改行させない。
 *  - ルール③（「。」の後に文章を続けない）
 *      → 「。」の直後（後続テキストがある場合）に <br> を挿入。
 *
 * 重要：テキストを <span> で分割しないこと。分割するとブラウザの文節解析
 *       （auto-phrase）が働かず、「価格」→「価 / 格の」のように単語が割れる
 *       （実測で確認済み）。そのため WORD JOINER を文字として挟む方式にしている。
 *
 * 除外：per-char/per-line アニメの見出し（.wc2-fill / .wc2-hl / .wc2-hero-h1 /
 *       .wc2-dim-big）、ローダー、マーキー、data-no-ja 指定要素。
 */
const SKIP_SELECTOR =
  ".wc2-fill, .wc2-hl, .wc2-hero-h1, .wc2-dim-big, .wc2-loader, .wc2-marquee, [data-no-ja]";

/** 改行を禁止する不可視文字（U+2060 WORD JOINER）。テキストを分割しない。 */
const WJ = "⁠";

/* ルール①の補助：auto-phrase でも稀に手前・途中で改行されてしまう助詞。
   直前と内部に WJ を挟み、行頭に来ない／途中で割れないようにする（分割はしない）。
   長い綴りから順に判定する。 */
const PARTICLE_SEQ = [
  "をもとに", "のもとに", "をもと",
  "にとって", "について", "によって", "における", "とともに",
  "としての", "という", "として", "とって",
  "を", "が",
];
/** 助詞が後続しうる文字（漢字・カナ・閉じ括弧・英数字）。平仮名の語尾（例「上品さは」）も対象。 */
const NOUNISH = /[ぁ-んァ-ヶー一-龠々」』）〕〉》0-9A-Za-z０-９]/;
/** 単独助詞に見えて語頭になりうる語（誤って束ねない） */
const WORD_START = /^(もの|もと|もう|もし|とき|ところ|ともに|とも|には|にも|でも|はじ|やは|へや)/;
/** 名詞の後ろでのみ助詞として扱う一文字（を/が は常に助詞なので上の配列で処理） */
const SOFT_PARTICLE = /[はもにでとへや]/;

/** 助詞の直前と内部に WJ を挟む（前が行頭／既に WJ の場合は不要） */
function protectParticles(text: string) {
  let out = "";
  const prevChar = () => (out.length ? out[out.length - 1] : "");
  for (let i = 0; i < text.length; ) {
    const seq = PARTICLE_SEQ.find((s) => text.startsWith(s, i));
    if (seq && out.length && prevChar() !== WJ) {
      out += WJ + seq.split("").join(WJ); // 直前＋内部で改行させない
      i += seq.length;
      continue;
    }
    const ch = text[i];
    if (
      SOFT_PARTICLE.test(ch) &&
      NOUNISH.test(prevChar()) &&
      !WORD_START.test(text.slice(i))
    ) {
      out += WJ + ch; // 名詞に続く助詞＝行頭に来させない
      i += 1;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** 「、」の直後に置かれた手書きの <br>（行末に「、」を残す原因）を除去する */
function stripCommaBr(root: Element) {
  root.querySelectorAll("br").forEach((br) => {
    if (br.parentElement?.closest(SKIP_SELECTOR)) return;
    let prev = br.previousSibling;
    while (prev && prev.nodeType === 3 && !(prev as Text).data.trim()) prev = prev.previousSibling;
    if (prev && prev.nodeType === 3 && /、\s*$/.test((prev as Text).data)) br.remove();
  });
}

function processTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return;
  const text = protectParticles(node.data); // ルール①の補助（WJ を挟むだけ）
  if (text === node.data && !/[。、]/.test(text)) return;

  const frag = document.createDocumentFragment();
  let buf = "";
  const flush = () => {
    if (buf) {
      frag.appendChild(document.createTextNode(buf));
      buf = "";
    }
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "。") {
      buf += ch;
      // ルール③：「。」の後にまだ文字が残っていれば改行（末尾の「。」は改行しない）
      if (text.slice(i + 1).replace(/\s/g, "").length > 0) {
        flush();
        frag.appendChild(document.createElement("br"));
      }
    } else if (ch === "、") {
      // ルール②：「、」の直後で改行させない＝「、」が行末に残らない
      buf += ch + WJ;
    } else {
      buf += ch;
    }
  }
  flush();
  parent.replaceChild(frag, node);
}

export function useJaTypography(enabled: boolean) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!enabled) return;
    const runPass = () => {
      const root = document.querySelector("main") || document.body;
      stripCommaBr(root); // 「、」直後の手書き改行を除去してから整形
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const t = n as Text;
          if (!t.data || !/[。、をがはもにでとへや]/.test(t.data)) return NodeFilter.FILTER_REJECT;
          const p = t.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.tagName;
          if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
          if (p.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
          if (p.closest("[data-ja-done]")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) nodes.push(n as Text);
      const parents = new Set<HTMLElement>();
      nodes.forEach((node) => {
        const p = node.parentElement;
        processTextNode(node);
        if (p) parents.add(p);
      });
      // 処理済みの親を印し、再実行時の二重処理を防ぐ（遅延マウント分だけ新規処理される）
      parents.forEach((p) => p.setAttribute("data-ja-done", "1"));
    };
    // ローダー／遅延読み込み（wc2 等）で後からマウントされる本文も拾うため複数回実行
    const timers = [90, 500, 1300, 2600].map((d) => window.setTimeout(runPass, d));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname, enabled]);
}
