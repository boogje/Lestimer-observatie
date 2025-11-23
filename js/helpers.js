// js/helpers.js

// Formatteert milliseconden naar m:ss (of u:mm:ss als > 1 uur)
export function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, '0');
  if (m >= 60) {
    return `${Math.floor(m / 60)}:${(m % 60).toString().padStart(2, '0')}:${sec}`;
  }
  return `${m}:${sec}`;
}

// Voegt een regel toe aan het logboek
export function addLog(text, type = 'note', categoryIndex = null) {
  const log = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = 'logentry';
  
  if (type === 'cat' && categoryIndex !== null) {
    entry.classList.add(`log-cat${categoryIndex}`);
  }
  if (type === 'note') {
    entry.classList.add('note');
  }

  // Alleen bij "start" echte kloktijd, anders lestijd
  const timestamp = type === 'start'
    ? new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : formatTime(window.state.totalElapsed);

  entry.textContent = `[${timestamp}] ${text}`;
  log.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth' });
}
