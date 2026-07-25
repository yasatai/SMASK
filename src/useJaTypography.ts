import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 日本語のレスポンシブ改行を整えるヘルパー。ルート切替ごとに本文テキストを走査し：
 *  - ルール③「。」の後に文章を続けない → 「。」の直後（後続テキストがある場合）に <br> を挿入
 *  - ルール②行末に「、」を残さない → 「、＋次の1文字」を白スペース nowrap で束ね、
 *    「、」が行末に落ちないようにする（次文字と必ず同じ行に載る）
 * インライン要素（<em>/<a> 等）は壊さず、対象のテキストノードだけを置換する。
 *
 * 除外：per-char/per-line アニメの見出し（.wc2-fill / .wc2-hl / .wc2-hero-h1 / .wc2-dim-big）、
 *       ローダー、data-no-ja 指定要素、および wc2（3D演出）ページ全体は別扱いのため対象外。
 */
const SKIP_SELECTOR =
  ".wc2-fill, .wc2-hl, .wc2-hero-h1, .wc2-dim-big, .wc2-loader, .wc2-marquee, [data-no-ja]";

function nowrapComma(next: string) {
  const span = document.createElement("span");
  span.style.whiteSpace = "nowrap";
  span.textContent = next ? "、" + next : "、";
  return span;
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
  const text = node.data;
  if (!/[。、]/.test(text)) return;

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
      flush();
      // 「。」の後にまだ文字が残っていれば改行（末尾の「。」は改行しない）
      if (text.slice(i + 1).replace(/\s/g, "").length > 0) {
        frag.appendChild(document.createElement("br"));
      }
    } else if (ch === "、") {
      const next = text[i + 1] || "";
      flush();
      if (next) {
        // 「、＋次の1文字」を nowrap で束ねる → 「、」が行末に来ない
        frag.appendChild(nowrapComma(next));
        i++;
      } else {
        // ノード末尾の「、」：次の隣接テキストの先頭1文字を借りて束ねる（行末の「、」を防ぐ）
        let sib = node.nextSibling;
        while (sib && sib.nodeType === 3 && !(sib as Text).data.trim()) sib = sib.nextSibling;
        if (sib && sib.nodeType === 3 && (sib as Text).data.length) {
          frag.appendChild(nowrapComma((sib as Text).data[0]));
          (sib as Text).data = (sib as Text).data.slice(1);
        } else {
          frag.appendChild(nowrapComma(""));
        }
      }
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
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // reduced-motion でも改行整形自体は有効にしてよいが、安全側で通常どおり実施
    }
    const id = window.setTimeout(() => {
      const root = document.querySelector("main") || document.body;
      stripCommaBr(root);   // 「、」直後の手書き改行を除去してから整形
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const t = n as Text;
          if (!t.data || !/[。、]/.test(t.data)) return NodeFilter.FILTER_REJECT;
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
      nodes.forEach(processTextNode);
    }, 80);
    return () => window.clearTimeout(id);
  }, [pathname, enabled]);
}
