# 모바일 청첩장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub Pages로 배포하는 빌드리스 모바일 청첩장. 공지용/초대용 두 버전, 4가지 테마 미리보기, D-Day, 오시는 길(3 길찾기 버튼), 카카오톡 공유를 순수 정적 사이트로 구현한다.

**Architecture:** 빌드 도구 없는 정적 사이트. `index.html` 뼈대 + `scripts/config.js`(모든 콘텐츠) + `scripts/main.js`(렌더·D-Day·버전분기·테마·공유) + `styles/base.css`(레이아웃·반응형) + `styles/themes.css`(4테마 CSS 변수). 클래식 `<script>` 로드(모듈/번들 없음)라 `file://`와 GitHub Pages 양쪽에서 그대로 동작.

**Tech Stack:** HTML5, CSS(변수), Vanilla JS(ES2019, 브라우저 전역), Kakao JS SDK(선택), GitHub Pages.

## Global Constraints

- **빌드 도구 금지** — React/Vite/Node 번들 없음. `<script src>` 클래식 로드만.
- **백엔드/DB 없음** — 순수 정적. RSVP·방명록·배경음악·계좌번호 **구현 안 함**.
- **콘텐츠는 `scripts/config.js` 한 곳**에만. 다른 파일에 이름/날짜/장소 하드코딩 금지.
- **카카오 키 없이도 100% 동작** — 키 부재 시 지도=이미지+버튼, 공유=링크복사/Web Share로 자동 폴백. 절대 에러로 죽지 않게.
- **기본 링크(파라미터 없음)=공지용**(장소·오시는 길 숨김). `?to=invite`=초대용(표시).
- **OG 메타태그는 공지용 정보만** — 링크 미리보기에 장소 노출 금지.
- **반응형** — 모바일 세로 기준, PC는 중앙 카드(최대 480px)+여백.
- **UI 문구는 한국어**, 코드 식별자는 영어.
- 로컬 검증은 정적 서버로: `python -m http.server 8000` 또는 `npx serve -l 8000` (실행 시 가용한 것 선택). 클립보드/공유는 `http://localhost`에서 테스트.

---

## File Structure

```
github-io/
├─ index.html            섹션 뼈대 + 메타태그 + 스크립트/스타일 로드
├─ styles/
│   ├─ base.css           레이아웃 · 컴포넌트 · 반응형 (테마 변수 소비)
│   └─ themes.css         :root[data-theme=...] 4테마 변수 정의
├─ scripts/
│   ├─ config.js          window.WEDDING_CONFIG — 모든 콘텐츠/설정
│   └─ main.js            렌더 · D-Day · 버전분기 · 테마 · 지도 · 공유
├─ images/
│   └─ .gitkeep           (사진 main.jpg/sub.jpg는 사용자가 나중에 추가)
├─ .nojekyll              GitHub Pages Jekyll 처리 비활성화
├─ README.md              수정 · 배포 · 카카오 설정 안내
└─ docs/superpowers/...   설계/계획 문서
```

---

### Task 1: 프로젝트 스캐폴드 + config + 기본 렌더링

**Files:**
- Create: `index.html`, `scripts/config.js`, `scripts/main.js`, `styles/base.css`, `.nojekyll`, `images/.gitkeep`
- Init: git 저장소

**Interfaces:**
- Produces: `window.WEDDING_CONFIG`(콘텐츠 객체), `renderBasics()`(이름/날짜 렌더), `formatDate(iso)`→`"2026년 10월 17일 토요일 오후 1시"`.

- [ ] **Step 1: git 저장소 초기화 + .gitignore**

실행 전 사용자에게 첫 커밋 진행을 확인받는다(하네스 규칙: 커밋은 요청 시). 확인되면:
```bash
cd /c/WorkSpace/github-io
git init
printf "node_modules/\n.DS_Store\nThumbs.db\n" > .gitignore
```

- [ ] **Step 2: `scripts/config.js` 작성 (콘텐츠 단일 소스)**

