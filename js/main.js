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

  // === START OBSERVATIE ===
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

    document.getElementById('pauseBtn').classList.remove('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');
    document.getElementById('saveLogBtn').classList.remove('hidden');
    document.getElementById('noteInput').classList.remove('hidden');
    document.getElementById('noteBtn').classList.remove('hidden');

    document.querySelector('.cat').style.background = categories[0].color;

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
      if (index < categories.length) {
        document.querySelectorAll('.cat')[index].click();
      }
      e.preventDefault();
      return;
    }

    // Elke andere toets → focus op notitieveld
    if (e.key.length === 1 || e.key === 'Enter') {
      const input = document.getElementById('noteInput');
      input.focus();
      if (e.key === 'Enter' && input.value.trim()) {
        document.getElementById('noteBtn').click();
      }
    }
  });

  // === CATEGORIE WISSEL ===
  document.addEventListener('click', e => {
    const cat = e.target.closest('.cat');
    if (!cat || !state.running) return;

    lastSegmentDuration = Date.now() - state.segmentStart;
    addSegment(state, state.active);

    // Nieuw lesdeel bij start Instructie & uitleg
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

  // === TIMER ===
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
    let content = `SPORTLES OBSERVATIE\n${'='.repeat(50)}\n\n`;
    content += `Lesonderwerp: ${state.info.subject}\n`;
    content += `Lesgever:     ${state.info.teacher}\n`;
    content += `Doelgroep:    ${state.info.group}\n`;
    content += `Datum:        ${new Date().toLocaleDateString('nl-BE')}\n\n`;
    content += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\n`;
    content += `TIJDVERDELING\n${'-'.repeat(30)}\n`;

    categories.forEach((cat, i) => {
      const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
      content += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
    });

    content += `\nVOLLEDIG LOGBOEK\n${'-'.repeat(30)}\n`;
    document.querySelectorAll('#log .logentry').forEach(e => {
      let text = e.textContent;
      if (e.classList.contains('log-note')) text = '    ' + text;
      if (e.classList.contains('log-sub')) text = '  ' + text;
      if (e.classList.contains('log-section')) text = '\n' + text.toUpperCase();
      content += text + '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeSubject = state.info.subject.replace(/[^a-zA-Z0-9 -]/g, '');
    const safeTeacher = state.info.teacher.replace(/[^a-zA-Z0-9 -]/g, '');
    const safeGroup = state.info.group.replace(/[^a-zA-Z0-9 -]/g, '');
    a.download = `${safeSubject} - ${safeTeacher} - ${safeGroup}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // === STOP ===
  document.getElementById('stopBtn').onclick = () => {
    state.running = false;
    closeLastSegment(state);
    addLog('Observatie beëindigd');

    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');

    // Rapport in resultaatvenster
    const rapport = document.getElementById('result');
    rapport.style.display = 'block';
    rapport.textContent = "Rapport is gegenereerd – gebruik 'Opslaan als .txt' of kopieer uit logboek.";

    navigator.clipboard.writeText(rapport.textContent).then(() => {
      setTimeout(() => alert('Logboek automatisch gekopieerd naar klembord!'), 300);
    });
  };

  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Nieuwe observatie starten?')) location.reload();
  };

  initNotes(state);
}
