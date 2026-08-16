#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [specPath, outPath] = process.argv.slice(2);

if (!specPath || !outPath) {
  console.error("Usage: node render_board_from_spec.mjs spec.json output.excalidraw");
  process.exit(2);
}

const spec = JSON.parse(readFileSync(specPath, "utf8"));
const out = resolve(outPath);

let seed = Number(spec.seed || 2026081601);
const now = Date.now();
const id = (prefix) => `${prefix}_${(seed++).toString(36)}`;

function base(type, extra) {
  return {
    id: id(type),
    type,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    angle: 0,
    strokeColor: "#111111",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: seed++,
    version: 1,
    versionNonce: seed++,
    isDeleted: false,
    boundElements: null,
    updated: now,
    link: null,
    locked: false,
    ...extra,
  };
}

function rect(x, y, width, height, bg = "#ffffff", stroke = "#111111", sw = 3) {
  return base("rectangle", {
    x,
    y,
    width,
    height,
    backgroundColor: bg,
    strokeColor: stroke,
    strokeWidth: sw,
    roundness: { type: 3 },
  });
}

function ellipse(x, y, width, height, bg = "#ffffff", stroke = "#111111", sw = 3) {
  return base("ellipse", {
    x,
    y,
    width,
    height,
    backgroundColor: bg,
    strokeColor: stroke,
    strokeWidth: sw,
  });
}

function text(x, y, value, size, width, color = "#111111", align = "left") {
  const lines = String(value).split("\n").length;
  return base("text", {
    x,
    y,
    width,
    height: Math.max(size * 1.45 * lines, size + 16),
    strokeColor: color,
    backgroundColor: "transparent",
    fontSize: size,
    fontFamily: 1,
    text: String(value),
    rawText: String(value),
    textAlign: align,
    verticalAlign: "top",
    containerId: null,
    originalText: String(value),
    autoResize: false,
    lineHeight: 1.22,
  });
}

