// js/main.js – 100% WERKEND: Checkmark/Cross + kleur + HTML-export + ①②③④

import { categories } from './config.js';
import { buildCategories, updateDisplay } from './ui.js';
import { addSegment, closeLastSegment } from './timeline.js';
import { initNotes } from './notes.js';
import { formatTime } from './helpers.js';

window.state = {
  running: false,
  lastSwitch: null,
  totalElapsed: 0,
  accum: [0,0,0,0],
  active: -1,
  segments: [],
  segmentStart: null,
  info: {},
  currentSection: 0,
  nextNotePositive: false,
  nextNoteNegative: false
};

export function initApp() {
  const state = window.state;
  const noteInput = document.getElementById('noteInput');

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

    // ①②③④ symbolen (terug!)
    document.querySelectorAll('.cat').forEach((cat, i) => {
      cat.dataset.key = ['①','②','③','④'][i];
    });

    state.running = true;
    state.lastSwitch = state.segmentStart = Date.now();

    ['pauseBtn','stopBtn','saveLogBtn','noteInput','noteBtn'].forEach(id => {
      document.getElementById(id).classList.remove('hidden');
    });

    const startTime = new Date().toLocaleString('nl-BE', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const log = document.getElementById('log');
    log.innerHTML = `
      <div class="log-title">LESOBSERVATIE</div>
      <div class="logentry info">Lesonderwerp: ${state.info.subject}</div>
      <div class="logentry info">Lesgever: ${state.info.teacher}</div>
      <div class="logentry info">Doelgroep: ${state.info.group}</div>
      <div class="logentry info">Tijdstip: observatie gestart op ${startTime}</div>
      <br>
      <div class="log-section">LESDEEL 1</div>
    `;

    // Start automatisch met Organisatie & beheer
    document.querySelector('.cat[data-id="0"]').click();
  };

  // === TOETSENBORD ===
  document.addEventListener('keydown', e => {
    if (!state.running) return;
    if (e.key >= '1' && e.key <= '4') { document.querySelectorAll('.cat')[e.key-1]?.click(); e.preventDefault(); return; }
    if (e.key === '+') { state.nextNotePositive = !state.nextNotePositive; state.nextNoteNegative = false; noteInput.classList.toggle('green-mode', state.nextNotePositive); noteInput.classList.remove('red-mode'); }
    if (e.key === '-') { state.nextNoteNegative = !state.nextNoteNegative; state.nextNotePositive = false; noteInput.classList.toggle('red-mode', state.nextNoteNegative); noteInput.classList.remove('green-mode'); }
    noteInput.focus();
    if (e.key === 'Enter' && noteInput.value.trim()) document.getElementById('noteBtn').click();
  });

  // === NOTITIES – Checkmark EN Cross + KLEUR ===
  window.addNoteToLog = (text) => {
    const entry = document.createElement('div');
    entry.className = 'logentry log-note';

    if (state.nextNotePositive) {
      entry.innerHTML = `<span class="time">[${formatTime(state.totalElapsed)}]</span> <span style="color:#66bb6a; font-weight:bold">Checkmark</span> ${text.trim()}`;
    } else if (state.nextNoteNegative) {
      entry.innerHTML = `<span class="time">[${formatTime(state.totalElapsed)}]</span> <span style="color:#ef5350; font-weight:bold">Cross</span> ${text.trim()}`;
    } else {
      entry.innerHTML = `<span class="time">[${formatTime(state.totalElapsed)}]</span> Arrow Right  ${text.trim()}`;
    }

    document.getElementById('log').appendChild(entry);
    entry.scrollIntoView({behavior:'smooth'});

    state.nextNotePositive = state.nextNoteNegative = false;
    noteInput.classList.remove('green-mode','red-mode');
    noteInput.value = '';
  };

  // === CATEGORIE WISSEL ===
  document.addEventListener('click', e => {
    const cat = e.target.closest('.cat');
    if (!cat || !state.running) return;

    const now = Date.now();
    const duration = state.segmentStart ? now - state.segmentStart : 0;
    if (state.active >= 0) state.accum[state.active] += duration;

    const newCatId = +cat.dataset.id;

    if ([0,1].includes(newCatId) && state.active >= 0 && ![0,1].includes(state.active)) {
      state.currentSection++;
      const div = document.createElement('div');
      div.className = 'log-section';
      div.textContent = `LESDEEL ${state.currentSection}`;
      document.getElementById('log').appendChild(div);
    }

    document.querySelectorAll('.cat').forEach(c => {
      c.classList.remove('active'); c.style.background = '#333';
    });
    cat.classList.add('active');
    cat.style.background = categories[newCatId].color;

    state.active = newCatId;
    state.segmentStart = now;

    const entry = document.createElement('div');
    entry.className = `logentry log-sub log-cat${newCatId}`;
    entry.style.background = categories[newCatId].color + '44';
    entry.innerHTML = `<span class="time">[${formatTime(state.totalElapsed + duration)}]</span> Arrow Right  ${categories[newCatId].name} ${duration>1000?`(${formatTime(duration)})`:''}`;
    document.getElementById('log').appendChild(entry);
    entry.scrollIntoView({behavior:'smooth'});
  });

  // === TIMER ===
  setInterval(() => {
    if (!state.running) return;
    const now = Date.now();
    const elapsed = now - state.lastSwitch;
    state.totalElapsed += elapsed;
    state.lastSwitch = now;
    updateDisplay(state);
  }, 200);

  // === EXPORT ALS PRACHTIG HTML (opent in Word!) ===
  document.getElementById('saveLogBtn').onclick = () => {
    const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <title>Lesobservatie - ${state.info.subject}</title>
  <style>
    body { font-family: Calibri, Arial; background: #111; color: #ddd; padding: 40px; line-height: 1.6; }
    .title { font-size: 28px; color: #4caf50; text-align: center; font-weight: bold; margin-bottom: 30px; }
    .info { margin: 8px 0; padding-left: 20px; }
    .section { font-size: 20px; color: #4caf50; font-weight: bold; margin: 30px 0 15px; text-transform: uppercase; }
    .cat0 { background: rgba(255,152,0,0.3); padding: 8px; border-radius: 6px; margin: 6px 0; }
    .cat1 { background: rgba(186,104,200,0.4); padding: 8px; border-radius: 6px; margin: 6px 0; }
    .cat2 { background: rgba(102,187,106,0.3); padding: 8px; border-radius: 6px; margin: 6px 0; }
    .cat3 { background: rgba(158,158,158,0.3); padding: 8px; border-radius: 6px; margin: 6px 0; }
    .note { padding-left: 40px; margin: 6px 0; }
    .time { color: #888; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="title">LESOBSERVATIE</div>
  <div class="info">Lesonderwerp: ${state.info.subject}</div>
  <div class="info">Lesgever: ${state.info.teacher}</div>
  <div class="info">Doelgroep: ${state.info.group}</div>
  <div class="info">Datum: ${new Date().toLocaleDateString('nl-BE')}</div>
  <br>
  <div class="section">Tijdverdeling</div>
  ${categories.map((c,i) => {
    const perc = state.totalElapsed ? (state.accum[i]/state.totalElapsed*100).toFixed(1) : 0;
    return `<div>• ${c.name}: ${formatTime(state.accum[i])} (${perc}%)</div>`;
  }).join('')}
  <br>
  <div class="section">Logboek</div>
  ${document.getElementById('log').innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.info.subject} - ${state.info.teacher}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pauze, stop, reset
  document.getElementById('pauseBtn').onclick = () => {
    state.running = !state.running;
    document.getElementById('pauseBtn').textContent = state.running ? 'Pauze' : 'Hervatten';
    if (state.running) state.lastSwitch = Date.now();
  };

  document.getElementById('stopBtn').onclick = () => {
    state.running = false;
    closeLastSegment(state);
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');
  };

  document.getElementById('resetBtn').onclick = () => confirm('Nieuwe observatie?') && location.reload();

  initNotes(state);
}
