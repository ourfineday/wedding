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
    wireTmapFallback();
    if (CFG.kakaoJsKey) loadKakaoMap(CFG.wedding);
  }

  // 티맵은 앱 전용(웹 주소 없음). PC/미설치면 안내 토스트, 휴대폰이면 앱으로 연결.
  function wireTmapFallback() {
    var a = document.getElementById("dir-tmap");
    if (!a) return;
    a.onclick = function (e) {
      e.preventDefault();
      var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
      if (!isMobile) {
        toast("티맵은 휴대폰의 티맵 앱에서 열려요 (PC는 미지원)");
        return;
      }
      window.location.href = a.getAttribute("href");
      setTimeout(function () {
        if (!document.hidden) toast("티맵 앱이 설치되어 있어야 열려요");
      }, 1500);
    };
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

  function absoluteUrl(path) {
    return new URL(path, location.href).href;
  }
  function currentShareUrl() {
    return location.href; // 현재 보고 있는 버전(파라미터 포함)을 공유
  }
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.hidden = false;
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("show");
      t.hidden = true;
    }, 1800);
  }
  // 카카오 공유 SDK를 키가 있을 때만 동적 로드(없으면 네트워크 요청 0).
  function loadKakaoSdk(cb) {
    if (window.Kakao) return cb();
    var s = document.createElement("script");
    s.src = "https://t1.kakao.com/kakao_js_sdk/2.7.2/kakao.min.js";
    s.crossOrigin = "anonymous";
    s.onload = cb;
    s.onerror = function () {
      cb();
    };
    document.head.appendChild(s);
  }

  function renderShare() {
    var el = document.getElementById("share");
    var hasKakao = !!CFG.kakaoJsKey;
    el.innerHTML = Lib.buildShareHTML({ kakao: hasKakao, native: !!navigator.share });

    var copyBtn = document.getElementById("btn-copy");
    if (copyBtn)
      copyBtn.onclick = function () {
        var url = currentShareUrl();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(
            function () {
              toast("링크가 복사되었어요");
            },
            function () {
              window.prompt("아래 링크를 복사하세요", url);
            }
          );
        } else {
          window.prompt("아래 링크를 복사하세요", url);
        }
      };

    var nativeBtn = document.getElementById("btn-native");
    if (nativeBtn && navigator.share)
      nativeBtn.onclick = function () {
        navigator.share({ title: "청첩장", url: currentShareUrl() });
      };

    var kakaoBtn = document.getElementById("btn-kakao");
    if (kakaoBtn && hasKakao)
      kakaoBtn.onclick = function () {
        loadKakaoSdk(function () {
          if (!window.Kakao) return toast("잠시 후 다시 시도해 주세요");
          if (!window.Kakao.isInitialized()) window.Kakao.init(CFG.kakaoJsKey);
          var url = currentShareUrl();
          window.Kakao.Share.sendDefault({
            objectType: "feed",
            content: {
              title: CFG.groom.name + " ♥ " + CFG.bride.name + " 결혼합니다",
              description: Lib.formatDate(CFG.wedding.datetime),
              imageUrl: absoluteUrl(CFG.photos.main),
              link: { mobileWebUrl: url, webUrl: url },
            },
            buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: url, webUrl: url } }],
          });
        });
      };
  }

  function applyTheme(name) {
    document.documentElement.setAttribute("data-theme", name);
  }

  function renderThemeBar() {
    var urlTheme = new URLSearchParams(location.search).get("theme");
    applyTheme(Lib.resolveTheme(urlTheme, CFG.theme));

    var bar = document.getElementById("theme-bar");
    if (!CFG.previewMode) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.innerHTML =
      '<span class="tb-label">테마 미리보기</span>' +
      Lib.THEMES.map(function (t) {
        return '<button data-t="' + t.key + '">' + t.label + "</button>";
      }).join("");

    var buttons = bar.querySelectorAll("button");
    Array.prototype.forEach.call(buttons, function (b) {
      b.onclick = function () {
        applyTheme(b.getAttribute("data-t"));
        Array.prototype.forEach.call(buttons, function (x) {
          x.classList.remove("on");
        });
        b.classList.add("on");
      };
    });
    var cur = document.documentElement.getAttribute("data-theme");
    var active = bar.querySelector('button[data-t="' + cur + '"]');
    if (active) active.classList.add("on");
  }

  function init() {
    renderThemeBar();
    renderHero();
    renderGreeting();
    renderDday();
    renderSchedule();
    renderVenue();
    renderShare();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
