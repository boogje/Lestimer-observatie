import { state } from "./state.js";
import { addTimelineSegment } from "../ui/timeline.js";
import { addLogEntry } from "../ui/logger.js";
import { updateTimeDisplays } from "./timer.js";

export function setupCategorySwitching() {
  document.querySelectorAll(".cat").forEach(cat => {
    cat.addEventListener("click", () => {
      if (!state.running) return;

      const now = Date.now();
      const duration = now - state.lastSwitch;

      addTimelineSegment(state.activeCategory, duration);
      updateTimeDisplays();

      document.querySelectorAll(".cat").forEach(c => c.classList.remove("active"));
      cat.classList.add("active");

      state.activeCategory = Number(cat.dataset.id);
      state.lastSwitch = now;

      addLogEntry(`→ ${cat.querySelector(".label").textContent}`, "cat", state.activeCategory);
    });
  });
}