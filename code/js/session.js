let sessionId = "";

export function getSessionId() { return sessionId; }
export function setSessionId(id) { sessionId = String(id).trim(); }

export async function uploadCode(code) {
  if (!sessionId) return { error: "Session ID required" };
  try {
    const res = await fetch("/code/upload", {
      method: "POST",
      headers: { seshID: sessionId, "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

export async function getData() {
  if (!sessionId) return { error: "Session ID required" };
  try {
    const res = await fetch("/code/getData", {
      headers: { seshID: sessionId },
    });
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}