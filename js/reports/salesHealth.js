// =======================================
// REPORT: Sales Health (CTR Based) – V1.0
// =======================================

window.renderSalesHealth = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !APP_STATE.activeACC) return;

  tableSection.innerHTML = "";
  chartsSection.innerHTML = ""; // charts later

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  // -------------------------------
  // Robust Date Parser
  // -------------------------------
  function parseDate(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value);
    }

    const p = value.includes("/") ? value.split("/") : value.split("-");
    if (p.length === 3) {
      return new Date(p[2], p[1] - 1, p[0]);
    }
    return null;
  }

  // -------------------------------
  // AGGREGATE CTR BY DATE
  // -------------------------------
  const dailyMap = {};

  APP_STATE.data.CTR.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const dateKey = d.toISOString().slice(0, 10);
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        saleUnits: 0, saleAmt: 0,
        cancelUnits: 0, cancelAmt: 0,
        returnUnits: 0, returnAmt: 0
      };
    }

    const qty = +r["Item Quantity"] || 0;
    const amt = +r["Price before discount"] || 0;
    const type = (r["Event Sub Type"] || "").toLowerCase();

    if (type === "sale") {
      dailyMap[dateKey].saleUnits += qty;
      dailyMap[dateKey].saleAmt += amt;
    } else if (type === "cancellation") {
      dailyMap[dateKey].cancelUnits += qty;
      dailyMap[dateKey].cancelAmt += amt;
    } else if (type === "return") {
      dailyMap[dateKey].returnUnits += qty;
      dailyMap[dateKey].returnAmt += amt;
    }
  });

  // -------------------------------
  // BUILD TABLE
  // -------------------------------
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

  Object.keys(dailyMap).sort().forEach(date => {
    const r = dailyMap[date];

    const netUnits = r.saleUnits - r.cancelUnits - r.returnUnits;
    const netAmt = r.saleAmt - r.cancelAmt - r.returnAmt;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${date}</td>
      <td>${r.saleUnits.toLocaleString()}</td>
      <td>₹ ${r.saleAmt.toLocaleString()}</td>
      <td>${r.cancelUnits.toLocaleString()}</td>
      <td>₹ ${r.cancelAmt.toLocaleString()}</td>
      <td>${r.returnUnits.toLocaleString()}</td>
      <td>₹ ${r.returnAmt.toLocaleString()}</td>
      <td>${netUnits.toLocaleString()}</td>
      <td>₹ ${netAmt.toLocaleString()}</td>
    `;

    tbody.appendChild(tr);
  });

  tableSection.appendChild(table);
};
