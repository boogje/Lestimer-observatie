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
export function addLog(text, type = 'normal') {
  const entry = document.createElement('div');
  entry.className = 'logentry';
  
  if (type === 'info') {
    entry.classList.add('info');
    entry.textContent = text;
  } else if (type === 'start') {
    entry.textContent = text;
    entry.style.color = '#66bb6a';
    entry.style.fontWeight = 'bold';
  } else {
    entry.textContent = text;
    if (type === 'note') entry.classList.add('log-note');
    if (type === 'sub') entry.classList.add('log-sub');
  }

  document.getElementById('log').appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth' });
}
