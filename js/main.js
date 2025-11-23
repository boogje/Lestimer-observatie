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
  currentSection: 0
};

window.categories = categories;

let lastSegmentDuration = 0;

export function initApp() {
  const state = window.state;

  document.getElementById('startObservationBtn').onclick = () => {
    state.info = {
      subject: document.getElementById('subject').value.trim() || "Onbekend onderwerp",
      teacher: document.getElementById('teacher').value.trim() || "Onbekende lesgever",
      group:   document.getElementById('group').value.trim()   || "Onbekende groep"
    };

    document.getElementById('pageTitle').textContent = state.info.subject;
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('timerScreen').classList.remove('hidden');

    buildCategories(categories);
    state.running = true;
    state.lastSwitch = state.segmentStart = Date.now();

    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');
    document.getElementById('noteInput').classList.remove('hidden');
    document.getElementById('noteBtn').classList.remove('hidden');

    document.querySelector('.cat').style.background = categories[0].color;

    // Intro info zonder timestamp
    addLog(`Lesonderwerp: ${state.info.subject}`, 'info');
    addLog(`Lesgever: ${state.info.teacher}`, 'info');
    addLog(`Doelgroep: ${state.info.group}`, 'info');
    addLog('Observatie gestart', 'start');
  };

  // Categorie wissel
  document.addEventListener('click', e => {
    const cat = e.target.closest('.cat');
    if (!cat || !state.running) return;

    // Duur van vorige segment
    lastSegmentDuration = Date.now() - state.segmentStart;

    addSegment(state, state.active);

    // Nieuw lesdeel bij Instructie & uitleg
    if (state.active === 1 && parseInt(cat.dataset.id) !== 1) {
      state.currentSection++;
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'log-section';
      sectionDiv.textContent = `Lesdeel ${state.currentSection}`;
      document.getElementById('log').appendChild(sectionDiv);
    }

    document.querySelectorAll('.cat').forEach(c => {
      c.classList.remove('active');
      c.style.background = '#333';
    });

    state.active = +cat.dataset.id;
    cat.classList.add('active');
    cat.style.background = categories[state.active].color;
    state.segmentStart = Date.now();

    const durationText = lastSegmentDuration > 1000 ? ` (${formatTime(lastSegmentDuration)})` : '';
    const entry = document.createElement('div');
    entry.className = 'logentry log-sub log-cat' + state.active;
    entry.textContent = `[${formatTime(state.totalElapsed)}] → ${categories[state.active].name}${durationText}`;
    document.getElementById('log').appendChild(entry);
    entry.scrollIntoView({ behavior: 'smooth' });
  });

  // Timer
  setInterval(() => {
    if (!state.running) return;
    const now = Date.now();
    const elapsed = now - state.lastSwitch;
    state.accum[state.active] += elapsed;
    state.totalElapsed += elapsed;
    state.lastSwitch = now;
    updateDisplay(state);
  }, 200);

  // Pauze
  document.getElementById('pauseBtn').onclick = () => {
    state.running = !state.running;
    document.getElementById('pauseBtn').textContent = state.running ? 'Pauze' : 'Hervatten';
    if (state.running) state.lastSwitch = Date.now();
    addLog(state.running ? '→ Hervat' : '→ Gepauzeerd', 'note');
  };

  // Notitie (met dubbele inspring)
  window.addNoteToLog = (text) => {
    const entry = document.createElement('div');
    entry.className = 'logentry log-note';
    entry.textContent = `→ ${text}`;
    document.getElementById('log').appendChild(entry);
    entry.scrollIntoView({ behavior: 'smooth' });
  };

  // Stop
  document.getElementById('stopBtn').onclick = () => {
    state.running = false;
    closeLastSegment(state);
    addLog('Observatie beëindigd');

    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');

    // Rapport genereren
    let rapport = `SPORTLES OBSERVATIE\n${'='.repeat(50)}\n\n`;
    rapport += `Lesonderwerp: ${state.info.subject}\n`;
    rapport += `Lesgever:     ${state.info.teacher}\n`;
    rapport += `Doelgroep:    ${state.info.group}\n`;
    rapport += `Datum:        ${new Date().toLocaleDateString('nl-BE')}\n\n`;
    rapport += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\n`;
    rapport += `TIJDVERDELING\n${'-'.repeat(30)}\n`;

    categories.forEach((cat, i) => {
      const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
      rapport += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
    });

    rapport += `\nVOLLEDIG LOGBOEK\n${'-'.repeat(30)}\n`;
    document.querySelectorAll('#log .logentry').forEach(e => {
      let text = e.textContent;
      if (e.classList.contains('log-note')) text = '    ' + text;
      if (e.classList.contains('log-sub')) text = '  ' + text;
      if (e.classList.contains('log-section')) text = '\n' + text.toUpperCase();
      rapport += text + '\n';
    });

    const div = document.getElementById('result');
    div.textContent = rapport;
    div.style.display = 'block';

    // Kopiëren naar klembord
    navigator.clipboard.writeText(rapport).then(() => {
      alert('Rapport automatisch gekopieerd naar klembord!');
    });
  };

  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Nieuwe observatie starten?')) location.reload();
  };

  initNotes(state);
}
