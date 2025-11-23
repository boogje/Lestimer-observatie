/*-+ (melding genegeerd) */

import { state } from "../core/state.js";
import { addLogEntry } from "./logger.js";

export function setupConfigPanel() {
  const panel = document.getElementById("configPanel");
  const main = document.getElementById("main");
  const header = document.getElementById("lessonHeader");

  const btn = document.getElementById("configStartBtn");

  btn.addEventListener("click", () => {
    // 1. State invullen
    state.lessonTitle = document.getElementById("cfgTitle").value.trim() || "Sportles";
    state.teacherName = document.getElementById("cfgTeacher").value.trim() || "Lesgever";
    state.location    = document.getElementById("cfgLocation").value.trim() || "Locatie onbekend";

    // 2. Header instellen
    header.textContent = `${state.lessonTitle} – ${state.teacherName}`;

    // 3. UI wisselen
    panel.style.display = "none";
    main.style.display = "block";

    // 4. Loggen
    addLogEntry(`LESDEEL: START`, "start");
    addLogEntry(`Les: ${state.lessonTitle}`, "note");
    addLogEntry(`Lesgever: ${state.teacherName}`, "note");
    addLogEntry(`Locatie: ${state.location}`, "note");
  });
}
