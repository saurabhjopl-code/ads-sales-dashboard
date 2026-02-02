// =======================================
// REPORT: Placement Performance – V3.1
// Source: PPR
// =======================================

window.renderPlacementPerformance = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;

  // -------------------------------
  // AGGREGATE BY PLACEMENT
  // -------------------------------
  const map = {};

  APP_STATE.data.PPR.forEach(r => {
    if (r.ACC !== acc) return;

    const placement = r["Placement Type"];
    if (!placement) return;

    if (!map[placement]) {
      map[placement] = {
        placement,
        views: 0,
        clicks: 0,
        spend: 0,
        directUnits: 0,
        indirectUnits: 0,
        directRevenue: 0,
        indirectRevenue: 0,
        totalCPC: 0,
        cpcCount: 0
      };
    }

    map[placement].views += +r["Views"] || 0;
    map[placement].clicks += +r["Clicks"] || 0;
    map[placement].spend += +r["Ad Spend"] || 0;
    map[placement].directUnits += +r["Direct Units Sold"] || 0;
    map[placement].indirectUnits += +r["Indirect Units Sold"] || 0;
    map[placement].directRevenue += +r["Direct Revenue"] || 0;
    map[placement].indirectRevenue += +r["Indirect Revenue"] || 0;

    if (+r["Average CPC"]) {
      map[placement].totalCPC += +r["Average CPC"];
      map[placement].cpcCount += 1;
    }
  });

  // -------------------------------
  // BUILD TABLE
  // -------------------------------
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Placement</th>
        <th>Views</th>
        <th>Clicks</th>
        <th>CTR %</th>
        <th>Avg CPC</th>
        <th>Ad Spend</th>
        <th>Direct Units</th>
        <th>Indirect Units</th>
        <th>Total Units</th>
        <th>Total Revenue</th>
        <th>ROI</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  Object.values(map).forEach(p => {
    const ctr = p.views > 0 ? (p.clicks / p.views) * 100 : 0;
    const avgCPC = p.cpcCount > 0 ? p.totalCPC / p.cpcCount : 0;
    const totalUnits = p.directUnits + p.indirectUnits;
    const totalRevenue = p.directRevenue + p.indirectRevenue;
    const roi = p.spend > 0 ? totalRevenue / p.spend : 0;

    let action = "OPTIMIZE";
    let cls = "trend-amber";

    if (roi >= 4) {
      action = "SCALE";
      cls = "trend-green";
    } else if (roi < 2) {
      action = "PAUSE";
      cls = "trend-red";
    }

    tbody.innerHTML += `
      <tr>
        <td>${p.placement}</td>
        <td>${p.views.toLocaleString()}</td>
        <td>${p.clicks.toLocaleString()}</td>
        <td>${ctr.toFixed(2)}%</td>
        <td>₹ ${avgCPC.toFixed(2)}</td>
        <td>₹ ${p.spend.toLocaleString()}</td>
        <td>${p.directUnits}</td>
        <td>${p.indirectUnits}</td>
        <td>${totalUnits}</td>
        <td>₹ ${totalRevenue.toLocaleString()}</td>
        <td>${roi.toFixed(2)}</td>
        <td class="${cls}" style="font-weight:700">${action}</td>
      </tr>
    `;
  });

  tableSection.appendChild(table);
};
