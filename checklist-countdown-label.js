(function () {
  function updateChecklistCountdownLabel() {
    const label = document.getElementById("dailyStatus");
    if (!label || !Array.isArray(tasks)) return;

    const state = loadState();
    const entry = getEntry(state);
    const completed = completedTaskCount(entry);
    const remaining = Math.max(tasks.length - completed, 0);

    if (remaining === 0) {
      label.textContent = "Checklist complete";
      return;
    }

    label.textContent = `${remaining} checklist item${remaining === 1 ? "" : "s"} left`;
  }

  function install() {
    if (typeof render === "function" && !render.__checklistCountdownContext) {
      const originalRender = render;
      const wrappedRender = function () {
        originalRender();
        updateChecklistCountdownLabel();
      };
      wrappedRender.__checklistCountdownContext = true;
      render = wrappedRender;
    }

    updateChecklistCountdownLabel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
