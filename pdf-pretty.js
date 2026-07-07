(function () {
  const WEIGHT_KEY = "soft75Weight.v1";
  const CREAM = [248, 245, 238];
  const CREAM_2 = [239, 232, 220];
  const GREEN = [111, 128, 101];
  const GREEN_DARK = [48, 69, 44];
  const GREEN_TEXT = [66, 88, 60];
  const MUTED = [109, 114, 104];
  const LINE = [222, 215, 201];
  const WHITE = [255, 255, 255];

  function loadWeights() {
    try {
      return JSON.parse(localStorage.getItem(WEIGHT_KEY)) || {};
    } catch {
      return {};
    }
  }

  function weightFor(weights, date) {
    return weights && weights[date] ? `${weights[date]} lb` : "—";
  }

  function fillPage(doc) {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, w, h, "F");
  }

  function footer(doc, pageNumber, totalPages) {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`75 Soft Tracker • Page ${pageNumber} of ${totalPages}`, w / 2, h - 24, { align: "center" });
  }

  function header(doc, title, subtitle) {
    const pageW = doc.internal.pageSize.getWidth();
    fillPage(doc);

    doc.setFillColor(...GREEN);
    doc.roundedRect(32, 30, pageW - 64, 98, 18, 18, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("times", "bold");
    doc.setFontSize(31);
    doc.text(title, 54, 70);

    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text(subtitle, 56, 94);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(62);
    doc.text("75", pageW - 110, 91);
  }

  function summaryCard(doc, x, y, w, h, label, value, subtext) {
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...LINE);
    doc.roundedRect(x, y, w, h, 13, 13, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...GREEN_TEXT);
    doc.text(label.toUpperCase(), x + 11, y + 17);

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(31, 34, 28);
    doc.text(String(value), x + 11, y + 43);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(subtext, x + 11, y + 58);
  }

  function statusLabel(entry) {
    return getStatusLabel(entry);
  }

  function safeActivity(entry) {
    const title = getActivityTitle(entry?.activityId);
    return title === "—" ? "—" : title;
  }

  function safeNotes(entry, length = 40) {
    return truncateText(entry?.notes || "", length);
  }

  function drawStarterCard(doc, x, y, w, h) {
    doc.setFillColor(230, 236, 223);
    doc.setDrawColor(209, 220, 203);
    doc.roundedRect(x, y, w, h, 16, 16, "FD");

    doc.setFont("times", "bolditalic");
    doc.setFontSize(18);
    doc.setTextColor(...GREEN_TEXT);
    doc.text("Ready to start", x + 20, y + 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 34, 28);
    const text = "Nothing has been logged yet, so this report is showing your clean starting point. Once you check off tasks, enter water, save weight, or add notes, this PDF will fill in with your real progress.";
    doc.text(doc.splitTextToSize(text, w - 40), x + 20, y + 52);
  }

  function exportPrettyPdf() {
    if (!window.jspdf?.jsPDF) {
      showToast("PDF tools are still loading. Try again in a second.");
      return;
    }

    const state = loadState();
    const weights = loadWeights();
    const entry = getEntry(state, selectedDate);
    const dates = challengeDateList(state.startDate);
    const waterGoalOz = getWaterGoalOz(state);
    const completed = dates.filter(date => isComplete(state.entries[date])).length;
    const partial = dates.filter(date => (isPartial(state.entries[date]) || weights[date]) && !isComplete(state.entries[date])).length;
    const open = TOTAL_DAYS - completed - partial;
    const overallPercent = Math.round((completed / TOTAL_DAYS) * 100);
    const selectedDayNumber = clampDayNumber(dayNumber(selectedDate, state.startDate));
    const selectedPercent = Math.round((completedTaskCount(entry) / tasks.length) * 100);
    const firstWeightDate = dates.find(date => weights[date]);
    const latestWeightDate = [...dates].reverse().find(date => weights[date]);
    const weightSummary = firstWeightDate && latestWeightDate ? `${weights[firstWeightDate]} lb → ${weights[latestWeightDate]} lb` : "No weight logged yet";
    const hasAnyProgress = dates.some(date => {
      const e = state.entries[date];
      return weights[date] || getEntryWaterOz(e) > 0 || completedTaskCount(e) > 0 || e?.activityId || (e?.notes || "").trim();
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();

    header(doc, "75 Soft Tracker", "Small daily choices, big life changes");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...WHITE);
    doc.text(`Generated: ${formatShortDate(todayString())}`, 56, 116);
    doc.text(`Start: ${formatShortDate(state.startDate)}`, pageW - 165, 116);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(31, 34, 28);
    doc.text("Challenge Summary", 40, 164);

    summaryCard(doc, 40, 181, 123, 74, "Completed", completed, "full days done");
    summaryCard(doc, 176, 181, 123, 74, "Days Left", Math.max(TOTAL_DAYS - completed, 0), "to finish");
    summaryCard(doc, 312, 181, 123, 74, "Streak", currentStreakFor(state), "current run");
    summaryCard(doc, 448, 181, 123, 74, "Best", bestStreakFor(state), "best streak");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 34, 28);
    doc.text("Overall Progress", 40, 292);

    doc.setFillColor(...CREAM_2);
    doc.roundedRect(40, 305, 532, 16, 8, 8, "F");
    if (overallPercent > 0) {
      doc.setFillColor(...GREEN);
      doc.roundedRect(40, 305, Math.max(9, 532 * (overallPercent / 100)), 16, 8, 8, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN_TEXT);
    doc.text(`${overallPercent}% complete`, 40, 342);
    doc.text(`${partial} partial • ${open} open`, pageW - 145, 342);
    doc.text(`Weight: ${weightSummary}`, 40, 362);

    if (!hasAnyProgress) {
      drawStarterCard(doc, 40, 385, 532, 104);
    }

    const y = hasAnyProgress ? 388 : 515;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(31, 34, 28);
    doc.text("Selected Day Snapshot", 40, y);

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...LINE);
    doc.roundedRect(40, y + 18, 532, 160, 16, 16, "FD");

    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...GREEN_TEXT);
    doc.text(`Day ${selectedDayNumber} of 75`, 60, y + 51);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(formatDate(selectedDate), 60, y + 69);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(31, 34, 28);
    doc.text(`Status: ${statusLabel(entry)}`, 60, y + 98);
    doc.text(`Daily: ${selectedPercent}%`, 175, y + 98);
    doc.text(`Water: ${entry.waterOz} / ${waterGoalOz} oz`, 270, y + 98);
    doc.text(`Weight: ${weightFor(weights, selectedDate)}`, 430, y + 98);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(`Activity: ${safeActivity(entry)}`, 60, y + 124);
    doc.text(`Notes: ${entry.notes ? truncateText(entry.notes, 82) : "No notes logged for this day yet."}`, 60, y + 145);

    doc.setFillColor(230, 236, 223);
    doc.roundedRect(40, 715, 532, 42, 14, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...GREEN_TEXT);
    doc.text("Rule of the report", 60, 735);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Small daily wins compound. Finish today, then repeat tomorrow.", 60, 751);

    doc.addPage();
    header(doc, "75-Day Daily List", "Water • Weight • Activity • Notes • Status");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(31, 34, 28);
    doc.text("Daily Tracker List", 40, 160);

    const rows = dates.map((date, index) => {
      const e = state.entries[date];
      return [
        `Day ${index + 1}`,
        formatShortDate(date),
        statusLabel(e),
        `${getEntryWaterOz(e)} oz`,
        weightFor(weights, date),
        safeActivity(e),
        safeNotes(e, 34)
      ];
    });

    if (typeof doc.autoTable === "function") {
      doc.autoTable({
        startY: 178,
        head: [["Day", "Date", "Status", "Water", "Weight", "Activity", "Notes"]],
        body: rows,
        theme: "grid",
        margin: { left: 32, right: 32, bottom: 44 },
        styles: {
          font: "helvetica",
          fontSize: 7.8,
          cellPadding: { top: 5, right: 3.5, bottom: 5, left: 3.5 },
          textColor: [31, 34, 28],
          lineColor: LINE,
          lineWidth: 0.45,
          overflow: "linebreak"
        },
        headStyles: {
          fillColor: GREEN,
          textColor: WHITE,
          fontStyle: "bold",
          halign: "left"
        },
        alternateRowStyles: { fillColor: [252, 249, 243] },
        columnStyles: {
          0: { cellWidth: 47, fontStyle: "bold" },
          1: { cellWidth: 66 },
          2: { cellWidth: 52 },
          3: { cellWidth: 48 },
          4: { cellWidth: 54 },
          5: { cellWidth: 114 },
          6: { cellWidth: 167 }
        },
        didDrawPage: data => {
          if (data.pageNumber > 1) {
            fillPage(doc);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...GREEN_TEXT);
            doc.text("75-Day Daily List", 40, 30);
          }
        }
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      footer(doc, i, totalPages);
    }

    doc.save(`75-soft-tracker-${todayString()}.pdf`);
    showToast("PDF exported");
  }

  function attachPrettyExport() {
    const button = document.getElementById("exportData");
    if (!button) return;
    const cleanButton = button.cloneNode(true);
    button.replaceWith(cleanButton);
    cleanButton.addEventListener("click", event => {
      event.preventDefault();
      exportPrettyPdf();
    });
  }

  attachPrettyExport();
})();
