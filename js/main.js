// js/main.js – 100% WERKEND MET Checkmark/✗, KLEUR, EN AUTO-START ORGANISATIE

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

    // Nummerhints
    document.querySelectorAll('.cat').forEach((cat, i) => {
      cat.dataset.key = ['One','Two','Three','Four'][i];
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
    log.innerHTML = '';

    // Hoofdtitel + info
    const title = document.createElement('div');
    title.className = 'log-title';
    title.textContent = 'LESOBSERVATIE';
    log.appendChild(title);

    ['Lesonderwerp', 'Lesgever', 'Doelgroep', `Tijdstip: observatie gestart op ${startTime}`].forEach((txt, i) => {
      const line = i < 3 ? `${['Lesonderwerp', 'Lesgever', 'Doelgroep'][i]}: ${state.info[['subject','teacher','group'][i]]}` : txt;
      const div = document.createElement('div');
      div.className = 'logentry info';
      div.textContent = line;
      log.appendChild(div);
    });

    log.appendChild(document.createElement('br'));

    // LESDEEL 1
    state.currentSection = 1;
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'log-section';
    sectionDiv.textContent = 'LESDEEL 1';
    log.appendChild(sectionDiv);

    // AUTOMATISCH STARTEN MET "Organisatie & beheer" (categorie 0)
    state.active = 0;
    document.querySelectorAll('.cat').forEach(c => {
      c.classList.remove('active');
      c.style.background = '#333';
    });
    const firstCat = document.querySelector('.cat[data-id="0"]');
    firstCat.classList.add('active');
    firstCat.style.background = categories[0].color;

    // Eerste logregel met timestamp
    const firstEntry = document.createElement('div');
    firstEntry.className = 'logentry log-sub log-cat0';
    firstEntry.textContent = `[${formatTime(0)}] → ${categories[0].name}`;
    log.appendChild(firstEntry);
  };

  // === TOETSENBORD – MET ANNULEREN ===
  document.addEventListener('keydown', e => {
    if (!state.running) return;

    if (e.key >= '1' && e.key <= '4') {
      const index = parseInt(e.key) - 1;
      document.querySelectorAll('.cat')[index]?.click();
      e.preventDefault();
      return;
    }

    if (e.key === '+' || e.key === '-') {
      if (e.key === '+') {
        if (state.nextNotePositive) {
          state.nextNotePositive = state.nextNoteNegative = false;
          noteInput.classList.remove('green-mode', 'red-mode');
          noteInput.placeholder = "Typ notitie… (groen geannuleerd)";
        } else {
          state.nextNotePositive = true;
          state.nextNoteNegative = false;
          noteInput.classList.remove('red-mode');
          noteInput.classList.add('green-mode');
          noteInput.placeholder = "Typ notitie… (groen actief – druk nogmaals + om te annuleren)";
        }
      }

      if (e.key === '-') {
        if (state.nextNoteNegative) {
          state.nextNotePositive = state.nextNoteNegative = false;
          noteInput.classList.remove('green-mode', 'red-mode');
          noteInput.placeholder = "Typ notitie… (rood geannuleerd)";
        } else {
          state.nextNoteNegative = true;
          state.nextNotePositive = false;
          noteInput.classList.remove('green-mode');
          noteInput.classList.add('red-mode');
          noteInput.placeholder = "Typ notitie… (rood actief – druk nogmaals - om te annuleren)";
        }
      }

      setTimeout(() => {
        if (!state.nextNotePositive && !state.nextNoteNegative) {
          noteInput.placeholder = "Typ notitie… (+ groen / - rood)";
        }
      }, 2000);

      noteInput.focus();
      e.preventDefault();
      return;
    }

    noteInput.focus();
    if (e.key === 'Enter' && noteInput.value.trim()) {
      document.getElementById('noteBtn').click();
    }
  });

  // === NOTITIES – NU MET CORRECTE KLEUR EN SYMBOOL ===
  window.addNoteToLog = (text) => {
    const entry = document.createElement('div');
    entry.className = 'logentry log-note';

    let prefix = '→ ';
    if (state.nextNotePositive) {
      prefix = 'Checkmark  ';
      entry.classList.add('note-positive');   // groen + vet
    }
    if (state.nextNoteNegative) {
      prefix = '✗  ';
      entry.classList.add('note-negative');   // rood + vet
    }

    const currentTime = formatTime(state.totalElapsed);
    entry.textContent = `[${currentTime}] ${prefix}${text.trim()}`;

    document.getElementById('log').appendChild(entry);
    entry.scrollIntoView({ behavior: 'smooth' });

    // Reset
    state.nextNotePositive = state.nextNoteNegative = false;
    noteInput.classList.remove('green-mode', 'red-mode');
    noteInput.value = '';
    noteInput.placeholder = "Typ notitie… (+ groen / - rood)";
  };

  // === CATEGORIE WISSEL ===
  document.addEventListener('click', e => {
    const cat = e.target.closest('.cat');
    if (!cat || !state.running) return;

    lastSegmentDuration = Date.now() - state.segmentStart;
    addSegment(state, state.active);

    const newCatId = +cat.dataset.id;

    if ([0, 1].includes(newCatId) && ![0, 1].includes(state.active)) {
      state.currentSection++;
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'log-section';
      sectionDiv.textContent = `LESDEEL ${state.currentSection}`;
      document.getElementById('log').appendChild(sectionDiv);
    }

    document.querySelectorAll('.cat').forEach(c => {
      c.classList.remove('active');
      c.style.background = '#333';
    });

    state.active = newCatId;
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

  // === TIMER, OPSLAAN, STOP – blijven werken ===
  setInterval(() => {
    if (!state.running) return;
    const now = Date.now();
    const elapsed = now - state.lastSwitch;
    state.accum[state.active] += elapsed;
    state.totalElapsed += elapsed;
    state.lastSwitch = now;
    updateDisplay(state);
  }, 200);

  document.getElementById('pauseBtn').onclick = () => {
    state.running = !state.running;
    document.getElementById('pauseBtn').textContent = state.running ? 'Pauze' : 'Hervatten';
    if (state.running) state.lastSwitch = Date.now();
  };

  document.getElementById('saveLogBtn').onclick = () => {
    let content = `LESOBSERVATIE – ${new Date().toLocaleDateString('nl-BE')}\n${'='.repeat(60)}\n\n`;
    content += `Lesonderwerp: ${state.info.subject}\nLesgever: ${state.info.teacher}\nDoelgroep: ${state.info.group}\n\n`;
    content += `Totale lestijd: ${formatTime(state.totalElapsed)}\n\nTIJDVERDELING\n${'-'.repeat(30)}\n`;
    categories.forEach((cat, i) => {
      const perc = state.totalElapsed ? (state.accum[i] / state.totalElapsed * 100).toFixed(1) : 0;
      content += `${cat.name}: ${formatTime(state.accum[i])} (${perc}%)\n`;
    });
    content += `\nLOGBOEK\n${'-'.repeat(30)}\n`;
    document.querySelectorAll('#log > div').forEach(el => {
      let line = el.textContent || '';
      if (el.classList.contains('log-note')) line = '   ' + line;
      if (el.classList.contains('log-sub')) line = '  ' + line;
      if (el.classList.contains('log-section') || el.classList.contains('log-title')) line = '\n' + line.toUpperCase();
      if (el.classList.contains('info')) line = '   ' + line;
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

  document.getElementById('stopBtn').onclick = () => {
    state.running = false;
    closeLastSegment(state);
    document.getElementById('pauseBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');
  };

  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Nieuwe observatie starten?')) location.reload();
  };

  initNotes(state);
}
