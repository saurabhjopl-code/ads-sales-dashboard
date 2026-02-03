// =======================================
// DATE FILTER + RESET (SINGLE SOURCE)
// Version: V1.1 (LOCKED)
// =======================================

(function () {
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const weekSelect = document.getElementById("weekSelector");
  const resetBtn = document.getElementById("resetFilters");

  function onDateChange() {
    APP_STATE.startDate = startInput.value || null;
    APP_STATE.endDate = endInput.value || null;

    // Manual date overrides week
    if (weekSelect) {
      weekSelect.value = "";
      APP_STATE.week = null;
    }

    window.renderAll?.();
  }

  startInput?.addEventListener("change", onDateChange);
  endInput?.addEventListener("change", onDateChange);

  // ✅ SINGLE RESET HANDLER
  resetBtn?.addEventListener("click", () => {
    startInput.value = "";
    endInput.value = "";
    if (weekSelect) weekSelect.value = "";

    APP_STATE.startDate = null;
    APP_STATE.endDate = null;
    APP_STATE.week = null;

    window.renderAll?.();
  });
})();
