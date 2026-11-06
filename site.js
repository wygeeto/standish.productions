// New York clock + keep only one section open (for browsers that don't do it on their own).
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

  var secs = Array.prototype.slice.call(document.querySelectorAll("details.sec"));
  secs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) secs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
