/* SMASK corporate — interactions
 * - page-load curtain reveal
 * - hero copy fade-in
 * - header scroll state
 * - mobile nav + dropdown toggles
 * - section curtain reveal (IntersectionObserver)
 * All spatial motion respects prefers-reduced-motion.
 */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- opening animation / page-load curtain ---- */
  function openStage() {
    var hero = document.querySelector(".hero");
    var intro = document.getElementById("intro");
    var curtain = document.querySelector(".load-curtain");

    /* Homepage: full opening sequence (logo -> gold line -> gems -> curtain) */
    if (intro) {
      // reduced-motion -> skip straight to hero
      if (reduce) {
        intro.classList.add("is-done");
        if (hero) hero.classList.add("is-ready");
        return;
      }

      document.body.style.overflow = "hidden";
      // after the logo reveal, part the curtain and start the hero fade-in
      setTimeout(function () {
        intro.classList.add("is-parting");
        if (hero) hero.classList.add("is-ready");
      }, 2400);
      // remove the overlay once the panels have slid away
      setTimeout(function () {
        intro.classList.add("is-done");
        document.body.style.overflow = "";
      }, 3900);
      return;
    }

    /* Sub-pages: quick 4-panel curtain */
    if (hero) hero.classList.add("is-ready");
    if (!curtain) return;
    if (reduce) { curtain.classList.add("is-done"); return; }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { curtain.classList.add("is-open"); });
    });
    curtain.addEventListener("transitionend", function once() {
      curtain.classList.add("is-done");
      curtain.removeEventListener("transitionend", once);
    });
    setTimeout(function () { curtain.classList.add("is-done"); }, 1600);
  }
  if (document.readyState === "complete") openStage();
  else window.addEventListener("load", openStage);

  /* ---- header scroll state ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---- dropdown (click on the "事業内容" label) ---- */
  document.querySelectorAll(".has-menu > .nav-link").forEach(function (btn) {
    var menu = btn.parentElement.querySelector(".submenu");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = menu.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  // close open dropdowns when clicking outside (desktop)
  document.addEventListener("click", function (e) {
    if (window.innerWidth <= 760) return;
    document.querySelectorAll(".submenu.is-open").forEach(function (m) {
      if (!m.parentElement.contains(e.target)) {
        m.classList.remove("is-open");
        var b = m.parentElement.querySelector(".nav-link");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---- split headings into chars for staggered rise ---- */
  function splitChars(el, baseDelay, step) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var idx = 0;
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split("").forEach(function (chr) {
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = chr;
        s.style.transitionDelay = (baseDelay + idx * step).toFixed(3) + "s";
        frag.appendChild(s);
        idx++;
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.classList.add("is-split");
  }
  if (!reduce) {
    document.querySelectorAll(".hero h1 .ln").forEach(function (ln, i) {
      splitChars(ln, 0.15 + i * 0.30, 0.045);
    });
    document.querySelectorAll(".sec-head h2 .ln").forEach(function (ln) {
      splitChars(ln, 0.14, 0.045);
    });
  }

  /* ---- fullpage pinned sections (homepage, desktop) ---- */
  (function () {
    var hero = document.querySelector(".hero");
    if (!hero) return;                                   // homepage only
    if (reduce || "ontouchstart" in window || window.innerWidth < 900) return;

    var sections = [hero].concat(
      Array.prototype.slice.call(document.querySelectorAll("main .panel"))
    );
    var footer = document.querySelector(".site-footer");
    if (footer) sections.push(footer);
    if (sections.length < 2) return;

    window.__smaskFullpage = true;
    document.documentElement.classList.add("is-fullpage");
    sections.forEach(function (s) { s.classList.add("fp-section"); });

    /* transition curtain */
    var curtain = document.createElement("div");
    curtain.className = "fp-curtain";
    for (var k = 0; k < 4; k++) curtain.appendChild(document.createElement("span"));
    document.body.appendChild(curtain);

    /* dot navigation */
    var dots = document.createElement("nav");
    dots.className = "fp-nav";
    dots.setAttribute("aria-label", "セクション");
    sections.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "セクション " + (i + 1));
      b.addEventListener("click", function () { goTo(i); });
      dots.appendChild(b);
    });
    document.body.appendChild(dots);
    var dotBtns = dots.querySelectorAll("button");

    var current = 0, animating = false, wheelLock = 0;

    function setActive(i) {
      sections.forEach(function (s, idx) {
        var on = idx === i;
        s.classList.toggle("is-active", on);
        if (!on) {
          s.classList.remove("is-revealed");
          if (s === hero) s.classList.remove("is-ready");
          var w = s.querySelector(".wrap");
          if (w) w.scrollTop = 0;
        }
      });
      dotBtns.forEach(function (b, idx) { b.classList.toggle("is-active", idx === i); });
    }

    function reveal(i) {
      var s = sections[i];
      void s.offsetWidth; // reflow so the replayed transition restarts
      if (s === hero) s.classList.add("is-ready");
      else s.classList.add("is-revealed");
    }

    function goTo(i) {
      if (animating || i === current || i < 0 || i >= sections.length) return;
      animating = true;
      curtain.classList.add("is-closing");
      setTimeout(function () {
        setActive(i);
        current = i;
        curtain.classList.remove("is-closing");
        void curtain.offsetWidth;
        curtain.classList.add("is-opening");
        reveal(i);
        setTimeout(function () {
          curtain.classList.remove("is-opening");
          animating = false;
          wheelLock = Date.now();      // absorb trailing trackpad momentum
        }, 1000);
      }, 920);
    }

    setActive(0); // hero .is-ready is applied by the intro sequence

    /* allow native scrolling inside a section that overflows the viewport */
    function canScrollInside(el, dy) {
      var sc = el.querySelector(".wrap");
      if (!sc || sc.scrollHeight <= sc.clientHeight + 1) return false;
      if (dy > 0) return sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1;
      return sc.scrollTop > 0;
    }

    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return; // keep pinch-zoom native
      var intro = document.getElementById("intro");
      if (intro && !intro.classList.contains("is-done")) { e.preventDefault(); return; }
      if (canScrollInside(sections[current], e.deltaY)) return;
      e.preventDefault();
      if (animating) return;
      var now = Date.now();
      if (now - wheelLock < 400) return;
      if (Math.abs(e.deltaY) < 24) return;
      wheelLock = now;
      goTo(current + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      if (animating) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); goTo(current + 1); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goTo(current - 1); }
      else if (e.key === "End")  { e.preventDefault(); goTo(sections.length - 1); }
      else if (e.key === "Home") { e.preventDefault(); goTo(0); }
    });

    /* SCROLL hint advances to the next section */
    var hint = document.querySelector(".hero-scroll");
    if (hint) {
      hint.style.cursor = "pointer";
      hint.addEventListener("click", function () { goTo(1); });
    }

    /* crossing the desktop/mobile breakpoint needs a re-init */
    window.addEventListener("resize", function () {
      if (window.innerWidth < 900) location.reload();
    });
  })();

  /* ---- inertia smooth scroll (desktop wheel, lerp) ---- */
  (function () {
    if (window.__smaskFullpage) return; // fullpage mode owns the wheel
    if (reduce || "ontouchstart" in window) return;
    var target = window.scrollY, current = window.scrollY, raf = null;
    function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
    function loop() {
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        window.scrollTo({ top: current, behavior: "auto" });
        raf = null; return;
      }
      window.scrollTo({ top: current, behavior: "auto" });
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;                      // keep pinch-zoom native
      if (document.body.style.overflow === "hidden") return; // intro / menu open
      e.preventDefault();
      if (raf === null) { current = window.scrollY; target = current; }
      target += e.deltaY;
      if (target < 0) target = 0;
      if (target > maxScroll()) target = maxScroll();
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: false });
  })();

  /* ---- page transition (leave curtain on internal links) ---- */
  (function () {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:)/.test(href)) return;
      if (a.host !== location.host) return;
      if (reduce) return; // navigate natively
      e.preventDefault();
      var c = document.createElement("div");
      c.className = "leave-curtain";
      for (var k = 0; k < 4; k++) c.appendChild(document.createElement("span"));
      document.body.appendChild(c);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { c.classList.add("is-closing"); });
      });
      setTimeout(function () { location.href = href; }, 780);
    });
    // if the page is restored from bfcache (back button), remove any stale curtain
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        document.querySelectorAll(".leave-curtain").forEach(function (n) { n.remove(); });
      }
    });
  })();

  /* ---- section curtain reveal (scroll mode only) ---- */
  if (window.__smaskFullpage) return; // fullpage mode drives reveals itself
  var panels = document.querySelectorAll(".panel");
  if (!panels.length) return;
  if (reduce || !("IntersectionObserver" in window)) {
    panels.forEach(function (p) { p.classList.add("is-revealed"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.22, rootMargin: "0px 0px -8% 0px" });
  panels.forEach(function (p) { io.observe(p); });
})();