function line(x, y, width, color = "#d92d20", sw = 7) {
  return base("line", {
    x,
    y,
    width,
    height: 0,
    strokeColor: color,
    strokeWidth: sw,
    roughness: 2,
    points: [
      [0, 0],
      [width, 0],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
  });
}

function arrow(x, y, width, height, color = "#111111", sw = 4) {
  return base("arrow", {
    x,
    y,
    width,
    height,
    strokeColor: color,
    strokeWidth: sw,
    roughness: 2,
    points: [
      [0, 0],
      [width, height],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow",
  });
}

function screen(y, no, title, sub) {
  const e = [];
  e.push(rect(0, y, 1600, 900, "#ffffff", "#d1d5db", 2));
  e.push(text(70, y + 50, String(no).padStart(2, "0"), 30, 80, "#9ca3af"));
  e.push(text(130, y + 45, title, 62, 1320, "#111111"));
  e.push(line(132, y + 132, Math.min(720, title.length * 42), "#d92d20", 8));
  if (sub) e.push(text(132, y + 172, sub, 30, 1280, "#4b5563"));
  return e;
}

function footer(y, value) {
  if (!value) return [];
  return [
    rect(280, y + 760, 1040, 76, "#111111", "#111111", 3),
    text(320, y + 783, value, 32, 960, "#ffffff", "center"),
  ];
}

function card(x, y, w, h, title, body, bg = "#ffffff") {
  const e = [];
  e.push(rect(x, y, w, h, bg, "#111111", 3));
  e.push(text(x + 30, y + 28, title, 35, w - 60, "#111111", "center"));
  e.push(line(x + 55, y + 84, Math.max(120, w - 110), "#d92d20", 5));
  e.push(text(x + 32, y + 118, body, 25, w - 64, "#374151", "center"));
  return e;
}

function numberedCard(x, y, no, title, body, bg, w = 430, h = 175) {
  const e = [];
  e.push(rect(x, y, w, h, bg, "#111111", 3));
  e.push(ellipse(x + 24, y + 24, 58, 58, "#111111", "#111111", 3));
  e.push(text(x + 36, y + 42, no, 24, 35, "#ffffff", "center"));
  e.push(text(x + 100, y + 28, title, 33, w - 125, "#111111"));
  e.push(text(x + 34, y + 94, body, 23, w - 68, "#374151", "center"));
  return e;
}

const colors = ["#ecfdf5", "#eff6ff", "#fff7ed", "#f5f3ff", "#fef3c7", "#f8fafc", "#ffffff"];

function renderComparison(y, layout) {
  const e = [];
  e.push(rect(120, y + 295, 600, 300, layout.left?.bg || "#fee2e2", "#111111", 4));
  e.push(text(170, y + 350, layout.left?.title || "过去", 45, 500, "#111111", "center"));
  e.push(text(170, y + 430, layout.left?.body || "", 36, 500, layout.left?.color || "#991b1b", "center"));
  e.push(arrow(760, y + 445, 100, 0, "#d92d20", 6));
  e.push(rect(900, y + 295, 580, 300, layout.right?.bg || "#ecfdf5", "#111111", 4));
  e.push(text(950, y + 350, layout.right?.title || "现在", 45, 480, "#111111", "center"));
  e.push(text(950, y + 430, layout.right?.body || "", 36, 480, layout.right?.color || "#065f46", "center"));
  e.push(...footer(y, layout.footer));
  return e;
}

function renderCards(y, layout) {
  const e = [];
  const cards = layout.cards || [];
  const n = Math.min(cards.length, 5);
  const w = n <= 3 ? 410 : 300;
  const gap = n <= 3 ? 75 : 25;
  const total = n * w + (n - 1) * gap;
  let x = (1600 - total) / 2;
  for (let i = 0; i < n; i++) {
    e.push(...card(x, y + 305, w, n <= 3 ? 285 : 300, cards[i].title, cards[i].body, cards[i].bg || colors[i % colors.length]));
    if (i < n - 1) e.push(arrow(x + w + 10, y + 435, Math.max(24, gap - 20), 0, "#6b7280", 3));
    x += w + gap;
  }
  e.push(...footer(y, layout.footer));
  return e;
}

function renderSteps(y, layout) {
  const e = [];
  const steps = layout.steps || [];
  const columns = layout.columns || (steps.length > 4 ? 3 : 2);
  const w = columns === 3 ? 430 : 610;
  const startX = columns === 3 ? 115 : 160;
  const gapX = columns === 3 ? 490 : 670;
  const gapY = 220;
  steps.forEach((s, i) => {
    const x = startX + (i % columns) * gapX;
    const yy = y + 300 + Math.floor(i / columns) * gapY;
    e.push(...numberedCard(x, yy, String(i + 1), s.title, s.body, s.bg || colors[i % colors.length], w, 175));
  });
  e.push(...footer(y, layout.footer));
  return e;
}

function renderFlow(y, layout) {
  const e = [];
  const items = layout.items || [];
  const perRow = Math.min(layout.perRow || 4, 5);
  const w = perRow === 4 ? 300 : 245;
  const gapX = perRow === 4 ? 70 : 55;
  const startX = (1600 - (perRow * w + (perRow - 1) * gapX)) / 2;
  items.forEach((item, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const x = startX + col * (w + gapX);
    const yy = y + 300 + row * 170;
    e.push(rect(x, yy, w, 95, colors[i % colors.length], "#111111", 3));
    e.push(text(x + 25, yy + 30, item, 30, w - 50, "#111111", "center"));
    if (col < perRow - 1 && i < items.length - 1) e.push(arrow(x + w + 10, yy + 48, gapX - 20, 0, "#d92d20", 4));
  });
  e.push(...footer(y, layout.footer));
  return e;
}

function renderTable(y, layout) {
  const e = [];
  const headers = layout.headers || [];
  const rows = layout.rows || [];
  const widths = layout.widths || headers.map(() => Math.floor(1320 / headers.length));
  const tableW = widths.reduce((a, b) => a + b, 0);
  const startX = (1600 - tableW) / 2;
  let x = startX;
  e.push(rect(startX - 25, y + 275, tableW + 50, 430, "#f8fafc", "#111111", 4));
  headers.forEach((h, i) => {
    e.push(rect(x, y + 315, widths[i], 62, "#111111", "#111111", 2));
    e.push(text(x + 10, y + 335, h, 24, widths[i] - 20, "#ffffff", "center"));
    x += widths[i];
  });
  rows.slice(0, 4).forEach((r, ri) => {
    x = startX;
    r.forEach((v, i) => {
      e.push(rect(x, y + 382 + ri * 76, widths[i], 68, ri % 2 ? "#ffffff" : "#ecfdf5", "#111111", 2));
      e.push(text(x + 10, y + 404 + ri * 76, v, i === r.length - 1 ? 28 : 22, widths[i] - 20, i === r.length - 1 ? "#a32020" : "#374151", "center"));
      x += widths[i];
    });
  });
  e.push(...footer(y, layout.footer));
  return e;
}

function renderCycle(y, layout) {
  const e = [];
  const items = layout.items || [];
  const cx = 800;
  const cy = y + 490;
  const positions = [
    [cx - 135, cy - 245],
    [cx + 205, cy - 145],
    [cx + 205, cy + 95],
    [cx - 135, cy + 215],
    [cx - 475, cy + 95],
    [cx - 475, cy - 145],
  ];
  items.slice(0, 6).forEach((item, i) => {
    const [x, yy] = positions[i];
    e.push(rect(x, yy, 270, 105, colors[i % colors.length], "#111111", 3));
    e.push(text(x + 30, yy + 34, item, 30, 210, "#111111", "center"));
    const [nx, ny] = positions[(i + 1) % Math.min(items.length, 6)];
    e.push(arrow(x + 270, yy + 52, nx - x - 270, ny - yy, "#d92d20", 4));
  });
  e.push(ellipse(cx - 145, cy - 130, 290, 260, "#111111", "#111111", 4));
  e.push(text(cx - 105, cy - 58, layout.center || "增长\n飞轮", 36, 210, "#ffffff", "center"));
  e.push(...footer(y, layout.footer));
  return e;
}

function renderQuote(y, layout) {
  const e = [];
  e.push(rect(150, y + 285, 1300, 260, "#111111", "#111111", 4));
  (layout.lines || []).slice(0, 3).forEach((lineText, i) => {
    e.push(text(210, y + 345 + i * 78, lineText, 40, 1180, i === 0 ? "#ffffff" : "#bbf7d0", "center"));
  });
  if (layout.footer) {
    e.push(rect(260, y + 670, 1080, 110, "#fff7ed", "#d92d20", 5));
    e.push(text(310, y + 700, layout.footer, 34, 980, "#a32020", "center"));
  }
  return e;
}

function renderLayout(y, layout = {}) {
  if (layout.type === "comparison") return renderComparison(y, layout);
  if (layout.type === "cards") return renderCards(y, layout);
  if (layout.type === "steps") return renderSteps(y, layout);
  if (layout.type === "flow") return renderFlow(y, layout);
  if (layout.type === "table") return renderTable(y, layout);
  if (layout.type === "cycle") return renderCycle(y, layout);
  if (layout.type === "quote") return renderQuote(y, layout);
  return renderCards(y, { cards: [{ title: "待补充", body: "请设置 layout.type" }] });
}

const elements = [];
const gapY = Number(spec.gapY || 120);
const screens = spec.screens || [];

screens.forEach((s, i) => {
  const y = i * (900 + gapY);
  elements.push(...screen(y, i + 1, s.title || `Screen ${i + 1}`, s.subtitle || ""));
  elements.push(...renderLayout(y, s.layout));
});

const scene = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements,
  appState: {
    gridSize: null,
    viewBackgroundColor: "#f3f4f6",
    currentItemFontFamily: 1,
    scrollX: 50,
    scrollY: 40,
    zoom: { value: Number(spec.zoom || 0.43) },
  },
  files: {},
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(scene, null, 2) + "\n", "utf8");
console.log(out);
