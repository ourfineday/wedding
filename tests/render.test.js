// tests/render.test.js — config+lib+main 통합 렌더 검증 (dom-harness 사용)
const test = require("node:test");
const assert = require("node:assert");
const { loadApp } = require("./dom-harness.js");

test("render: previewMode=true면 테마 미리보기 바 노출(5개) + config.theme 적용", () => {
  const { els, documentEl, cfg } = loadApp({ config: (c) => { c.previewMode = true; } });
  assert.strictEqual(els["theme-bar"].hidden, false, "바 표시");
  const bar = els["theme-bar"].innerHTML;
  ["미니멀", "싱그러움", "클래식", "내추럴", "레퍼런스"].forEach((l) => assert.ok(bar.includes(l), l));
  assert.strictEqual(documentEl.getAttribute("data-theme"), cfg.theme, "config.theme 적용");
});

test("render: 기본(배포) 설정은 테마바 숨김 + config.theme 적용", () => {
  const { els, documentEl, cfg } = loadApp();
  assert.strictEqual(els["theme-bar"].hidden, true, "바 숨김");
  assert.strictEqual(documentEl.getAttribute("data-theme"), cfg.theme, "config.theme 적용");
});

test("render: ?theme=fresh 이면 data-theme=fresh", () => {
  const { documentEl } = loadApp({ search: "?theme=fresh" });
  assert.strictEqual(documentEl.getAttribute("data-theme"), "fresh");
});

test("render: 히어로에 이름 + 날짜 + 사진", () => {
  const { els } = loadApp();
  const hero = els.hero.innerHTML;
  assert.ok(hero.includes("탁성준 · 김혜린"), "이름");
  assert.ok(hero.includes("2026년 9월 12일 토요일 오후 5시"), "날짜");
  assert.ok(hero.includes('class="photo"'), "사진 박스");
});

test("render: 인사말에 제목 + 본문 + 서브 사진 (부모님 빈칸이면 혼주 생략)", () => {
  const { els } = loadApp();
  const g = els.greeting.innerHTML;
  assert.ok(g.includes("저희, 결혼합니다"), "제목");
  assert.ok(g.includes("축복해"), "인사말 본문");
  assert.ok(!g.includes("의 아들"), "혼주 생략(부모님 빈칸)");
  assert.ok(g.includes('class="photo"'), "서브 사진");
});

test("render: D-Day 배지 + 문구 (라벨 형식)", () => {
  const { els } = loadApp();
  const d = els.dday.innerHTML;
  assert.ok(d.includes('class="dday-badge"'), "배지");
  assert.ok(/D-\d+|D-DAY|D\+\d+/.test(d), "D-라벨 형식: " + d);
  assert.ok(/남았습니다|오늘|되었습니다/.test(d), "문구");
});

test("render: 일정 섹션에 제목 + 날짜 + 달력(17 강조)", () => {
  const { els } = loadApp();
  const s = els.schedule.innerHTML;
  assert.ok(s.includes("예식 안내"), "제목");
  assert.ok(s.includes("2026년 9월 12일"), "날짜");
  assert.ok(s.includes('class="cal"'), "달력");
  assert.ok(s.includes('class="cal-d on">12</span>'), "12 강조");
});

test("render: 공지용(기본)에서 오시는 길 숨김", () => {
  const { els } = loadApp();
  assert.strictEqual(els.venue.hidden, true, "hidden");
  assert.strictEqual(els.venue.innerHTML, "", "빈 내용");
});

test("render: 초대용(?to=invite)에서 오시는 길 표시 + 3버튼", () => {
  const { els } = loadApp({ search: "?to=invite" });
  assert.strictEqual(els.venue.hidden, false, "표시됨");
  const v = els.venue.innerHTML;
  assert.ok(v.includes("오시는 길"), "제목");
  assert.ok(v.includes("map-ph"), "지도 이미지(키 없음)");
  assert.ok(v.includes(">티맵</a>") && v.includes(">카카오맵</a>") && v.includes(">네이버지도</a>"), "3버튼");
});

test("render: 공유 섹션 - 카톡 + 링크복사 버튼 항상 노출", () => {
  const { els } = loadApp();
  const s = els.share.innerHTML;
  assert.ok(s.includes("청첩장 공유하기"), "제목");
  assert.ok(s.includes("카카오톡으로 공유하기"), "카톡 버튼");
  assert.ok(s.includes("링크 복사"), "링크복사");
});
