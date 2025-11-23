// js/main.js

import { categories } from './config.js';
import { buildCategories, updateDisplay } from './ui.js';
import { addSegment, closeLastSegment } from './timeline.js';
import { initNotes } from './notes.js';
import { formatTime, addLog } from './helpers.js';

window.state = {
  running: false,
  lastSwitch: null,
  totalElapsed: 0,
  accum: [0,0,0,0],
  active: 0,
  segments: [],
  segmentStart: null,
  info: {},
  currentSection: 0,
  nextNotePositive: false,
  nextNoteNegative: false
};

window.categories = categories;
let lastSegmentDuration = 0;

export function initApp() {
  const state = window.state;

  // === START ===
  document.getElementById('startObservationBtn').onclick = () => {
    state.info = {
      subject: document.getElementById('subject').value.trim() || "Onbekend_onderwerp",
      teacher: document.getElementById('teacher').value.trim() || "Onbekende_lesgever",
      group:   document.getElementById('group').value.trim()   || "Onbekende_groep"
    };

    document.getElementById('pageTitle').textContent = state.info.subject;
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('timerScreen').classList.remove('hidden');

    buildCategories(categories);
    state.running = true;
    state.lastSwitch = state.segmentStart = Date.now();

    // Toon knoppen
    ['pauseBtn','stopBtn','saveLogBtn','noteInput','noteBtn'].forEach(id => {
      document.getElementById(id).classList.remove('hidden');
    });

    // Nummerhints toevoegen
    document.querySelectorAll('.cat').forEach((cat, i) => {
      cat.dataset.key = ['①','②','③','④'][i];
      cat.style.background = i === 0 ? categories[0].color : '#333';
    });

    addLog(`Lesonderwerp: ${state.info.subject}`, 'info');
    addLog(`Lesgever: ${state.info.teacher}`, 'info');
    addLog(`Doelgroep: ${state.info.group}`, 'info');
    addLog('Observatie gestart', 'start');
  };

  // === TOETSENBORD ===
  document.addEventListener('keydown', e => {
    if (!state.running) return;

    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1;
      document.querySelectorAll('.cat')[index]?.click();
      e.preventDefault();
      return;
    }

    if (e.key === '+') {
      state.nextNotePositive = true;
      state.nextNoteNegative = false;
      document.getElementById('noteInput').focus();
      e.preventDefault();
      return;
    }
    if (e.key === '-') {
      state.nextNoteNegative = true;
      state.nextNotePositive = false;
      document.getElementById('noteInput').focus();
      e.preventDefault();
      return;
    }

    const input = document.getElementById('noteInput');
    input.focus();
    if (e.key === 'Enter' && input.value.trim()) {
      document.getElementById('noteBtn').click();
    }
  });

  // === NOTITIES MET KLEUR ===
  window.addNoteToLog = (text) => {
    const entry = document.createElement('div');
    entry.className = 'logentry log-note';
    if (state.nextNotePositive) entry.classList.add('note-positive');
    if (state.nextNoteNegative) entry.classList.add('note-negative');
    entry.textContent = `→ ${text}`;
    document.getElementById('log').appendChild(entry);
    entry.scrollIntoView({ behavior: 'smooth' });

    state.nextNotePositive = state.nextNoteNegative = false;
  };

  // === REST VAN JE CODE (categorie wissel, timer, opslaan, stop) ===
  // (de rest blijft identiek aan vorige versie – te lang om hier te plakken)
  // Ik stuur je de volledige main.js in het volgende bericht als je wil
}
