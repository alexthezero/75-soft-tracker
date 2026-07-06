(function () {
  const CUSTOM_PREFIX = "custom:";

  function encodeCustomActivity(name) {
    return `${CUSTOM_PREFIX}${encodeURIComponent(name.trim())}`;
  }

  function decodeCustomActivity(activityId) {
    if (typeof activityId !== "string" || !activityId.startsWith(CUSTOM_PREFIX)) return "";
    try {
      return decodeURIComponent(activityId.slice(CUSTOM_PREFIX.length));
    } catch {
      return activityId.slice(CUSTOM_PREFIX.length);
    }
  }

  function isCustomActivity(activityId) {
    return typeof activityId === "string" && activityId.startsWith(CUSTOM_PREFIX);
  }

  function getCustomEls() {
    return {
      select: document.getElementById("activitySelect"),
      title: document.getElementById("activityTitle"),
      type: document.getElementById("activityType"),
      desc: document.getElementById("activityDescription"),
      steps: document.getElementById("activitySteps"),
      card: document.getElementById("customActivityCard"),
      input: document.getElementById("customActivityInput"),
      save: document.getElementById("saveCustomActivity")
    };
  }

  function ensureCustomOption() {
    const { select } = getCustomEls();
    if (!select || select.querySelector('option[value="custom"]')) return;

    const option = document.createElement("option");
    option.value = "custom";
    option.textContent = "Custom activity...";
    select.appendChild(option);
  }

  function ensureCustomCard() {
    const { select } = getCustomEls();
    if (!select || document.getElementById("customActivityCard")) return;

    const card = document.createElement("div");
    card.className = "custom-activity-card";
    card.id = "customActivityCard";
    card.hidden = true;
    card.innerHTML = `
      <label for="customActivityInput" class="small-label">Custom activity</label>
      <div class="start-row">
        <input id="customActivityInput" type="text" maxlength="60" placeholder="Example: kayaking, biking, pickleball" />
        <button class="primary-btn" id="saveCustomActivity" type="button">Save Activity</button>
      </div>
      <p class="hint">Use this for anything not listed. It saves to the selected day and counts as your movement.</p>
    `;

    select.insertAdjacentElement("afterend", card);
  }

  function updateCustomCardVisibility() {
    const { select, card } = getCustomEls();
    if (!select || !card) return;
    card.hidden = select.value !== "custom";
  }

  function saveCustomActivity() {
    const { input } = getCustomEls();
    const name = (input?.value || "").trim();

    if (!name) {
      if (typeof showToast === "function") showToast("Enter a custom activity.");
      return;
    }

    if (typeof updateEntry !== "function") return;

    updateEntry(entry => {
      entry.activityId = encodeCustomActivity(name);
      entry.customActivity = name;
      if (!entry.checks) entry.checks = {};
      entry.checks.movement = true;
    });
  }

  function syncCustomUiForDay() {
    const { select, card, input } = getCustomEls();
    if (!select) return;

    let customName = "";
    try {
      const state = typeof loadState === "function" ? loadState() : null;
      const entry = state?.entries?.[selectedDate];
      if (entry?.activityId && isCustomActivity(entry.activityId)) {
        customName = entry.customActivity || decodeCustomActivity(entry.activityId);
      }
    } catch {
      customName = "";
    }

    if (customName) {
      select.value = "custom";
      if (input) input.value = customName;
      if (card) card.hidden = false;
    } else {
      if (card && select.value !== "custom") card.hidden = true;
      if (input && select.value !== "custom") input.value = "";
    }
  }

  function installRenderActivityOverride() {
    if (typeof renderActivity !== "function" || renderActivity.__customActivityPatched) return;

    const originalRenderActivity = renderActivity;
    renderActivity = function (activityId) {
      if (isCustomActivity(activityId)) {
        const name = decodeCustomActivity(activityId);
        const { title, type, desc, steps } = getCustomEls();
        if (type) type.textContent = "Custom";
        if (title) title.textContent = name || "Custom activity";
        if (desc) desc.textContent = "Saved custom movement for this day.";
        if (steps) steps.innerHTML = "<li>Complete 45 minutes of this activity.</li><li>Log notes if you want more detail.</li>";
        return;
      }

      originalRenderActivity(activityId);
    };

    renderActivity.__customActivityPatched = true;
  }

  function installGetActivityTitleOverride() {
    if (typeof getActivityTitle !== "function" || getActivityTitle.__customActivityPatched) return;

    const originalGetActivityTitle = getActivityTitle;
    getActivityTitle = function (activityId) {
      if (isCustomActivity(activityId)) return decodeCustomActivity(activityId) || "Custom activity";
      return originalGetActivityTitle(activityId);
    };

    getActivityTitle.__customActivityPatched = true;
  }

  function installRenderOverride() {
    if (typeof render !== "function" || render.__customActivityPatched) return;

    const originalRender = render;
    render = function () {
      originalRender();
      ensureCustomOption();
      ensureCustomCard();
      syncCustomUiForDay();
      updateCustomCardVisibility();
    };

    render.__customActivityPatched = true;
  }

  function bootCustomActivity() {
    ensureCustomOption();
    ensureCustomCard();
    installRenderActivityOverride();
    installGetActivityTitleOverride();
    installRenderOverride();

    const { select, save, input } = getCustomEls();

    if (select && !select.__customActivityListener) {
      select.addEventListener("change", () => {
        updateCustomCardVisibility();
        if (select.value === "custom" && input) {
          setTimeout(() => input.focus(), 50);
        }
      });
      select.__customActivityListener = true;
    }

    if (save && !save.__customActivityListener) {
      save.addEventListener("click", saveCustomActivity);
      save.__customActivityListener = true;
    }

    if (input && !input.__customActivityListener) {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") saveCustomActivity();
      });
      input.__customActivityListener = true;
    }

    syncCustomUiForDay();
    updateCustomCardVisibility();
  }

  bootCustomActivity();
})();
