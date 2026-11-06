// New York clock, the three sections (tap a headline to show its work), and the full screen photo viewer.
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
  function openSection(id, scroll) {
    buttons.forEach(function (b) {
      var on = b.getAttribute("aria-controls") === id;
      b.setAttribute("aria-expanded", on ? "true" : "false");
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
    if (id) document.getElementById(id).querySelectorAll(".skills, .handles li, .feed, .ugc h3, .ugc li, .mine")
      .forEach(function (el, n) { el.classList.add("fx"); el.style.setProperty("--d", n * 70 + "ms"); });   // text fades in one after another
    document.body.classList.toggle("open", !!id);   // phones hide the bottom chunk while a tab is open
    if (id && history.replaceState) history.replaceState(null, "", "#" + id);
    if (!id && history.replaceState) history.replaceState(null, "", location.pathname);
    if (id && scroll && window.matchMedia("(max-width: 760px)").matches) {
      document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("aria-controls");
      openSection(b.getAttribute("aria-expanded") === "true" ? null : id, true);
    });
  });
  // clicking the name goes back to the home view: everything closed, back at the top
  var home = document.getElementById("home");
  if (home) home.addEventListener("click", function (ev) {
    ev.preventDefault();
    openSection(null, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  var start = location.hash.slice(1);
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
      new ResizeObserver(function () { if (gallery.clientWidth !== lastW) { lastW = gallery.clientWidth; layout(); } }).observe(gallery);
    } else {
      window.addEventListener("resize", layout);
    }
  }

  // instagram boxes: shrink each one to fit its column
  var igs = Array.prototype.slice.call(document.querySelectorAll(".ig"));
  function fitIg() { igs.forEach(function (b) { if (b.clientWidth) b.style.setProperty("--s", (b.clientWidth / 340).toFixed(4)); }); }
  if (igs.length) {
    if ("ResizeObserver" in window) { var ro = new ResizeObserver(fitIg); igs.forEach(function (b) { ro.observe(b); }); }
    else window.addEventListener("resize", fitIg);
  }

  // photo viewer
  var viewer = document.getElementById("viewer");
  var img = viewer.querySelector("img");
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
