// js/main.js

import { categories } from './config.js';
import { buildCategories, updateDisplay, initButtons } from './ui.js';
import { addSegment, closeLastSegment, rebuildTimeline } from './timeline.js';
import { initNotes } from './notes.js';
import { formatTime, addLog } from './helpers.js';

window.state = {
  running: false,
  startTime: null,
  lastSwitch: null,
  totalElapsed: 0,
  accum: [0,0,0,0],
  active: 0,
  segments: [],
  segmentStart: null,
  info: {}
};

window.categories = categories;

export function initApp(categories) {
  const state = window.state;

  // Intro scherm knop
  document.getElementById('startObservationBtn').onclick = () => {
    // Info opslaan
    state.info = {
      subject: document.getElementById('subject').value.trim() || "Onbekend onderwerp",
      teacher: document.getElementById('teacher').value.trim() || "Onbekende lesgever",
      group:   document.getElementById('group').value.trim()   || "Onbekende groep"
    };

    // Titel updaten
    document.getElementById('pageTitle').textContent = state.info.subject;

    // Schakel naar timer scherm
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('timerScreen').classList.remove('hidden');

    // Bouw categorieën
    buildCategories(categories);

    // Start de timer
    state.running = true;
    state.startTime = state.lastSwitch = state.segmentStart = Date.now();

    // Toon bediening
    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');
    document.getElementById('noteInput').classList.remove('hidden');
    document.getElementById('noteBtn').classList.remove('hidden');

    // Kleur eerste categorie
    document.querySelector('.cat').style.background = categories[0].color;

    // Log start + info
    addLog('Observatie gestart', 'start');
    addLog(`Lesgever: ${state.info.teacher}`);
    addLog(`Doelgroep: ${state.info.group}`);
  };

  // Categorie wissel
  document.addEventListener('click', e => {
    if (!e.target.closest) return;
    const cat = e.target.closest('.cat');
    if (!cat || !state.running) return;

    addSegment(state, state.active);

    document.querySelectorAll('.cat').forEach(c => {
      c.classList.remove('active');
      c.style.background = '#333';
    });

    state.active = parseInt(cat.dataset.id);
    cat.classList.add('active');
    cat.style.background = categories[state.active].color;
    state.segmentStart = Date.now();

    addLog(`→ ${categories[state.active].name}`, 'cat', state.active);
  });

  // Timer loop
  setInterval(() => {
    if (!state.running) return;
    const now = Date.now();
    const elapsed = now - state.lastSwitch;
    state.accum[state.active] += elapsed;
    state.totalElapsed += elapsed;
    state.lastSwitch = now;
    updateDisplay(state, categories);
  }, 200);

  // Pauze knop
  document.getElementById('pauseBtn').onclick = () => {
    state.running = !state.running;
    document.getElementById('pauseBtn').textContent = state.running ? 'Pauze' : 'Hervatten';
    if (state.running) state.lastSwitch = Date.now();
    addLog(state.running ? 'Hervat' : 'Gepauzeerd');
  };

  // Stop knop
  document.getElementById('stopBtn').onclick = () => {
    state.running = false;
    closeLastSegment(state);
    addLog('Observatie beëindigd');

    // Toon Reset knop
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');

    // Resultaat genereren
    let result = `OBSERVATIE RAPPORT\n`;
    result += `${'='.repeat(50)}\n\n`;
    result += `Lesonderwerp: ${state.info.subject}\n`;
    result += `Lesgever:     ${state.info.teacher}\n`;
    result += `Doelgroep:    ${state.info.group}\n`;
    result += `Datum:        ${new Date().toLocaleDateString('nl-BE')}\n\n`;
    result += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\n`;

    categories.forEach((cat, i) => {
      const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
      result += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
    });

    result += `\nVolledig logboek:\n${'-'.repeat(30)}\n`;
    document.querySelectorAll('#log .logentry').forEach(e => result += e.textContent + '\n');

    document.getElementById('result').textContent = result;
    document.getElementById('result').style.display = 'block';
  };

  // Reset knop
  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Nieuwe observatie starten?')) location.reload();
  };

  // Notities
  initNotes(state);
}
