export function toBin(n) { return (n & 0xff).toString(2).padStart(8, "0"); }
export function toHex(n) { return (n & 0xff).toString(16).toUpperCase().padStart(2, "0"); }
export function clampByte(n) { return Math.max(0, Math.min(255, n | 0)); }

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Parse a value in a given format ("bin" | "dec" | "hex").
 * Returns a byte 0-255 or null if invalid.
 */
export function parseByte(s, fmt) {
  s = String(s).trim();
  if (!s) return null;
  if (fmt === "bin") {
    if (!/^[01]{1,8}$/.test(s)) return null;
    return parseInt(s, 2);
  }
  if (fmt === "hex") {
    s = s.replace(/^0x/i, "");
    if (!/^[0-9a-fA-F]{1,2}$/.test(s)) return null;
    return parseInt(s, 16);
  }
  if (!/^\d{1,3}$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n > 255 ? null : n;
}