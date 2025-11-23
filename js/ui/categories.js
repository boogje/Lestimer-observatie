/* ============================================================
   CATEGORIES UI — knoppen, percentages, tijdsweergave, wissels
   ============================================================ */

import { State, fmt } from "../core/state.js";
import { switchCategory } from "../core/timer.js";
import { logCategorySwitch, logNewLessonPart } from "./logger.js";


/* ─────────────────────────────────────────────────────────────
   SELECTORS
   ───────────────────────────────────────────────────────────── */
const catDivs = document.querySelectorAll(".cat");
const fills   = document.querySelectorAll(".fill");
const percEls = [
    document.getElementById("p0"),
    document.getElementById("p1"),
    document.getElementById("p2"),
    document.getElementById("p3")
];
const timeEls = [
    document.getElementById("t0"),
    document.getElementById("t1"),
    document.getElementById("t2"),
    document.getElementById("t3")
];


/* ============================================================
   INITIALISEER EVENT LISTENERS VOOR CATEGORIEKNOPPEN
   ============================================================ */
export function initCategoryButtons() {

    catDivs.forEach(div => {
        div.addEventListener("click", () => {

            if (!State.running) return;

            const newCat = Number(div.dataset.id);
            if (newCat === State.activeCat) return;

            // Voer categorie-wissel uit in core
            const dur = switchCategory(newCat);

            // Log de switch + segmentduur
            logCategorySwitch(newCat, dur);

            // UI update
            updateActiveButton(newCat);

            // Nieuw lesdeel indien instructie (categorie 1)
            if (newCat === 1) {
                logNewLessonPart();
            }
        });
    });
}


/* ============================================================
   ACTIVE KNOP MARKEREN
   ============================================================ */
export function updateActiveButton(newCat) {
    catDivs.forEach(div => div.classList.remove("active"));
    catDivs[newCat].classList.add("active");
}


/* ============================================================
   UPDATE CATEGORIE UI (tijd, percentages, fills)
   ============================================================ */
export function updateCategoryUI() {
    const total = State.totalElapsed > 0 ? State.totalElapsed : 1;

    for (let i = 0; i < 4; i++) {
        // Tijd per categorie
        timeEls[i].textContent = fmt(State.accum[i]);

        // Percentages
        const p = (State.accum[i] / total) * 100;
        percEls[i].textContent = p.toFixed(1) + "%";

        // Fill-balk
        fills[i].style.width = p + "%";
    }
}
