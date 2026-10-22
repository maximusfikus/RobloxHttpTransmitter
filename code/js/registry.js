import { uploadCode, getData } from "./session.js";
import { toBin, toHex, clampByte, parseByte } from "./util.js";

const state = {
  rows: 16,
  cols: 4,
  grid: [],
  format: "bin",
};

let gridEl, statusEl;

export function initRegistry() {
  gridEl = document.getElementById("registryGrid");
  statusEl = document.getElementById("registryStatus");

  resetGrid(state.rows, state.cols);

  document.querySelectorAll("[data-format]").forEach(btn => {
    btn.addEventListener("click", () => setFormat(btn.dataset.format));
  });

  document.getElementById("gridResize").addEventListener("click", () => {
    const rows = Math.max(1, Math.min(64, Number(document.getElementById("gridRows").value) | 0));
    const cols = Math.max(1, Math.min(16, Number(document.getElementById("gridCols").value) | 0));
    resizeGrid(rows, cols);
  });

  document.getElementById("registryLoad").addEventListener("click", loadFromServer);
  document.getElementById("registryUpload").addEventListener("click", uploadToServer);

  initTranslator();
  render();
}

function resetGrid(rows, cols) {
  state.rows = rows;
  state.cols = cols;
  state.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  render();
}

function resizeGrid(rows, cols) {
  const next = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => clampByte(state.grid[r]?.[c] ?? 0))
  );
  state.rows = rows;
  state.cols = cols;
  state.grid = next;
  render();
}

function setFormat(fmt) {
  state.format = fmt;
  document.querySelectorAll("[data-format]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.format === fmt);
  });
  render();
}

function formatValue(n, fmt) {
  if (fmt === "bin") return toBin(n);
  if (fmt === "hex") return toHex(n);
  return String(n);
}

function subText(n, fmt) {
  if (fmt === "bin") return `${n} · 0x${toHex(n)}`;
  if (fmt === "dec") return `${toBin(n)} · 0x${toHex(n)}`;
  return `${n} · ${toBin(n)}`;
}

function render() {
  const fmt = state.format;

  let html = `<table class="reg-table"><thead><tr><th></th>`;
  for (let c = 0; c < state.cols; c++) html += `<th>b${c}</th>`;
  html += `</tr></thead><tbody>`;

  for (let r = 0; r < state.rows; r++) {
    html += `<tr><th>${String(r).padStart(2, "0")}</th>`;
    for (let c = 0; c < state.cols; c++) {
      const v = state.grid[r][c];
      html += `<td>
        <input class="reg-cell" data-r="${r}" data-c="${c}"
               value="${formatValue(v, fmt)}" spellcheck="false" />
        <small>${subText(v, fmt)}</small>
      </td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  gridEl.innerHTML = html;

  gridEl.querySelectorAll(".reg-cell").forEach(inp => {
    inp.addEventListener("focus", e => e.target.select());
    inp.addEventListener("change", onCellChange);
    inp.addEventListener("blur", onCellChange);
  });
}

function onCellChange(e) {
  const r = +e.target.dataset.r;
  const c = +e.target.dataset.c;
  const parsed = parseByte(e.target.value, state.format);

  if (parsed === null) {
    e.target.value = formatValue(state.grid[r][c], state.format);
    return;
  }
  state.grid[r][c] = parsed;
  e.target.value = formatValue(parsed, state.format);
  e.target.parentElement.querySelector("small").textContent = subText(parsed, state.format);
}

async function loadFromServer() {
  statusEl.textContent = "Loading…";
  const res = await getData();
  if (res.error) { statusEl.textContent = "❌ " + res.error; return; }

  const data = Array.isArray(res.data) ? res.data : [];
  const rows = Math.max(state.rows, data.length);
  const maxCols = data.reduce((m, l) => Math.max(m, Array.isArray(l) ? l.length : 0), 0);
  const cols = Math.max(state.cols, maxCols);

  document.getElementById("gridRows").value = rows;
  document.getElementById("gridCols").value = cols;

  state.rows = rows;
  state.cols = cols;
  state.grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => decodeStored(data[r]?.[c]))
  );

  render();
  statusEl.textContent = `✅ Loaded ${data.length} line(s)`;
}

function decodeStored(v) {
  if (typeof v === "number") return clampByte(v);
  if (typeof v === "string") {
    if (/^[01]{8}$/.test(v)) return parseInt(v, 2);
    if (/^\d+$/.test(v)) return clampByte(parseInt(v, 10));
    if (v.length === 1) return v.charCodeAt(0) & 0xff;
  }
  return 0;
}

async function uploadToServer() {
  statusEl.textContent = "Uploading…";
  const res = await uploadCode(state.grid);
  statusEl.textContent = res.error ? "❌ " + res.error : "✅ " + (res.message || "uploaded");
}

function initTranslator() {
  const bin = document.getElementById("transBin");
  const dec = document.getElementById("transDec");
  const hex = document.getElementById("transHex");

  function sync(source, fmt) {
    const n = parseByte(source.value, fmt);
    if (n === null) return;
    if (source !== bin) bin.value = toBin(n);
    if (source !== dec) dec.value = String(n);
    if (source !== hex) hex.value = toHex(n);
  }

  bin.addEventListener("input", () => sync(bin, "bin"));
  dec.addEventListener("input", () => sync(dec, "dec"));
  hex.addEventListener("input", () => sync(hex, "hex"));
}