// =======================================
// REPORT: Executive Overview
// TAB 1: GMV BASED OVERVIEW (LOCKED V3.3)
// TAB 2: CTR BASED OVERVIEW (FINAL LOGIC)
// PLA Metrics derived ONLY from CDR
// UI Tabs unified with Sales Health
// Version: V4.1 (Grand Total Added – SAFE)
// =======================================

window.renderExecutiveOverview = function () {
  const chartsSection = document.getElementById("chartsSection");
  const tableSection = document.getElementById("tableSection");

  chartsSection.innerHTML = "";
  tableSection.innerHTML = "";

  // -------------------------------
  // TABS (Sales Health Style)
  // -------------------------------
  tableSection.innerHTML = `
    <div class="report-tabs">
      <button class="tab-btn active" data-tab="gmv">
        GMV – Based Overview
      </button>
      <button class="tab-btn" data-tab="ctr">
        Transaction (CTR) – Based Overview
      </button>
    </div>
    <div id="execTableContainer"></div>
  `;

  const container = document.getElementById("execTableContainer");

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
  // 1️⃣ GMV BASED AGGREGATION
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
  // 2️⃣ CTR BASED AGGREGATION
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
    const subType = (r["Event Sub Type"] || "").trim();

    if (subType === "Sale") {
      ctrMap[acc].saleUnits += qty;
      ctrMap[acc].saleAmount += amt;
    }
    if (subType === "Return") {
      ctrMap[acc].returnUnits += qty;
      ctrMap[acc].returnAmount += amt;
    }
    if (subType === "Cancellation") {
      ctrMap[acc].cancelUnits += qty;
      ctrMap[acc].cancelAmount += amt;
    }
  });

  // ==================================================
  // 3️⃣ PLA METRICS (CDR ONLY)
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
  // TABLE RENDER
  // ==================================================
  function renderTable(map, type) {
    container.innerHTML = "";

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

    // ===== GRAND TOTAL ACCUMULATORS =====
    let T_grossUnits = 0,
        T_grossSale = 0,
        T_netUnits = 0,
        T_netSale = 0,
        T_returnUnits = 0,
        T_cancelUnits = 0,
        T_plaSpend = 0,
        T_plaUnits = 0,
        T_plaRevenue = 0;

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

      const returnPct = grossUnits ? (returnUnits / grossUnits) * 100 : 0;
      const cancelPct = grossUnits ? (cancelUnits / grossUnits) * 100 : 0;
      const asp = netUnits ? netSale / netUnits : 0;
      const actualPlaPct = netSale ? (pla.spend / netSale) * 100 : 0;
      const projectedPla = netSale * 0.03;
      const plaDiff = pla.spend - projectedPla;
      const plaUnitPct = grossUnits ? (pla.units / grossUnits) * 100 : 0;
      const roi = pla.spend ? pla.revenue / pla.spend : 0;

      // ===== ADD TO TOTALS =====
      T_grossUnits += grossUnits;
      T_grossSale += grossSale;
      T_netUnits += netUnits;
      T_netSale += netSale;
      T_returnUnits += returnUnits;
      T_cancelUnits += cancelUnits;
      T_plaSpend += pla.spend;
      T_plaUnits += pla.units;
      T_plaRevenue += pla.revenue;

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

    // ===== GRAND TOTAL ROW =====
    const T_returnPct = T_grossUnits ? (T_returnUnits / T_grossUnits) * 100 : 0;
    const T_cancelPct = T_grossUnits ? (T_cancelUnits / T_grossUnits) * 100 : 0;
    const T_asp = T_netUnits ? T_netSale / T_netUnits : 0;
    const T_actualPlaPct = T_netSale ? (T_plaSpend / T_netSale) * 100 : 0;
    const T_projectedPla = T_netSale * 0.03;
    const T_plaDiff = T_plaSpend - T_projectedPla;
    const T_plaUnitPct = T_grossUnits ? (T_plaUnits / T_grossUnits) * 100 : 0;
    const T_roi = T_plaSpend ? T_plaRevenue / T_plaSpend : 0;

    tbody.innerHTML += `
      <tr class="grand-total">
        <td>Grand Total</td>
        <td>${T_grossUnits.toLocaleString()}</td>
        <td>₹ ${T_grossSale.toLocaleString()}</td>
        <td>${T_returnPct.toFixed(2)}%</td>
        <td>${T_cancelPct.toFixed(2)}%</td>
        <td>₹ ${T_netSale.toLocaleString()}</td>
        <td>₹ ${T_asp.toFixed(2)}</td>
        <td>₹ ${T_plaSpend.toLocaleString()}</td>
        <td>${T_actualPlaPct.toFixed(2)}%</td>
        <td>₹ ${T_projectedPla.toLocaleString()}</td>
        <td>₹ ${T_plaDiff.toLocaleString()}</td>
        <td>${T_plaUnits.toLocaleString()}</td>
        <td>${T_plaUnitPct.toFixed(2)}%</td>
        <td>₹ ${T_plaRevenue.toLocaleString()}</td>
        <td>${T_roi.toFixed(2)}</td>
      </tr>
    `;

    container.appendChild(table);
  }

  // -------------------------------
  // TAB HANDLING
  // -------------------------------
  const tabButtons = tableSection.querySelectorAll(".tab-btn");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      btn.dataset.tab === "gmv"
        ? renderTable(gmvMap, "gmv")
        : renderTable(ctrMap, "ctr");
    });
  });

  // Default load
  renderTable(gmvMap, "gmv");
};
