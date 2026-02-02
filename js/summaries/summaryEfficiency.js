// =======================================
// SUMMARY 3: Ads Efficiency & Budget Control
// =======================================

window.renderSummaryEfficiency = function () {
  const container = document.querySelector("#summary-efficiency .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -----------------------------------
  // DATE PARSER (ROBUST, SHARED LOGIC)
  // -----------------------------------
  function parseDate(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value);
    }

    const parts = value.includes("/") ? value.split("/") : value.split("-");
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    return null;
  }

  // -----------------------------------
  // GMV (GROSS)
  // -----------------------------------
  let grossUnits = 0;
  let grossAmount = 0;

  APP_STATE.data.GMV.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d) return;
    if (start && d < start) return;
    if (end && d > end) return;

    grossUnits += +r["Gross Units"] || 0;
    grossAmount += +r["GMV"] || 0;
  });

  // -----------------------------------
  // CTR (NET)
  // -----------------------------------
  let netUnits = 0;
  let netAmount = 0;

  APP_STATE.data.CTR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d) return;
    if (start && d < start) return;
    if (end && d > end) return;

    const qty = +r["Item Quantity"] || 0;
    const amt = +r["Price before discount"] || 0;
    const type = (r["Event Sub Type"] || "").toLowerCase();

    if (type === "sale") {
      netUnits += qty;
      netAmount += amt;
    } else if (type === "cancellation" || type === "return") {
      netUnits -= qty;
      netAmount -= amt;
    }
  });

  // -----------------------------------
  // CDR (ADS)
  // -----------------------------------
  let adSpend = 0;
  let adUnits = 0;
  let adRevenue = 0;

  APP_STATE.data.CDR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Date"]);
    if (!d) return;
    if (start && d < start) return;
    if (end && d > end) return;

    adSpend += +r["Ad Spend"] || 0;
    adUnits += +r["Total converted units"] || 0;
    adRevenue += +r["Total Revenue (Rs.)"] || 0;
  });

  // -----------------------------------
  // DERIVED METRICS
  // -----------------------------------
  const fixedAdsSpend = netAmount * 0.03;
  const adsDiffValue = adSpend - fixedAdsSpend;
  const adsDiffPercent = fixedAdsSpend > 0
    ? (adsDiffValue / fixedAdsSpend) * 100
    : 0;

  const adUnitsPercent = netUnits > 0
    ? (adUnits / netUnits) * 100
    : 0;

  const roi = adSpend > 0 ? adRevenue / adSpend : 0;

  // -----------------------------------
  // RENDER HELPER
  // -----------------------------------
  const renderItem = (label, value, isPercent = false, isDiff = false) => {
    const div = document.createElement("div");
    div.className = "summary-item";

    let display = value;
    if (isPercent) display = value.toFixed(2) + " %";
    if (!isPercent && typeof value === "number") {
      display = "₹ " + value.toLocaleString();
    }

    if (isDiff) {
      div.style.color = value < 0 ? "var(--success)" : "var(--danger)";
    }

    div.innerHTML = `
      <div class="label">${label}</div>
      <div class="value">${display}</div>
    `;

    container.appendChild(div);
  };

  // -----------------------------------
  // RENDER SUMMARY (ORDERED)
  // -----------------------------------
  renderItem("Gross Sale", grossAmount);
  renderItem("Gross Units Sold", grossUnits, false);

  renderItem("Net Sale", netAmount);
  renderItem("Net Units", netUnits, false);

  renderItem("Ads Spend", adSpend);
  renderItem("Units Sold Through Ads", adUnits, false);
  renderItem("Revenue Through Ads", adRevenue);

  renderItem("ROI", roi, true);
  renderItem("Units Sold Through Ads %", adUnitsPercent, true);

  renderItem("Fixed Ads %", 3, true);
  renderItem("Ads Diff (₹)", adsDiffValue, false, true);
  renderItem("Ads Diff (%)", adsDiffPercent, true, true);
};
