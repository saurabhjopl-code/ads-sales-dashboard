// =======================================
// REPORT: SKU / FSN Performance – V3.3
// Sources: GMV + CFR
// =======================================

window.renderSkuPerformance = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  // This report OWNS the containers
  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  // ================================
  // SKU MAP
  // ================================
  const skuMap = {};

  // -------- GMV (Sales Truth) --------
  APP_STATE.data.GMV.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const sku = r["SKU ID"];
    if (!sku) return;

    if (!skuMap[sku]) {
      skuMap[sku] = {
        sku,
        product: r["Product Id"] || "",
        grossUnits: 0,
        netUnits: 0,
        netSales: 0,
        adsUnits: 0,
        adsRevenue: 0,
        adsSpend: 0
      };
    }

    skuMap[sku].grossUnits += +r["Gross Units"] || 0;
    skuMap[sku].netUnits += +r["Final Sale Units"] || 0;
    skuMap[sku].netSales += +r["Final Sale Amount"] || 0;
  });

  // -------- CFR (Ads Performance) --------
  APP_STATE.data.CFR.forEach(r => {
    if (r.ACC !== acc) return;

    const sku = r["Sku Id"];
    if (!sku) return;

    if (!skuMap[sku]) {
      skuMap[sku] = {
        sku,
        product: r["Product Name"] || "",
        grossUnits: 0,
        netUnits: 0,
        netSales: 0,
        adsUnits: 0,
        adsRevenue: 0,
        adsSpend: 0
      };
    }

    const adsUnits =
      (+r["Direct Units Sold"] || 0) +
      (+r["Indirect Units Sold"] || 0);

    skuMap[sku].adsUnits += adsUnits;
    skuMap[sku].adsRevenue += +r["Total Revenue (Rs.)"] || 0;
    skuMap[sku].adsSpend += +r["SUM(cost)"] || 0;
  });

  // ================================
  // BUILD TABLE
  // ================================
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>SKU ID</th>
        <th>Product</th>
        <th>Gross Units</th>
        <th>Net Units</th>
        <th>Net Sales</th>
        <th>Ads Units</th>
        <th>Ads Revenue</th>
        <th>Ads Contribution %</th>
        <th>Ads ROI</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  Object.values(skuMap)
    .sort((a, b) => b.netSales - a.netSales)
    .forEach(s => {
      const adsContribution =
        s.netSales > 0 ? (s.adsRevenue / s.netSales) * 100 : 0;

      const adsROI =
        s.adsSpend > 0 ? s.adsRevenue / s.adsSpend : 0;

      let action = "REVIEW";
      let cls = "trend-amber";

      if (s.netSales > 0 && adsROI >= 4) {
        action = "SCALE";
        cls = "trend-green";
      } else if (s.netSales > 0 && s.adsUnits === 0) {
        action = "ORGANIC";
        cls = "trend-amber";
      } else if (s.adsSpend > 0 && s.adsRevenue === 0) {
        action = "PAUSE";
        cls = "trend-red";
      }

      tbody.innerHTML += `
        <tr>
          <td>${s.sku}</td>
          <td>${s.product}</td>
          <td>${s.grossUnits.toLocaleString()}</td>
          <td>${s.netUnits.toLocaleString()}</td>
          <td>₹ ${s.netSales.toLocaleString()}</td>
          <td>${s.adsUnits}</td>
          <td>₹ ${s.adsRevenue.toLocaleString()}</td>
          <td>${adsContribution.toFixed(2)}%</td>
          <td>${adsROI.toFixed(2)}</td>
          <td class="${cls}" style="font-weight:700">${action}</td>
        </tr>
      `;
    });

  tableSection.appendChild(table);
};
