// =======================================
// SUMMARY 4: Sales Performance Snapshot (Transactions)
// =======================================

window.renderSummaryCTR = function () {
  const container = document.querySelector("#summary-ctr .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate;
  const end = APP_STATE.endDate;

  // -------------------------------
  // FILTER CTR DATA
  // -------------------------------
  const rows = APP_STATE.data.CTR.filter(r => {
    if (r.ACC !== acc) return false;

    const date = r["Order Date"];
    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
  });

  // -------------------------------
  // AGGREGATION VARIABLES
  // -------------------------------
  let saleQty = 0, saleAmt = 0;
  let cancelQty = 0, cancelAmt = 0;
  let returnQty = 0, returnAmt = 0;

  rows.forEach(r => {
    const qty = Number(r["Item Quantity"] || 0);
    const amt = Number(r["Price before discount"] || 0);
    const type = (r["Event Sub Type"] || "").toLowerCase();

    if (type === "sale") {
      saleQty += qty;
      saleAmt += amt;
    } 
    else if (type === "cancellation") {
      cancelQty += qty;
      cancelAmt += amt;
    } 
    else if (type === "return") {
      returnQty += qty;
      returnAmt += amt;
    }
  });

  const netQty = saleQty - cancelQty - returnQty;
  const netAmt = saleAmt - cancelAmt - returnAmt;

  // -------------------------------
  // RENDER HELPER
  // -------------------------------
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

  // -------------------------------
  // RENDER SUMMARY
  // -------------------------------
  renderItem("Gross Sale", saleQty, saleAmt);
  renderItem("Cancel", cancelQty, cancelAmt);
  renderItem("Return", returnQty, returnAmt);
  renderItem("Net Sales", netQty, netAmt);
};
