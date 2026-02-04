// =======================================
// MONTH + DATE FILTER + RESET
// Month drives Date Range (UI blank by default)
// Version: V4.1 (FIXED)
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
  // MONTH CHANGE (DATE UI BLANK)
  // -------------------------------
  monthSelect.addEventListener("change", () => {
    const val = monthSelect.value;
    if (!val) return;

    const [y, m] = val.split("-").map(Number);
    const { start, end } = getMonthRange(y, m - 1);

    // Internal state (required for reports)
    APP_STATE.startDate = toISO(start);
    APP_STATE.endDate = toISO(end);
    APP_STATE.week = null;

    // UI stays blank (user-only control)
    startInput.value = "";
    endInput.value = "";
    if (weekSelect) weekSelect.value = "";

    window.renderAll?.();
  });

  // -------------------------------
  // MANUAL DATE CHANGE (OVERRIDE)
  // -------------------------------
  function onDateChange() {
    APP_STATE.startDate = startInput.value || null;
    APP_STATE.endDate = endInput.value || null;
    APP_STATE.week = null;

    // Manual date overrides month
    monthSelect.value = "";
    if (weekSelect) weekSelect.value = "";

    window.renderAll?.();
  }

  startInput.addEventListener("change", onDateChange);
  endInput.addEventListener("change", onDateChange);

  // -------------------------------
  // RESET (FIXED)
  // -------------------------------
  resetBtn.addEventListener("click", () => {
    // Clear UI
    startInput.value = "";
    endInput.value = "";
    if (weekSelect) weekSelect.value = "";

    // Reset state
    APP_STATE.week = null;

    // Re-init latest month (GMV based)
    if (typeof initDefaultMonth === "function") {
      initDefaultMonth();
    } else {
      window.location.reload(); // fallback safety
    }
  });
})();
