// =======================================
// REPORT: Keyword Performance – V3.1
// Clean View + Charts (Top 10)
// Source: CKR
// =======================================

window.renderKeywordPerformance = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;

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

  const keywords = Object.values(map).map(k => {
    const totalRevenue = k.directRevenue + k.indirectRevenue;
    const roi = k.spend > 0 ? totalRevenue / k.spend : 0;
    return { ...k, totalRevenue, roi };
  });

  // -------------------------------
  // BUILD TABLE (UNCHANGED)
  // -------------------------------
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Keyword</th>
        <th>Match</th>
        <th>Campaign</th>
        <th>Views</th>
        <th>Clicks</th>
        <th>CTR %</th>
        <th>Spend</th>
        <th>Total Units</th>
        <th>Total Revenue</th>
        <th>ROI</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  keywords.forEach(k => {
    const ctr = k.views > 0 ? (k.clicks / k.views) * 100 : 0;
    const totalUnits = k.directUnits + k.indirectUnits;

    let action = "OPTIMIZE";
    let cls = "trend-amber";

    if (k.roi >= 4 && k.directUnits >= 2) {
      action = "SCALE";
      cls = "trend-green";
    } else if (k.roi < 2 || (k.spend > 0 && totalUnits === 0)) {
      action = "PAUSE";
      cls = "trend-red";
    }

    tbody.innerHTML += `
      <tr>
        <td>${k.keyword}</td>
        <td>${k.matchType}</td>
        <td>${k.campaign}</td>
        <td>${k.views.toLocaleString()}</td>
        <td>${k.clicks.toLocaleString()}</td>
        <td>${ctr.toFixed(2)}%</td>
        <td>₹ ${k.spend.toLocaleString()}</td>
        <td>${totalUnits}</td>
        <td>₹ ${k.totalRevenue.toLocaleString()}</td>
        <td>${k.roi.toFixed(2)}</td>
        <td class="${cls}" style="font-weight:700">${action}</td>
      </tr>
    `;
  });

  tableSection.appendChild(table);

  // =====================================================
  // CHARTS – TOP 10 KEYWORDS
  // =====================================================

  const topBySpend = keywords
    .filter(k => k.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  const topByROI = keywords
    .filter(k => k.spend > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);

  // -------------------------------
  // Chart 1: Spend vs Revenue
  // -------------------------------
  const canvas1 = document.createElement("canvas");
  chartsSection.appendChild(canvas1);

  new Chart(canvas1.getContext("2d"), {
    type: "bar",
    data: {
      labels: topBySpend.map(k => k.keyword),
      datasets: [
        {
          label: "Ad Spend",
          data: topBySpend.map(k => k.spend)
        },
        {
          label: "Total Revenue",
          data: topBySpend.map(k => k.totalRevenue)
        }
      ]
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        x: {
          ticks: {
            callback: v => "₹ " + v.toLocaleString()
          }
        }
      }
    }
  });

  // -------------------------------
  // Chart 2: ROI (Top 10)
  // -------------------------------
  const canvas2 = document.createElement("canvas");
  canvas2.style.marginTop = "32px";
  chartsSection.appendChild(canvas2);

  new Chart(canvas2.getContext("2d"), {
    type: "bar",
    data: {
      labels: topByROI.map(k => k.keyword),
      datasets: [
        {
          label: "ROI",
          data: topByROI.map(k => k.roi)
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};
