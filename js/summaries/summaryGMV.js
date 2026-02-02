// =======================================
// SUMMARY 1: Sales Performance Snapshot (GMV)
// =======================================

window.renderSummaryGMV = function () {
  const container = document.querySelector("#summary-gmv .summary-grid");
  if (!container) return;

  container.innerHTML = "";

  const { GMV } = APP_STATE.data;
  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate;
  const end = APP_STATE.endDate;

  // -------------------------------
  // FILTER DATA (ACC + DATE)
  // -------------------------------
  const filtered = GMV.filter(row => {
    if (row.ACC !== acc) return false;

    if (start && row["Order Date"] < start) return false;
    if (end && row["Order Date"] > end) return false;

    return true;
  });

  // -------------------------------
  // AGGREGATIONS
  // -------------------------------
  let grossUnits = 0;
  let grossAmount = 0;

  let cancelUnits = 0;
  let cancelAmount = 0;

  let returnUnits = 0;
  let returnAmount = 0;

  let finalUnits = 0;
  let finalAmount = 0;

  filtered.forEach(row => {
    grossUnits += Number(row["Gross Units"] || 0);
    grossAmount += Number(row["GMV"] || 0);

    cancelUnits += Number(row["Cancellation Units"] || 0);
    cancelAmount += Number(row["Cancellation Amount"] || 0);

    returnUnits += Number(row["Return Units"] || 0);
    returnAmount += Number(row["Return Amount"] || 0);

    finalUnits += Number(row["Final Sale Units"] || 0);
    finalAmount += Number(row["Final Sale Amount"] || 0);
  });

  const netUnits = grossUnits - cancelUnits - returnUnits;

  // -------------------------------
  // RENDER HELPERS
  // -------------------------------
  function renderItem(label, units, amount) {
    const div = document.createElement("div");
    div.className = "summary-item";
    div.innerHTML = `
      <div class="label">${label}</div>
      <div class="value">${units.toLocaleString()} units</div>
      <div class="label">₹ ${amount.toLocaleString()}</div>
    `;
    container.appendChild(div);
  }

  // -------------------------------
  // RENDER SUMMARY
  // -------------------------------
  renderItem("Gross Sale", grossUnits, grossAmount);
  renderItem("Cancel", cancelUnits, cancelAmount);
  renderItem("Return", returnUnits, returnAmount);
  renderItem("Net Sales", netUnits, finalAmount);
};

// =======================================
// AUTO HOOK INTO ROUTE RENDER
// =======================================
const _oldRenderRouteGMV = window.renderActiveRoute;
window.renderActiveRoute = function () {
  if (_oldRenderRouteGMV) _oldRenderRouteGMV();
  window.renderSummaryGMV();
};
