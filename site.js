// New York clock + full screen picture viewer.
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

  var viewer = document.getElementById("viewer");
  if (!viewer) return;
  var stage = viewer.querySelector(".stage");
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile.zoom"));
  var current = -1;
  var opener = null;

  function show(i) {
    current = (i + tiles.length) % tiles.length;
    var media = tiles[current].querySelector("img, video").cloneNode(true);
    media.removeAttribute("loading");
    stage.replaceChildren(media);
  }
  function open(i) {
    opener = tiles[i];
    show(i);
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    viewer.querySelector(".close").focus();
  }
  function close() {
    viewer.hidden = true;
    stage.replaceChildren();
    document.body.style.overflow = "";
    if (opener) opener.focus();
  }

  tiles.forEach(function (t, i) { t.addEventListener("click", function () { open(i); }); });
  viewer.addEventListener("click", close);
  document.addEventListener("keydown", function (ev) {
    if (viewer.hidden) return;
    if (ev.key === "Escape") close();
    if (ev.key === "ArrowRight") show(current + 1);
    if (ev.key === "ArrowLeft") show(current - 1);
  });
})();
