// js/main.js – DEFINITIEVE VERSIE MET ALLE FUNCTIES

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

  // === START OBSERVATIE ===
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

    // Voeg nummerhints toe: ① ② ③ ④
    document.querySelectorAll('.cat').forEach((cat, i) => {
      cat.dataset.key = ['①','②','③','④'][i];
      if (i === 0) cat.style.background = categories[0].color;
    });

    state.running = true;
    state.lastSwitch = state.segmentStart = Date.now();

    ['pauseBtn','stopBtn','saveLogBtn','noteInput','noteBtn'].forEach(id => {
      document.getElementById(id).classList.remove('hidden');
    });

    addLog(`Lesonderwerp: ${state.info.subject}`, 'info');
    addLog(`Lesgever: ${state.info.teacher}`, 'info');
    addLog(`Doelgroep: ${state.info.group}`, 'info');
    addLog('Observatie gestart', 'start');
  };

  // === TOETSENBORD BESTURING ===
  document.addEventListener('keydown', e => {
    if (!state.running) return;

    // Categorieën 1-4
    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1;
      document.querySelectorAll('.cat')[index]?.click();
      e.preventDefault();
      return;
    }

    // + = groen, - = rood
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

    // Elke andere toets → focus op notitieveld
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

  // === CATEGORIE WISSEL ===
  document.addEventListener('click', e => {
    const cat = e.target.closest('.cat');
    if (!cat || !state.running) return;

    lastSegmentDuration = Date.now() - state.segmentStart;
    addSegment(state, state.active);

    // Nieuw lesdeel bij start Instructie & uitleg (categorie 1)
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

  // === TIMER LOOP ===
  setInterval(() => {
    if (!state.running) return;
    const now = Date.now();
    const elapsed = now - state.lastSwitch;
    state.accum[state.active] += elapsed;
    state.totalElapsed += elapsed;
    state.lastSwitch = now;
    updateDisplay(state);
  }, 200);

  // === PAUZE ===
  document.getElementById('pauseBtn').onclick = () => {
    state.running = !state.running;
    document.getElementById('pauseBtn').textContent = state.running ? 'Pauze' : 'Hervatten';
    if (state.running) state.lastSwitch = Date.now();
    addLog(state.running ? '→ Hervat' : '→ Gepauzeerd', 'note');
  };

  // === OPSLAAN ALS .TXT ===
  document.getElementById('saveLogBtn').onclick = () => {
    let content = `SPORTLES OBSERVATIE – ${new Date().toLocaleDateString('nl-BE')}\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `Lesonderwerp: ${state.info.subject}\n`;
    content += `Lesgever:     ${state.info.teacher}\n`;
    content += `Doelgroep:    ${state.info.group}\n\n`;
    content += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\n`;
    content += `TIJDVERDELING\n${'-'.repeat(30)}\n`;
    categories.forEach((cat, i) => {
      const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
      content += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
    });
    content += `\nLOGBOEK\n${'-'.repeat(30)}\n`;
    document.querySelectorAll('#log > div').forEach(el => {
      let line = el.textContent || '';
      if (el.classList.contains('log-note')) line = '    ' + line;
      if (el.classList.contains('log-sub')) line = '  ' + line;
      if (el.classList.contains('log-section')) line = '\n' + line.toUpperCase();
      content += line + '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.info.subject} - ${state.info.teacher} - ${state.info.group}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // === STOP & RESULTATEN ===
  document.getElementById('stopBtn').onclick = () => {
    state.running = false;
    closeLastSegment(state);
    addLog('Observatie beëindigd');

    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');
  };

  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Nieuwe observatie starten?')) location.reload();
  };

  initNotes(state);
}
