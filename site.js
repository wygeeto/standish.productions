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
  var start = location.hash.slice(1);
  if (start && document.getElementById(start + "-btn")) openSection(start, false);

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
    cap.textContent = t.getAttribute("data-caption") + "  ·  " + (current + 1) + " / " + tiles.length;
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
