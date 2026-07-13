// tests/dom-harness.js — 무설치 렌더 하니스.
// config.js + lib.js + main.js 를 최소 DOM 목(mock) 위에서 실제 실행하고,
// 각 섹션의 렌더된 innerHTML 등을 검사할 수 있게 돌려준다.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function makeEl(id) {
  const el = {
    id,
    innerHTML: "",
    hidden: false,
    _attrs: {},
    _cls: new Set(),
    _handlers: {},
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k]; },
    classList: {
      add(c) { el._cls.add(c); },
      remove(c) { el._cls.delete(c); },
      contains(c) { return el._cls.has(c); },
    },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    appendChild(c) { return c; },
    remove() {},
    set onclick(fn) { this._handlers.click = fn; },
    get onclick() { return this._handlers.click; },
  };
  return el;
}

// search 예: "" 또는 "?to=invite&theme=classic"
function loadApp({ search = "", config } = {}) {
  const ids = ["theme-bar", "hero", "greeting", "dday", "schedule", "venue", "share", "toast"];
  const els = {};
  ids.forEach((id) => { els[id] = makeEl(id); });

  const documentEl = {
    _attrs: { "data-theme": "minimal" },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k]; },
  };

  const doc = {
    _ready: null,
    getElementById: (id) => els[id] || makeEl(id),
    addEventListener: (ev, cb) => { if (ev === "DOMContentLoaded") doc._ready = cb; },
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, remove() {}, onload: null, onerror: null }),
    head: { appendChild() {} },
    documentElement: documentEl,
  };

  const sandbox = { console, URLSearchParams, setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0 };
  const ctx = vm.createContext(sandbox);
  vm.runInContext("window = globalThis;", ctx);
  ctx.document = doc;
  ctx.navigator = {};
  ctx.location = { search, href: "http://localhost/" + (search || "") };

  const root = path.join(__dirname, "..");
  vm.runInContext(fs.readFileSync(path.join(root, "scripts/config.js"), "utf8"), ctx, { filename: "config.js" });
  if (config) config(ctx.window.WEDDING_CONFIG); // 테스트별 config 덮어쓰기 훅
  vm.runInContext(fs.readFileSync(path.join(root, "scripts/lib.js"), "utf8"), ctx, { filename: "lib.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "scripts/main.js"), "utf8"), ctx, { filename: "main.js" });
  if (doc._ready) doc._ready();

  return { els, doc, documentEl, cfg: ctx.window.WEDDING_CONFIG };
}

module.exports = { loadApp };
