(function () {
  const STORAGE_KEY = "soft75Checklist.v1";
  const MANAGED_PREFIX = "managed-task:";

  const DEFAULTS = Array.isArray(tasks)
    ? tasks.map(item => ({
        id: item.id,
        title: item.title,
        desc: item.desc
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

  function normalizeTask(raw) {
    const title = String(raw?.title || "").trim();
    if (!title) return null;
    return {
      id: String(raw.id || `${MANAGED_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      title,
      desc: String(raw.desc || "Custom daily checklist item.").trim() || "Custom daily checklist item."
    };
  }

  function applySavedTasks() {
    const state = loadManagerState();
    state.added = state.added.map(normalizeTask).filter(Boolean);
    state.added.forEach(item => CATALOG.set(item.id, item));

    const deleted = new Set(state.deletedIds);
    tasks.splice(0, tasks.length);

    DEFAULTS.forEach(item => {
      if (!deleted.has(item.id)) tasks.push({ ...item });
    });

    state.added.forEach(item => {
      if (!deleted.has(item.id)) tasks.push({ ...item });
    });

    saveManagerState(state);
  }

  function safeBuildChecklist() {
    const container = document.getElementById("checklist");
    if (!container) return;
    container.innerHTML = "";

    tasks.forEach(task => {
      const label = document.createElement("label");
      label.className = "task";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.task = task.id;

      const textWrap = document.createElement("span");
      const title = document.createElement("strong");
      const description = document.createElement("span");
      title.textContent = task.title;
      description.textContent = task.desc;
      textWrap.append(title, description);
      label.append(checkbox, textWrap);
      container.appendChild(label);
    });
  }

  function installChecklistBuilder() {
    buildChecklist = safeBuildChecklist;
  }

  function ensureStyles() {
    if (document.getElementById("checklistManagerStyles")) return;
    const style = document.createElement("style");
    style.id = "checklistManagerStyles";
    style.textContent = `
      .checklist-manager-toggle { width: 100%; margin-top: 12px; }
      .checklist-manager {
        margin-top: 14px;
        padding: 16px;
        border-radius: 22px;
        border: 1px solid rgba(102, 112, 88, 0.16);
        background: rgba(255, 255, 255, 0.72);
      }
      .checklist-manager[hidden] { display: none !important; }
      .checklist-manager h3 { margin: 0 0 5px; color: var(--green-6); }
      .checklist-manager-form { display: grid; gap: 10px; margin-top: 14px; }
      .checklist-manager-actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .checklist-manager-list { display: grid; gap: 9px; margin-top: 16px; }
      .checklist-manager-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: center;
        padding: 12px;
        border-radius: 17px;
        border: 1px solid rgba(102, 112, 88, 0.14);
        background: rgba(255, 255, 255, 0.78);
      }
      .checklist-manager-item strong { display: block; color: var(--green-6); }
      .checklist-manager-meta { margin-top: 3px; color: var(--muted); font-size: 0.82rem; line-height: 1.35; }
      .checklist-delete-btn,
      .checklist-restore-btn {
        min-height: 38px;
        padding: 8px 12px;
        border-radius: 999px;
        font-weight: 800;
      }
      .checklist-delete-btn {
        color: var(--pink-text);
        background: var(--pink-soft);
        border: 1px solid rgba(180, 84, 77, 0.12);
      }
      .checklist-restore-btn {
        color: var(--green-5);
        background: var(--green-1);
        border: 1px solid rgba(123, 146, 103, 0.18);
      }
      @media (max-width: 520px) {
        .checklist-manager-item { grid-template-columns: 1fr; }
        .checklist-delete-btn,
        .checklist-restore-btn { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureManagerUi() {
    const checklist = document.getElementById("checklist");
    if (!checklist || document.getElementById("checklistManager")) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "secondary-btn checklist-manager-toggle";
    toggle.id = "checklistManagerToggle";
    toggle.textContent = "Manage daily checklist";
    toggle.setAttribute("aria-expanded", "false");

    const manager = document.createElement("section");
    manager.className = "checklist-manager";
    manager.id = "checklistManager";
    manager.hidden = true;
    manager.innerHTML = `
      <h3>Customize daily checklist</h3>
      <p class="hint">Add your own daily goals, remove items you do not use, or restore the original checklist anytime.</p>
      <div class="checklist-manager-form">
        <input id="newChecklistTitle" type="text" maxlength="60" placeholder="Checklist item name" />
        <textarea id="newChecklistDescription" maxlength="180" placeholder="Short description or instructions"></textarea>
        <div class="checklist-manager-actions">
          <button class="primary-btn" id="addChecklistItem" type="button">Add checklist item</button>
          <button class="ghost-btn" id="restoreChecklistDefaults" type="button">Restore all defaults</button>
        </div>
      </div>
      <div class="checklist-manager-list" id="checklistManagerList"></div>
    `;

    checklist.insertAdjacentElement("afterend", manager);
    checklist.insertAdjacentElement("afterend", toggle);

    toggle.addEventListener("click", () => {
      manager.hidden = !manager.hidden;
      toggle.setAttribute("aria-expanded", String(!manager.hidden));
      toggle.textContent = manager.hidden ? "Manage daily checklist" : "Hide checklist manager";
      if (!manager.hidden) renderManagerList();
    });

    manager.querySelector("#addChecklistItem").addEventListener("click", addChecklistItem);
    manager.querySelector("#restoreChecklistDefaults").addEventListener("click", restoreAllDefaults);
  }

  function activeIds() {
    return new Set(tasks.map(item => item.id));
  }

  function renderManagerList() {
    const list = document.getElementById("checklistManagerList");
    if (!list) return;
    const state = loadManagerState();
    const active = activeIds();
    const allItems = [...DEFAULTS, ...state.added.map(normalizeTask).filter(Boolean)];

    list.innerHTML = "";
    allItems.forEach(item => {
      const row = document.createElement("div");
      row.className = "checklist-manager-item";

      const copy = document.createElement("div");
      const title = document.createElement("strong");
      const meta = document.createElement("div");
      title.textContent = item.title;
      meta.className = "checklist-manager-meta";
      meta.textContent = item.desc;
      copy.append(title, meta);

      const button = document.createElement("button");
      button.type = "button";
      const isActive = active.has(item.id);
      button.className = isActive ? "checklist-delete-btn" : "checklist-restore-btn";
      button.textContent = isActive ? "Delete" : "Restore";
      button.addEventListener("click", () => {
        if (isActive) deleteChecklistItem(item.id);
        else restoreChecklistItem(item.id);
      });

      row.append(copy, button);
      list.appendChild(row);
    });
  }

  function refreshChecklist() {
    applySavedTasks();
    safeBuildChecklist();
    if (typeof render === "function") render();
    renderManagerList();
  }

  function addChecklistItem() {
    const titleInput = document.getElementById("newChecklistTitle");
    const descInput = document.getElementById("newChecklistDescription");
    const title = String(titleInput?.value || "").trim();
    const desc = String(descInput?.value || "").trim();

    if (!title) {
      if (typeof showToast === "function") showToast("Enter a checklist item name.");
      return;
    }

    const state = loadManagerState();
    const allNames = [...DEFAULTS, ...state.added]
      .map(item => String(item.title || "").trim().toLowerCase());
    if (allNames.includes(title.toLowerCase())) {
      if (typeof showToast === "function") showToast("That checklist item already exists.");
      return;
    }

    const item = normalizeTask({ title, desc });
    state.added.push(item);
    state.deletedIds = state.deletedIds.filter(id => id !== item.id);
    saveManagerState(state);

    if (titleInput) titleInput.value = "";
    if (descInput) descInput.value = "";
    refreshChecklist();
    if (typeof showToast === "function") showToast("Checklist item added");
  }

  function deleteChecklistItem(id) {
    const item = CATALOG.get(id) || DEFAULTS.find(task => task.id === id);
    if (!item) return;
    if (!confirm(`Remove “${item.title}” from the daily checklist? Existing saved checkmarks will be kept.`)) return;

    const state = loadManagerState();
    if (!state.deletedIds.includes(id)) state.deletedIds.push(id);
    saveManagerState(state);
    refreshChecklist();
    if (typeof showToast === "function") showToast("Checklist item removed");
  }

  function restoreChecklistItem(id) {
    const state = loadManagerState();
    state.deletedIds = state.deletedIds.filter(itemId => itemId !== id);
    saveManagerState(state);
    refreshChecklist();
    if (typeof showToast === "function") showToast("Checklist item restored");
  }

  function restoreAllDefaults() {
    if (!confirm("Restore all original daily checklist items? Your added items will stay available.")) return;
    const state = loadManagerState();
    const defaultIds = new Set(DEFAULTS.map(item => item.id));
    state.deletedIds = state.deletedIds.filter(id => !defaultIds.has(id));
    saveManagerState(state);
    refreshChecklist();
    if (typeof showToast === "function") showToast("Original checklist restored");
  }

  function bootChecklistManager() {
    installChecklistBuilder();
    applySavedTasks();
    ensureStyles();
    ensureManagerUi();
    safeBuildChecklist();
    if (typeof render === "function") render();
  }

  bootChecklistManager();
})();
