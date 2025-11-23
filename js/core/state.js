/*-+  (melding genegeerd) */

export const state = {
  lessonTitle: "",
  teacherName: "",
  location: "",
  running: false,
  startTime: null,
  lastSwitch: null,
  totalElapsed: 0,
  activeCategory: 0,
  accum: [0, 0, 0, 0],
  timelineSegments: [],
  logEntries: [],
  noteDraftStart: null,
  typingStarted: false
};

export function initState() {
  state.lessonTitle = "";
  state.teacherName = "";
  state.location = "";
  state.running = false;
  state.startTime = null;
  state.lastSwitch = null;
  state.totalElapsed = 0;
  state.activeCategory = 0;
  state.accum = [0, 0, 0, 0];
  state.timelineSegments = [];
  state.logEntries = [];
  state.noteDraftStart = null;
  state.typingStarted = false;
}
