// =======================================
// SUMMARY 2: Advertising Performance Snapshot
// =======================================

window.renderSummaryAds = function () {
  const container = document.querySelector("#summary-ads .summary-grid");
  if (!container || !APP_STATE.activeACC) return;

  container.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -----------------------------------
  // DATE PARSER (ROBUST)
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
  // FILTER CDR DATA
  // -----------------------------------
  const rows = APP_STATE.data.CDR.filter(r => {
    if (r.ACC !== acc) return false;

    const rowDate = parseDate(r["Date"]);
    if (!rowDate) return false;

    if (start && rowDate < start) return false;
    if (end && rowDate > end) return false;

    return true;
  });

  // -----------------------------------
  // AGGREGATION
  // -----------------------------------
  let adSpend = 0;
  let adUnits = 0;
  let adRevenue = 0;

  rows.forEach(r => {
    adSpend += +r["Ad Spend"] || 0;
    adUnits += +r["Total converted units"] || 0;
    adRevenue += +r["Total Revenue (Rs.)"] || 0;
  });

  const roi = adSpend > 0 ? adRevenue / adSpend : 0;
  const acos = adRevenue > 0 ? (adSpend / adRevenue) * 100 : 0;

  // -----------------------------------
  // RENDER HELPER
  // -----------------------------------
  const renderItem = (label, value, suffix = "") => {
    const div = document.createElement("div");
    div.className = "summary-item";
    div.innerHTML = `
      <div class="label">${label}</div>
      <div class="value">${value}${suffix}</div>
    `;
    container.appendChild(div);
  };

  // -----------------------------------
  // RENDER SUMMARY
  // -----------------------------------
  renderItem("Ads Spend", `₹ ${adSpend.toLocaleString()}`);
  renderItem("Units Sold Through Ads", adUnits.toLocaleString());
  renderItem("Revenue Through Ads", `₹ ${adRevenue.toLocaleString()}`);
  renderItem("ROI", roi.toFixed(2));
  renderItem("ACOS", acos.toFixed(2), " %");
};
