// scripts/main.js — DOM 렌더링 글루. 순수 로직은 WeddingLib(lib.js) 사용.
(function () {
  "use strict";
  var CFG = window.WEDDING_CONFIG;
  var Lib = window.WeddingLib;

  function renderHero() {
    var el = document.getElementById("hero");
    el.innerHTML =
      '<p class="names">' + CFG.groom.name + " · " + CFG.bride.name + "</p>" +
      '<p class="date-line">' + Lib.formatDate(CFG.wedding.datetime) + "</p>";
  }

  function init() {
    renderHero();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
