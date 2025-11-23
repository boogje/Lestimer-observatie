// js/ui.js

import { formatTime } from './helpers.js';
import { addLog } from './helpers.js';

export function buildCategories(categories) {
  const container = document.getElementById('categories-container');
  container.innerHTML = ''; // leegmaken

  categories.forEach((cat, index) => {
    const row = document.createElement('div');
    row.className = 'row';

    // Percentage box
    const percBox = document.createElement('div');
    percBox.className = 'percBox';
    percBox.id = `perc${index}`;
    percBox.textContent = '0%';

    // Categorie knop
    const catDiv = document.createElement('div');
    catDiv.className = 'cat';
    if (index === 0) catDiv.classList.add('active'); // eerste is standaard actief
    catDiv.dataset.id = index;

    // Donkere fill (voor procentuele vulling)
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.background = cat.dark;

    // Inhoud
    catDiv.innerHTML = `
      <div class="label">${cat.name}</div>
      <div class="desc">${cat.desc}</div>
      <div class="time" id="t${index}">0:00</div>
    `;

    catDiv.appendChild(fill);
    row.appendChild(percBox);
    row.appendChild(catDiv);
    container.appendChild(row);
  });
}

export function updateDisplay(state, categories) {
  // Totaal tijd
  document.getElementById('total').textContent = formatTime(state.totalElapsed);

  // Per categorie tijd + percentage + fill
  state.accum.forEach((time, i) => {
    document.getElementById(`t${i}`).textContent = formatTime(time);
    const perc = state.totalElapsed ? (time / state.totalElapsed * 100).toFixed(1) : 0;
    document.getElementById(`perc${i}`).textContent = perc + '%';
    document.querySelectorAll('.fill')[i].style.width = perc + '%';
  });
}

export function initButtons(state, categories) {
  // Start knop
  document.getElementById('startBtn').onclick = () => {
    state.running = true;
    state.startTime = state.lastSwitch = Date.now();
    state.segmentStart = Date.now();
    state.segments = [];
    document.getElementById('timeline').innerHTML = '';

    document.getElementById('startBtn').classList.add('hidden');
    document.querySelectorAll('#pauseBtn, #stopBtn, #resetBtn, #noteInput, #noteBtn')
      .forEach(el => el.classList.remove('hidden'));

    // Actieve categorie kleur zetten
    document.querySelectorAll('.cat').forEach((c, i) => {
      c.style.background = i === 0 ? categories[0].color : '#333';
    });

    addLog('Observatie gestart', 'start');
  };

  // Pauze knop
  document.getElementById('pauseBtn').onclick = () => {
    state.running = !state.running;
    document.getElementById('pauseBtn').textContent = state.running ? 'Pauze' : 'Hervatten';
    if (state.running) state.lastSwitch = Date.now();
    addLog(state.running ? 'Hervat' : 'Gepauzeerd');
  };

  // Reset knop
  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Alles wissen en opnieuw beginnen?')) location.reload();
  };
}

export { addLog };
