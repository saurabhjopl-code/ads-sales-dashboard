const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");

[startInput, endInput].forEach(input => {
  input.addEventListener("change", () => {
    APP_STATE.startDate = startInput.value || null;
    APP_STATE.endDate = endInput.value || null;
    renderActiveRoute();
  });
});
