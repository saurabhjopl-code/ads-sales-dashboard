// =======================================
// DATE FILTER + RESET (FINAL FIX)
// Uses #resetFiltersBtn (HTML)
// Version: V1.2 (LOCKED)
// =======================================

(function () {
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const weekSelect = document.getElementById("weekSelector");
  const resetBtn = document.getElementById("resetFiltersBtn");

  if (!startInput || !endInput || !resetBtn) return;

  // -------------------------------
  // DATE CHANGE HANDLER
  // -------------------------------
  function onDateChange() {
    APP_STATE.startDate = startInput.value || null;
    APP_STATE.endDate = endInput.value || null;

    // Manual date selection clears week
    if (weekSelect) {
      weekSelect.value = "";
      APP_STATE.week = null;
    }

    window.renderAll?.();
  }

  startInput.addEventListener("change", onDateChange);
  endInput.addEventListener("change", onDateChange);

  // -------------------------------
  // RESET BUTTON HANDLER
  // -------------------------------
  resetBtn.addEventListener("click", () => {
    // Clear UI inputs
    startInput.value = "";
    endInput.value = "";
    if (weekSelect) weekSelect.value = "";

    // Clear state
    APP_STATE.startDate = null;
    APP_STATE.endDate = null;
    APP_STATE.week = null;

    window.renderAll?.();
  });
})();
