// =======================================
// REPORT: Keyword Performance – V3.1
// Source: CKR (Keyword Level)
// =======================================

window.renderKeywordPerformance = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

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

  // -------------------------------
  // AGGREGATE BY KEYWORD
  // -------------------------------
  const map = {};

  APP_STATE.data.CKR.forEach(r => {
    if (r.ACC !== acc) return;

    const keyword = r["attributed_keyword"];
    const matchType = r["keyword_match_type"];
    if (!keyword) return;

    const key = `${keyword}__${matchType}`;

    if (!map[key]) {
      map[key] = {
        keyword,
        matchType,
        campaign: r["Campaign Name"],
        adgroup: r["AdGroup ID"],
        views: 0,
        clicks: 0,
        spend: 0,
        directUnits: 0,
        indirectUnits: 0,
        directRevenue: 0,
        indirectRevenue: 0
      };
    }

    map[key].views += +r["Views"] || 0;
    map[key].clicks += +r["Clicks"] || 0;
    map[key].spend += +r["SUM(cost)"] || 0;
    map[key].directUnits += +r["Direct Units Sold"] || 0;
    map[key].indirectUnits += +r["Indirect Units Sold"] || 0;
    map[key].directRevenue += +r["Direct Revenue"] || 0;
    map[key].indirectRevenue += +r["Indirect Revenue"] || 0;
  });

  // -------------------------------
  // BUILD TABLE
  // -------------------------------
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Keyword</th>
        <th>Match Type</th>
        <th>Campaign</th>
        <th>Ad Group</th>
        <th>Views</th>
        <th>Clicks</th>
        <th>CTR (%)</th>
        <th>Ad Spend</th>
        <th>Direct Units</th>
        <th>Indirect Units</th>
        <th>Total Units</th>
        <th>Total Revenue</th>
        <th>ROI</th>
        <th>Direct ROI</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  Object.values(map).forEach(k => {
    const ctr = k.views > 0 ? (k.clicks / k.views) * 100 : 0;
    const totalUnits = k.directUnits + k.indirectUnits;
    const totalRevenue = k.directRevenue + k.indirectRevenue;
    const roi = k.spend > 0 ? totalRevenue / k.spend : 0;
    const directROI = k.spend > 0 ? k.directRevenue / k.spend : 0;

    let action = "OPTIMIZE";
    let actionClass = "trend-amber";

    if (roi >= 4 && k.directUnits >= 2) {
      action = "SCALE";
      actionClass = "trend-green";
    } else if (roi < 2 || (k.spend > 0 && totalUnits === 0)) {
      action = "PAUSE";
      actionClass = "trend-red";
    }

    tbody.innerHTML += `
      <tr>
        <td>${k.keyword}</td>
        <td>${k.matchType}</td>
        <td>${k.campaign}</td>
        <td>${k.adgroup}</td>
        <td>${k.views.toLocaleString()}</td>
        <td>${k.clicks.toLocaleString()}</td>
        <td>${ctr.toFixed(2)}%</td>
        <td>₹ ${k.spend.toLocaleString()}</td>
        <td>${k.directUnits}</td>
        <td>${k.indirectUnits}</td>
        <td>${totalUnits}</td>
        <td>₹ ${totalRevenue.toLocaleString()}</td>
        <td>${roi.toFixed(2)}</td>
        <td>${directROI.toFixed(2)}</td>
        <td class="${actionClass}" style="font-weight:700;">${action}</td>
      </tr>
    `;
  });

  tableSection.appendChild(table);
};
