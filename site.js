// New York clock, the three sections (tap a headline to show its work), and the full screen photo viewer.
// check mode: open the site with ?debug to see a small report box (for tracking down browser-specific problems).
(function () {
  if (!/[?&]debug/.test(location.search)) return;
  var errors = [];
  window.addEventListener("error", function (e) { errors.push((e.message || "error") + " @" + (e.lineno || "?")); });
  window.addEventListener("unhandledrejection", function (e) { errors.push("promise: " + e.reason); });
  document.addEventListener("DOMContentLoaded", function () {
    var box = document.createElement("pre");
    box.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99;max-width:min(560px,calc(100vw - 16px));margin:0;padding:8px 10px;" +
      "background:#111;color:#0f0;font:11px/1.35 ui-monospace,Menlo,monospace;white-space:pre-wrap;text-transform:none;border-radius:6px;opacity:.92";
    document.body.appendChild(box);
    function report() {
      var p = document.querySelector(".panel:not([hidden])"), L = [];
      L.push(navigator.userAgent);
      L.push("window " + innerWidth + "x" + innerHeight + "  zoom " + (window.devicePixelRatio || 1) + "  reduce-motion " + matchMedia("(prefers-reduced-motion: reduce)").matches);
      L.push("site.js " + ((document.currentScript || document.querySelector("script[src*=site]") || {}).src || "").split("?")[1]);
      if (p) {
        var r = p.getBoundingClientRect(), cs = getComputedStyle(p);
        L.push("open: " + p.id + "  x" + Math.round(r.x) + " y" + Math.round(r.y) + " w" + Math.round(r.width) + " h" + Math.round(r.height) +
               "  opacity " + cs.opacity + "  display " + cs.display + "  visibility " + cs.visibility + "  settled " + p.classList.contains("settled"));
        var an = p.getAnimations ? p.getAnimations({ subtree: true }) : [];
        L.push("animations " + an.length + (an[0] ? "  first: " + an[0].animationName + " " + an[0].playState + " t=" + Math.round(an[0].currentTime || 0) : ""));
        var first = p.firstElementChild; if (first) { var fr = first.getBoundingClientRect(); L.push("first item: " + first.className + " y" + Math.round(fr.y) + " h" + Math.round(fr.height) + " opacity " + getComputedStyle(first).opacity + " color " + getComputedStyle(first).color); }
        L.push("items " + p.querySelectorAll("*").length + "  scrollY " + Math.round(scrollY) + "  page height " + document.documentElement.scrollHeight);
      } else L.push("open: none");
      L.push("errors: " + (errors.length ? errors.join(" | ") : "none"));
      box.textContent = L.join("\n");
    }
    report(); setInterval(report, 500);
  });
})();

