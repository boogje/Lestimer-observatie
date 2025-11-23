/* ============================================================
   STATE MANAGER — centrale opslag van alle app-variabelen
   ============================================================ */

export const State = {
    /* ───────────────────────────────────────────────
       LES-INFORMATIE
       ─────────────────────────────────────────────── */
    lessonTitle: "",
    lessonTeacher: "",
    lessonLocation: "",

    /* ───────────────────────────────────────────────
       TIJD
       ─────────────────────────────────────────────── */
    running: false,
    startTime: null,
    lastSwitch: null,
    totalElapsed: 0,

    /* ───────────────────────────────────────────────
       CATEGORIEËN
       ─────────────────────────────────────────────── */
    categories: [
        "Organisatie & beheer",
        "Instructie & uitleg",
        "Actieve leertijd",
        "Overig / pauze"
    ],
    colors: ["#ff9800", "#b39ddb", "#66bb6a", "#9e9e9e"],
    darkColors: ["#e65100", "#7e57c2", "#43a047", "#616161"],
    accum: [0, 0, 0, 0],
    activeCat: 0,

    /* ───────────────────────────────────────────────
       TIMELINE GEGEVENS
       ─────────────────────────────────────────────── */
    timelineSegments: [],   // {start, end, cat}
    lessonParts: [],        // {start, end, label}

    currentPart: null,

    /* ───────────────────────────────────────────────
       NOTITIES
       ─────────────────────────────────────────────── */
    noteStartTime: null,
    typingStarted: false
};


/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

/** Format milliseconds → m:ss of h:mm:ss */
export function fmt(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    if (m >= 60) {
        const h = Math.floor(m / 60);
        const mm = String(m % 60).padStart(2, "0");
        return `${h}:${mm}:${sec}`;
    }
    return `${m}:${sec}`;
}

/** Huidige lestijd */
export function lessonTime() {
    return fmt(State.totalElapsed);
}
