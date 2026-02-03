// =======================================
// REPORT: Executive Overview
// TAB 1: GMV BASED OVERVIEW (POPULATED)
// Version: V3.2+
// =======================================

window.renderExecutiveOverview = function () {
  const chartsSection = document.getElementById("chartsSection");
  const tableSection = document.getElementById("tableSection");

  chartsSection.innerHTML = "";
  tableSection.innerHTML = "";

  // -------------------------------
  // TABS
  // -------------------------------
  const tabs = document.createElement("div");
  tabs.className = "report-tabs";
  tabs.innerHTML = `
    <button class="tab active" data-tab="gmv">GMV BASED OVERVIEW</button>
    <button class="tab" data-tab="ctr">TRANSACTION (CTR) BASED OVERVIEW</button>
  `;

  tableSection.appendChild(tabs);

  const content = document.createElement("div");
  tableSection.appendChild(content);

  // -------------------------------
  // DATE FILTERS
  // -------------------------------
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  // -------------------------------
  // GMV AGGREGATION (ACC-WISE)
  // -------------------------------
  const accMap = {};

  APP_STATE.data.GMV.forEach(r => {
    const acc = r.ACC;
    if (!acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    if (!accMap[acc]) {
      accMap[acc] = {
        acc,
        grossUnits: 0,
        grossSale: 0,
        netUnits: 0,
        netSale: 0,
        returnUnits: 0,
        cancelUnits: 0,
        plaSpend: 0,
        plaUnits: 0,
        plaRevenue: 0
      };
    }

    accMap[acc].grossUnits += +r["Gross Units"] || 0;
    accMap[acc].grossSale += +r["GMV"] || 0;
    accMap[acc].netUnits += +r["Final Sale Units"] || 0;
    accMap[acc].netSale += +r["Final Sale Amount"] || 0;
    accMap[acc].returnUnits += +r["Return Units"] || 0;
    accMap[acc].cancelUnits += +r["Cancellation Units"] || 0;
  });

  // -------------------------------
  // PLA SPEND (CDR)
  // -------------------------------
  APP_STATE.data.CDR.forEach(r => {
    const acc = r.ACC;
    if (!acc || !accMap[acc]) return;

    const d = parseDate(r["Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    accMap[acc].plaSpend += +r["Ad Spend"] || 0;
  });

  // -------------------------------
  // PLA UNITS & REVENUE (CFR)
  // -------------------------------
  APP_STATE.data.CFR.forEach(r => {
    const acc = r.ACC;
    if (!acc || !accMap[acc]) return;

    accMap[acc].plaUnits +=
      (+r["Direct Units Sold"] || 0) +
      (+r["Indirect Units Sold"] || 0);

    accMap[acc].plaRevenue += +r["Total Revenue (Rs.)"] || 0;
  });

  // -------------------------------
  // RENDER GMV TABLE
  // -------------------------------
  function renderGMVTable() {
    content.innerHTML = "";

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Account</th>
          <th>Gross Units</th>
          <th>Gross Sale</th>
          <th>Return (%)</th>
          <th>Cancelled (%)</th>
          <th>Net Sale</th>
          <th>ASP</th>
          <th>PLA Spend</th>
          <th>Actual PLA %</th>
          <th>Projected PLA (3%)</th>
          <th>PLA Diff (Value)</th>
          <th>PLA Units Sold</th>
          <th>PLA Units Sold %</th>
          <th>Sale through PLA</th>
          <th>ROI</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    Object.values(accMap)
      .sort((a, b) => b.netSale - a.netSale)
      .forEach(a => {
        const returnPct =
          a.grossUnits > 0 ? (a.returnUnits / a.grossUnits) * 100 : 0;

        const cancelPct =
          a.grossUnits > 0 ? (a.cancelUnits / a.grossUnits) * 100 : 0;

        const asp =
          a.netUnits > 0 ? a.netSale / a.netUnits : 0;

        const actualPlaPct =
          a.netSale > 0 ? (a.plaSpend / a.netSale) * 100 : 0;

        const projectedPla = a.netSale * 0.03;
        const plaDiff = a.plaSpend - projectedPla;

        const plaUnitPct =
          a.grossUnits > 0 ? (a.plaUnits / a.grossUnits) * 100 : 0;

        const roi =
          a.plaSpend > 0 ? a.plaRevenue / a.plaSpend : 0;

        tbody.innerHTML += `
          <tr>
            <td>${a.acc}</td>
            <td>${a.grossUnits.toLocaleString()}</td>
            <td>₹ ${a.grossSale.toLocaleString()}</td>
            <td>${returnPct.toFixed(2)}%</td>
            <td>${cancelPct.toFixed(2)}%</td>
            <td>₹ ${a.netSale.toLocaleString()}</td>
            <td>₹ ${asp.toFixed(2)}</td>
            <td>₹ ${a.plaSpend.toLocaleString()}</td>
            <td>${actualPlaPct.toFixed(2)}%</td>
            <td>₹ ${projectedPla.toLocaleString()}</td>
            <td>₹ ${plaDiff.toLocaleString()}</td>
            <td>${a.plaUnits.toLocaleString()}</td>
            <td>${plaUnitPct.toFixed(2)}%</td>
            <td>₹ ${a.plaRevenue.toLocaleString()}</td>
            <td>${roi.toFixed(2)}</td>
          </tr>
        `;
      });

    content.appendChild(table);
  }

  // -------------------------------
  // TAB HANDLING
  // -------------------------------
  renderGMVTable();

  tabs.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      tabs.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      if (tab.dataset.tab === "gmv") {
        renderGMVTable();
      } else {
        content.innerHTML = `
          <div style="padding:20px; text-align:center;">
            CTR Based Executive Overview – Coming Next
          </div>
        `;
      }
    };
  });
};
