/* ============================================================
   LOGGER — hiërarchische logstructuur (L1 / L2 / L3)
   ============================================================ */

import { State, fmt } from "../core/state.js";

/* ─────────────────────────────────────────────────────────────
   SELECTOR
   ───────────────────────────────────────────────────────────── */
const logBox = document.getElementById("log");


/* ============================================================
   BASIS: TIMESTAMP BUILDER
   ============================================================ */

function timestamp(overrideMs = null) {
    const t = overrideMs !== null ? overrideMs : State.totalElapsed;
    return `[${fmt(t)}]`;
}


/* ============================================================
   LOG L1 — LESDELEN (HOOFDNIVEAU – CAPS)
   ============================================================ */
export function logNewLessonPart() {
    // Sluit vorige lesdeel af
    if (State.currentPart) {
        State.currentPart.end = State.totalElapsed;
    }

    // Maak nieuw lesdeel
    State.currentPart = {
        start: State.totalElapsed,
        end: null,
        label: ""
    };
    State.lessonParts.push(State.currentPart);

    // SCHRIJF NAAR LOG
    const div = document.createElement("div");
    div.className = "logL1";
    div.textContent = `${timestamp()} NIEUW LESDEEL`;
    logBox.appendChild(div);
    div.scrollIntoView({ behavior: "smooth" });
}


/* ============================================================
   LOG L2 — CATEGORIE-WISSEL
   ============================================================ */
export function logCategorySwitch(newCat, durationMs) {
    const name = State.categories[newCat];
    const dur = fmt(durationMs);

    const div = document.createElement("div");
    div.className = "logL2";
    div.textContent = `${timestamp()} → ${name} (${dur})`;
    logBox.appendChild(div);
    div.scrollIntoView({ behavior: "smooth" });
}


/* ============================================================
   LOG L3 — NOTITIES
   ============================================================ */
export function logNote(text, msStamp) {
    const div = document.createElement("div");
    div.className = "logL3";
    div.textContent = `${timestamp(msStamp)} → ${text}`;
    logBox.appendChild(div);
    div.scrollIntoView({ behavior: "smooth" });
}


/* ============================================================
   LOG — START EN STOP
   ============================================================ */
export function logStart() {
    const div = document.createElement("div");
    div.className = "logL1";
    div.textContent = `${timestamp(0)} OBSERVATIE GESTART`;
    logBox.appendChild(div);
}

export function logStop() {
    const div = document.createElement("div");
    div.className = "logL1";
    div.textContent = `${timestamp()} OBSERVATIE BEËINDIGD`;
    logBox.appendChild(div);
}
