// =======================================
// REPORT: Sales Health (CTR & GMV Tabs) – V1.0
// =======================================

window.renderSalesHealth = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -------------------------------
  // Date Parser
  // -------------------------------
  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);

    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  // -------------------------------
  // Tabs UI
  // -------------------------------
  const tabWrapper = document.createElement("div");
  tabWrapper.className = "acc-tabs"; // reuse ACC tab styling

  const ctrTab = document.createElement("div");
  ctrTab.className = "acc-tab active";
  ctrTab.innerText = "CTR – Transactions";

  const gmvTab = document.createElement("div");
  gmvTab.className = "acc-tab";
  gmvTab.innerText = "GMV – System Sales";

  tabWrapper.appendChild(ctrTab);
  tabWrapper.appendChild(gmvTab);
  tableSection.appendChild(tabWrapper);

  const contentDiv = document.createElement("div");
  tableSection.appendChild(contentDiv);

  // -------------------------------
  // RENDER CTR TABLE
  // -------------------------------
  function renderCTRTable() {
    contentDiv.innerHTML = "";

    const daily = {};

    APP_STATE.data.CTR.forEach(r => {
      if (r.ACC !== acc) return;

      const d = parseDate(r["Order Date"]);
      if (!d || (start && d < start) || (end && d > end)) return;

      const key = d.toISOString().slice(0, 10);
      if (!daily[key]) {
        daily[key] = {
          saleU: 0, saleA: 0,
          cancelU: 0, cancelA: 0,
          returnU: 0, returnA: 0
        };
      }

      const qty = +r["Item Quantity"] || 0;
      const amt = +r["Price before discount"] || 0;
      const type = (r["Event Sub Type"] || "").toLowerCase();

      if (type === "sale") {
        daily[key].saleU += qty;
        daily[key].saleA += amt;
      } else if (type === "cancellation") {
        daily[key].cancelU += qty;
        daily[key].cancelA += amt;
      } else if (type === "return") {
        daily[key].returnU += qty;
        daily[key].returnA += amt;
      }
    });

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Gross Sale Units</th>
          <th>Gross Sale Amount</th>
          <th>Cancel Units</th>
          <th>Cancel Amount</th>
          <th>Return Units</th>
          <th>Return Amount</th>
          <th>Net Units</th>
          <th>Net Sales Amount</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    Object.keys(daily).sort().forEach(date => {
      const r = daily[date];
      const netU = r.saleU - r.cancelU - r.returnU;
      const netA = r.saleA - r.cancelA - r.returnA;

      tbody.innerHTML += `
        <tr>
          <td>${date}</td>
          <td>${r.saleU}</td>
          <td>₹ ${r.saleA.toLocaleString()}</td>
          <td>${r.cancelU}</td>
          <td>₹ ${r.cancelA.toLocaleString()}</td>
          <td>${r.returnU}</td>
          <td>₹ ${r.returnA.toLocaleString()}</td>
          <td>${netU}</td>
          <td>₹ ${netA.toLocaleString()}</td>
        </tr>
      `;
    });

    contentDiv.appendChild(table);
  }

  // -------------------------------
  // RENDER GMV TABLE
  // -------------------------------
  function renderGMVTable() {
    contentDiv.innerHTML = "";

    const daily = {};

    APP_STATE.data.GMV.forEach(r => {
      if (r.ACC !== acc) return;

      const d = parseDate(r["Order Date"]);
      if (!d || (start && d < start) || (end && d > end)) return;

      const key = d.toISOString().slice(0, 10);
      if (!daily[key]) {
        daily[key] = {
          grossU: 0, grossA: 0,
          cancelU: 0, cancelA: 0,
          returnU: 0, returnA: 0,
          finalU: 0, finalA: 0
        };
      }

      daily[key].grossU += +r["Gross Units"] || 0;
      daily[key].grossA += +r["GMV"] || 0;
      daily[key].cancelU += +r["Cancellation Units"] || 0;
      daily[key].cancelA += +r["Cancellation Amount"] || 0;
      daily[key].returnU += +r["Return Units"] || 0;
      daily[key].returnA += +r["Return Amount"] || 0;
      daily[key].finalU += +r["Final Sale Units"] || 0;
      daily[key].finalA += +r["Final Sale Amount"] || 0;
    });

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Gross Units</th>
          <th>GMV Amount</th>
          <th>Cancel Units</th>
          <th>Cancel Amount</th>
          <th>Return Units</th>
          <th>Return Amount</th>
          <th>Net Units</th>
          <th>Final Sale Amount</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    Object.keys(daily).sort().forEach(date => {
      const r = daily[date];
      const netU = r.grossU - r.cancelU - r.returnU;

      tbody.innerHTML += `
        <tr>
          <td>${date}</td>
          <td>${r.grossU}</td>
          <td>₹ ${r.grossA.toLocaleString()}</td>
          <td>${r.cancelU}</td>
          <td>₹ ${r.cancelA.toLocaleString()}</td>
          <td>${r.returnU}</td>
          <td>₹ ${r.returnA.toLocaleString()}</td>
          <td>${netU}</td>
          <td>₹ ${r.finalA.toLocaleString()}</td>
        </tr>
      `;
    });

    contentDiv.appendChild(table);
  }

  // -------------------------------
  // Tab Clicks
  // -------------------------------
  ctrTab.onclick = () => {
    ctrTab.classList.add("active");
    gmvTab.classList.remove("active");
    renderCTRTable();
  };

  gmvTab.onclick = () => {
    gmvTab.classList.add("active");
    ctrTab.classList.remove("active");
    renderGMVTable();
  };

  // Default
  renderCTRTable();
};
