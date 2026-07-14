// scripts/lib.js — 순수 로직(DOM 의존 없음). 브라우저/Node 양쪽에서 사용, node --test로 검증.
(function (root, factory) {
  var lib = factory();
  if (typeof module === "object" && module.exports) module.exports = lib;
  root.WeddingLib = lib;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  var THEMES = [
    { key: "minimal", label: "미니멀" },
    { key: "fresh", label: "싱그러움" },
    { key: "classic", label: "클래식" },
    { key: "natural", label: "내추럴" },
    { key: "reference", label: "레퍼런스" },
  ];

  // urlTheme > cfgTheme > 기본(minimal). 유효하지 않은 값은 무시.
  function resolveTheme(urlTheme, cfgTheme) {
    function ok(k) {
      return THEMES.some(function (t) { return t.key === k; });
    }
    if (ok(urlTheme)) return urlTheme;
    if (ok(cfgTheme)) return cfgTheme;
    return "minimal";
  }

  // ISO(로컬 표기) → "2026년 10월 17일 토요일 오후 1시"
  function formatDate(iso) {
    var d = new Date(iso);
    var h = d.getHours();
    var ampm = h < 12 ? "오전" : "오후";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    var min = d.getMinutes();
    return (
      d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " +
      DAYS[d.getDay()] + "요일 " + ampm + " " + h12 + "시" + (min ? " " + min + "분" : "")
    );
  }

  // now/target(Date) → { label, days, phase }
  function computeDday(now, target) {
    var d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var d1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    var diff = Math.round((d1 - d0) / 86400000);
    if (diff > 0) return { label: "D-" + diff, days: diff, phase: "before" };
    if (diff === 0) return { label: "D-DAY", days: 0, phase: "day" };
    return { label: "D+" + -diff, days: diff, phase: "after" };
  }

  function ddayMessage(r) {
    if (r.phase === "before") return "결혼식이 " + r.days + "일 남았습니다";
    if (r.phase === "day") return "오늘은 저희의 결혼식입니다";
    return "함께한 지 " + -r.days + "일이 되었습니다";
  }

  // location.search 문자열 → "public" | "invite"
  function getAudience(search) {
    try {
      return new URLSearchParams(search || "").get("to") === "invite" ? "invite" : "public";
    } catch (e) {
      return /(?:^|[?&])to=invite(?:&|$)/.test(search || "") ? "invite" : "public";
    }
  }

  // 길찾기 딥링크 3종 (키 불필요). 검색용 이름은 venueSearch 우선(없으면 venue).
  function directionLinks(cfg) {
    var w = cfg.wedding;
    var q = encodeURIComponent(w.venueSearch || w.venue);
    return {
      kakao: "https://map.kakao.com/link/to/" + q + "," + w.lat + "," + w.lng,
      naver: "https://map.naver.com/p/search/" + q,
      naverApp:
        "nmap://route/car?dlat=" + w.lat + "&dlng=" + w.lng + "&dname=" + q + "&appname=ourfineday.github.io",
      tmap: "tmap://route?goalname=" + q + "&goalx=" + w.lng + "&goaly=" + w.lat,
    };
  }

  // 오시는 길 섹션 내부 HTML. 키 없으면 지도 이미지(map-ph), 있으면 kakao-map 임베드 컨테이너.
  function buildVenueHTML(cfg) {
    var w = cfg.wedding;
    var L = directionLinks(cfg);
    var mapInner = cfg.kakaoJsKey
      ? '<div id="kakao-map" class="map-box"></div>'
      : '<div class="map-box map-ph">지도</div>';
    return (
      '<h2 class="sec-title">오시는 길</h2>' +
      '<p class="venue-name">' + w.venue + "</p>" +
      '<p class="venue-addr">' + w.address + "</p>" +
      mapInner +
      '<div class="dir-btns">' +
      '<a class="dir-btn" id="dir-tmap" href="' + L.tmap + '">티맵</a>' +
      '<a class="dir-btn" href="' + L.kakao + '" target="_blank" rel="noopener">카카오맵</a>' +
      '<a class="dir-btn" id="dir-naver" href="' + L.naver + '" target="_blank" rel="noopener">네이버지도</a>' +
      "</div>"
    );
  }

  // 사진 박스 HTML. 경로가 없거나 로드 실패하면 CSS 플레이스홀더가 보임.
  function photoHTML(path, label) {
    var ph = '<div class="photo-ph">' + label + "</div>";
    var img = path
      ? '<img class="photo-img" src="' + path + '" alt="' + label +
        "\" onerror=\"this.style.display='none'\" />"
      : "";
    return '<div class="photo">' + ph + img + "</div>";
  }

  // 인사말 섹션 HTML: 제목 + 인사말 본문 + (부모님 있으면) 혼주 표기.
  function buildGreetingHTML(cfg) {
    var body = (cfg.greeting || "").replace(/\n/g, "<br />");
    var hosts = "";
    if (cfg.groom.parents && cfg.bride.parents) {
      var gRel = cfg.groom.rel || "아들";
      var bRel = cfg.bride.rel || "딸";
      var gName = cfg.groom.given || cfg.groom.name; // 혼주줄은 성 뺀 이름(given) 우선
      var bName = cfg.bride.given || cfg.bride.name;
      hosts =
        '<div class="hosts">' +
        '<p><span class="host-p">' + cfg.groom.parents + "</span>의 " + gRel + " <b>" + gName + "</b></p>" +
        '<p><span class="host-p">' + cfg.bride.parents + "</span>의 " + bRel + " <b>" + bName + "</b></p>" +
        "</div>";
    }
    return (
      '<h2 class="sec-title">저희, 결혼합니다</h2>' +
      '<p class="greeting-body">' + body + "</p>" +
      hosts
    );
  }

  // 공유 버튼 HTML. 카카오톡 공유 버튼은 항상 노출(키 없으면 공유창/복사로 폴백).
  function buildShareHTML() {
    return (
      '<h2 class="sec-title">청첩장 공유하기</h2>' +
      '<div class="share-btns">' +
      '<button id="btn-kakao" class="share-btn kakao">카카오톡으로 공유하기</button>' +
      '<button id="btn-copy" class="share-btn">링크 복사</button>' +
      "</div>"
    );
  }

  // 예식 월 달력 HTML (예식일 .on 강조, 일요일 .sun)
  function buildCalendarHTML(iso) {
    var d = new Date(iso);
    var y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    var first = new Date(y, m, 1).getDay();
    var last = new Date(y, m + 1, 0).getDate();
    var cells = DAYS.map(function (h, i) {
      return '<span class="cal-h' + (i === 0 ? " sun" : "") + '">' + h + "</span>";
    });
    for (var b = 0; b < first; b++) cells.push("<span></span>");
    for (var n = 1; n <= last; n++) {
      var isSun = (first + n - 1) % 7 === 0;
      var cls = "cal-d" + (n === day ? " on" : "") + (isSun ? " sun" : "");
      cells.push('<span class="' + cls + '">' + n + "</span>");
    }
    return '<div class="cal">' + cells.join("") + "</div>";
  }

  return {
    THEMES: THEMES,
    resolveTheme: resolveTheme,
    formatDate: formatDate,
    computeDday: computeDday,
    ddayMessage: ddayMessage,
    getAudience: getAudience,
    directionLinks: directionLinks,
    buildVenueHTML: buildVenueHTML,
    buildGreetingHTML: buildGreetingHTML,
    photoHTML: photoHTML,
    buildShareHTML: buildShareHTML,
    buildCalendarHTML: buildCalendarHTML,
  };
});
