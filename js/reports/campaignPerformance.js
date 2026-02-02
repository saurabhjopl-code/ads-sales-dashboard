// =======================================
// REPORT: Campaign Performance – V1.2+
// Source: CDR (Campaign Level)
// =======================================

window.renderCampaignPerformance = function () {
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
  // AGGREGATE BY CAMPAIGN
  // -------------------------------
  const map = {};

  APP_STATE.data.CDR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const id = r["Campaign ID"];
    if (!id) return;

    if (!map[id]) {
      map[id] = {
        id,
        name: r["Campaign Name"],
        views: 0,
        clicks: 0,
        spend: 0,
        units: 0,
        revenue: 0
      };
    }

    map[id].views += +r["Views"] || 0;
    map[id].clicks += +r["Clicks"] || 0;
    map[id].spend += +r["Ad Spend"] || 0;
    map[id].units += +r["Total converted units"] || 0;
    map[id].revenue += +r["Total Revenue (Rs.)"] || 0;
  });

  const campaigns = Object.values(map);

  // -------------------------------
  // BUILD TABLE (UNCHANGED LOGIC)
  // -------------------------------
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Campaign ID</th>
        <th>Campaign Name</th>
        <th>Views</th>
        <th>Clicks</th>
        <th>CTR (%)</th>
        <th>Ad Spend</th>
        <th>Units Sold (Ads)</th>
        <th>Revenue (Ads)</th>
        <th>ROI</th>
        <th>ACOS (%)</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  campaigns.forEach(c => {
    const ctr = c.views > 0 ? (c.clicks / c.views) * 100 : 0;
    const roi = c.spend > 0 ? c.revenue / c.spend : 0;
    const acos = c.revenue > 0 ? (c.spend / c.revenue) * 100 : 0;

    let action = "HOLD";
    let actionClass = "trend-amber";

    if (roi >= 4 && acos <= 25) {
      action = "SCALE";
      actionClass = "trend-green";
    } else if (roi < 2 || acos > 40) {
      action = "PAUSE";
      actionClass = "trend-red";
    }

    tbody.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.views.toLocaleString()}</td>
        <td>${c.clicks.toLocaleString()}</td>
        <td>${ctr.toFixed(2)}%</td>
        <td>₹ ${c.spend.toLocaleString()}</td>
        <td>${c.units.toLocaleString()}</td>
        <td>₹ ${c.revenue.toLocaleString()}</td>
        <td>${roi.toFixed(2)}</td>
        <td>${acos.toFixed(2)}%</td>
        <td class="${actionClass}" style="font-weight:700;">${action}</td>
      </tr>
    `;
  });

  tableSection.appendChild(table);

  // -------------------------------
  // CHART DATA
  // -------------------------------
  const labels = campaigns.map(c => c.name);
  const spendData = campaigns.map(c => c.spend);
  const revenueData = campaigns.map(c => c.revenue);
  const roiData = campaigns.map(c =>
    c.spend > 0 ? c.revenue / c.spend : 0
  );

  // -------------------------------
  // CHART 1: Spend vs Revenue
  // -------------------------------
  const canvas1 = document.createElement("canvas");
  chartsSection.appendChild(canvas1);

  new Chart(canvas1.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Ad Spend",
          data: spendData
        },
        {
          label: "Revenue",
          data: revenueData
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        x: {
          ticks: {
            callback: value => "₹ " + value.toLocaleString()
          }
        }
      }
    }
  });

  // -------------------------------
  // CHART 2: ROI by Campaign
  // -------------------------------
  const canvas2 = document.createElement("canvas");
  canvas2.style.marginTop = "32px";
  chartsSection.appendChild(canvas2);

  new Chart(canvas2.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "ROI",
          data: roiData
        }
      ]
    },
    options: {
      responsive: true,
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
