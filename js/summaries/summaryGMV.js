// =======================================
// SUMMARY 1: Sales Performance Snapshot (GMV)
// =======================================

window.renderSummaryGMV = function () {
  const container = document.querySelector("#summary-gmv .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate;
  const end = APP_STATE.endDate;

  const rows = APP_STATE.data.GMV.filter(r => {
    if (r.ACC !== acc) return false;
    if (start && r["Order Date"] < start) return false;
    if (end && r["Order Date"] > end) return false;
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
