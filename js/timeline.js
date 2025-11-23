// js/timeline.js

export function addSegment(state, oldCategoryIndex) {
  if (!state.segmentStart) return;

  const duration = Date.now() - state.segmentStart;
  state.segments.push({
    cat: oldCategoryIndex,
    duration: duration
  });
  rebuildTimeline(state);
}

export function rebuildTimeline(state) {
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';

  // Als er nog geen segmenten zijn (bijv. net gestart), toon niets of een placeholder
  if (state.segments.length === 0) return;

  const total = state.segments.reduce((sum, seg) => sum + seg.duration, 0);

  state.segments.forEach(seg => {
    const div = document.createElement('div');
    div.className = 'seg';
    div.style.background = window.categories[seg.cat].color; // window.categories komt uit main.js
    div.style.width = (seg.duration / total * 100) + '%';
    tl.appendChild(div);
  });
}

// Sluit het laatste segment netjes af bij Stop
export function closeLastSegment(state) {
  if (state.segmentStart && state.running) {
    const duration = Date.now() - state.segmentStart;
    state.segments.push({
      cat: state.active,
      duration: duration
    });
    rebuildTimeline(state);
  }
}
