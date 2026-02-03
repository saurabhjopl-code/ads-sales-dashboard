// =======================================
// DATE FILTER + RESET BUTTON
// Clears Date Range + Week
// Version: V1.0 (LOCKED)
// =======================================

(function () {
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");
  const weekSelect = document.getElementById("weekSelector");

  // -------------------------------
  // DATE CHANGE HANDLERS
  // -------------------------------
  function onDateChange() {
    const start = startInput?.value || null;
    const end = endInput?.value || null;

    APP_STATE.startDate = start;
    APP_STATE.endDate = end;

    // If manual date selected → reset week
    if (weekSelect) {
      weekSelect.value = "";
      APP_STATE.week = null;
    }

    window.renderAll?.();
  }

  if (startInput) startInput.addEventListener("change", onDateChange);
  if (endInput) endInput.addEventListener("change", onDateChange);

  // -------------------------------
  // RESET BUTTON
  // -------------------------------
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "RESET";
  resetBtn.className = "btn-reset";

  resetBtn.onclick = () => {
    // Clear UI
    if (startInput) startInput.value = "";
    if (endInput) endInput.value = "";
    if (weekSelect) weekSelect.value = "";

    // Clear state
    APP_STATE.startDate = null;
    APP_STATE.endDate = null;
    APP_STATE.week = null;

    window.renderAll?.();
  };

  // -------------------------------
  // Inject RESET next to filters
  // -------------------------------
  const header = document.querySelector(".date-filters");
  if (header) header.appendChild(resetBtn);
})();
