// =======================================
// SUMMARY 4: Sales Performance Snapshot (Transactions)
// =======================================

window.renderSummaryCTR = function () {
  const container = document.querySelector("#summary-ctr .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  function parseDate(value) {
    if (!value) return null;
    const parts = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  const rows = APP_STATE.data.CTR.filter(r => {
    if (r.ACC !== acc) return false;

    const rowDate = parseDate(r["Order Date"]);
    if (!rowDate) return false;

    if (start && rowDate < start) return false;
    if (end && rowDate > end) return false;

    return true;
  });

  let saleQty = 0, saleAmt = 0;
  let cancelQty = 0, cancelAmt = 0;
  let returnQty = 0, returnAmt = 0;

  rows.forEach(r => {
    const qty = +r["Item Quantity"] || 0;
    const amt = +r["Price before discount"] || 0;
    const type = (r["Event Sub Type"] || "").toLowerCase();

    if (type === "sale") {
      saleQty += qty;
      saleAmt += amt;
    } else if (type === "cancellation") {
      cancelQty += qty;
      cancelAmt += amt;
    } else if (type === "return") {
      returnQty += qty;
      returnAmt += amt;
    }
  });

  const netQty = saleQty - cancelQty - returnQty;
  const netAmt = saleAmt - cancelAmt - returnAmt;

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

  renderItem("Gross Sale", saleQty, saleAmt);
  renderItem("Cancel", cancelQty, cancelAmt);
  renderItem("Return", returnQty, returnAmt);
  renderItem("Net Sales", netQty, netAmt);
};
