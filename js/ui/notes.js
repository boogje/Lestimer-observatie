/*-+  (melding genegeerd) */

import { state } from "../core/state.js";
import { addLogEntry } from "./logger.js";

export function setupNotes() {
  const input = document.getElementById("noteInput");
  const btn = document.getElementById("noteBtn");

  input.addEventListener("input", () => {
    if (!state.typingStarted && input.value.length > 0 && state.running) {
      state.noteDraftStart = state.totalElapsed;
      state.typingStarted = true;
    }
  });

  btn.addEventListener("click", commitNote);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") commitNote();
  });
}

function commitNote() {
  const input = document.getElementById("noteInput");
  const txt = input.value.trim();
  if (!txt) return;

  const stamp = state.noteDraftStart !== null
    ? formatElapsed(state.noteDraftStart)
    : formatElapsed(state.totalElapsed);

  addLogEntry(txt, "note");

  input.value = "";
  state.noteDraftStart = null;
  state.typingStarted = false;
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");

  return m >= 60
    ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${sec}`
    : `${m}:${sec}`;
}
