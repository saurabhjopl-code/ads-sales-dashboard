// =======================================
// REPORT: Executive Overview
// TAB 1: GMV BASED OVERVIEW (LOCKED)
// TAB 2: CTR BASED OVERVIEW (CORRECTED)
// PLA Metrics derived ONLY from CDR
// Version: V3.4.1
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

  // ==================================================
  // 1️⃣ GMV BASED AGGREGATION (UNCHANGED)
  // ==================================================
  const gmvMap = {};

  APP_STATE.data.GMV.forEach(r => {
    const acc = r.ACC;
    if (!acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    if (!gmvMap[acc]) {
      gmvMap[acc] = {
        acc,
        grossUnits: 0,
        grossSale: 0,
        netUnits: 0,
        netSale: 0,
        returnUnits: 0,
        cancelUnits: 0
      };
    }

    gmvMap[acc].grossUnits += +r["Gross Units"] || 0;
    gmvMap[acc].grossSale += +r["GMV"] || 0;
    gmvMap[acc].netUnits += +r["Final Sale Units"] || 0;
    gmvMap[acc].netSale += +r["Final Sale Amount"] || 0;
    gmvMap[acc].returnUnits += +r["Return Units"] || 0;
    gmvMap[acc].cancelUnits += +r["Cancellation Units"] || 0;
  });

  // ==================================================
  // 2️⃣ CTR BASED AGGREGATION (FIXED)
  // ==================================================
  const ctrMap = {};

  APP_STATE.data.CTR.forEach(r => {
    const acc = r.ACC;
    if (!acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    if (!ctrMap[acc]) {
      ctrMap[acc] = {
        acc,
        saleUnits: 0,
        saleAmount: 0,
        returnUnits: 0,
        returnAmount: 0,
        cancelUnits: 0,
        cancelAmount: 0
      };
    }

    const qty = +r["Item Quantity"] || 0;
    const amt = +r["Price before discount"] || 0;

    if (r["Event Type"] === "SALE") {
      ctrMap[acc].saleUnits += qty;
      ctrMap[acc].saleAmount += amt;
    }

    if (r["Event Type"] === "RETURN") {
      ctrMap[acc].returnUnits += qty;
      ctrMap[acc].returnAmount += amt;
    }

    if (r["Event Type"] === "CANCEL") {
      ctrMap[acc].cancelUnits += qty;
      ctrMap[acc].cancelAmount += amt;
    }
  });

  // ==================================================
  // 3️⃣ PLA METRICS (CDR – SAME FOR BOTH)
  // ==================================================
  const plaMap = {};

  APP_STATE.data.CDR.forEach(r => {
    const acc = r.ACC;
    if (!acc) return;

    const d = parseDate(r["Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    if (!plaMap[acc]) {
      plaMap[acc] = { spend: 0, units: 0, revenue: 0 };
    }

    plaMap[acc].spend += +r["Ad Spend"] || 0;
    plaMap[acc].units += +r["Total converted units"] || 0;
    plaMap[acc].revenue += +r["Total Revenue (Rs.)"] || 0;
  });

  // ==================================================
  // TABLE RENDERER
  // ==================================================
  function renderTable(map, type) {
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

    Object.values(map).forEach(a => {
      const pla = plaMap[a.acc] || { spend: 0, units: 0, revenue: 0 };

      let grossUnits, grossSale, netUnits, netSale, returnUnits, cancelUnits;

      if (type === "gmv") {
        grossUnits = a.grossUnits;
        grossSale = a.grossSale;
        netUnits = a.netUnits;
        netSale = a.netSale;
        returnUnits = a.returnUnits;
        cancelUnits = a.cancelUnits;
      } else {
        grossUnits = a.saleUnits;
        grossSale = a.saleAmount;
        returnUnits = a.returnUnits;
        cancelUnits = a.cancelUnits;
        netUnits = grossUnits - returnUnits - cancelUnits;
        netSale = grossSale - a.returnAmount - a.cancelAmount;
      }

      const returnPct = grossUnits > 0 ? (returnUnits / grossUnits) * 100 : 0;
      const cancelPct = grossUnits > 0 ? (cancelUnits / grossUnits) * 100 : 0;
      const asp = netUnits > 0 ? netSale / netUnits : 0;

      const actualPlaPct = netSale > 0 ? (pla.spend / netSale) * 100 : 0;
      const projectedPla = netSale * 0.03;
      const plaDiff = pla.spend - projectedPla;
      const plaUnitPct = grossUnits > 0 ? (pla.units / grossUnits) * 100 : 0;
      const roi = pla.spend > 0 ? pla.revenue / pla.spend : 0;

      tbody.innerHTML += `
        <tr>
          <td>${a.acc}</td>
          <td>${grossUnits.toLocaleString()}</td>
          <td>₹ ${grossSale.toLocaleString()}</td>
          <td>${returnPct.toFixed(2)}%</td>
          <td>${cancelPct.toFixed(2)}%</td>
          <td>₹ ${netSale.toLocaleString()}</td>
          <td>₹ ${asp.toFixed(2)}</td>
          <td>₹ ${pla.spend.toLocaleString()}</td>
          <td>${actualPlaPct.toFixed(2)}%</td>
          <td>₹ ${projectedPla.toLocaleString()}</td>
          <td>₹ ${plaDiff.toLocaleString()}</td>
          <td>${pla.units.toLocaleString()}</td>
          <td>${plaUnitPct.toFixed(2)}%</td>
          <td>₹ ${pla.revenue.toLocaleString()}</td>
          <td>${roi.toFixed(2)}</td>
        </tr>
      `;
    });

    content.appendChild(table);
  }

  // -------------------------------
  // TAB HANDLING
  // -------------------------------
  renderTable(gmvMap, "gmv");

  tabs.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      tabs.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      tab.dataset.tab === "gmv"
        ? renderTable(gmvMap, "gmv")
        : renderTable(ctrMap, "ctr");
    };
  });
};