```js
// scripts/config.js — 여기 값만 고치면 청첩장이 바뀝니다.
window.WEDDING_CONFIG = {
  // ── 기본 정보 ──
  groom: { name: "김민준", parents: "" },   // 신랑 (parents 예: "김OO·박OO의 장남")
  bride: { name: "이서연", parents: "" },   // 신부
  wedding: {
    datetime: "2026-10-17T13:00:00+09:00",  // 예식 일시(ISO, +09:00)
    venue: "OO컨벤션 웨딩홀 3층 그랜드볼룸",   // 예식장 이름
    address: "서울특별시 중구 세종대로 110",   // 주소
    lat: 37.5665,                            // 위도 (임시)
    lng: 126.9780,                           // 경도 (임시)
  },
  greeting: "저희 두 사람이 하나가 되는 자리에\n귀한 걸음으로 축복해 주세요.",
  photos: { main: "images/main.jpg", sub: "images/sub.jpg" }, // 없으면 자동 플레이스홀더

  // ── 선택 기능 ──
  kakaoJsKey: "",       // 카카오 JS 키(비우면 링크복사/버튼으로 동작)

  // ── 표시 설정 ──
  theme: "minimal",     // minimal | classic | natural | reference (미리보기 후 확정)
  previewMode: true,    // true면 상단 테마 선택 바 표시. 테마 확정 후 false로.
};
```

- [ ] **Step 3: `index.html` 뼈대 작성**

```html
<!doctype html>
<html lang="ko" data-theme="minimal">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>모바일 청첩장</title>
  <!-- OG: 공지용 정보만 (장소 미포함). Task 8에서 실제 값으로 갱신 -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="저희 결혼합니다" />
  <meta property="og:description" content="소중한 분들을 초대합니다" />
  <link rel="stylesheet" href="styles/themes.css" />
  <link rel="stylesheet" href="styles/base.css" />
</head>
<body>
  <div id="theme-bar" hidden></div>
  <main id="app">
    <section id="hero"></section>
    <section id="greeting"></section>
    <section id="dday"></section>
    <section id="schedule"></section>
    <section id="venue" hidden></section>
    <section id="share"></section>
  </main>
  <div id="toast" class="toast" hidden></div>

  <script src="scripts/config.js"></script>
  <script src="scripts/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: `styles/base.css` 최소 레이아웃**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
:root { --maxw: 480px; }
body {
  font-family: var(--font-body, system-ui, "Apple SD Gothic Neo", sans-serif);
  color: var(--fg, #222); background: var(--bg-outer, #eceae6);
  line-height: 1.7; -webkit-text-size-adjust: 100%;
}
#app {
  max-width: var(--maxw); margin: 0 auto; background: var(--bg, #fff);
  min-height: 100vh; overflow: hidden;
}
section { padding: 48px 28px; text-align: center; }
.names { font-family: var(--font-head, serif); font-size: 1.6rem; letter-spacing: .04em; }
.date-line { color: var(--muted, #888); margin-top: 8px; }
```

- [ ] **Step 5: `scripts/main.js` — formatDate + renderBasics + 부트스트랩**

```js
(function () {
  "use strict";
  var CFG = window.WEDDING_CONFIG;

  function formatDate(iso) {
    var d = new Date(iso);
    var days = ["일","월","화","수","목","금","토"];
    var h = d.getHours();
    var ampm = h < 12 ? "오전" : "오후";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    var min = d.getMinutes();
    return d.getFullYear() + "년 " + (d.getMonth()+1) + "월 " + d.getDate() + "일 " +
      days[d.getDay()] + "요일 " + ampm + " " + h12 + "시" + (min ? " " + min + "분" : "");
  }

  function renderBasics() {
    var el = document.getElementById("hero");
    el.innerHTML =
      '<p class="names">' + CFG.groom.name + " · " + CFG.bride.name + "</p>" +
      '<p class="date-line">' + formatDate(CFG.wedding.datetime) + "</p>";
  }

  function init() { renderBasics(); }
  document.addEventListener("DOMContentLoaded", init);

  // 테스트/후속 태스크 공유
  window.__wedding = { formatDate: formatDate };
})();
```

- [ ] **Step 6: `.nojekyll` + `images/.gitkeep` 생성**

```bash
touch .nojekyll images/.gitkeep
```

- [ ] **Step 7: 로컬 서버로 검증**

