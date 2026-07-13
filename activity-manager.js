(function () {
  const STORAGE_KEY = "soft75Activities.v1";
  const MANAGED_PREFIX = "managed:";
  const DEFAULTS = Array.isArray(activities)
    ? activities.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        desc: item.desc,
        steps: Array.isArray(item.steps) ? [...item.steps] : []
      }))
    : [];
  const CATALOG = new Map(DEFAULTS.map(item => [item.id, item]));

  function loadManagerState() {
    const fallback = { added: [], deletedIds: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return fallback;
      return {
        added: Array.isArray(saved.added) ? saved.added : [],
        deletedIds: Array.isArray(saved.deletedIds) ? saved.deletedIds : []
      };
    } catch {
      return fallback;
    }
  }

  function saveManagerState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function normalizeActivity(raw) {
    const title = String(raw?.title || "").trim();
    if (!title) return null;
    return {
      id: String(raw.id || `${MANAGED_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      type: String(raw.type || "Custom").trim() || "Custom",
      title,
      desc: String(raw.desc || "Custom activity added to your tracker.").trim() || "Custom activity added to your tracker.",
      steps: Array.isArray(raw.steps)
        ? raw.steps.map(step => String(step).trim()).filter(Boolean)
        : []
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function applySavedActivities() {
    const state = loadManagerState();
    state.added = state.added.map(normalizeActivity).filter(Boolean);
    state.added.forEach(item => CATALOG.set(item.id, item));

    const deleted = new Set(state.deletedIds);
    activities.splice(0, activities.length);

    DEFAULTS.forEach(item => {
      if (!deleted.has(item.id)) activities.push({ ...item, steps: [...item.steps] });
    });

    state.added.forEach(item => {
      if (!deleted.has(item.id)) activities.push({ ...item, steps: [...item.steps] });
    });

    saveManagerState(state);
  }

  function rebuildPicker() {
    if (typeof buildActivities === "function") buildActivities();
    const select = document.getElementById("activitySelect");
    if (select && !select.querySelector('option[value="custom"]')) {
      const customOption = document.createElement("option");
      customOption.value = "custom";
      customOption.textContent = "Custom activity for this day...";
      select.appendChild(customOption);
    }
    if (typeof render === "function") render();
  }

  function ensureStyles() {
    if (document.getElementById("activityManagerStyles")) return;
    const style = document.createElement("style");
    style.id = "activityManagerStyles";
    style.textContent = `
      .activity-manager-toggle { margin-top: 10px; width: 100%; }
      .activity-manager {
        margin-top: 14px;
        padding: 16px;
        border-radius: 22px;
        border: 1px solid rgba(102, 112, 88, 0.16);
        background: rgba(255, 255, 255, 0.72);
      }
      .activity-manager[hidden] { display: none !important; }
      .activity-manager h3 { margin: 0 0 5px; }
      .activity-manager-form { display: grid; gap: 10px; margin-top: 14px; }
      .activity-manager-form textarea { min-height: 84px; }
      .activity-manager-actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .activity-manager-list { display: grid; gap: 9px; margin-top: 16px; }
      .activity-manager-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: center;
        padding: 12px;
        border-radius: 17px;
        border: 1px solid rgba(102, 112, 88, 0.14);
        background: rgba(255, 255, 255, 0.78);
      }
      .activity-manager-item strong { display: block; color: var(--green-6); }
      .activity-manager-meta { margin-top: 3px; color: var(--muted); font-size: 0.82rem; }
      .activity-delete-btn,
      .activity-restore-btn {
        min-height: 38px;
        padding: 8px 12px;
        border-radius: 999px;
        font-weight: 800;
      }
      .activity-delete-btn { color: var(--pink-text); background: var(--pink-soft); }
      .activity-restore-btn { color: var(--green-5); background: var(--green-1); }
      .activity-removed-title { margin: 18px 0 8px; color: var(--green-5); font-size: 0.78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      @media (max-width: 520px) {
        .activity-manager-item { grid-template-columns: 1fr; }
        .activity-delete-btn, .activity-restore-btn { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureManagerUi() {
    const randomButton = document.getElementById("randomActivity");
    if (!randomButton || document.getElementById("activityManager")) return;

    const toggle = document.createElement("button");
    toggle.id = "activityManagerToggle";
    toggle.className = "secondary-btn activity-manager-toggle";
    toggle.type = "button";
    toggle.textContent = "Manage activities";

    const panel = document.createElement("section");
    panel.id = "activityManager";
    panel.className = "activity-manager";
    panel.hidden = true;
    panel.innerHTML = `
      <h3>Activity Manager</h3>
      <p class="hint">Add activities to the picker, remove ones you do not use, or restore the original list later.</p>
      <div class="activity-manager-form">
        <input id="managedActivityTitle" type="text" maxlength="60" placeholder="Activity name, such as kayaking" />
        <input id="managedActivityType" type="text" maxlength="40" placeholder="Category, such as Outdoor or Cardio" />
        <textarea id="managedActivityDescription" maxlength="180" placeholder="Short description (optional)"></textarea>
        <textarea id="managedActivitySteps" maxlength="300" placeholder="Steps, one per line (optional)"></textarea>
        <div class="activity-manager-actions">
          <button class="primary-btn" id="addManagedActivity" type="button">Add activity</button>
          <button class="secondary-btn" id="restoreDefaultActivities" type="button">Restore defaults</button>
        </div>
      </div>
      <div id="activityManagerList" class="activity-manager-list"></div>
      <div id="removedActivityList"></div>
    `;

    randomButton.insertAdjacentElement("afterend", toggle);
    toggle.insertAdjacentElement("afterend", panel);

    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      toggle.textContent = panel.hidden ? "Manage activities" : "Hide activity manager";
      if (!panel.hidden) renderManagerList();
    });

    document.getElementById("addManagedActivity").addEventListener("click", addActivity);
    document.getElementById("restoreDefaultActivities").addEventListener("click", restoreDefaults);
  }

  function addActivity() {
    const title = document.getElementById("managedActivityTitle")?.value.trim();
    const type = document.getElementById("managedActivityType")?.value.trim();
    const desc = document.getElementById("managedActivityDescription")?.value.trim();
    const stepsText = document.getElementById("managedActivitySteps")?.value || "";

    if (!title) {
      if (typeof showToast === "function") showToast("Enter an activity name.");
      return;
    }

    const activity = normalizeActivity({
      title,
      type: type || "Custom",
      desc: desc || "Custom activity added to your tracker.",
      steps: stepsText.split(/\n+/).map(step => step.trim()).filter(Boolean)
    });

    const state = loadManagerState();
    state.added.push(activity);
    state.deletedIds = state.deletedIds.filter(id => id !== activity.id);
    saveManagerState(state);
    CATALOG.set(activity.id, activity);
    activities.push({ ...activity, steps: [...activity.steps] });

    ["managedActivityTitle", "managedActivityType", "managedActivityDescription", "managedActivitySteps"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    rebuildPicker();
    renderManagerList();
    if (typeof showToast === "function") showToast("Activity added");
  }

  function deleteActivity(id) {
    const activity = CATALOG.get(id);
    if (!activity) return;
    if (!confirm(`Remove “${activity.title}” from the activity picker? Previous days will keep their saved activity.`)) return;

    const state = loadManagerState();
    if (!state.deletedIds.includes(id)) state.deletedIds.push(id);
    saveManagerState(state);

    const index = activities.findIndex(item => item.id === id);
    if (index >= 0) activities.splice(index, 1);

    rebuildPicker();
    renderManagerList();
    if (typeof showToast === "function") showToast("Activity removed");
  }

  function restoreActivity(id) {
    const activity = CATALOG.get(id);
    if (!activity) return;

    const state = loadManagerState();
    state.deletedIds = state.deletedIds.filter(itemId => itemId !== id);
    saveManagerState(state);

    if (!activities.some(item => item.id === id)) activities.push({ ...activity, steps: [...activity.steps] });
    rebuildPicker();
    renderManagerList();
    if (typeof showToast === "function") showToast("Activity restored");
  }

  function restoreDefaults() {
    const defaultIds = new Set(DEFAULTS.map(item => item.id));
    const state = loadManagerState();
    state.deletedIds = state.deletedIds.filter(id => !defaultIds.has(id));
    saveManagerState(state);
    applySavedActivities();
    rebuildPicker();
    renderManagerList();
    if (typeof showToast === "function") showToast("Default activities restored");
  }

  function renderManagerList() {
    const list = document.getElementById("activityManagerList");
    const removedList = document.getElementById("removedActivityList");
    if (!list || !removedList) return;

    const state = loadManagerState();
    const deleted = new Set(state.deletedIds);
    const active = Array.from(CATALOG.values()).filter(item => !deleted.has(item.id));
    const removed = Array.from(CATALOG.values()).filter(item => deleted.has(item.id));

    list.innerHTML = active.map(item => `
      <div class="activity-manager-item">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <div class="activity-manager-meta">${escapeHtml(item.type)}${item.id.startsWith(MANAGED_PREFIX) ? " • Added" : " • Default"}</div>
        </div>
        <button class="activity-delete-btn" type="button" data-delete-activity="${escapeHtml(item.id)}">Delete</button>
      </div>
    `).join("");

    removedList.innerHTML = removed.length ? `
      <p class="activity-removed-title">Removed activities</p>
      <div class="activity-manager-list">
        ${removed.map(item => `
          <div class="activity-manager-item">
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <div class="activity-manager-meta">${escapeHtml(item.type)}</div>
            </div>
            <button class="activity-restore-btn" type="button" data-restore-activity="${escapeHtml(item.id)}">Restore</button>
          </div>
        `).join("")}
      </div>
    ` : "";

    list.querySelectorAll("[data-delete-activity]").forEach(button => {
      button.addEventListener("click", () => deleteActivity(button.dataset.deleteActivity));
    });
    removedList.querySelectorAll("[data-restore-activity]").forEach(button => {
      button.addEventListener("click", () => restoreActivity(button.dataset.restoreActivity));
    });
  }

  function installArchiveLookups() {
    if (typeof getActivityTitle === "function" && !getActivityTitle.__managerPatched) {
      const previousGetTitle = getActivityTitle;
      getActivityTitle = function (activityId) {
        const result = previousGetTitle(activityId);
        if (result !== "—") return result;
        return CATALOG.get(activityId)?.title || "—";
      };
      getActivityTitle.__managerPatched = true;
    }

    if (typeof renderActivity === "function" && !renderActivity.__managerPatched) {
      const previousRenderActivity = renderActivity;
      renderActivity = function (activityId) {
        const archived = CATALOG.get(activityId);
        const isActive = activities.some(item => item.id === activityId);
        if (archived && !isActive) {
          const type = document.getElementById("activityType");
          const title = document.getElementById("activityTitle");
          const desc = document.getElementById("activityDescription");
          const steps = document.getElementById("activitySteps");
          if (type) type.textContent = `${archived.type} • Removed`;
          if (title) title.textContent = archived.title;
          if (desc) desc.textContent = archived.desc;
          if (steps) steps.innerHTML = archived.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("");
          return;
        }
        previousRenderActivity(activityId);
      };
      renderActivity.__managerPatched = true;
    }
  }

  function bootManager() {
    applySavedActivities();
    installArchiveLookups();
    ensureStyles();
    ensureManagerUi();
    rebuildPicker();
    renderManagerList();
  }

  bootManager();
})();
