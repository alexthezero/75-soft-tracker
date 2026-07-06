const WEIGHT_PDF_STORAGE_KEY = "soft75Weight.v1";

function loadPdfWeights() {
  try {
    return JSON.parse(localStorage.getItem(WEIGHT_PDF_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function getPdfWeightForDate(weights, date) {
  return weights && weights[date] ? `${weights[date]} lb` : "—";
}

function hasMeaningfulEntry(entry, weightValue) {
  if (weightValue) return true;
  if (!entry) return false;
  if (getEntryWaterOz(entry) > 0) return true;
  if (entry.activityId) return true;
  if ((entry.notes || "").trim()) return true;
  return completedTaskCount(entry) > 0;
}

function pdfFooter(doc, pageNumber, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(109, 112, 101);
  doc.text(`75 Soft Tracker • Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 24, { align: "center" });
}

function pdfRoundedCard(doc, x, y, w, h, label, value, subtext = "") {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 215, 201);
  doc.roundedRect(x, y, w, h, 14, 14, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(66, 88, 60);
  doc.text(label.toUpperCase(), x + 12, y + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(31, 34, 28);
  doc.text(String(value), x + 12, y + 43);

  if (subtext) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(109, 112, 101);
    doc.text(subtext, x + 12, y + 58);
  }
}

function pdfHeader(doc, title, subtitle = "Progress Report") {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(244, 241, 232);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  doc.setFillColor(111, 128, 101);
  doc.roundedRect(28, 28, pageWidth - 56, 96, 18, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(title, 48, 68);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(subtitle, 50, 91);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(58);
  doc.text("75", pageWidth - 108, 91);
}

function drawEmptyStarterCard(doc, x, y, w, h) {
  doc.setFillColor(230, 236, 223);
  doc.setDrawColor(209, 220, 203);
  doc.roundedRect(x, y, w, h, 16, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(66, 88, 60);
  doc.text("Ready to start", x + 20, y + 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(31, 34, 28);
  const lines = doc.splitTextToSize(
    "Nothing has been logged yet, so this report is showing your clean starting point. Once you complete tasks, enter water, add weight, or write notes, this PDF will automatically fill in with your real progress.",
    w - 40
  );
  doc.text(lines, x + 20, y + 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(66, 88, 60);
  const steps = ["1. Pick today's movement", "2. Enter water consumed", "3. Save weight if tracking", "4. Check off tasks", "5. Add a quick daily note"];
  steps.forEach((step, index) => doc.text(step, x + 20, y + 116 + index * 18));
}

function drawChecklistSnapshot(doc, entry, x, y) {
  let taskY = y;
  tasks.forEach(task => {
    const done = Boolean(entry.checks?.[task.id]);
    doc.setFillColor(done ? 111 : 255, done ? 128 : 255, done ? 101 : 255);
    doc.setDrawColor(111, 128, 101);
    doc.roundedRect(x, taskY - 9, 11, 11, 2, 2, done ? "FD" : "D");
    doc.setFont("helvetica", done ? "bold" : "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 34, 28);
    doc.text(task.title, x + 20, taskY);
    taskY += 20;
  });
}

function drawProgressGrid(doc, dates, state, weights, x, y) {
  const size = 22;
  const gap = 8;
  const columns = 15;

  dates.forEach((date, index) => {
    const entry = state.entries[date];
    const row = Math.floor(index / columns);
    const column = index % columns;
    const dotX = x + column * (size + gap);
    const dotY = y + row * (size + gap);

    if (isComplete(entry)) {
      doc.setFillColor(111, 128, 101);
      doc.setDrawColor(111, 128, 101);
    } else if (isPartial(entry) || weights[date]) {
      doc.setFillColor(244, 217, 170);
      doc.setDrawColor(229, 189, 119);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(222, 215, 201);
    }

    doc.roundedRect(dotX, dotY, size, size, 5, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(index + 1 >= 10 ? 7 : 8);
    doc.setTextColor(isComplete(entry) ? 255 : 109, isComplete(entry) ? 255 : 112, isComplete(entry) ? 255 : 101);
    doc.text(String(index + 1), dotX + size / 2, dotY + 14, { align: "center" });
  });
}

function drawLegend(doc, x, y) {
  const items = [
    { label: "Complete", fill: [111, 128, 101], stroke: [111, 128, 101], text: [255, 255, 255] },
    { label: "Partial / weight logged", fill: [244, 217, 170], stroke: [229, 189, 119], text: [31, 34, 28] },
    { label: "Open", fill: [255, 255, 255], stroke: [222, 215, 201], text: [31, 34, 28] }
  ];

  let offset = 0;
  items.forEach(item => {
    doc.setFillColor(...item.fill);
    doc.setDrawColor(...item.stroke);
    doc.roundedRect(x + offset, y - 9, 12, 12, 3, 3, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(109, 112, 101);
    doc.text(item.label, x + offset + 18, y + 1);
    offset += item.label.length * 4.7 + 34;
  });
}

function exportTrackerPdfWithWeight() {
  if (!window.jspdf?.jsPDF || typeof window.jspdf.jsPDF !== "function") {
    showToast("PDF tools are still loading. Try again in a second.");
    return;
  }

  const state = loadState();
  const entry = getEntry(state, selectedDate);
  const weights = loadPdfWeights();
  const selectedWeight = getPdfWeightForDate(weights, selectedDate);
  const waterGoalOz = getWaterGoalOz(state);
  const dates = challengeDateList(state.startDate);
  const completed = dates.filter(date => isComplete(state.entries[date])).length;
  const partial = dates.filter(date => isPartial(state.entries[date]) || weights[date]).length - completed;
  const open = TOTAL_DAYS - completed - Math.max(partial, 0);
  const currentStreak = currentStreakFor(state);
  const bestStreak = bestStreakFor(state);
  const daysLeft = Math.max(TOTAL_DAYS - completed, 0);
  const overallPercent = Math.round((completed / TOTAL_DAYS) * 100);
  const selectedDayNumber = clampDayNumber(dayNumber(selectedDate, state.startDate));
  const selectedPercent = Math.round((completedTaskCount(entry) / tasks.length) * 100);
  const loggedRows = dates.filter(date => hasMeaningfulEntry(state.entries[date], weights[date]));
  const hasAnyProgress = loggedRows.length > 0;

  const firstWeightDate = dates.find(date => weights[date]);
  const latestWeightDate = [...dates].reverse().find(date => weights[date]);
  const weightSummary = firstWeightDate && latestWeightDate
    ? `${weights[firstWeightDate]} lb to ${weights[latestWeightDate]} lb`
    : "No weight logged yet";

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();

  pdfHeader(doc, "75 Soft Tracker", "Progress Report • Built for consistency, not perfection");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${formatShortDate(todayString())}`, 50, 113);
  doc.text(`Start: ${formatShortDate(state.startDate)}`, pageWidth - 165, 113);

  doc.setTextColor(31, 34, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Challenge Summary", 36, 158);

  pdfRoundedCard(doc, 36, 174, 126, 74, "Completed", completed, "full days done");
  pdfRoundedCard(doc, 174, 174, 126, 74, "Days Left", daysLeft, "to finish");
  pdfRoundedCard(doc, 312, 174, 126, 74, "Streak", currentStreak, "current run");
  pdfRoundedCard(doc, 450, 174, 126, 74, "Best", bestStreak, "best streak");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(31, 34, 28);
  doc.text("Overall Progress", 36, 280);

  doc.setFillColor(231, 223, 209);
  doc.roundedRect(36, 292, 540, 18, 9, 9, "F");
  if (overallPercent > 0) {
    doc.setFillColor(111, 128, 101);
    doc.roundedRect(36, 292, 540 * (overallPercent / 100), 18, 9, 9, "F");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(66, 88, 60);
  doc.text(`${overallPercent}% complete`, 36, 330);
  doc.text(`${Math.max(partial, 0)} partial • ${open} open`, pageWidth - 146, 330);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 34, 28);
  doc.text(`Weight: ${weightSummary}`, 36, 352);

  if (!hasAnyProgress) {
    drawEmptyStarterCard(doc, 36, 378, 540, 178);
  }

  const snapshotY = hasAnyProgress ? 378 : 585;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 34, 28);
  doc.text("Selected Day Snapshot", 36, snapshotY);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 215, 201);
  doc.roundedRect(36, snapshotY + 16, 540, 132, 16, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(66, 88, 60);
  doc.text(`Day ${selectedDayNumber} of 75`, 56, snapshotY + 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(109, 112, 101);
  doc.text(formatDate(selectedDate), 56, snapshotY + 64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 34, 28);
  doc.text(`Status: ${getStatusLabel(entry)}`, 56, snapshotY + 92);
  doc.text(`Daily: ${selectedPercent}%`, 166, snapshotY + 92);
  doc.text(`Water: ${entry.waterOz} / ${waterGoalOz} oz`, 256, snapshotY + 92);
  doc.text(`Weight: ${selectedWeight}`, 410, snapshotY + 92);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(109, 112, 101);
  const activityText = getActivityTitle(entry.activityId) === "—" ? "No activity selected yet" : getActivityTitle(entry.activityId);
  const notesText = entry.notes ? truncateText(entry.notes, 72) : "No notes logged yet";
  doc.text(`Activity: ${activityText}`, 56, snapshotY + 116);
  doc.text(`Notes: ${notesText}`, 56, snapshotY + 134);

  doc.addPage();
  pdfHeader(doc, "75-Day Visual History", "Green = complete • Gold = partial or weight logged • White = open");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 34, 28);
  doc.text("Challenge Grid", 36, 158);
  drawLegend(doc, 36, 178);
  drawProgressGrid(doc, dates, state, weights, 36, 202);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(31, 34, 28);
  doc.text("Logged Entries", 36, 390);

  if (loggedRows.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(222, 215, 201);
    doc.roundedRect(36, 408, 540, 126, 16, 16, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(66, 88, 60);
    doc.text("No entries logged yet", 56, 442);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(109, 112, 101);
    doc.text(doc.splitTextToSize("Once you save water, weight, activity, checklist items, or notes, this section will show only the days with real data instead of filling the PDF with blank rows.", 500), 56, 466);
  } else if (typeof doc.autoTable === "function") {
    const tableRows = loggedRows.map(date => {
      const index = dates.indexOf(date);
      const dayEntry = state.entries[date];
      return [
        `Day ${index + 1}`,
        formatShortDate(date),
        getStatusLabel(dayEntry),
        `${getEntryWaterOz(dayEntry)} oz`,
        getPdfWeightForDate(weights, date),
        getActivityTitle(dayEntry?.activityId),
        truncateText(dayEntry?.notes || "", 34)
      ];
    });

    doc.autoTable({
      startY: 410,
      head: [["Day", "Date", "Status", "Water", "Weight", "Activity", "Notes"]],
      body: tableRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 4,
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
        0: { cellWidth: 48 },
        1: { cellWidth: 68 },
        2: { cellWidth: 54 },
        3: { cellWidth: 48 },
        4: { cellWidth: 54 },
        5: { cellWidth: 112 },
        6: { cellWidth: 156 }
      },
      margin: { left: 36, right: 36 }
    });
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    pdfFooter(doc, i, totalPages);
  }

  doc.save(`75-soft-tracker-${todayString()}.pdf`);
  showToast("PDF exported");
}

(function attachWeightPdfExport() {
  const button = document.getElementById("exportData");
  if (!button) return;

  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    exportTrackerPdfWithWeight();
  }, true);
})();
