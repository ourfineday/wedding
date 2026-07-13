// tests/lib.test.js — 순수 로직 유닛테스트. 실행: node --test
const test = require("node:test");
const assert = require("node:assert");
const Lib = require("../scripts/lib.js");

test("THEMES: 테마 키 순서(싱그러움 포함)", () => {
  assert.deepStrictEqual(
    Lib.THEMES.map((t) => t.key),
    ["minimal", "fresh", "classic", "natural", "reference"]
  );
});

test("resolveTheme: url > config > 기본(minimal)", () => {
  assert.strictEqual(Lib.resolveTheme("classic", "natural"), "classic", "url 우선");
  assert.strictEqual(Lib.resolveTheme(null, "natural"), "natural", "config");
  assert.strictEqual(Lib.resolveTheme("fresh", "minimal"), "fresh", "fresh 유효");
  assert.strictEqual(Lib.resolveTheme("bogus", "nope"), "minimal", "둘 다 무효→minimal");
});

test("formatDate: 예식일 한국어 포맷", () => {
  assert.strictEqual(Lib.formatDate("2026-10-17T13:00:00"), "2026년 10월 17일 토요일 오후 1시");
});
test("formatDate: 분이 있으면 표시", () => {
  assert.strictEqual(Lib.formatDate("2026-10-17T11:30:00"), "2026년 10월 17일 토요일 오전 11시 30분");
});

test("computeDday: 전/당일/후", () => {
  const t = new Date("2026-10-17T13:00:00");
  assert.strictEqual(Lib.computeDday(new Date("2026-10-10T09:00:00"), t).label, "D-7");
  assert.strictEqual(Lib.computeDday(new Date("2026-10-17T09:00:00"), t).label, "D-DAY");
  assert.strictEqual(Lib.computeDday(new Date("2026-10-20T09:00:00"), t).label, "D+3");
});

test("ddayMessage: phase별 문구", () => {
  assert.ok(Lib.ddayMessage({ phase: "before", days: 7 }).includes("7일 남았"));
  assert.ok(Lib.ddayMessage({ phase: "day", days: 0 }).includes("오늘"));
  assert.ok(Lib.ddayMessage({ phase: "after", days: -3 }).includes("3일"));
});

test("getAudience: 기본 public, ?to=invite 만 invite", () => {
  assert.strictEqual(Lib.getAudience(""), "public");
  assert.strictEqual(Lib.getAudience("?to=invite"), "invite");
  assert.strictEqual(Lib.getAudience("?to=public"), "public");
  assert.strictEqual(Lib.getAudience("?foo=1&to=invite"), "invite");
});

test("directionLinks: 3사 URL 형식", () => {
  const links = Lib.directionLinks({ wedding: { venue: "OO홀", lat: 37.5, lng: 127.0 } });
  assert.ok(links.kakao.startsWith("https://map.kakao.com/link/to/"), "kakao");
  assert.ok(links.naver.startsWith("https://map.naver.com/"), "naver");
  assert.ok(links.tmap.startsWith("tmap://route"), "tmap");
});

test("buildVenueHTML: 키 없으면 지도 이미지 + 3버튼", () => {
  const cfg = { wedding: { venue: "OO홀", address: "서울 어딘가", lat: 37.5, lng: 127 }, kakaoJsKey: "" };
  const h = Lib.buildVenueHTML(cfg);
  assert.ok(h.includes("오시는 길"), "제목");
  assert.ok(h.includes("OO홀"), "예식장명");
  assert.ok(h.includes("map-ph"), "지도 플레이스홀더");
  assert.ok(h.includes(">티맵</a>") && h.includes(">카카오맵</a>") && h.includes(">네이버지도</a>"), "3버튼");
  assert.ok(h.includes('id="dir-tmap"'), "티맵 버튼 id(폴백 배선용)");
});
test("buildVenueHTML: 키 있으면 kakao-map 임베드 컨테이너", () => {
  const cfg = { wedding: { venue: "OO홀", address: "주소", lat: 37.5, lng: 127 }, kakaoJsKey: "ABC123" };
  const h = Lib.buildVenueHTML(cfg);
  assert.ok(h.includes('id="kakao-map"'), "임베드 컨테이너");
  assert.ok(!h.includes("map-ph"), "플레이스홀더 없음");
});

test("buildGreetingHTML: 본문 + 혼주(부모님) 표기", () => {
  const cfg = {
    greeting: "안녕\n하세요",
    groom: { name: "민준", parents: "김부·박모" },
    bride: { name: "서연", parents: "이부·최모" },
  };
  const h = Lib.buildGreetingHTML(cfg);
  assert.ok(h.includes("모시는 글"), "제목");
  assert.ok(h.includes("안녕<br />하세요"), "본문 줄바꿈");
  assert.ok(h.includes("김부·박모") && h.includes("민준"), "신랑 혼주");
  assert.ok(h.includes("이부·최모") && h.includes("서연"), "신부 혼주");
});
test("buildGreetingHTML: 부모님 없으면 혼주줄 생략(에러 없음)", () => {
  const cfg = { greeting: "안녕", groom: { name: "민준", parents: "" }, bride: { name: "서연", parents: "" } };
  const h = Lib.buildGreetingHTML(cfg);
  assert.ok(h.includes("안녕"), "본문");
  assert.ok(!h.includes("hosts"), "혼주 블록 생략");
});

test("buildShareHTML: 카카오톡 공유 + 링크 복사 항상 노출", () => {
  const h = Lib.buildShareHTML();
  assert.ok(h.includes("카카오톡으로 공유하기"), "카톡 버튼");
  assert.ok(h.includes("링크 복사"), "링크복사");
  assert.ok(h.includes('id="btn-kakao"') && h.includes('id="btn-copy"'), "버튼 id");
});

test("photoHTML: 경로 있으면 img+플레이스홀더, 없으면 플레이스홀더만", () => {
  const withImg = Lib.photoHTML("images/main.jpg", "메인 사진");
  assert.ok(withImg.includes('class="photo-img"'), "img class");
  assert.ok(withImg.includes('src="images/main.jpg"'), "src");
  assert.ok(withImg.includes('class="photo-ph">메인 사진</div>'), "placeholder label");
  const noImg = Lib.photoHTML("", "사진");
  assert.ok(!noImg.includes("<img"), "no img when path empty");
  assert.ok(noImg.includes('class="photo-ph">사진</div>'), "placeholder only");
});

test("buildCalendarHTML: 예식일(17) 강조 셀 포함", () => {
  const html = Lib.buildCalendarHTML("2026-10-17T13:00:00");
  assert.ok(html.includes('class="cal-d on">17</span>'), html);
});
