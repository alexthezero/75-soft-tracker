const TOTAL_DAYS = 75;
const WATER_GOAL_ML = 3000;
const STORAGE_KEY = "soft75Tracker.v1";

const tasks = [
  {
    id: "movement",
    title: "45-minute movement",
    desc: "Walk, stretch, do bodyweight work, stairs, yard work, or another no-gym activity."
  },
  {
    id: "water",
    title: "Drink 3 liters of water",
    desc: "Use the quick-add buttons below, or check this off manually once your water goal is done."
  },
  {
    id: "reading",
    title: "Read 10 pages",
    desc: "A real book, ebook, audiobook chapter notes, devotional, or personal-development reading counts."
  },
  {
    id: "nutrition",
    title: "Eat well / stay on plan",
    desc: "Prioritize protein, fruits or vegetables, reasonable portions, and fewer junk snacks."
  },
  {
    id: "alcohol",
    title: "Stay within your alcohol rule",
    desc: "75 Soft commonly allows alcohol only on social occasions. Check this when you followed your rule."
  },
  {
    id: "log",
    title: "Log the day",
    desc: "Write down what you did. A tiny note is enough — consistency beats perfection."
  }
];

const activities = [
  {
    id: "walk",
    type: "Low impact",
    title: "Brisk neighborhood walk",
    desc: "Your safest default. Keep a pace where talking is possible but your breathing picks up.",
    steps: ["5-minute easy warmup", "35-minute steady walk", "5-minute cooldown and calf stretch"]
  },
  {
    id: "family-walk",
    type: "Family friendly",
    title: "Stroller or family walk",
    desc: "Perfect when life is busy. The goal is steady movement for the full session.",
    steps: ["Pick a simple route", "Keep moving for 45 minutes", "Add hills if the walk feels too easy"]
  },
  {
    id: "bodyweight",
    type: "Strength",
    title: "Beginner bodyweight circuit",
    desc: "No equipment needed. Move slowly and keep your form clean.",
    steps: ["Squats x 12", "Incline pushups x 10", "Glute bridges x 15", "Wall sit x 30 seconds", "Repeat 4 to 5 rounds"]
  },
  {
    id: "core",
    type: "Core",
    title: "Core and mobility session",
    desc: "Great for days when you want to feel better without beating up your joints.",
    steps: ["Dead bugs x 10 each side", "Bird dogs x 10 each side", "Plank x 20 to 40 seconds", "Hip and hamstring stretches", "Repeat until 45 minutes"]
  },
  {
    id: "stairs",
    type: "Cardio",
    title: "Stairs or step-ups",
    desc: "A serious workout with almost no setup. Use a safe step and do not rush.",
    steps: ["5-minute warmup walk", "1 minute step-ups", "1 minute easy walk", "Repeat 15 to 18 rounds", "Cool down"]
  },
  {
    id: "yardwork",
    type: "Outdoor",
    title: "Intentional yard work",
    desc: "Mowing, raking, trimming, sweeping, or outdoor cleanup counts when you keep moving.",
    steps: ["Choose one outdoor task", "Set a 45-minute timer", "Keep a steady pace", "Finish with stretching"]
  },
  {
    id: "low-impact-hiit",
    type: "Low-impact HIIT",
    title: "No-jump cardio circuit",
    desc: "Good for rainy days. No jumping required.",
    steps: ["March in place", "Side steps", "Shadow boxing", "Standing knee raises", "Do 45 seconds on / 15 seconds easy"]
  },
  {
    id: "mobility",
    type: "Recovery",
    title: "Mobility and stretching flow",
    desc: "Use this when sore, tired, or stiff. It still counts if you complete the time.",
    steps: ["Neck and shoulder circles", "Cat-cow", "Hip flexor stretch", "Hamstring stretch", "Easy walk between stretches"]
  },
  {
    id: "walk-circuit",
    type: "Hybrid",
    title: "Walk plus mini circuit",
    desc: "A balanced option: light cardio plus simple strength work.",
    steps: ["25-minute walk", "Squats x 15", "Counter pushups x 12", "Glute bridges x 15", "Stretch to finish"]
  },
  {
    id: "dance",
    type: "Mood booster",
    title: "Music movement session",
    desc: "Not every workout has to be serious. Put on music and move for the full 45 minutes.",
    steps: ["Pick a playlist", "Move continuously", "Mix in side steps and shadow boxing", "Cool down with stretching"]
  }
];

