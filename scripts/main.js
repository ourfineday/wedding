// scripts/main.js — DOM 렌더링 글루. 순수 로직은 WeddingLib(lib.js) 사용.
(function () {
  "use strict";
  var CFG = window.WEDDING_CONFIG;
  var Lib = window.WeddingLib;

  function renderHero() {
    var el = document.getElementById("hero");
    el.innerHTML =
      Lib.photoHTML(CFG.photos.main, "메인 사진") +
      '<div class="hero-cap">' +
      '<p class="names">' + CFG.groom.name + " · " + CFG.bride.name + "</p>" +
      '<p class="date-line">' + Lib.formatDate(CFG.wedding.datetime) + "</p>" +
      "</div>";
  }

  function renderGreeting() {
    var el = document.getElementById("greeting");
    el.innerHTML =
      '<h2 class="sec-title">모시는 글</h2>' +
      '<p class="greeting-body">' + CFG.greeting.replace(/\n/g, "<br />") + "</p>" +
      Lib.photoHTML(CFG.photos.sub, "사진");
  }

  function init() {
    renderHero();
    renderGreeting();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
