import { state } from "./state.js";
import { addLogEntry } from "../ui/logger.js";
import { renderTimeline } from "../ui/timeline.js";

export function setupTimerControls() {
  document.getElementById("startBtn")?.addEventListener("click", startObservation);
  document.getElementById("pauseBtn")?.addEventListener("click", togglePause);
  document.getElementById("stopBtn")?.addEventListener("click", stopObservation);

  setInterval(updateTimerTick, 200);
}

function startObservation() {
  state.running = true;
  state.startTime = Date.now();
  state.lastSwitch = Date.now();

  document.getElementById("startBtn")?.classList.add("hidden");
  document.getElementById("pauseBtn")?.classList.remove("hidden");
  document.getElementById("stopBtn")?.classList.remove("hidden");

  addLogEntry("OBSERVATIE GESTART", "start");
}

function togglePause() {
  state.running = !state.running;
  const btn = document.getElementById("pauseBtn");
  btn.textContent = state.running ? "Pauze" : "Hervatten";
  if (state.running) state.lastSwitch = Date.now();
  addLogEntry(state.running ? "HERVAT" : "GEPAUZEERD", "note");
}

function updateTimerTick() {
  if (!state.running) return;
  const now = Date.now();
  const elapsed = now - state.lastSwitch;

  state.accum[state.activeCategory] += elapsed;
  state.totalElapsed += elapsed;
  state.lastSwitch = now;

  updateTimeDisplays();
  renderTimeline();
}

export function updateTimeDisplays() {
  document.getElementById("total").textContent = formatTime(state.totalElapsed);

  state.accum.forEach((ms, i) => {
    document.getElementById("t" + i).textContent = formatTime(ms);
    const perc = state.totalElapsed ? ((ms / state.totalElapsed) * 100).toFixed(1) : 0;
    document.getElementById("p" + i).textContent = perc + "%";
    document.querySelectorAll(".fill")[i].style.width = perc + "%";
  });
}

export function stopObservation() {
  if (state.running) updateTimerTick();
  state.running = false;
  addLogEntry("OBSERVATIE BEËINDIGD", "note");

  document.getElementById("exportSection")?.classList.remove("hidden");
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return m >= 60 ? `${Math.floor(m/60)}:${(m%60).toString().padStart(2,'0')}:${sec}` : `${m}:${sec}`;
}