const weeklyPlan = [
  { day: "Mon", title: "Brisk walk + core", desc: "30-minute walk, then 15 minutes of planks, dead bugs, bird dogs, and stretching." },
  { day: "Tue", title: "Bodyweight strength", desc: "Squats, incline pushups, glute bridges, lunges, wall sits, and calf raises." },
  { day: "Wed", title: "Active recovery", desc: "Easy walk, slow mobility, stretching, or yoga. Keep it gentle but complete the time." },
  { day: "Thu", title: "Low-impact cardio", desc: "Stairs, step-ups, marching, shadow boxing, or no-jump intervals." },
  { day: "Fri", title: "Full-body circuit", desc: "Repeat 3–5 rounds of squats, pushups, glute bridges, bird dogs, and mountain climbers." },
  { day: "Sat", title: "Outdoor movement", desc: "Long walk, park walk, beach walk, stroller walk, or intentional yard work." },
  { day: "Sun", title: "Mobility reset", desc: "Stretching, easy walking, foam rolling if available, and prep for the coming week." }
];

const els = {
  installBtn: document.getElementById("installBtn"),
  selectedDateLabel: document.getElementById("selectedDateLabel"),
  dayHeading: document.getElementById("dayHeading"),
  prevDay: document.getElementById("prevDay"),
  nextDay: document.getElementById("nextDay"),
  dailyMeter: document.getElementById("dailyMeter"),
  dailyPercent: document.getElementById("dailyPercent"),
  dailyStatus: document.getElementById("dailyStatus"),
  startDate: document.getElementById("startDate"),
  saveStart: document.getElementById("saveStart"),
  completedDays: document.getElementById("completedDays"),
  currentStreak: document.getElementById("currentStreak"),
  daysLeft: document.getElementById("daysLeft"),
  bestStreak: document.getElementById("bestStreak"),
  checklist: document.getElementById("checklist"),
  waterLiters: document.getElementById("waterLiters"),
  waterMeter: document.getElementById("waterMeter"),
  resetWater: document.getElementById("resetWater"),
  completeAll: document.getElementById("completeAll"),
  activitySelect: document.getElementById("activitySelect"),
  activityType: document.getElementById("activityType"),
  activityTitle: document.getElementById("activityTitle"),
  activityDescription: document.getElementById("activityDescription"),
  activitySteps: document.getElementById("activitySteps"),
  randomActivity: document.getElementById("randomActivity"),
  weekList: document.getElementById("weekList"),
  notes: document.getElementById("notes"),
  saveDay: document.getElementById("saveDay"),
  jumpToday: document.getElementById("jumpToday"),
  clearDay: document.getElementById("clearDay"),
  historyGrid: document.getElementById("historyGrid"),
  exportData: document.getElementById("exportData"),
  resetAll: document.getElementById("resetAll"),
  toast: document.getElementById("toast")
};

let selectedDate = todayString();
let deferredInstallPrompt = null;
let saveTimer = null;

function todayString() {
  return dateToString(new Date());
}

function dateToString(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value, amount) {
  const date = parseDate(value);
  date.setDate(date.getDate() + amount);
  return dateToString(date);
}

