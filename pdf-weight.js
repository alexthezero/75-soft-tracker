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
  const partial = dates.filter(date => isPartial(state.entries[date])).length;
  const open = TOTAL_DAYS - completed - partial;
  const currentStreak = currentStreakFor(state);
  const bestStreak = bestStreakFor(state);
  const daysLeft = Math.max(TOTAL_DAYS - completed, 0);
  const overallPercent = Math.round((completed / TOTAL_DAYS) * 100);
  const selectedDayNumber = clampDayNumber(dayNumber(selectedDate, state.startDate));
  const selectedPercent = Math.round((completedTaskCount(entry) / tasks.length) * 100);

  const firstWeightDate = dates.find(date => weights[date]);
  const latestWeightDate = [...dates].reverse().find(date => weights[date]);
  const firstWeight = firstWeightDate ? `${weights[firstWeightDate]} lb` : "—";
  const latestWeight = latestWeightDate ? `${weights[latestWeightDate]} lb` : "—";

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
  doc.setFontSize(11);
  doc.setTextColor(31, 34, 28);
  doc.text(`Weight: ${firstWeight} → ${latestWeight}`, 36, 366);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 34, 28);
  doc.text("Selected Day Snapshot", 36, 396);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 215, 201);
  doc.roundedRect(36, 412, 540, 212, 16, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(66, 88, 60);
  doc.text(`Day ${selectedDayNumber} of 75`, 56, 442);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(109, 112, 101);
  doc.text(formatDate(selectedDate), 56, 460);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 34, 28);
  doc.text(`Status: ${getStatusLabel(entry)}`, 56, 490);
  doc.text(`Daily: ${selectedPercent}%`, 190, 490);
  doc.text(`Water: ${entry.waterOz} / ${waterGoalOz} oz`, 300, 490);
  doc.text(`Weight: ${selectedWeight}`, 445, 490);

  let taskY = 522;
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
  doc.text("Activity", 330, 522);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(109, 112, 101);
  doc.text(doc.splitTextToSize(getActivityTitle(entry.activityId), 190), 330, 540);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 34, 28);
  doc.text("Notes", 330, 576);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(109, 112, 101);
  doc.text(doc.splitTextToSize(entry.notes || "No notes logged for this day yet.", 210), 330, 594);

  doc.setFillColor(230, 236, 223);
  doc.roundedRect(36, 652, 540, 54, 14, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(66, 88, 60);
  doc.text("Rule of the report", 56, 674);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Small daily wins compound. Finish today, then repeat tomorrow.", 56, 692);

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
      getPdfWeightForDate(weights, date),
      getActivityTitle(dayEntry?.activityId),
      truncateText(dayEntry?.notes || "", 36)
    ];
  });

  if (typeof doc.autoTable === "function") {
    doc.autoTable({
      startY: 118,
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
  showToast("PDF exported with weight");
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
