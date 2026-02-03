// =======================================
// MONTH + DATE FILTER + RESET
// Month drives Date Range (GMV based)
// Version: V2.0 (V3.9 BASELINE)
// =======================================

(function () {
  const monthSelect = document.getElementById("monthSelector");
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const weekSelect = document.getElementById("weekSelector");
  const resetBtn = document.getElementById("resetFiltersBtn");

  if (!monthSelect || !startInput || !endInput || !resetBtn) return;

  function toISO(d) {
    return d.toISOString().split("T")[0];
  }

  function getMonthRange(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { start, end };
  }

  // -------------------------------
  // MONTH CHANGE
  // -------------------------------
  monthSelect.addEventListener("change", () => {
    const val = monthSelect.value;
    if (!val) return;

    const [y, m] = val.split("-").map(Number);
    const { start, end } = getMonthRange(y, m - 1);

    APP_STATE.startDate = toISO(start);
    APP_STATE.endDate = toISO(end);
    APP_STATE.week = null;

    startInput.value = APP_STATE.startDate;
    endInput.value = APP_STATE.endDate;
    if (weekSelect) weekSelect.value = "";

    window.renderAll?.();
  });

  // -------------------------------
  // MANUAL DATE CHANGE
  // -------------------------------
  function onDateChange() {
    APP_STATE.startDate = startInput.value || null;
    APP_STATE.endDate = endInput.value || null;
    APP_STATE.week = null;

    if (weekSelect) weekSelect.value = "";
    if (monthSelect) monthSelect.value = "";

    window.renderAll?.();
  }

  startInput.addEventListener("change", onDateChange);
  endInput.addEventListener("change", onDateChange);

  // -------------------------------
  // RESET
  // -------------------------------
  resetBtn.addEventListener("click", () => {
    document.dispatchEvent(new Event("resetMonth"));
  });
})();
