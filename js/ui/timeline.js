/*-+  (melding genegeerd) */

import { state } from "../core/state.js";

export function setupTimelineRendering() {
  // Init: niets te doen, rendering gebeurt live in updateTick
}

export function addTimelineSegment(catIndex, durationMs) {
  if (durationMs < 200) return; // Te kort → negeren (vermijdt ruis)

  state.timelineSegments.push({
    cat: catIndex,
    duration: durationMs
  });

  renderTimeline();
}

export function renderTimeline() {
  const bar = document.getElementById("timeline");
  if (!bar) return;

  bar.innerHTML = "";

  const total = state.timelineSegments.reduce((a, s) => a + s.duration, 0) || 1;

  state.timelineSegments.forEach(seg => {
    const div = document.createElement("div");
    div.className = "seg";
    div.style.background = getColor(seg.cat);
    div.style.width = (seg.duration / total * 100) + "%";
    bar.appendChild(div);
  });
}

function getColor(i) {
  return ["#ff9800", "#b39ddb", "#66bb6a", "#9e9e9e"][i];
}
