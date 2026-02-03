// =======================================
// REPORT: Placement Performance + Efficiency Chart
// Version: V3.8.1 (FIXED – Stable)
// Source: PPR
// NOTE: PPR does NOT use date filtering
// =======================================

window.renderPlacementPerformance = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !chartsSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;

  // ==================================================
  // AGGREGATE: Placement → Campaign (NO DATE FILTER)
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

    const s = placementMap[placement].summary;

    s.views += +r["Views"] || 0;
    s.clicks += +r["Clicks"] || 0;
    s.spend += +r["Ad Spend"] || 0;
    s.directUnits += +r["Direct Units Sold"] || 0;
    s.indirectUnits += +r["Indirect Units Sold"] || 0;
    s.directRevenue += +r["Direct Revenue"] || 0;
    s.indirectRevenue += +r["Indirect Revenue"] || 0;

    if (+r["Average CPC"]) {
      s.totalCPC += +r["Average CPC"];
      s.cpcCount += 1;
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

  const placements = Object.values(placementMap);
  if (!placements.length) {
    tableSection.innerHTML = "<p>No placement data available.</p>";
    return;
  }

  // ==================================================
  // PLACEMENT EFFICIENCY BUBBLE CHART
  // ==================================================
  const canvas = document.createElement("canvas");
  chartsSection.appendChild(canvas);

  const bubbleData = placements.map(p => {
    const s = p.summary;
    const revenue = s.directRevenue + s.indirectRevenue;
    const roi = s.spend ? revenue / s.spend : 0;

    return {
      label: p.placement,
      x: s.spend,
      y: roi,
      r: Math.max(6, Math.sqrt(revenue) / 8)
    };
  });

  new Chart(canvas, {
    type: "bubble",
    data: {
      datasets: [{
        label: "Placement Efficiency",
        data: bubbleData
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = ctx.raw;
              return [
                `Placement: ${v.label}`,
                `Spend: ₹ ${v.x.toLocaleString()}`,
                `ROI: ${v.y.toFixed(2)}`
              ];
            }
          }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          title: { display: true, text: "Ad Spend (₹)" }
        },
        y: {
          title: { display: true, text: "ROI" },
          beginAtZero: true
        }
      }
    }
  });

  // ==================================================
  // TABLE
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

  function metrics(o) {
    const ctr = o.views ? (o.clicks / o.views) * 100 : 0;
    const avgCPC = o.cpcCount ? o.totalCPC / o.cpcCount : 0;
    const units = o.directUnits + o.indirectUnits;
    const revenue = o.directRevenue + o.indirectRevenue;
    const roi = o.spend ? revenue / o.spend : 0;

    let action = "OPTIMIZE";
    let cls = "trend-amber";

    if (roi >= 4) { action = "SCALE"; cls = "trend-green"; }
    else if (roi < 2) { action = "PAUSE"; cls = "trend-red"; }

    return { ctr, avgCPC, units, revenue, roi, action, cls };
  }

  placements.forEach(p => {
    const m = metrics(p.summary);
    const rowId = `pl-${p.placement.replace(/\s+/g, "-")}`;

    tbody.innerHTML += `
      <tr class="placement-row" data-target="${rowId}" style="cursor:pointer;font-weight:700">
        <td>▶ ${p.placement}</td>
        <td>${p.summary.views.toLocaleString()}</td>
        <td>${p.summary.clicks.toLocaleString()}</td>
        <td>${m.ctr.toFixed(2)}%</td>
        <td>₹ ${m.avgCPC.toFixed(2)}</td>
        <td>₹ ${p.summary.spend.toLocaleString()}</td>
        <td>${m.units}</td>
        <td>₹ ${m.revenue.toLocaleString()}</td>
        <td>${m.roi.toFixed(2)}</td>
        <td class="${m.cls}">${m.action}</td>
      </tr>
    `;

    Object.values(p.campaigns).forEach(c => {
      const cm = metrics(c);

      tbody.innerHTML += `
        <tr class="campaign-row ${rowId}" style="display:none">
          <td style="padding-left:30px">${c.campaignId}</td>
          <td>${c.views.toLocaleString()}</td>
          <td>${c.clicks.toLocaleString()}</td>
          <td>${cm.ctr.toFixed(2)}%</td>
          <td>₹ ${cm.avgCPC.toFixed(2)}</td>
          <td>₹ ${c.spend.toLocaleString()}</td>
          <td>${cm.units}</td>
          <td>₹ ${cm.revenue.toLocaleString()}</td>
          <td>${cm.roi.toFixed(2)}</td>
          <td class="${cm.cls}">${cm.action}</td>
        </tr>
      `;
    });
  });

  tableSection.appendChild(table);

  // ==================================================
  // EXPAND / COLLAPSE
  // ==================================================
  table.querySelectorAll(".placement-row").forEach(row => {
    row.addEventListener("click", () => {
      const target = row.dataset.target;
      const cell = row.querySelector("td");

      table.querySelectorAll(`.${target}`).forEach(r => {
        r.style.display = r.style.display === "none" ? "table-row" : "none";
      });

      cell.innerHTML = cell.innerHTML.startsWith("▶")
        ? cell.innerHTML.replace("▶", "▼")
        : cell.innerHTML.replace("▼", "▶");
    });
  });
};
