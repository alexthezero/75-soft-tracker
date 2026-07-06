const TOTAL_DAYS = 75;
const DEFAULT_WATER_GOAL_OZ = 100;
const ML_TO_OZ = 0.033814;
const STORAGE_KEY = "soft75Tracker.v1";

const tasks = [
  {
    id: "movement",
    title: "45-minute movement",
    desc: "Walk, stretch, do bodyweight work, stairs, yard work, or another no-gym activity."
  },
  {
    id: "water",
    title: "Hit your water goal",
    desc: "Set your daily ounces goal once, then enter how many ounces you drank each day."
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
  waterOunces: document.getElementById("waterOunces"),
  waterGoalDisplay: document.getElementById("waterGoalDisplay"),
  waterGoalOz: document.getElementById("waterGoalOz"),
  saveWaterGoal: document.getElementById("saveWaterGoal"),
  waterConsumedOz: document.getElementById("waterConsumedOz"),
  saveWaterConsumed: document.getElementById("saveWaterConsumed"),
  waterMeter: document.getElementById("waterMeter"),
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

function formatShortDate(value) {
  return parseDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function normalizeWaterGoal(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return DEFAULT_WATER_GOAL_OZ;
  return Math.round(numeric);
}

function normalizeWaterConsumed(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric);
}

function getWaterGoalOz(state) {
  return normalizeWaterGoal(state?.waterGoalOz);
}

function getEntryWaterOz(entry) {
  if (!entry) return 0;
  if (Number.isFinite(entry.waterOz)) return Math.max(0, Math.round(entry.waterOz));
  if (Number.isFinite(entry.waterMl)) return Math.max(0, Math.round(entry.waterMl * ML_TO_OZ));
  return 0;
}

function updateWaterCheck(entry, state) {
  entry.checks.water = getEntryWaterOz(entry) >= getWaterGoalOz(state);
}

function loadState() {
  const fallback = { startDate: todayString(), waterGoalOz: DEFAULT_WATER_GOAL_OZ, entries: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return fallback;
    return {
      startDate: saved.startDate || todayString(),
      waterGoalOz: normalizeWaterGoal(saved.waterGoalOz),
      entries: saved.entries || {}
    };
  } catch {
    return fallback;
  }
}

function saveState(state) {
  state.waterGoalOz = getWaterGoalOz(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getEntry(state, date = selectedDate) {
  if (!state.entries[date]) {
    state.entries[date] = {
      checks: {},
      waterOz: 0,
      activityId: "",
      notes: ""
    };
  }
  if (!state.entries[date].checks) state.entries[date].checks = {};
  if (!Number.isFinite(state.entries[date].waterOz)) {
    state.entries[date].waterOz = getEntryWaterOz(state.entries[date]);
  }
  state.entries[date].waterOz = normalizeWaterConsumed(state.entries[date].waterOz);
  updateWaterCheck(state.entries[date], state);
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

function getStatusLabel(entry) {
  if (isComplete(entry)) return "Complete";
  if (isPartial(entry)) return "Partial";
  return "Open";
}

function getActivityTitle(activityId) {
  const activity = activities.find(item => item.id === activityId);
  return activity ? activity.title : "—";
}

function truncateText(text, maxLength = 60) {
  if (!text) return "—";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
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
  const waterGoalOz = getWaterGoalOz(state);
  const currentDay = clampDayNumber(dayNumber(selectedDate, state.startDate));
  const rawDay = dayNumber(selectedDate, state.startDate);

  els.startDate.value = state.startDate;
  els.waterGoalOz.value = waterGoalOz;
  els.waterConsumedOz.value = entry.waterOz;
  els.waterGoalDisplay.textContent = waterGoalOz;
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

  els.waterOunces.textContent = entry.waterOz;
  els.waterMeter.style.width = `${Math.min((entry.waterOz / waterGoalOz) * 100, 100)}%`;

  els.activitySelect.value = entry.activityId || "";
  renderActivity(entry.activityId);

  els.notes.value = entry.notes || "";

  saveState(state);
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

function drawPdfCard(doc, x, y, w, h, title, value, subtitle = "") {
  doc.setFillColor(248, 246, 239);
  doc.setDrawColor(222, 215, 201);
  doc.roundedRect(x, y, w, h, 12, 12, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(66, 88, 60);
  doc.text(title.toUpperCase(), x + 12, y + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(31, 34, 28);
  doc.text(String(value), x + 12, y + 44);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(109, 112, 101);
    doc.text(subtitle, x + 12, y + 59);
  }
}

function addPdfPageNumber(doc, pageNumber, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(109, 112, 101);
  doc.text(`75 Soft Tracker • Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 24, { align: "center" });
}

function exportTrackerPdf() {
  if (!window.jspdf?.jsPDF || typeof window.jspdf.jsPDF !== "function") {
    showToast("PDF tools are still loading. Try again in a second.");
    return;
  }

  const state = loadState();
  const entry = getEntry(state, selectedDate);
  const waterGoalOz = getWaterGoalOz(state);
  const dates = challengeDateList(state.startDate);
  const completed = dates.filter(date => isComplete(state.entries[date])).length;
  const partial = dates.filter(date => isPartial(state.entries[date])).length;
  const open = TOTAL_DAYS - completed - partial;
  const currentStreak = currentStreakFor(state);
  const bestStreak = bestStreakFor(state);
  const daysLeft = Math.max(TOTAL_DAYS - completed, 0);
  const overallPercent = Math.round((completed / TOTAL_DAYS) * 100);
  const selectedDayNumber = clampDayNumber(dayNumber(selectedDate, state.startDate));
  const selectedPercent = Math.round((completedTaskCount(entry) / tasks.length) * 100);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(244, 241, 232);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(111, 128, 101);
  doc.roundedRect(28, 28, pageWidth - 56, 104, 18, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("75 Soft Tracker", 48, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Progress Report • Built for consistency, not perfection", 50, 94);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(64);
  doc.setTextColor(255, 255, 255);
  doc.text("75", pageWidth - 118, 95);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${formatShortDate(todayString())}`, 50, 116);
  doc.text(`Start: ${formatShortDate(state.startDate)}`, pageWidth - 166, 116);

  doc.setTextColor(31, 34, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Challenge Summary", 36, 168);

  drawPdfCard(doc, 36, 184, 126, 76, "Completed", completed, "full days done");
  drawPdfCard(doc, 174, 184, 126, 76, "Days Left", daysLeft, "to finish");
  drawPdfCard(doc, 312, 184, 126, 76, "Streak", currentStreak, "current run");
  drawPdfCard(doc, 450, 184, 126, 76, "Best", bestStreak, "best streak");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(31, 34, 28);
  doc.text("Overall Progress", 36, 294);

  doc.setFillColor(231, 223, 209);
  doc.roundedRect(36, 306, 540, 18, 9, 9, "F");
  doc.setFillColor(111, 128, 101);
  doc.roundedRect(36, 306, Math.max(8, 540 * (overallPercent / 100)), 18, 9, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(66, 88, 60);
  doc.text(`${overallPercent}% complete`, 36, 344);
  doc.text(`${partial} partial • ${open} open`, pageWidth - 146, 344);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 34, 28);
  doc.text("Selected Day Snapshot", 36, 386);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 215, 201);
  doc.roundedRect(36, 402, 540, 212, 16, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(66, 88, 60);
  doc.text(`Day ${selectedDayNumber} of 75`, 56, 432);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(109, 112, 101);
  doc.text(formatDate(selectedDate), 56, 450);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 34, 28);
  doc.text(`Status: ${getStatusLabel(entry)}`, 56, 480);
  doc.text(`Daily: ${selectedPercent}%`, 190, 480);
  doc.text(`Water: ${entry.waterOz} / ${waterGoalOz} oz`, 300, 480);

  let taskY = 512;
  tasks.forEach(task => {
    const done = Boolean(entry.checks?.[task.id]);
    doc.setFillColor(done ? 111 : 255, done ? 128 : 255, done ? 101 : 255);
    doc.setDrawColor(111, 128, 101);
    doc.roundedRect(56, taskY - 9, 11, 11, 2, 2, done ? "FD" : "D");
    doc.setFont("helvetica", done ? "bold" : "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 34, 28);
    doc.text(task.title, 76, taskY);
    taskY += 20;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 34, 28);
  doc.text("Activity", 330, 512);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(109, 112, 101);
  doc.text(doc.splitTextToSize(getActivityTitle(entry.activityId), 190), 330, 530);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 34, 28);
  doc.text("Notes", 330, 566);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(109, 112, 101);
  doc.text(doc.splitTextToSize(entry.notes || "No notes logged for this day yet.", 210), 330, 584);

  doc.setFillColor(230, 236, 223);
  doc.roundedRect(36, 642, 540, 54, 14, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(66, 88, 60);
  doc.text("Rule of the report", 56, 664);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Small daily wins compound. Finish today, then repeat tomorrow.", 56, 682);

  doc.addPage();
  doc.setFillColor(244, 241, 232);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(111, 128, 101);
  doc.roundedRect(28, 28, pageWidth - 56, 70, 18, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("75-Day History", 48, 72);

  const tableRows = dates.map((date, index) => {
    const dayEntry = state.entries[date];
    return [
      `Day ${index + 1}`,
      formatShortDate(date),
      getStatusLabel(dayEntry),
      `${getEntryWaterOz(dayEntry)} oz`,
      getActivityTitle(dayEntry?.activityId),
      truncateText(dayEntry?.notes || "", 44)
    ];
  });

  if (typeof doc.autoTable === "function") {
    doc.autoTable({
      startY: 118,
      head: [["Day", "Date", "Status", "Water", "Activity", "Notes"]],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 5,
        textColor: [31, 34, 28],
        lineColor: [222, 215, 201],
        lineWidth: 0.6
      },
      headStyles: {
        fillColor: [111, 128, 101],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [249, 246, 239]
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 72 },
        2: { cellWidth: 58 },
        3: { cellWidth: 48 },
        4: { cellWidth: 124 },
        5: { cellWidth: 188 }
      },
      margin: { left: 36, right: 36 }
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 34, 28);
    doc.text("History table could not load, but your summary page is ready.", 36, 130);
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPdfPageNumber(doc, i, totalPages);
  }

  doc.save(`75-soft-tracker-${todayString()}.pdf`);
  showToast("PDF exported");
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

  els.saveWaterGoal.addEventListener("click", () => {
    const newGoal = Number(els.waterGoalOz.value);
    if (!Number.isFinite(newGoal) || newGoal <= 0) {
      showToast("Enter a valid water goal in ounces.");
      return;
    }

    const state = loadState();
    state.waterGoalOz = Math.round(newGoal);
    const entry = getEntry(state);
    updateWaterCheck(entry, state);
    saveState(state);
    render();
    showToast("Water goal saved");
  });

  els.saveWaterConsumed.addEventListener("click", () => {
    const consumed = Number(els.waterConsumedOz.value);
    if (!Number.isFinite(consumed) || consumed < 0) {
      showToast("Enter valid ounces consumed.");
      return;
    }

    updateEntry((entry, state) => {
      entry.waterOz = normalizeWaterConsumed(consumed);
      entry.waterMl = 0;
      updateWaterCheck(entry, state);
    });
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

  els.completeAll.addEventListener("click", () => {
    updateEntry((entry, state) => {
      tasks.forEach(task => {
        entry.checks[task.id] = true;
      });
      entry.waterOz = Math.max(entry.waterOz, getWaterGoalOz(state));
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

  els.exportData.addEventListener("click", exportTrackerPdf);

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