Run: `python -m http.server 8000` (또는 `npx serve -l 8000`) 후 `http://localhost:8000` 열기.
Expected: 상단에 "김민준 · 이서연", 그 아래 "2026년 10월 17일 토요일 오후 1시" 표시. 콘솔 에러 없음.
Console 검증: `window.__wedding.formatDate("2026-10-17T13:00:00+09:00")` → `"2026년 10월 17일 토요일 오후 1시"`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold static wedding invitation with config-driven basics"
```

---

### Task 2: 히어로 · 인사말 · 사진 플레이스홀더

**Files:**
- Modify: `scripts/main.js`, `styles/base.css`

**Interfaces:**
- Consumes: `CFG.photos`, `CFG.greeting`, `renderBasics()`
- Produces: `photoEl(path, label)`→`<div class="photo">`(이미지 로드 실패/빈 경로 시 플레이스홀더 박스), `renderGreeting()`.

- [ ] **Step 1: `photoEl` 헬퍼 + 히어로에 메인 사진 결합**

`main.js`의 `renderBasics`를 히어로 사진 포함으로 교체:
```js
function photoEl(path, label) {
  var wrap = document.createElement("div");
  wrap.className = "photo";
  var img = document.createElement("img");
  img.alt = label; img.loading = "lazy";
  var ph = document.createElement("div");
  ph.className = "photo-ph"; ph.textContent = label;
  function showPh() { img.remove(); if (!wrap.contains(ph)) wrap.appendChild(ph); }
  img.onerror = showPh;
  if (path) { img.src = path; wrap.appendChild(img); } else { showPh(); }
  return wrap;
}

