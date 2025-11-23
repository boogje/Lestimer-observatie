// js/app.js
import { state, initState } from "./core/state.js";
import { setupTimerControls } from "./core/timer.js";
import { setupCategorySwitching } from "./core/categories.js";
import { setupTimelineRendering } from "./ui/timeline.js";
import { setupLogSystem } from "./ui/logger.js";
import { setupNotes } from "./ui/notes.js";
import { addLogEntry } from "./ui/logger.js";
import { setupConfigPanel } from "./ui/config.js";



// ================ ALLES STARTEN ================
export function appInit() {
  initState();
  setupConfigPanel();         // <-- DIT WAS HET MISSENDE STUK!
  setupTimerControls();
  setupCategorySwitching();
  setupTimelineRendering();
  setupLogSystem();
  setupNotes();

  console.log("%cSportles Timer v10 – Alles geladen & klaar!", "color:#4caf50;font-size:1.4em;font-weight:bold;");
}

// DIRECT STARTEN (dit stond vroeger niet!)
window.addEventListener("DOMContentLoaded", () => {
    appInit();
});