// New York clock + turn the menu item red for the section on screen.
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

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if (!("IntersectionObserver" in window) || !links.length) return;
  var seen = new Map();
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { seen.set(en.target.id, en.isIntersecting); });
    var first = links.find(function (a) { return seen.get(a.hash.slice(1)); });
    links.forEach(function (a) { a.classList.toggle("on", a === first); });
  }, { rootMargin: "0px 0px -55% 0px" });
  links.forEach(function (a) {
    var s = document.getElementById(a.hash.slice(1));
    if (s) obs.observe(s);
  });
})();
