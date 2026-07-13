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

  function renderSchedule() {
    var el = document.getElementById("schedule");
    el.innerHTML =
      '<h2 class="sec-title">예식 안내</h2>' +
      '<p class="sched-date">' + Lib.formatDate(CFG.wedding.datetime) + "</p>" +
      Lib.buildCalendarHTML(CFG.wedding.datetime);
  }

  function renderVenue() {
    var el = document.getElementById("venue");
    // 공지용(기본)에서는 장소·오시는 길을 숨긴다. 초대용(?to=invite)만 노출.
    if (Lib.getAudience(location.search) !== "invite") {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML = Lib.buildVenueHTML(CFG);
    if (CFG.kakaoJsKey) loadKakaoMap(CFG.wedding);
  }

  // 카카오 키가 있을 때만 지도 SDK를 불러와 임베드. 실패해도 지도 이미지가 유지됨.
  function loadKakaoMap(w) {
    var box = document.getElementById("kakao-map");
    if (!box) return;
    var s = document.createElement("script");
    s.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=" +
      encodeURIComponent(CFG.kakaoJsKey);
    s.onload = function () {
      try {
        window.kakao.maps.load(function () {
          var pos = new window.kakao.maps.LatLng(w.lat, w.lng);
          var map = new window.kakao.maps.Map(box, { center: pos, level: 4 });
          new window.kakao.maps.Marker({ position: pos, map: map });
        });
      } catch (e) {
        /* 폴백: 지도 박스 유지 */
      }
    };
    s.onerror = function () {};
    document.head.appendChild(s);
  }

  function init() {
    renderHero();
    renderGreeting();
    renderDday();
    renderSchedule();
    renderVenue();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
