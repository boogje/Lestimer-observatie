/* ============================================================
   APP.JS — hoofdcontroller van de volledige applicatie
   ============================================================ */
import { State, fmt } from "./core/state.js";
import { startTimer, togglePause, tick, stopTimer, resetTimer } from "./core/timer.js";

import { initCategoryButtons, updateCategoryUI, updateActiveButton } from "./ui/categories.js";
import { updateTimelineUI } from "./ui/timeline.js";

import { logStart, logStop, logNote } from "./ui/logger.js";

import { initClipboardExport, initDownloadExport } from "./export/exporter.js";


/* ─────────────────────────────────────────────────────────────
   SELECTORS
   ───────────────────────────────────────────────────────────── */
const startBtn     = document.getElementById("startBtn");
const pauseBtn     = document.getElementById("pauseBtn");
const stopBtn      = document.getElementById("stopBtn");
const resetBtn     = document.getElementById("resetBtn");
const noteInput    = document.getElementById("noteInput");
const noteBtn      = document.getElementById("noteBtn");
const configPanel  = document.getElementById("configPanel");
const main         = document.querySelector("main");

/* LESGEGEVENS */
const cfgTitle     = document.getElementById("cfgTitle");
const cfgTeacher   = document.getElementById("cfgTeacher");
const cfgLocation  = document.getElementById("cfgLocation");
const configStartBtn = document.getElementById("configStartBtn");

const lessonHeader = document.getElementById("lessonHeader");
const totalDisplay = document.getElementById("total");

const exportSection = document.getElementById("exportSection");


/* ============================================================
   INITIALISATIE — startpaneel
   ============================================================ */
configStartBtn.onclick = () => {
    State.lessonTitle   = cfgTitle.value.trim();
    State.lessonTeacher = cfgTeacher.value.trim();
    State.lessonLocation= cfgLocation.value.trim();

    if (!State.lessonTitle) { alert("Geef een titel in."); return; }
    if (!State.lessonTeacher) { alert("Geef lesgever(s) in."); return; }

    configPanel.style.display = "none";
    main.style.display = "block";

    lessonHeader.textContent =
        `${State.lessonTitle} – ${State.lessonTeacher}` +
        (State.lessonLocation ? ` (${State.lessonLocation})` : "");

    startBtn.classList.remove("hidden");
};


/* ============================================================
   START
   ============================================================ */
startBtn.onclick = () => {
    startBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
    noteInput.classList.remove("hidden");
    noteBtn.classList.remove("hidden");

    startTimer();
    logStart();
};


/* ============================================================
   PAUZE
   ============================================================ */
pauseBtn.onclick = () => {
    togglePause();
    pauseBtn.textContent = State.running ? "Pauze" : "▶ Hervatten";
};


/* ============================================================
   STOP
   ============================================================ */
stopBtn.onclick = () => {
    stopTimer();
    logStop();

    exportSection.style.display = "block";
};


/* ============================================================
   RESET
   ============================================================ */
resetBtn.onclick = () => {
    if (confirm("Alles wissen en opnieuw beginnen?")) {
        resetTimer();
        location.reload();
    }
};


/* ============================================================
   NOTITIES
   ============================================================ */
noteInput.addEventListener("input", () => {
    if (noteInput.value.trim().length > 0 && !State.typingStarted && State.running) {
        State.noteStartTime = Date.now();
        State.typingStarted = true;
    }
});

noteBtn.onclick = () => {
    const txt = noteInput.value.trim();
    if (!txt) return;

    const t = State.typingStarted
        ? (State.noteStartTime - State.startTime)
        : State.totalElapsed;

    logNote(txt, t);

    State.typingStarted = false;
    State.noteStartTime = null;
    noteInput.value = "";
};


/* ============================================================
   EXPORT SYSTEM
   ============================================================ */
initClipboardExport();
initDownloadExport();


/* ============================================================
   HOOFD TICK LOOP
   ============================================================ */
setInterval(() => {
    tick();                // tijd bijwerken
    updateCategoryUI();    // percentages, tijden, fills
    updateTimelineUI();    // segmenten + lesdelen
    totalDisplay.textContent = fmt(State.totalElapsed);
}, 200);


/* ============================================================
   CATEGORIEKNOPPEN
   ============================================================ */
initCategoryButtons();
updateActiveButton(State.activeCat);
