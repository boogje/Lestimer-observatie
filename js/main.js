// js/main.js

import { categories } from './config.js';
import { buildCategories, updateDisplay, initButtons } from './ui.js';
import { addSegment, closeLastSegment, rebuildTimeline } from './timeline.js';
import { initNotes } from './notes.js';
import { formatTime, addLog } from './helpers.js';

// Globale state (alleen hier gedeeld)
window.state = {
  running: false,
  startTime: null,
  lastSwitch: null,
  totalElapsed: 0,
  accum: [0, 0, 0, 0],
  active: 0,
  segments: [],
  segmentStart: null
};

// Maak categorieën globaal beschikbaar voor timeline.js
window.categories = categories;

export function initApp(categories) {
  const state = window.state;

  // 1. Bouw de categorieën op de pagina
  buildCategories(categories);

  // 2. Activeer knoppen
  initButtons(state, categories);

  // 3. Notities initialiseren
  initNotes(state);

  // 4. Categorie wissel-logica
  document.querySelectorAll('.cat').forEach(cat => {
    cat.addEventListener('click', () => {
      if (!state.running) return;

      // Sluit vorig segment af
      addSegment(state, state.active);

      // Update vorige categorie (verwijder active + kleur)
      document.querySelectorAll('.cat').forEach(c => {
        c.classList.remove('active');
        c.style.background = '#333';
      });

      // Nieuwe actieve categorie
      state.active = parseInt(cat.dataset.id);
      cat.classList.add('active');
      cat.style.background = categories[state.active].color;

      // Start nieuw segment
      state.segmentStart = Date.now();

      addLog(`→ ${categories[state.active].name}`, 'cat', state.active);
    });
  });

  // 5. Hoofd-timer (200ms update)
  setInterval(() => {
    if (!state.running) return;

    const now = Date.now();
    const elapsed = now - state.lastSwitch;
    state.accum[state.active] += elapsed;
    state.totalElapsed += elapsed;
    state.lastSwitch = now;

    updateDisplay(state, categories);
  }, 200);

  // 6. Stop-knop logica
  document.getElementById('stopBtn').onclick = () => {
    if (state.running) {
      // Stop timer
      state.running = false;
      document.getElementById('pauseBtn').textContent = 'Pauze';
    }

    // Sluit laatste segment netjes af
    closeLastSegment(state);

    addLog('Observatie beëindigd');

    // Genereer resultaat
    let result = `Observatie beëindigd – ${new Date().toLocaleString('nl-BE')}\n\n`;
    result += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\n`;

    categories.forEach((cat, i) => {
      const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
      result += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
    });

    result += `\nVolledig logboek:\n`;
    document.querySelectorAll('#log .logentry').forEach(entry => {
      result += entry.textContent + '\n';
    });

    const resultDiv = document.getElementById('result');
    resultDiv.textContent = result;
    resultDiv.style.display = 'block';
  };
}
