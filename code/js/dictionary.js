import { escapeHtml } from "./util.js";

let nextId = 1;
const state = {
  entries: [
    { id: nextId++, source: "A", bytes: "65" },
    { id: nextId++, source: "B", bytes: "66" },
    { id: nextId++, source: "space", bytes: "32" },
    { id: nextId++, source: "mov", bytes: "1, 2" },
  ],
};

let rowsEl;

export function initDictionary() {
  rowsEl = document.getElementById("dictRows");
  document.getElementById("dictAdd").addEventListener("click", () => {
    state.entries.push({ id: nextId++, source: "", bytes: "" });
    render();
  });
  render();
}

function render() {
  rowsEl.innerHTML = "";
  for (const entry of state.entries) {
    rowsEl.appendChild(renderRow(entry));
  }
}

function renderRow(entry) {
  const row = document.createElement("div");
  row.className = "dict-row";

  const src = document.createElement("input");
  src.className = "dict-source";
  src.placeholder = "source (e.g. mov)";
  src.spellcheck = false;
  src.value = entry.source;
  src.addEventListener("input", e => { entry.source = e.target.value; });

  const bytes = document.createElement("input");
  bytes.className = "dict-bytes";
  bytes.placeholder = "bytes (e.g. 1, 2, #0A)";
  bytes.spellcheck = false;
  bytes.value = entry.bytes;
  bytes.addEventListener("input", e => { entry.bytes = e.target.value; });

  const rm = document.createElement("button");
  rm.className = "dict-remove";
  rm.textContent = "×";
  rm.title = "remove entry";
  rm.addEventListener("click", () => {
    state.entries = state.entries.filter(e => e.id !== entry.id);
    render();
  });

  row.append(src, bytes, rm);
  return row;
}

/** Returns { source: [byte, byte, ...] } using current entries. */
export function getDictionary() {
  const dict = {};
  for (const { source, bytes } of state.entries) {
    const key = source.trim();
    if (!key) continue;
    const vals = parseByteList(bytes);
    if (vals.length === 0) continue;
    dict[key] = vals;
  }
  return dict;
}

/** Parse "1, 2, #0A, 0x00001010" into [1, 2, 10, 10]. */
function parseByteList(str) {
  const out = [];
  const s = String(str);
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c) || c === ",") { i++; continue; }

    if (c === "#") {
      const m = s.slice(i + 1).match(/^[0-9a-fA-F]{1,2}/);
      if (!m) { i++; continue; }
      out.push(parseInt(m[0], 16));
      i += 1 + m[0].length;
      continue;
    }
    if (c === "0" && s[i + 1] === "x") {
      const m = s.slice(i + 2).match(/^[01]{1,8}/);
      if (!m) { i += 2; continue; }
      out.push(parseInt(m[0], 2));
      i += 2 + m[0].length;
      continue;
    }
    if (/[0-9]/.test(c)) {
      const m = s.slice(i).match(/^\d+/);
      const n = parseInt(m[0], 10);
      if (n <= 255) out.push(n);
      i += m[0].length;
      continue;
    }
    i++;
  }
  return out;
}

// re-export so IDE can use the same escaping without importing util twice
export { escapeHtml };