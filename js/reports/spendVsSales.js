// =======================================
// REPORT: Spend vs Sales (GMV Based) – V1.0
// =======================================

window.renderSpendVsSales = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -------------------------------
  // Date Parser (Locked Utility)
  // -------------------------------
  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  // -------------------------------
  // DAILY MAP
  // -------------------------------
  const daily = {};

  // GMV → Net Sales
  APP_STATE.data.GMV.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const key = d.toISOString().slice(0, 10);
    if (!daily[key]) {
      daily[key] = {
        grossUnits: 0,
        netSales: 0,
        adsSpend: 0
      };
    }

    daily[key].grossUnits += +r["Gross Units"] || 0;
    daily[key].netSales += +r["Final Sale Amount"] || 0;
  });

  // CDR → Ads Spend
  APP_STATE.data.CDR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const key = d.toISOString().slice(0, 10);
    if (!daily[key]) {
      daily[key] = {
        grossUnits: 0,
        netSales: 0,
        adsSpend: 0
      };
    }

    daily[key].adsSpend += +r["Ad Spend"] || 0;
  });

  // -------------------------------
  // BUILD TABLE
  // -------------------------------
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Gross Units</th>
        <th>Net Sales (GMV)</th>
        <th>Actual Ads Spend</th>
        <th>Fixed Ads (3%)</th>
        <th>Ads Diff (₹)</th>
        <th>Ads Diff (%)</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  let totalGrossUnits = 0;
  let totalNetSales = 0;
  let totalAdsSpend = 0;
  let totalFixedAds = 0;

  Object.keys(daily).sort().forEach(date => {
    const r = daily[date];

    const fixedAds = r.netSales * 0.03;
    const diffValue = r.adsSpend - fixedAds;
    const diffPct = fixedAds > 0 ? (diffValue / fixedAds) * 100 : 0;

    totalGrossUnits += r.grossUnits;
    totalNetSales += r.netSales;
    totalAdsSpend += r.adsSpend;
    totalFixedAds += fixedAds;

    const diffClass = diffValue > 0 ? "trend-red" : "trend-green";

    tbody.innerHTML += `
      <tr>
        <td>${date}</td>
        <td>${r.grossUnits.toLocaleString()}</td>
        <td>₹ ${r.netSales.toLocaleString()}</td>
        <td>₹ ${r.adsSpend.toLocaleString()}</td>
        <td>₹ ${fixedAds.toLocaleString()}</td>
        <td class="${diffClass}">₹ ${diffValue.toLocaleString()}</td>
        <td class="${diffClass}">${diffPct.toFixed(2)}%</td>
      </tr>
    `;
  });

  // -------------------------------
  // GRAND TOTAL
  // -------------------------------
  const totalDiff = totalAdsSpend - totalFixedAds;
  const totalDiffPct = totalFixedAds > 0 ? (totalDiff / totalFixedAds) * 100 : 0;
  const totalClass = totalDiff > 0 ? "trend-red" : "trend-green";

  tbody.innerHTML += `
    <tr class="grand-total">
      <td>Grand Total</td>
      <td>${totalGrossUnits.toLocaleString()}</td>
      <td>₹ ${totalNetSales.toLocaleString()}</td>
      <td>₹ ${totalAdsSpend.toLocaleString()}</td>
      <td>₹ ${totalFixedAds.toLocaleString()}</td>
      <td class="${totalClass}">₹ ${totalDiff.toLocaleString()}</td>
      <td class="${totalClass}">${totalDiffPct.toFixed(2)}%</td>
    </tr>
  `;

  tableSection.appendChild(table);
};
