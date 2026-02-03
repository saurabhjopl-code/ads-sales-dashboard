// =======================================
// REPORT: Placement Performance (Expandable)
// Version: V3.7 (Built on V3.6 Reset)
// Source: PPR
// =======================================

window.renderPlacementPerformance = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;

  // ==================================================
  // AGGREGATE: Placement -> Campaign
  // ==================================================
  const placementMap = {};

  APP_STATE.data.PPR.forEach(r => {
    if (r.ACC !== acc) return;

    const placement = r["Placement Type"];
    const campaignId = r["Campaign ID"];
    if (!placement || !campaignId) return;

    if (!placementMap[placement]) {
      placementMap[placement] = {
        placement,
        summary: {
          views: 0,
          clicks: 0,
          spend: 0,
          directUnits: 0,
          indirectUnits: 0,
          directRevenue: 0,
          indirectRevenue: 0,
          totalCPC: 0,
          cpcCount: 0
        },
        campaigns: {}
      };
    }

    const p = placementMap[placement].summary;

    p.views += +r["Views"] || 0;
    p.clicks += +r["Clicks"] || 0;
    p.spend += +r["Ad Spend"] || 0;
    p.directUnits += +r["Direct Units Sold"] || 0;
    p.indirectUnits += +r["Indirect Units Sold"] || 0;
    p.directRevenue += +r["Direct Revenue"] || 0;
    p.indirectRevenue += +r["Indirect Revenue"] || 0;

    if (+r["Average CPC"]) {
      p.totalCPC += +r["Average CPC"];
      p.cpcCount += 1;
    }

    if (!placementMap[placement].campaigns[campaignId]) {
      placementMap[placement].campaigns[campaignId] = {
        campaignId,
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

    const c = placementMap[placement].campaigns[campaignId];

    c.views += +r["Views"] || 0;
    c.clicks += +r["Clicks"] || 0;
    c.spend += +r["Ad Spend"] || 0;
    c.directUnits += +r["Direct Units Sold"] || 0;
    c.indirectUnits += +r["Indirect Units Sold"] || 0;
    c.directRevenue += +r["Direct Revenue"] || 0;
    c.indirectRevenue += +r["Indirect Revenue"] || 0;

    if (+r["Average CPC"]) {
      c.totalCPC += +r["Average CPC"];
      c.cpcCount += 1;
    }
  });

  // ==================================================
  // TABLE STRUCTURE
  // ==================================================
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Placement / Campaign</th>
        <th>Views</th>
        <th>Clicks</th>
        <th>CTR %</th>
        <th>Avg CPC</th>
        <th>Ad Spend</th>
        <th>Total Units</th>
        <th>Total Revenue</th>
        <th>ROI</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  // ==================================================
  // HELPERS
  // ==================================================
  function calcRowMetrics(obj) {
    const ctr = obj.views ? (obj.clicks / obj.views) * 100 : 0;
    const avgCPC = obj.cpcCount ? obj.totalCPC / obj.cpcCount : 0;
    const totalUnits = obj.directUnits + obj.indirectUnits;
    const totalRevenue = obj.directRevenue + obj.indirectRevenue;
    const roi = obj.spend ? totalRevenue / obj.spend : 0;

    let action = "OPTIMIZE";
    let cls = "trend-amber";

    if (roi >= 4) {
      action = "SCALE";
      cls = "trend-green";
    } else if (roi < 2) {
      action = "PAUSE";
      cls = "trend-red";
    }

    return { ctr, avgCPC, totalUnits, totalRevenue, roi, action, cls };
  }

  // ==================================================
  // RENDER ROWS
  // ==================================================
  Object.values(placementMap).forEach(p => {
    const s = p.summary;
    const m = calcRowMetrics(s);
    const rowId = `placement-${p.placement.replace(/\s+/g, "-")}`;

    // Parent Row (Placement)
    tbody.innerHTML += `
      <tr class="placement-row" data-target="${rowId}" style="font-weight:700; cursor:pointer;">
        <td>▶ ${p.placement}</td>
        <td>${s.views.toLocaleString()}</td>
        <td>${s.clicks.toLocaleString()}</td>
        <td>${m.ctr.toFixed(2)}%</td>
        <td>₹ ${m.avgCPC.toFixed(2)}</td>
        <td>₹ ${s.spend.toLocaleString()}</td>
        <td>${m.totalUnits}</td>
        <td>₹ ${m.totalRevenue.toLocaleString()}</td>
        <td>${m.roi.toFixed(2)}</td>
        <td class="${m.cls}">${m.action}</td>
      </tr>
    `;

    // Child Rows (Campaigns)
    Object.values(p.campaigns).forEach(c => {
      const cm = calcRowMetrics(c);

      tbody.innerHTML += `
        <tr class="campaign-row ${rowId}" style="display:none;">
          <td style="padding-left:30px;">${c.campaignId}</td>
          <td>${c.views.toLocaleString()}</td>
          <td>${c.clicks.toLocaleString()}</td>
          <td>${cm.ctr.toFixed(2)}%</td>
          <td>₹ ${cm.avgCPC.toFixed(2)}</td>
          <td>₹ ${c.spend.toLocaleString()}</td>
          <td>${cm.totalUnits}</td>
          <td>₹ ${cm.totalRevenue.toLocaleString()}</td>
          <td>${cm.roi.toFixed(2)}</td>
          <td class="${cm.cls}">${cm.action}</td>
        </tr>
      `;
    });
  });

  tableSection.appendChild(table);

  // ==================================================
  // EXPAND / COLLAPSE LOGIC
  // ==================================================
  table.querySelectorAll(".placement-row").forEach(row => {
    row.addEventListener("click", () => {
      const target = row.dataset.target;
      const icon = row.querySelector("td");

      table.querySelectorAll(`.${target}`).forEach(r => {
        r.style.display = r.style.display === "none" ? "table-row" : "none";
      });

      icon.innerHTML = icon.innerHTML.startsWith("▶")
        ? icon.innerHTML.replace("▶", "▼")
        : icon.innerHTML.replace("▼", "▶");
    });
  });
};
