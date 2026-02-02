// =======================================
// SUMMARY 3: Ads Budget Variance Control (GMV vs CTR)
// =======================================

window.renderSummaryEfficiency = function () {
  const container = document.querySelector("#summary-efficiency .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -------------------------------
  // Robust Date Parser
  // -------------------------------
  function parseDate(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value);
    }

    const p = value.includes("/") ? value.split("/") : value.split("-");
    if (p.length === 3) {
      return new Date(p[2], p[1] - 1, p[0]);
    }
    return null;
  }

  // -------------------------------
  // NET SALE (GMV)
  // -------------------------------
  let netSaleGMV = 0;

  APP_STATE.data.GMV.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    netSaleGMV += +r["Final Sale Amount"] || 0;
  });

  // -------------------------------
  // NET SALE (CTR)
  // -------------------------------
  let netSaleCTR = 0;

  APP_STATE.data.CTR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const amt = +r["Price before discount"] || 0;
    const type = (r["Event Sub Type"] || "").toLowerCase();

    if (type === "sale") netSaleCTR += amt;
    else if (type === "return" || type === "cancellation") netSaleCTR -= amt;
  });

  // -------------------------------
  // ACTUAL ADS SPEND
  // -------------------------------
  let actualAdsSpend = 0;

  APP_STATE.data.CDR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    actualAdsSpend += +r["Ad Spend"] || 0;
  });

  // -------------------------------
  // FIXED ADS (3%)
  // -------------------------------
  const fixedGMV = netSaleGMV * 0.03;
  const fixedCTR = netSaleCTR * 0.03;

  const diffGMV = actualAdsSpend - fixedGMV;
  const diffCTR = actualAdsSpend - fixedCTR;

  const diffPctGMV = fixedGMV > 0 ? (diffGMV / fixedGMV) * 100 : 0;
  const diffPctCTR = fixedCTR > 0 ? (diffCTR / fixedCTR) * 100 : 0;

  // -------------------------------
  // Render Helper
  // -------------------------------
  function renderItem(label, value, isPercent = false, isDiff = false) {
    const div = document.createElement("div");
    div.className = "summary-item";

    let display;
    if (isPercent) display = value.toFixed(2) + " %";
    else display = "₹ " + value.toLocaleString();

    if (isDiff) {
      div.style.color = value < 0 ? "var(--success)" : "var(--danger)";
    }

    div.innerHTML = `
      <div class="label">${label}</div>
      <div class="value">${display}</div>
    `;

    container.appendChild(div);
  }

  // -------------------------------
  // Render Summary (FINAL SET)
  // -------------------------------
  renderItem("Net Sale (GMV)", netSaleGMV);
  renderItem("Net Sale (CTR)", netSaleCTR);

  renderItem("Fixed Ads (3%) on Net Sale (GMV)", fixedGMV);
  renderItem("Fixed Ads (3%) on Net Sale (CTR)", fixedCTR);

  renderItem("Ads Diff (₹) on Net Sale (GMV)", diffGMV, false, true);
  renderItem("Ads Diff (₹) on Net Sale (CTR)", diffCTR, false, true);

  renderItem("Ads Diff (%) on Net Sale (GMV)", diffPctGMV, true, true);
  renderItem("Ads Diff (%) on Net Sale (CTR)", diffPctCTR, true, true);
};
