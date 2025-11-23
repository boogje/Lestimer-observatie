/* ============================================================
   TIMER ENGINE — tijdregistratie & categorie-wissels
   ============================================================ */

import { State, fmt } from "./state.js";

/* ============================================================
   START TIMER
   ============================================================ */
export function startTimer() {
    State.running = true;
    State.startTime = Date.now();
    State.lastSwitch = Date.now();
    State.totalElapsed = 0;

    // Eerste segment starten
    State.timelineSegments.push({
        start: 0,
        end: null,
        cat: State.activeCat
    });

    // Eerste lesdeel starten
    State.currentPart = {
        start: 0,
        end: null,
        label: ""   // wordt later benoemd
    };
    State.lessonParts.push(State.currentPart);
}


/* ============================================================
   PAUZEER / HERVAT
   ============================================================ */
export function togglePause() {
    if (State.running) {
        State.running = false;
    } else {
        State.running = true;
        State.lastSwitch = Date.now();
    }
}


/* ============================================================
   TICK — wordt meerdere keren per seconde aangeroepen
   ============================================================ */
export function tick() {
    if (!State.running) return;

    const now = Date.now();
    const elapsed = now - State.lastSwitch;

    // Update huidige categorie en totalen
    State.accum[State.activeCat] += elapsed;
    State.totalElapsed += elapsed;

    State.lastSwitch = now;
}


/* ============================================================
   WISSEL VAN CATEGORIE
   ============================================================ */
export function switchCategory(newCat) {
    if (!State.running) return;

    const now = Date.now();
    const elapsed = now - State.lastSwitch;

    // Vorige categorie afronden
    State.accum[State.activeCat] += elapsed;
    State.totalElapsed += elapsed;

    const lastSeg = State.timelineSegments[State.timelineSegments.length - 1];
    lastSeg.end = State.totalElapsed;

    // Nieuwe segment starten
    State.timelineSegments.push({
        start: State.totalElapsed,
        end: null,
        cat: newCat
    });

    // Switch
    State.activeCat = newCat;
    State.lastSwitch = now;

    return elapsed; // nodig voor log: duur vorige segment
}


/* ============================================================
   STOP TIMER
   ============================================================ */
export function stopTimer() {
    if (!State.running) return;

    tick();
    State.running = false;

    // Eindsegment afsluiten
    const lastSeg = State.timelineSegments[State.timelineSegments.length - 1];
    lastSeg.end = State.totalElapsed;

    // Laatste lesdeel afronden
    if (State.currentPart) {
        State.currentPart.end = State.totalElapsed;
    }
}


/* ============================================================
   RESET ALLES
   ============================================================ */
export function resetTimer() {
    State.running = false;
    State.startTime = null;
    State.lastSwitch = null;
    State.totalElapsed = 0;

    State.accum = [0,0,0,0];
    State.activeCat = 0;

    State.timelineSegments = [];
    State.lessonParts = [];
    State.currentPart = null;

    State.noteStartTime = null;
    State.typingStarted = false;
}
