import { setSessionId } from "./session.js";
import { initRegistry } from "./registry.js";
import { initDictionary } from "./dictionary.js";
import { initIDE } from "./ide.js";

function init() {
  const sessionInput = document.getElementById("sessionId");
  const sessionStatus = document.getElementById("sessionStatus");

  setSessionId(sessionInput.value);
  sessionStatus.textContent = `session: ${sessionInput.value}`;

  sessionInput.addEventListener("change", () => {
    setSessionId(sessionInput.value);
    sessionStatus.textContent = sessionInput.value
      ? `session: ${sessionInput.value}`
      : "⚠️ enter a session ID";
  });

  initRegistry();
  initDictionary();
  initIDE();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}