function formatDate(value) {
  return parseDate(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function loadState() {
  const fallback = { startDate: todayString(), entries: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return fallback;
    return {
      startDate: saved.startDate || todayString(),
      entries: saved.entries || {}
    };
  } catch {
    return fallback;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getEntry(state, date = selectedDate) {
  if (!state.entries[date]) {
    state.entries[date] = {
      checks: {},
      waterMl: 0,
      activityId: "",
      notes: ""
    };
  }
  if (!state.entries[date].checks) state.entries[date].checks = {};
  if (!Number.isFinite(state.entries[date].waterMl)) state.entries[date].waterMl = 0;
  return state.entries[date];
}

function dayNumber(date, startDate) {
  const diff = Math.floor((parseDate(date) - parseDate(startDate)) / 86400000);
  return diff + 1;
}

function clampDayNumber(number) {
  return Math.min(Math.max(number, 1), TOTAL_DAYS);
}

function challengeDateList(startDate) {
  return Array.from({ length: TOTAL_DAYS }, (_, index) => addDays(startDate, index));
}

function completedTaskCount(entry) {
  return tasks.filter(task => entry?.checks?.[task.id]).length;
}

function isComplete(entry) {
  return completedTaskCount(entry) === tasks.length;
}

function isPartial(entry) {
  return entry && completedTaskCount(entry) > 0 && !isComplete(entry);
}

function currentStreakFor(state) {
  const dates = challengeDateList(state.startDate);
  const todayIndex = dates.indexOf(todayString());
  if (todayIndex === -1) return 0;

  let streak = 0;
  for (let i = todayIndex; i >= 0; i--) {
    if (isComplete(state.entries[dates[i]])) streak += 1;
    else break;
  }
  return streak;
}

function bestStreakFor(state) {
  const dates = challengeDateList(state.startDate);
  let best = 0;
  let current = 0;

  dates.forEach(date => {
    if (isComplete(state.entries[date])) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });

  return best;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function buildChecklist() {
  els.checklist.innerHTML = "";
  tasks.forEach(task => {
    const label = document.createElement("label");
    label.className = "task";
    label.innerHTML = `
      <input type="checkbox" data-task="${task.id}" />
      <span>
        <strong>${task.title}</strong>
        <span>${task.desc}</span>
      </span>
    `;
    els.checklist.appendChild(label);
  });
}

function buildActivities() {
  els.activitySelect.innerHTML = '<option value="">Select an activity...</option>';
  activities.forEach(activity => {
    const option = document.createElement("option");
    option.value = activity.id;
    option.textContent = activity.title;
    els.activitySelect.appendChild(option);
  });
}

function buildWeeklyPlan() {
  const selected = parseDate(selectedDate).getDay();
  const mondayBasedIndex = selected === 0 ? 6 : selected - 1;

  els.weekList.innerHTML = "";
  weeklyPlan.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `week-item ${index === mondayBasedIndex ? "today" : ""}`;
    div.innerHTML = `
      <div class="week-day-name">${item.day}</div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.desc}</p>
      </div>
    `;
    els.weekList.appendChild(div);
  });
}

function renderActivity(activityId) {
  const activity = activities.find(item => item.id === activityId);
  if (!activity) {
    els.activityType.textContent = "Pick an option";
    els.activityTitle.textContent = "Movement idea";
    els.activityDescription.textContent = "Choose an activity or hit random when you need a quick decision.";
    els.activitySteps.innerHTML = "";
    return;
  }

  els.activityType.textContent = activity.type;
  els.activityTitle.textContent = activity.title;
  els.activityDescription.textContent = activity.desc;
  els.activitySteps.innerHTML = activity.steps.map(step => `<li>${step}</li>`).join("");
}

function renderHistory(state) {
  els.historyGrid.innerHTML = "";
  const dates = challengeDateList(state.startDate);

  dates.forEach((date, index) => {
    const entry = state.entries[date];
    const button = document.createElement("button");
    button.className = "day-dot";
    button.textContent = index + 1;
    button.title = `Day ${index + 1} — ${formatDate(date)}`;

    if (isComplete(entry)) button.classList.add("complete");
    else if (isPartial(entry)) button.classList.add("partial");
    if (date === selectedDate) button.classList.add("selected");

    button.addEventListener("click", () => {
      selectedDate = date;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    els.historyGrid.appendChild(button);
  });
}

function renderStats(state) {
  const dates = challengeDateList(state.startDate);
  const completed = dates.filter(date => isComplete(state.entries[date])).length;

  els.completedDays.textContent = completed;
  els.currentStreak.textContent = currentStreakFor(state);
  els.bestStreak.textContent = bestStreakFor(state);
  els.daysLeft.textContent = Math.max(TOTAL_DAYS - completed, 0);
}

function render() {
  const state = loadState();
  const entry = getEntry(state);
  const currentDay = clampDayNumber(dayNumber(selectedDate, state.startDate));
  const rawDay = dayNumber(selectedDate, state.startDate);

  els.startDate.value = state.startDate;
  els.selectedDateLabel.textContent = formatDate(selectedDate);
  els.dayHeading.textContent = `Day ${currentDay} of ${TOTAL_DAYS}`;

  if (rawDay < 1) els.dayHeading.textContent = "Before challenge starts";
  if (rawDay > TOTAL_DAYS) els.dayHeading.textContent = "Challenge complete window";

  document.querySelectorAll("[data-task]").forEach(input => {
    input.checked = Boolean(entry.checks[input.dataset.task]);
    input.closest(".task").classList.toggle("done", input.checked);
  });

  const percent = Math.round((completedTaskCount(entry) / tasks.length) * 100);
  els.dailyMeter.style.width = `${percent}%`;
  els.dailyPercent.textContent = `${percent}% complete`;
  els.dailyStatus.textContent = percent === 100 ? "Day complete" : `${tasks.length - completedTaskCount(entry)} left`;

  els.waterLiters.textContent = (entry.waterMl / 1000).toFixed(1);
  els.waterMeter.style.width = `${Math.min((entry.waterMl / WATER_GOAL_ML) * 100, 100)}%`;

  els.activitySelect.value = entry.activityId || "";
  renderActivity(entry.activityId);

  els.notes.value = entry.notes || "";

  renderStats(state);
  renderHistory(state);
  buildWeeklyPlan();
}

function updateEntry(mutator, quiet = false) {
  const state = loadState();
  const entry = getEntry(state);
  mutator(entry, state);
  saveState(state);
  render();
  if (!quiet) showToast("Saved");
}

function attachEvents() {
  els.saveStart.addEventListener("click", () => {
    const newStart = els.startDate.value || todayString();
    const state = loadState();
    state.startDate = newStart;
    saveState(state);
    selectedDate = todayString();
    render();
    showToast("Start date saved");
  });

  els.prevDay.addEventListener("click", () => {
    selectedDate = addDays(selectedDate, -1);
    render();
  });

  els.nextDay.addEventListener("click", () => {
    selectedDate = addDays(selectedDate, 1);
    render();
  });

  els.jumpToday.addEventListener("click", () => {
    selectedDate = todayString();
    render();
    showToast("Jumped to today");
  });

  els.checklist.addEventListener("change", event => {
    if (!event.target.matches("[data-task]")) return;
    updateEntry(entry => {
      entry.checks[event.target.dataset.task] = event.target.checked;
    }, true);
  });

  document.querySelectorAll("[data-water]").forEach(button => {
    button.addEventListener("click", () => {
      const amount = Number(button.dataset.water);
      updateEntry(entry => {
        entry.waterMl = Math.max(0, entry.waterMl + amount);
        if (entry.waterMl >= WATER_GOAL_ML) entry.checks.water = true;
      }, true);
    });
  });

  els.resetWater.addEventListener("click", () => {
    updateEntry(entry => {
      entry.waterMl = 0;
      entry.checks.water = false;
    });
  });

  els.completeAll.addEventListener("click", () => {
    updateEntry(entry => {
      tasks.forEach(task => {
        entry.checks[task.id] = true;
      });
      entry.waterMl = Math.max(entry.waterMl, WATER_GOAL_ML);
    });
  });

  els.activitySelect.addEventListener("change", () => {
    updateEntry(entry => {
      entry.activityId = els.activitySelect.value;
      if (entry.activityId) entry.checks.movement = true;
    }, true);
  });

  els.randomActivity.addEventListener("click", () => {
    const random = activities[Math.floor(Math.random() * activities.length)];
    updateEntry(entry => {
      entry.activityId = random.id;
      entry.checks.movement = true;
    });
  });

  els.notes.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      updateEntry(entry => {
        entry.notes = els.notes.value.trim();
        if (entry.notes) entry.checks.log = true;
      }, true);
    }, 350);
  });

  els.saveDay.addEventListener("click", () => {
    updateEntry(entry => {
      entry.notes = els.notes.value.trim();
      if (entry.notes) entry.checks.log = true;
      entry.savedAt = new Date().toISOString();
    });
  });

  els.clearDay.addEventListener("click", () => {
    if (!confirm("Clear this day’s checklist, water, activity, and notes?")) return;
    const state = loadState();
    delete state.entries[selectedDate];
    saveState(state);
    render();
    showToast("Day cleared");
  });

  els.resetAll.addEventListener("click", () => {
    if (!confirm("Erase all 75 Soft progress on this device?")) return;
    localStorage.removeItem(STORAGE_KEY);
    selectedDate = todayString();
    render();
    showToast("Progress reset");
  });

  els.exportData.addEventListener("click", () => {
    const state = loadState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "75-soft-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installBtn.hidden = false;
  });

  els.installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installBtn.hidden = true;
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // The app still works without offline support.
    });
  }
}

function boot() {
  const state = loadState();
  if (!localStorage.getItem(STORAGE_KEY)) saveState(state);
  buildChecklist();
  buildActivities();
  attachEvents();
  render();
  registerServiceWorker();
}

boot();
