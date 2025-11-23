/* ============================================================
   EXPORTER — TXT / Clipboard + tekstgenerator
   ============================================================ */

import { State, fmt } from "../core/state.js";

/* ─────────────────────────────────────────────────────────────
   SELECTORS
   ───────────────────────────────────────────────────────────── */
const copyBtn     = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");


/* ============================================================
   HOOFDFUNCTIE: Bouw volledige exporttekst
   ============================================================ */
export function generateExportText() {
    let out = "";

    /* ───────────────────────────────────────────────
       BASISINFO
       ─────────────────────────────────────────────── */
    out += `LES: ${State.lessonTitle}\n`;
    out += `LESGEVER(S): ${State.lessonTeacher}\n`;
    if (State.lessonLocation) {
        out += `LOCATIE / KLASGROEP: ${State.lessonLocation}\n`;
    }
    out += `\nTOTALE LESDUUR: ${fmt(State.totalElapsed)}\n\n`;

    /* ───────────────────────────────────────────────
       VERDELING PER CATEGORIE
       ─────────────────────────────────────────────── */
    out += `--- VERDELING PER CATEGORIE ---\n`;
    State.categories.forEach((cat, i) => {
        const p = State.totalElapsed
            ? (State.accum[i] / State.totalElapsed) * 100
            : 0;
        out += `${cat}: ${fmt(State.accum[i])} (${p.toFixed(1)}%)\n`;
    });

    /* ───────────────────────────────────────────────
       LESDELEN
       ─────────────────────────────────────────────── */
    out += `\n--- LESDELEN ---\n`;
    State.lessonParts.forEach(part => {
        const end = part.end !== null ? part.end : State.totalElapsed;
        const name = part.label ? part.label.toUpperCase() : "LESDEEL";
        out += `${name}: ${fmt(end - part.start)}\n`;
    });

    /* ───────────────────────────────────────────────
       LOGBOEK
       ─────────────────────────────────────────────── */
    out += `\n--- VOLLEDIG LOGBOEK ---\n`;

    document.querySelectorAll("#log div").forEach(div => {
        out += div.textContent + "\n";
    });

    return out;
}


/* ============================================================
   KOPIEER NAAR KLEMBORD
   ============================================================ */
export function initClipboardExport() {
    copyBtn.addEventListener("click", () => {
        const txt = generateExportText();

        navigator.clipboard.writeText(txt)
            .then(() => alert("Logboek gekopieerd naar klembord!"))
            .catch(() => alert("Kopiëren mislukt."));
    });
}


/* ============================================================
   DOWNLOAD TXT
   ============================================================ */
export function initDownloadExport() {
    downloadBtn.addEventListener("click", () => {
        const txt = generateExportText();

        const blob = new Blob([txt], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);

        const safe = State.lessonTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const filename = `observatie_${safe}.txt`;

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    });
}
