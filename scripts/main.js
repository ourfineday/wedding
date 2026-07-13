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

  function renderDday() {
    var el = document.getElementById("dday");
    var target = new Date(CFG.wedding.datetime);
    function paint() {
      var r = Lib.computeDday(new Date(), target);
      el.innerHTML =
        '<div class="dday-badge">' + r.label + "</div>" +
        '<p class="dday-msg">' + Lib.ddayMessage(r) + "</p>";
    }
    paint();
    setInterval(paint, 60 * 1000); // 1분마다 재계산 → 자정 넘어가면 자동 갱신
  }

  function init() {
    renderHero();
    renderGreeting();
    renderDday();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
