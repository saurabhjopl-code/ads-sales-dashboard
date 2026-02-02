const weekSelector = document.getElementById("weekSelector");

weekSelector.addEventListener("change", () => {
  APP_STATE.week = weekSelector.value || null;
  renderActiveRoute();
});
