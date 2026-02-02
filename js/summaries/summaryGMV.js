// =======================================
// SUMMARY 1: Sales Performance Snapshot (GMV)
// =======================================

window.renderSummaryGMV = function () {
  const container = document.querySelector("#summary-gmv .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -----------------------------------
  // ROBUST DATE PARSER
  // -----------------------------------
  function parseDate(value) {
    if (!value) return null;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value);
    }

    // DD-MM-YYYY or DD/MM/YYYY
    const parts = value.includes("/") ? value.split("/") : value.split("-");
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    return null;
  }

  const rows = APP_STATE.data.GMV.filter(r => {
    if (r.ACC !== acc) return false;

    const rowDate = parseDate(r["Order Date"]);
    if (!rowDate) return false;

    if (start && rowDate < start) return false;
    if (end && rowDate > end) return false;

    return true;
  });

  let grossUnits = 0, grossAmt = 0;
  let cancelUnits = 0, cancelAmt = 0;
  let returnUnits = 0, returnAmt = 0;
  let finalUnits = 0, finalAmt = 0;

  rows.forEach(r => {
    grossUnits += +r["Gross Units"] || 0;
    grossAmt += +r["GMV"] || 0;
    cancelUnits += +r["Cancellation Units"] || 0;
    cancelAmt += +r["Cancellation Amount"] || 0;
    returnUnits += +r["Return Units"] || 0;
    returnAmt += +r["Return Amount"] || 0;
    finalUnits += +r["Final Sale Units"] || 0;
    finalAmt += +r["Final Sale Amount"] || 0;
  });

  const netUnits = grossUnits - cancelUnits - returnUnits;

  const renderItem = (label, units, amount) => {
    const div = document.createElement("div");
    div.className = "summary-item";
    div.innerHTML = `
      <div class="label">${label}</div>
      <div class="value">${units.toLocaleString()} units</div>
      <div class="label">₹ ${amount.toLocaleString()}</div>
    `;
    container.appendChild(div);
  };

  renderItem("Gross Sale", grossUnits, grossAmt);
  renderItem("Cancel", cancelUnits, cancelAmt);
  renderItem("Return", returnUnits, returnAmt);
  renderItem("Net Sales", netUnits, finalAmt);
};