function renderHero() {
  var el = document.getElementById("hero");
  el.innerHTML = "";
  el.appendChild(photoEl(CFG.photos.main, "메인 사진"));
  var cap = document.createElement("div");
  cap.className = "hero-cap";
  cap.innerHTML = '<p class="names">' + CFG.groom.name + " · " + CFG.bride.name +
    '</p><p class="date-line">' + window.__wedding.formatDate(CFG.wedding.datetime) + "</p>";
  el.appendChild(cap);
}
```
`init()`에서 `renderBasics()` → `renderHero()`로 교체.

- [ ] **Step 2: 인사말 렌더 + 서브 사진**

```js
function renderGreeting() {
  var el = document.getElementById("greeting");
  el.innerHTML = '<h2 class="sec-title">모시는 글</h2>' +
    '<p class="greeting-body">' + CFG.greeting.replace(/\n/g, "<br>") + "</p>";
  el.appendChild(photoEl(CFG.photos.sub, "사진"));
}
```
`init()`에 `renderGreeting()` 추가.

- [ ] **Step 3: 사진/섹션 스타일 (`base.css` 추가)**

```css
.photo { position: relative; width: 100%; aspect-ratio: 4/5; background: var(--photo-bg,#e9e6e1);
  border-radius: var(--radius,14px); overflow: hidden; }
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-ph { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  color: var(--muted,#9a948c); font-size:.95rem; letter-spacing:.1em;
  background: repeating-linear-gradient(45deg, var(--photo-bg,#e9e6e1) 0 12px, var(--photo-bg2,#e2ded7) 12px 24px); }
.hero-cap { margin-top: 22px; }
.sec-title { font-family: var(--font-head,serif); font-size:1.15rem; color: var(--accent,#b08d57);
  letter-spacing:.2em; margin-bottom:18px; }
.greeting-body { white-space: normal; margin-bottom: 28px; }
```

- [ ] **Step 4: 검증**

Run: 로컬 서버 새로고침.
Expected: 히어로에 4:5 플레이스홀더(대각선 패턴 + "메인 사진") + 이름/날짜. 인사말 섹션에 "모시는 글" 제목 + 문구(줄바꿈 반영) + 서브 사진 플레이스홀더. 콘솔 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: hero photo, greeting section, image placeholders"
```

---

### Task 3: D-Day 카운터

**Files:**
- Modify: `scripts/main.js`, `styles/base.css`

**Interfaces:**
- Consumes: `CFG.wedding.datetime`
- Produces: `computeDday(now, target)`→`{label, days, phase}` (phase: `"before"|"day"|"after"`), `renderDday()`.

- [ ] **Step 1: `computeDday` 순수 함수 작성**

```js
function computeDday(now, target) {
  var d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var d1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  var diff = Math.round((d1 - d0) / 86400000);
  if (diff > 0) return { label: "D-" + diff, days: diff, phase: "before" };
  if (diff === 0) return { label: "D-DAY", days: 0, phase: "day" };
  return { label: "D+" + (-diff), days: diff, phase: "after" };
}
window.__wedding.computeDday = computeDday;
```

- [ ] **Step 2: 콘솔로 함수 검증 (테스트)**

Run: 브라우저 콘솔에서 아래 실행.
```js
var t = new Date("2026-10-17T13:00:00+09:00");
[["2026-10-10","D-7"],["2026-10-17","D-DAY"],["2026-10-20","D+3"]]
  .map(function(c){ return window.__wedding.computeDday(new Date(c[0]+"T09:00:00+09:00"), t).label === c[1]; });
```
Expected: `[true, true, true]`.

- [ ] **Step 3: `renderDday` + 매일 자정 갱신 틱**

```js
function renderDday() {
  var el = document.getElementById("dday");
  var target = new Date(CFG.wedding.datetime);
  function paint() {
    var r = computeDday(new Date(), target);
    var msg = r.phase === "before" ? "결혼식이 " + r.days + "일 남았습니다"
            : r.phase === "day" ? "오늘은 저희의 결혼식입니다" : "함께한 지 " + (-r.days) + "일";
    el.innerHTML = '<div class="dday-badge">' + r.label + "</div><p class='dday-msg'>" + msg + "</p>";
  }
  paint();
  setInterval(paint, 60 * 1000); // 1분마다 재계산(자정 넘어가면 자동 갱신)
}
```
`init()`에 `renderDday()` 추가.

- [ ] **Step 4: 스타일 (`base.css`)**

```css
#dday .dday-badge { display:inline-block; font-family:var(--font-head,serif); font-size:2rem;
  color:var(--accent,#b08d57); border:1px solid var(--accent,#b08d57); border-radius:999px;
  padding:10px 28px; letter-spacing:.06em; }
#dday .dday-msg { margin-top:14px; color:var(--muted,#888); }
```

- [ ] **Step 5: 검증**

Expected: D-Day 배지(예: "D-96")와 "결혼식이 96일 남았습니다" 문구 표시. (오늘=2026-07-13 기준 예식 2026-10-17까지 96일.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: D-Day counter with pure computeDday + live tick"
```

---

### Task 4: 일정(날짜) 섹션

**Files:**
- Modify: `scripts/main.js`, `styles/base.css`

**Interfaces:**
- Consumes: `CFG.wedding.datetime`, `formatDate`
- Produces: `renderSchedule()` (날짜/시간 + 해당 월 달력, 예식일 강조).

- [ ] **Step 1: `renderSchedule` — 날짜줄 + 달력 그리드**

```js
function renderSchedule() {
  var el = document.getElementById("schedule");
  var d = new Date(CFG.wedding.datetime);
  var y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  var first = new Date(y, m, 1).getDay();       // 그 달 1일의 요일
  var last = new Date(y, m + 1, 0).getDate();   // 그 달 말일
  var head = ["일","월","화","수","목","금","토"];
  var cells = head.map(function(h, i){ return '<span class="cal-h' + (i===0?" sun":"") + '">' + h + "</span>"; });
  for (var b = 0; b < first; b++) cells.push('<span></span>');
  for (var n = 1; n <= last; n++) {
    var cls = "cal-d" + (n === day ? " on" : "") + (((first + n - 1) % 7) === 0 ? " sun" : "");
    cells.push('<span class="' + cls + '">' + n + "</span>");
  }
  el.innerHTML = '<h2 class="sec-title">예식 안내</h2>' +
    '<p class="sched-date">' + window.__wedding.formatDate(CFG.wedding.datetime) + "</p>" +
    '<div class="cal">' + cells.join("") + "</div>";
}
```
`init()`에 `renderSchedule()` 추가.

- [ ] **Step 2: 달력 스타일 (`base.css`)**

```css
.sched-date { margin-bottom:18px; color:var(--fg,#333); }
.cal { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; max-width:300px; margin:0 auto; }
.cal span { padding:7px 0; font-size:.9rem; }
.cal-h { color:var(--muted,#999); font-weight:600; }
.cal .sun { color:#d06a6a; }
.cal-d.on { background:var(--accent,#b08d57); color:#fff; border-radius:999px; font-weight:700; }
```

- [ ] **Step 3: 검증**

Expected: "예식 안내" + 날짜줄 + 2026년 10월 달력, 17일이 강조 원으로 표시, 일요일 열은 붉은색.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: schedule section with month calendar highlighting the date"
```

---

### Task 5: 두 버전 분기(?to=invite) + 오시는 길(지도 + 3 길찾기 버튼)

**Files:**
- Modify: `scripts/main.js`, `styles/base.css`

**Interfaces:**
- Consumes: `CFG.wedding`(venue/address/lat/lng/kakaoJsKey)
- Produces: `getAudience()`→`"public"|"invite"`, `directionLinks(cfg)`→`{kakao,naver,tmap}`, `renderVenue()`(초대용일 때만 #venue 노출).

- [ ] **Step 1: `getAudience` + `directionLinks` 순수 함수**

```js
function getAudience() {
  return new URLSearchParams(location.search).get("to") === "invite" ? "invite" : "public";
}
function directionLinks(cfg) {
  var w = cfg.wedding, q = encodeURIComponent(w.venue);
  return {
    kakao: "https://map.kakao.com/link/to/" + q + "," + w.lat + "," + w.lng,
    naver: "https://map.naver.com/p/search/" + q,
    tmap: "tmap://route?goalname=" + q + "&goalx=" + w.lng + "&goaly=" + w.lat,
  };
}
window.__wedding.getAudience = getAudience;
window.__wedding.directionLinks = directionLinks;
```

- [ ] **Step 2: 콘솔 검증 (테스트)**

Run: 콘솔.
```js
window.__wedding.getAudience(); // 기본 URL에서
```
Expected: `"public"`. 그리고 `http://localhost:8000/?to=invite` 에서 다시 실행 → `"invite"`.
```js
var L = window.__wedding.directionLinks(WEDDING_CONFIG);
/^https:\/\/map\.kakao\.com\/link\/to\//.test(L.kakao) && /^tmap:\/\/route/.test(L.tmap);
```
Expected: `true`.

- [ ] **Step 3: `renderVenue` — 지도 플레이스홀더/임베드 + 버튼 3개**

```js
function renderVenue() {
  var el = document.getElementById("venue");
  if (getAudience() !== "invite") { el.hidden = true; return; }
  el.hidden = false;
  var w = CFG.wedding, L = directionLinks(CFG);
  var mapInner = (CFG.kakaoJsKey)
    ? '<div id="kakao-map" class="map-box"></div>'   // 키 있으면 Task에서 SDK로 채움
    : '<div class="map-box map-ph">지도</div>';
  el.innerHTML =
    '<h2 class="sec-title">오시는 길</h2>' +
    '<p class="venue-name">' + w.venue + "</p>" +
    '<p class="venue-addr">' + w.address + "</p>" +
    mapInner +
    '<div class="dir-btns">' +
      '<a class="dir-btn" href="' + L.tmap + '">티맵</a>' +
      '<a class="dir-btn" href="' + L.kakao + '" target="_blank" rel="noopener">카카오맵</a>' +
      '<a class="dir-btn" href="' + L.naver + '" target="_blank" rel="noopener">네이버지도</a>' +
    "</div>";
  if (CFG.kakaoJsKey) tryKakaoMap(w);
}
function tryKakaoMap(w) {
  // 카카오 지도 SDK가 로드/초기화된 경우에만 임베드. 실패해도 조용히 넘어감.
  try {
    if (window.kakao && window.kakao.maps) {
      var c = new window.kakao.maps.LatLng(w.lat, w.lng);
      var map = new window.kakao.maps.Map(document.getElementById("kakao-map"), { center: c, level: 4 });
      new window.kakao.maps.Marker({ position: c, map: map });
    }
  } catch (e) { /* 폴백: 이미 지도 박스만 표시됨 */ }
}
```
`init()`에 `renderVenue()` 추가. (카카오 지도 SDK 로드는 Task 6에서 공유 SDK와 함께 조건부로 처리.)

- [ ] **Step 4: 스타일 (`base.css`)**

```css
.venue-name { font-weight:700; } .venue-addr { color:var(--muted,#888); margin:4px 0 18px; }
.map-box { width:100%; height:220px; border-radius:var(--radius,14px); overflow:hidden; }
.map-ph { display:flex; align-items:center; justify-content:center; color:var(--muted,#9a948c);
  background: var(--photo-bg,#e9e6e1); letter-spacing:.2em; }
.dir-btns { display:flex; gap:8px; margin-top:14px; }
.dir-btn { flex:1; padding:12px 0; border:1px solid var(--line,#ddd); border-radius:10px;
  text-decoration:none; color:var(--fg,#333); font-size:.9rem; }
```

- [ ] **Step 5: 검증**

Expected:
- `http://localhost:8000/` → "오시는 길" 섹션 **안 보임**(#venue hidden).
- `http://localhost:8000/?to=invite` → 섹션 표시: 예식장명/주소 + "지도" 플레이스홀더 박스 + [티맵][카카오맵][네이버지도] 버튼. 카카오맵 버튼 href가 `https://map.kakao.com/link/to/...` 인지 확인.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: audience split (?to=invite) + venue directions with 3 map buttons"
```

---

### Task 6: 공유 (카카오톡 카드 + 링크복사 + Web Share) & 카카오 SDK 조건부 로드

**Files:**
- Modify: `scripts/main.js`, `styles/base.css`, `index.html`

**Interfaces:**
- Consumes: `CFG.kakaoJsKey`, `CFG.photos.main`, `getAudience`, `formatDate`
- Produces: `currentShareUrl()`, `absoluteUrl(path)`, `toast(msg)`, `renderShare()`, `loadKakaoSdk(cb)`.

- [ ] **Step 1: `index.html`에 카카오 SDK 자리(주석) — 동적 로드 방식 채택**

정적 태그 대신 `main.js`에서 키가 있을 때만 SDK를 주입한다(키 없으면 네트워크 요청 0). `index.html`은 수정 없음 확인만.

- [ ] **Step 2: `loadKakaoSdk` + `toast` + URL 헬퍼**

```js
function absoluteUrl(path) { return new URL(path, location.href).href; }
function currentShareUrl() { return location.href; } // 현재 보는 버전(파라미터 포함) 공유
function toast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.hidden = false; t.classList.add("show");
  setTimeout(function(){ t.classList.remove("show"); t.hidden = true; }, 1800);
}
function loadKakaoSdk(cb) {
  if (window.Kakao) return cb();
  var s = document.createElement("script");
  s.src = "https://t1.kakao.com/kakao_js_sdk/2.7.2/kakao.min.js";
  s.integrity = "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
  s.crossOrigin = "anonymous";
  s.onload = cb; s.onerror = function(){ cb(); };
  document.head.appendChild(s);
}
window.__wedding.currentShareUrl = currentShareUrl;
```

- [ ] **Step 3: `renderShare` — 버튼 구성 + 동작**

```js
function renderShare() {
  var el = document.getElementById("share");
  var hasKakao = !!CFG.kakaoJsKey;
  el.innerHTML = '<h2 class="sec-title">마음 전하기</h2>' +
    '<div class="share-btns">' +
      (hasKakao ? '<button id="btn-kakao" class="share-btn kakao">카카오톡 공유</button>' : "") +
      '<button id="btn-copy" class="share-btn">링크 복사</button>' +
      (navigator.share ? '<button id="btn-native" class="share-btn">공유하기</button>' : "") +
    "</div>";

  document.getElementById("btn-copy").onclick = function () {
    navigator.clipboard.writeText(currentShareUrl())
      .then(function(){ toast("링크가 복사되었어요"); })
      .catch(function(){ window.prompt("아래 링크를 복사하세요", currentShareUrl()); });
  };
  var nb = document.getElementById("btn-native");
  if (nb) nb.onclick = function(){ navigator.share({ title:"청첩장", url: currentShareUrl() }); };

  var kb = document.getElementById("btn-kakao");
  if (kb) kb.onclick = function () {
    loadKakaoSdk(function () {
      if (!window.Kakao) return toast("잠시 후 다시 시도해 주세요");
      if (!window.Kakao.isInitialized()) window.Kakao.init(CFG.kakaoJsKey);
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: CFG.groom.name + " ♥ " + CFG.bride.name + " 결혼합니다",
          description: window.__wedding.formatDate(CFG.wedding.datetime),
          imageUrl: absoluteUrl(CFG.photos.main),
          link: { mobileWebUrl: currentShareUrl(), webUrl: currentShareUrl() },
        },
        buttons: [{ title: "청첩장 보기",
          link: { mobileWebUrl: currentShareUrl(), webUrl: currentShareUrl() } }],
      });
    });
  };
}
```
`init()`에 `renderShare()` 추가.

- [ ] **Step 4: 공유 버튼 + 토스트 스타일 (`base.css`)**

```css
.share-btns { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
.share-btn { padding:12px 20px; border:1px solid var(--line,#ddd); background:var(--bg,#fff);
  border-radius:10px; font-size:.95rem; cursor:pointer; color:var(--fg,#333); }
.share-btn.kakao { background:#FEE500; border-color:#FEE500; color:#191600; }
.toast { position:fixed; left:50%; bottom:32px; transform:translateX(-50%) translateY(10px);
  background:rgba(0,0,0,.82); color:#fff; padding:11px 18px; border-radius:999px; font-size:.9rem;
  opacity:0; transition:opacity .2s, transform .2s; z-index:50; }
.toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
```

- [ ] **Step 5: 검증 (키 없이)**

Expected: "마음 전하기" + [링크 복사] (모바일이면 [공유하기]도). 카카오 버튼은 **안 보임**(키 없음). "링크 복사" 클릭 → "링크가 복사되었어요" 토스트, 클립보드에 현재 URL. `?to=invite`에서 복사하면 초대용 URL이 복사되는지 확인.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: share section (copy/Web Share, conditional Kakao card)"
```

---

### Task 7: 4가지 테마 + 테마 선택 바 + 반응형 마무리

**Files:**
- Create: `styles/themes.css`
- Modify: `scripts/main.js`, `styles/base.css`, `index.html`(웹폰트 링크)

**Interfaces:**
- Consumes: `CFG.theme`, `CFG.previewMode`
- Produces: `applyTheme(name)`(html `data-theme` 설정), `renderThemeBar()`(previewMode 시 상단 바).

- [ ] **Step 1: `styles/themes.css` — 4테마 변수 정의**

각 테마는 동일한 변수 집합에 값만 다르게 준다.
```css
:root, :root[data-theme="minimal"] {
  --font-head: "Noto Serif KR", serif; --font-body: "Noto Sans KR", sans-serif;
  --bg:#ffffff; --bg-outer:#eceae6; --fg:#2b2b2b; --muted:#8b8680; --accent:#b0894f;
  --line:#e4e0d9; --photo-bg:#eae6df; --photo-bg2:#e3ded6; --radius:14px;
}
:root[data-theme="classic"] {
  --font-head:"Nanum Myeongjo", serif; --font-body:"Noto Sans KR", sans-serif;
  --bg:#fffdfb; --bg-outer:#f2e7e7; --fg:#4a3a3a; --muted:#a98f8f; --accent:#c98b8b;
  --line:#efd9d9; --photo-bg:#f3e6e6; --photo-bg2:#eddada; --radius:18px;
}
:root[data-theme="natural"] {
  --font-head:"Noto Serif KR", serif; --font-body:"Noto Sans KR", sans-serif;
  --bg:#fdfdf9; --bg-outer:#e7ebe1; --fg:#39423a; --muted:#8a938a; --accent:#7d9070;
  --line:#dbe2d5; --photo-bg:#e6ebe0; --photo-bg2:#dee5d7; --radius:12px;
}
:root[data-theme="reference"] {
  --font-head:"Noto Serif KR", serif; --font-body:"Noto Sans KR", sans-serif;
  --bg:#ffffff; --bg-outer:#111111; --fg:#222; --muted:#999; --accent:#111;
  --line:#e6e6e6; --photo-bg:#ededed; --photo-bg2:#e5e5e5; --radius:0px;
}
```

- [ ] **Step 2: `index.html`에 웹폰트 추가**

`<head>`에 추가(외부 CSS 허용됨 — GitHub Pages):
```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&family=Noto+Serif+KR:wght@400;600&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: `applyTheme` + `renderThemeBar` (main.js)**

```js
var THEMES = [
  { key:"minimal", label:"미니멀" }, { key:"classic", label:"클래식" },
  { key:"natural", label:"내추럴" }, { key:"reference", label:"레퍼런스" },
];
function applyTheme(name) {
  var ok = THEMES.some(function(t){ return t.key === name; });
  document.documentElement.setAttribute("data-theme", ok ? name : "minimal");
}
function renderThemeBar() {
  var urlTheme = new URLSearchParams(location.search).get("theme");
  applyTheme(urlTheme || CFG.theme);
  var bar = document.getElementById("theme-bar");
  if (!CFG.previewMode) { bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = '<span class="tb-label">테마 미리보기</span>' +
    THEMES.map(function(t){ return '<button data-t="' + t.key + '">' + t.label + "</button>"; }).join("");
  bar.querySelectorAll("button").forEach(function(b){
    b.onclick = function(){
      applyTheme(b.getAttribute("data-t"));
      bar.querySelectorAll("button").forEach(function(x){ x.classList.remove("on"); });
      b.classList.add("on");
    };
  });
  var cur = document.documentElement.getAttribute("data-theme");
  var active = bar.querySelector('button[data-t="' + cur + '"]'); if (active) active.classList.add("on");
}
```
`init()` **맨 앞**에 `renderThemeBar()` 추가(다른 렌더보다 먼저 테마 적용).

- [ ] **Step 4: 테마 바 + 반응형 스타일 (base.css)**

```css
#theme-bar { position:sticky; top:0; z-index:40; display:flex; gap:6px; align-items:center;
  justify-content:center; flex-wrap:wrap; padding:8px; background:rgba(20,20,20,.9); }
#theme-bar .tb-label { color:#fff; font-size:.8rem; margin-right:4px; }
#theme-bar button { padding:6px 12px; border:1px solid #555; background:transparent; color:#eee;
  border-radius:999px; font-size:.82rem; cursor:pointer; }
#theme-bar button.on { background:#fff; color:#111; border-color:#fff; }
@media (min-width:520px) { body { padding:24px 0; } #app { box-shadow:0 8px 40px rgba(0,0,0,.12); border-radius:6px; } }
```

- [ ] **Step 5: 검증**

Expected: 상단 sticky 바에 [미니멀][클래식][내추럴][레퍼런스]. 클릭마다 배경/폰트/포인트색/모서리 즉시 변경. `?theme=classic`로 열면 클래식으로 시작. PC(≥520px)에서 중앙 카드 + 그림자. `config.previewMode=false`로 바꾸면 바 사라지고 `config.theme` 고정.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 4 selectable themes with preview bar + responsive polish"
```

---

### Task 8: README + 실제 값/OG 갱신 + 최종 점검

**Files:**
- Create: `README.md`
- Modify: `index.html`(OG 실제 문구)

**Interfaces:** 없음(문서/마무리).

- [ ] **Step 1: OG 메타태그를 공지용 실제 문구로 갱신**

`index.html`의 og:title/description을 실제 이름 기반(장소 미포함)으로. 예:
```html
<meta property="og:title" content="김민준 · 이서연 결혼합니다" />
<meta property="og:description" content="2026년 10월 17일 · 소중한 분들을 초대합니다" />
<meta property="og:image" content="images/main.jpg" />
```

- [ ] **Step 2: `README.md` 작성 (수정/배포/카카오 안내)**

아래 항목을 실제 명령과 함께 문서화:
1. **사진 바꾸기**: `images/`에 `main.jpg`,`sub.jpg` 넣기(또는 `config.js`의 `photos` 경로 변경).
2. **글자/날짜/장소 바꾸기**: `scripts/config.js`만 수정.
3. **테마 확정**: `config.js`의 `theme` 지정 + `previewMode:false`.
4. **두 버전 공유**: 공지용 = 기본 URL, 초대용 = `?to=invite` 붙인 URL.
5. **GitHub Pages 배포**: repo 생성 → push → Settings ▸ Pages ▸ Branch=main ▸ /(root).
6. **카카오(선택)**: developers.kakao.com 앱 생성 → JS 키 → 웹 플랫폼 도메인 등록(`https://<id>.github.io`) → `config.js`의 `kakaoJsKey` 입력 → 카드공유+움직이는 지도 활성.

- [ ] **Step 3: 전체 회귀 검증(공지/초대 × 4테마)**

Expected 체크리스트:
- 공지용(`/`): 히어로·인사말·D-Day·일정·공유 보임, **오시는 길 없음**.
- 초대용(`/?to=invite`): 위 + **오시는 길(3버튼)** 보임.
- 4테마 각각 레이아웃 깨짐 없음(모바일 375px, PC 1280px).
- 콘솔 에러 0. 링크 복사 정상.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: README + OG tags + final QA pass"
```

---

## Self-Review (작성자 점검 완료)

- **Spec 커버리지:** 두 버전(T5)·계좌 없음(전 태스크 미구현)·사진 2장 placeholder(T2)·D-Day(T3)·반응형(T7)·4테마 미리보기(T7)·지도 3버튼+카카오 임베드 폴백(T5/T6)·카톡 공유 폴백(T6)·GitHub Pages 배포(T8) → 모두 태스크 존재. ✅
- **Placeholder 스캔:** "TBD/적절히 처리" 류 없음. 모든 코드 스텝에 실제 코드 포함. ✅
- **타입/이름 일관성:** `computeDday`, `getAudience`, `directionLinks`, `currentShareUrl`, `absoluteUrl`, `applyTheme`, `photoEl`, `toast` — 정의 태스크와 사용 태스크 명칭 일치. `window.__wedding` 네임스페이스로 공유. ✅
- **주의:** 카카오 지도 SDK는 `kakaoJsKey`가 있을 때만 시도하며 실패해도 지도 박스로 폴백(T5 `tryKakaoMap` try/catch). SDK integrity 해시는 실제 로드 시 최신 버전 값으로 교체 필요(2.7.x).
