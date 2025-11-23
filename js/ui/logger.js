/*-+  (melding genegeerd) */

import { state } from "../core/state.js";

export function setupLogSystem() {
  // Init: logger wordt puur event-driven gebruikt
}

export function addLogEntry(text, type = "note", category = null) {
  const container = document.getElementById("log");
  if (!container) return;

  const entry = document.createElement("div");
  entry.classList.add("logentry");

  if (type === "cat" && category !== null) entry.classList.add("log-cat" + category);
  if (type === "note") entry.classList.add("note");

  const stamp = type === "start"
    ? new Date().toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : formatElapsed(state.totalElapsed);

  entry.textContent = `[${stamp}] ${text}`;
  container.appendChild(entry);

  entry.scrollIntoView({ behavior: "smooth" });

  state.logEntries.push({
    timestamp: stamp,
    text,
    type,
    category
  });
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");

  return m >= 60
    ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${sec}`
    : `${m}:${sec}`;
}
