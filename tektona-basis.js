/* ##########################################################################
   TEKTONA BASIS (Script)
   Gemeinsam für Website und alle Werkzeuge. Im <head> laden (ohne defer),
   damit das gewählte Thema vor dem ersten Zeichnen gesetzt ist.

     A  Thema hell/dunkel       Knopf #tk-theme im Kopf, Wahl wird im Browser gemerkt
     B  Drucken                 Knopf #tk-print öffnet die Druckvorschau am Bildschirm;
                                Ctrl+P druckt direkt. In beiden Fällen:
                                Klasse .pp auf <html>, Ereignis "tk:printstart",
                                danach "tk:printend". Seiten hängen sich daran,
                                um ihren Inhalt für Papier vorzubereiten.
   ########################################################################## */
(function () {
  "use strict";
  var root = document.documentElement;

  function read(key)         { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }


  /* A  Thema ------------------------------------------------------------- */
  var saved = read("tk-theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-tk", saved);

  function isLight() {
    var t = root.getAttribute("data-tk");
    return t ? t === "light" : root.getAttribute("data-theme") === "light";
  }
  function syncThemeButton() {
    var b = document.getElementById("tk-theme");
    if (!b) return;
    var light = isLight(), label = light ? "Dunkles Design" : "Helles Design";
    var sun = b.querySelector(".i-sun"), moon = b.querySelector(".i-moon");
    if (sun)  sun.toggleAttribute("hidden", light);      /* SVG: Attribut setzen, nicht .hidden */
    if (moon) moon.toggleAttribute("hidden", !light);
    b.setAttribute("aria-label", label);
    b.title = label;
  }
  function toggleTheme() {
    var next = isLight() ? "dark" : "light";
    root.setAttribute("data-tk", next);
    store("tk-theme", next);
    syncThemeButton();
    window.dispatchEvent(new CustomEvent("tk:theme", { detail: next }));
  }


  /* B  Drucken ----------------------------------------------------------- */
  var printing = false;

  function startPrint() {
    if (printing) return;
    printing = true;
    root.classList.add("pp");
    window.dispatchEvent(new Event("tk:printstart"));
  }
  function endPrint() {
    if (!printing) return;
    printing = false;
    root.classList.remove("pp", "pp-preview");
    window.dispatchEvent(new Event("tk:printend"));
  }
  function openPreview() {
    startPrint();
    root.classList.add("pp-preview");
    window.scrollTo(0, 0);
  }
  var inPreview = function () { return root.classList.contains("pp-preview"); };

  /* Ctrl+P / Menü Drucken: nur umschalten, wenn nicht schon die Vorschau offen ist */
  window.addEventListener("beforeprint", function () { if (!inPreview()) startPrint(); });
  window.addEventListener("afterprint",  function () { if (!inPreview()) endPrint(); });

  function buildPreviewBar() {
    var bar = document.createElement("div");
    bar.className = "pp-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Druckvorschau");
    bar.innerHTML =
      '<span>Druckvorschau A4</span>' +
      '<span class="pp-hint">Drucken mit Ctrl+P / Cmd+P</span>' +
      '<button type="button" data-pp="print">Drucken</button>' +
      '<button type="button" data-pp="close">Schliessen</button>';
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.getAttribute("data-pp") === "print") window.print();
      if (b.getAttribute("data-pp") === "close") endPrint();
    });
    document.body.insertBefore(bar, document.body.firstChild);
  }


  /* Verdrahten, sobald das Markup da ist --------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var themeBtn = document.getElementById("tk-theme");
    var printBtn = document.getElementById("tk-print");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    if (printBtn) printBtn.addEventListener("click", openPreview);
    syncThemeButton();
    buildPreviewBar();
    preloadLogos();
  });

  /* Beide Logos vorladen: das Logo für Papier ist am Bildschirm (dunkles Thema)
     ausgeblendet und würde sonst erst beim Drucken geladen, also zu spät. */
  function preloadLogos() {
    Array.prototype.forEach.call(document.querySelectorAll(".tk-logo span"), function (el) {
      var bg = getComputedStyle(el).backgroundImage || "";
      (bg.match(/url\([^)]*\)/g) || []).forEach(function (u) {
        var img = new Image();
        img.src = u.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
      });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && inPreview()) endPrint();
  });

  /* Für Seiten und Tests */
  window.Tektona = { isLight: isLight, openPrintPreview: openPreview, closePrintPreview: endPrint };
})();
