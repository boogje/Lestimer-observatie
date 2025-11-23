/* ============================================================
   TIMELINE UI — segment rendering + lesdeel-labels boven balk
   ============================================================ */

import { State, fmt } from "../core/state.js";


/* ─────────────────────────────────────────────────────────────
   SELECTORS
   ───────────────────────────────────────────────────────────── */
const timeline = document.getElementById("timeline");
const timelineLabels = document.getElementById("timelineLabels");


/* ============================================================
   UPDATE TIMELINE SEGMENTEN (horizontale balk)
   ============================================================ */
export function renderTimeline() {
    timeline.innerHTML = "";

    const total = State.totalElapsed > 0 ? State.totalElapsed : 1;

    State.timelineSegments.forEach(seg => {
        const segStart = seg.start;
        const segEnd = seg.end !== null ? seg.end : State.totalElapsed;
        const width = ((segEnd - segStart) / total) * 100;

        const block = document.createElement("div");
        block.className = "seg";
        block.style.width = width + "%";
        block.style.background = State.colors[seg.cat];

        timeline.appendChild(block);
    });
}


/* ============================================================
   UPDATE LESDEEL LABELS (boven timeline, exact breedte)
   ============================================================ */
export function renderLessonPartLabels() {
    timelineLabels.innerHTML = "";

    const total = State.totalElapsed > 0 ? State.totalElapsed : 1;

    State.lessonParts.forEach(part => {
        const start = part.start;
        const end = part.end !== null ? part.end : State.totalElapsed;

        const width = ((end - start) / total) * 100;

        const lbl = document.createElement("div");
        lbl.className = "timelineLabel";
        lbl.style.width = width + "%";

        lbl.textContent = part.label
            ? part.label.toUpperCase()
            : "LESDEEL";

        timelineLabels.appendChild(lbl);
    });
}


/* ============================================================
   VOLLEDIG TIMELINE UPDATE PAKKET
   ============================================================ */
export function updateTimelineUI() {
    renderTimeline();
    renderLessonPartLabels();
}