(function () {
  var clock = document.getElementById("clock");
  if (clock) {
    var fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  // sections
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".sec"));
  var homebox = document.getElementById("homebox"), reel = document.querySelector(".reel");
  function openSection(id, scroll) {
    buttons.forEach(function (b) {
      var on = b.getAttribute("aria-controls") === id;
      b.setAttribute("aria-expanded", on ? "true" : "false");
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
    if (id) document.getElementById(id).querySelectorAll(".skills, .handles li, .feed, .others, .ugc h2, .ugc li, .mine, .sites h2, .sites li")
      .forEach(function (el, n) { el.classList.add("fx"); el.style.setProperty("--d", n * 70 + "ms"); });   // text fades in one after another
    if (id && egg) egg.hidden = true;
    if (homebox) homebox.hidden = !!id;   // the home video only shows when no section is open
    if (reel) { if (id) reel.pause(); else play(); }
    if (id) settle(document.getElementById(id));
    document.body.classList.toggle("open", !!id);   // phones hide the bottom chunk while a tab is open
    if (id && history.replaceState) history.replaceState(null, "", "#" + id);
    if (!id && history.replaceState) history.replaceState(null, "", location.pathname);
    if (id && scroll && window.matchMedia("(max-width: 760px)").matches) {
      document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  // safety net: the fade-ins start invisible. If the browser doesn't run them (Safari sometimes stalls them),
  // show everything at once instead of leaving the section blank. Otherwise switch them off once they've finished.
  function settle(panel) {
    panel.classList.remove("settled");
    var check = setTimeout(function () {
      var a = panel.getAnimations ? panel.getAnimations()[0] : null;
      if (!a || !(a.currentTime > 50)) panel.classList.add("settled");
    }, 400);
    setTimeout(function () { clearTimeout(check); panel.classList.add("settled"); }, 3200);
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("aria-controls");
      openSection(b.getAttribute("aria-expanded") === "true" ? null : id, true);
    });
  });
  // clicking the name goes back to the home view: everything closed, back at the top
  var home = document.getElementById("home");
  // easter egg: clicking the name while already on the home view shows a little note in the empty space
  var egg = document.getElementById("egg");
  if (home) home.addEventListener("click", function (ev) {
    ev.preventDefault();
    var onHome = !buttons.some(function (b) { return b.getAttribute("aria-expanded") === "true"; });
    if (onHome && egg) {
      egg.hidden = true; void egg.offsetWidth; egg.hidden = false;   // restart the fade each click
      settle(egg);
      return;
    }
    openSection(null, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  // home video: plays silently on a loop. Phones that refuse autoplay (e.g. low power mode) start it on the first tap.
  function play() { var p = reel && reel.play(); if (p && p.catch) p.catch(function () {}); }
  if (reel) {
    play();
    document.addEventListener("touchstart", function once() { if (!homebox.hidden) play(); document.removeEventListener("touchstart", once); }, { passive: true });
  }
  var start = location.hash.slice(1);
  if (start === "socials") start = "media";   // old links to #socials still work
  if (start && document.getElementById(start + "-btn")) openSection(start, false);

  // photo grid: fill each row edge to edge, keeping every photo's shape (like a contact sheet).
  // The last row keeps the normal height instead of stretching.
  var gallery = document.querySelector(".gallery");
  function layout() {
    if (!gallery || !gallery.offsetWidth) return;
    var W = gallery.clientWidth;
    var cs = getComputedStyle(gallery);
    var target = parseFloat(cs.getPropertyValue("--row")) || 300;
    var gap = parseFloat(cs.columnGap) || 0;
    var items = Array.prototype.slice.call(gallery.querySelectorAll(".tile"));
    var rows = [], row = [], sum = 0;
    items.forEach(function (t) {
      var r = parseFloat(t.style.getPropertyValue("--r")) || 1;
      row.push([t, r]); sum += r;
      if (sum * target + gap * (row.length - 1) >= W) { rows.push([row, (W - gap * (row.length - 1)) / sum]); row = []; sum = 0; }
    });
    if (row.length) rows.push([row, Math.min(target, (W - gap * (row.length - 1)) / sum)]);
    var frag = document.createDocumentFragment();
    rows.forEach(function (rw) {
      var div = document.createElement("div");
      div.className = "jrow";
      rw[0].forEach(function (p) { p[0].style.width = Math.floor(p[1] * rw[1] * 100) / 100 + "px"; div.appendChild(p[0]); });
      frag.appendChild(div);
    });
    gallery.replaceChildren(frag);
    gallery.classList.add("justified");
  }
  if (gallery) {
    if ("ResizeObserver" in window) {
      var lastW = 0;
      new ResizeObserver(function () { requestAnimationFrame(function () { if (gallery.clientWidth !== lastW) { lastW = gallery.clientWidth; layout(); } }); }).observe(gallery);   // next frame, so resizing never loops
    } else {
      window.addEventListener("resize", layout);
    }
  }

  // instagram boxes: shrink each one to fit its column
  var igs = Array.prototype.slice.call(document.querySelectorAll(".ig"));
  // only reacts to width changes: setting --s changes the box height, which must not trigger it again (that loops)
  function fitIg() {
    igs.forEach(function (b) {
      var w = b.clientWidth;
      if (w && w !== b._w) { b._w = w; b.style.setProperty("--s", (w / 340).toFixed(4)); }
    });
  }
  if (igs.length) {
    if ("ResizeObserver" in window) { var ro = new ResizeObserver(function () { requestAnimationFrame(fitIg); }); igs.forEach(function (b) { ro.observe(b); }); }
    else window.addEventListener("resize", fitIg);
  }

  // photo viewer
  var viewer = document.getElementById("viewer");
  var img = document.createElement("img");   // made here so the page has no empty image tag until a photo opens
  img.alt = "";
  viewer.querySelector(".v-fig").prepend(img);
  var cap = viewer.querySelector("figcaption");
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
  var current = 0, opener = null, touchX = null;

  function show(i) {
    current = (i + tiles.length) % tiles.length;
    var t = tiles[current], src = t.querySelector("img");
    img.src = src.getAttribute("src");
    img.alt = src.alt;
    var title = document.createElement("span"), nums = document.createElement("span");
    title.className = "cap-t"; nums.className = "cap-n";
    title.textContent = t.getAttribute("data-caption");
    nums.textContent = t.getAttribute("data-year") + " · " + (current + 1) + " / " + tiles.length;
    cap.replaceChildren(title, nums);
  }
  function open(i) { opener = tiles[i]; show(i); viewer.hidden = false; document.body.style.overflow = "hidden"; viewer.querySelector(".v-close").focus(); }
  function close() { viewer.hidden = true; img.removeAttribute("src"); document.body.style.overflow = ""; if (opener) opener.focus(); }

  tiles.forEach(function (t, i) { t.addEventListener("click", function () { open(i); }); });
  viewer.querySelector(".v-close").addEventListener("click", close);
  viewer.querySelector(".v-prev").addEventListener("click", function (ev) { ev.stopPropagation(); show(current - 1); });
  viewer.querySelector(".v-next").addEventListener("click", function (ev) { ev.stopPropagation(); show(current + 1); });
  viewer.addEventListener("click", function (ev) { if (ev.target === viewer) close(); });
  viewer.addEventListener("touchstart", function (ev) { touchX = ev.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", function (ev) {
    if (touchX === null) return;
    var dx = ev.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener("keydown", function (ev) {
    if (viewer.hidden) return;
    if (ev.key === "Escape") close();
    if (ev.key === "ArrowRight") show(current + 1);
    if (ev.key === "ArrowLeft") show(current - 1);
  });
})();
