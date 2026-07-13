// tests/render.test.js — config+lib+main 통합 렌더 검증 (dom-harness 사용)
const test = require("node:test");
const assert = require("node:assert");
const { loadApp } = require("./dom-harness.js");

test("render: 히어로에 이름 + 날짜 + 사진", () => {
  const { els } = loadApp();
  const hero = els.hero.innerHTML;
  assert.ok(hero.includes("김민준 · 이서연"), "이름");
  assert.ok(hero.includes("2026년 10월 17일 토요일 오후 1시"), "날짜");
  assert.ok(hero.includes('class="photo"'), "사진 박스");
});

test("render: 인사말에 제목 + 본문 + 서브 사진", () => {
  const { els } = loadApp();
  const g = els.greeting.innerHTML;
  assert.ok(g.includes("모시는 글"), "제목");
  assert.ok(g.includes("귀한 걸음"), "인사말 본문");
  assert.ok(g.includes('class="photo"'), "서브 사진");
});
