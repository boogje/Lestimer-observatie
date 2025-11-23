// js/notes.js

import { addLog } from './helpers.js';

let noteTypingStart = null;

export function initNotes(state) {
  const noteInput = document.getElementById('noteInput');
  const noteBtn = document.getElementById('noteBtn');

  // Onthoud wanneer er voor het eerst getypt wordt
  noteInput.addEventListener('input', () => {
    if (noteInput.value.length > 0 && noteTypingStart === null && state.running) {
      noteTypingStart = state.totalElapsed;
    }
  });

  // Verzenden met knop of Enter
  const sendNote = () => {
    const text = noteInput.value.trim();
    if (!text) return;

    const timestampMs = noteTypingStart !== null ? noteTypingStart : state.totalElapsed;
    // Tijdelijk overschrijven zodat addLog de juiste lestijd gebruikt
    const originalTotal = state.totalElapsed;
    state.totalElapsed = timestampMs;
    addLog(text, 'note');
    state.totalElapsed = originalTotal;

    // Reset
    noteInput.value = '';
    noteTypingStart = null;
  };

  noteBtn.onclick = sendNote;
  noteInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendNote();
  });
}
