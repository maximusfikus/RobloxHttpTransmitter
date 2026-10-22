import { getDictionary } from "./dictionary.js";
import { uploadCode } from "./session.js";
import { toBin, toHex, escapeHtml } from "./util.js";

let lastCompiled = null;

export function initIDE() {
  const editor = document.getElementById("ideEditor");
  const compileBtn = document.getElementById("ideCompile");
  const uploadBtn = document.getElementById("ideUpload");
  const previewEl = document.getElementById("idePreview");
  const statusEl = document.getElementById("ideStatus");

  compileBtn.addEventListener("click", () => {
    const result = compile(editor.value);
    lastCompiled = result;
    renderPreview(result, previewEl, statusEl);
    const hasBytes = result.lines.some(l => l.length > 0);
    uploadBtn.disabled = result.errors.length > 0 || !hasBytes;
  });

  uploadBtn.addEventListener("click", async () => {
    if (!lastCompiled) return;
    statusEl.textContent = "Uploading…";
    const res = await uploadCode(lastCompiled.paddedLines);
    statusEl.textContent = res.error ? "❌ " + res.error : "✅ " + (res.message || "uploaded");
  });
}

function compile(text) {
  const dict = getDictionary();
  const dictKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

  const rawLines = String(text).split(/\r?\n/);
  const lines = [];
  const tokensByLine = [];
  const errors = [];

  rawLines.forEach((rawLine, lineIdx) => {
    const tokens = tokenizeLine(rawLine, dict, dictKeys);
    tokensByLine.push(tokens);
    const bytes = [];
    for (const tok of tokens) {
      if (tok.error) {
        errors.push(`line ${lineIdx + 1}: ${tok.error} (col ${tok.pos + 1})`);
        continue;
      }
      if (Array.isArray(tok.value)) bytes.push(...tok.value);
      else bytes.push(tok.value);
    }
    lines.push(bytes);
  });

  const maxWidth = Math.max(1, ...lines.map(l => l.length));
  const paddedLines = lines.map(l => {
    const out = l.slice();
    while (out.length < maxWidth) out.push(0);
    return out;
  });

  return { lines, paddedLines, tokensByLine, errors, maxWidth };
}

function tokenizeLine(text, dict, dictKeys) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c) || c === ",") { i++; continue; }

    // Hex literal: #FF
    if (c === "#") {
      const m = text.slice(i + 1).match(/^[0-9a-fA-F]{1,2}/);
      if (!m) { tokens.push({ error: "bad hex literal", pos: i }); i++; continue; }
      tokens.push({ value: parseInt(m[0], 16), text: "#" + m[0] });
      i += 1 + m[0].length;
      continue;
    }

    // Binary literal: 0x01010101 (exactly 8 bits, per spec)
    if (c === "0" && text[i + 1] === "x") {
      const m = text.slice(i + 2).match(/^[01]{8}/);
      if (!m) { tokens.push({ error: "binary literal must be 8 bits (0x00000000)", pos: i }); i += 2; continue; }
      tokens.push({ value: parseInt(m[0], 2), text: "0x" + m[0] });
      i += 2 + m[0].length;
      continue;
    }

    // Decimal literal
    if (/[0-9]/.test(c)) {
      const m = text.slice(i).match(/^\d+/);
      const n = parseInt(m[0], 10);
      if (n > 255) tokens.push({ error: `decimal ${n} > 255`, pos: i });
      else tokens.push({ value: n, text: m[0] });
      i += m[0].length;
      continue;
    }

    // Dictionary (longest match)
    let matched = null;
    for (const k of dictKeys) {
      if (text.startsWith(k, i)) { matched = k; break; }
    }
    if (matched) {
      tokens.push({ value: dict[matched], text: matched, multi: true });
      i += matched.length;
      continue;
    }

    tokens.push({ error: `unknown token starting '${c}'`, pos: i });
    i++;
  }
  return tokens;
}

function renderPreview(result, previewEl, statusEl) {
  if (result.errors.length > 0) {
    statusEl.textContent = `❌ ${result.errors.length} error(s)`;
    previewEl.innerHTML = `<div class="error-list">${
      result.errors.map(e => `<div>${escapeHtml(e)}</div>`).join("")
    }</div>`;
    return;
  }

  if (result.lines.length === 0) {
    previewEl.textContent = "";
    statusEl.textContent = "Nothing to compile.";
    return;
  }

  statusEl.textContent =
    `✅ ${result.lines.length} line(s) × ${result.maxWidth} byte(s) ` +
    `= ${result.lines.reduce((a, b) => a + b.length, 0)} total bytes`;

  let html = `<table class="preview-table"><thead><tr>
    <th>#</th><th>Source</th><th>Bytes</th><th>Binary</th><th>Hex</th>
  </tr></thead><tbody>`;

  result.lines.forEach((_, idx) => {
    const padded = result.paddedLines[idx];
    const src = result.tokensByLine[idx]
      .map(t => t.text ?? (t.error ? `{error}` : "?"))
      .join(" ");
    html += `<tr>
      <td>${idx}</td>
      <td><code>${escapeHtml(src)}</code></td>
      <td>${padded.join(", ")}</td>
      <td class="mono">${padded.map(toBin).join(" ")}</td>
      <td class="mono">${padded.map(toHex).join(" ")}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  previewEl.innerHTML = html;
}