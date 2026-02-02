// =======================================
// REPORT: Category / Vertical View – V3.3
// Source: GMV
// NOTE: Appends below Sales Health (does NOT clear containers)
// =======================================

window.renderCategoryVertical = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  if (!tableSection || !chartsSection || !APP_STATE.activeACC) return;

  const acc = APP_STATE.activeACC;
  const start = APP_STATE.startDate ? new Date(APP_STATE.startDate) : null;
  const end = APP_STATE.endDate ? new Date(APP_STATE.endDate) : null;

  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  // ================================
  // WRAPPER (SO IT DOESN'T COLLIDE)
  // ================================
  const wrapper = document.createElement("div");
  wrapper.style.marginTop = "40px";

  const title = document.createElement("h3");
  title.innerText = "Category / Vertical View";
  wrapper.appendChild(title);

  // -------------------------------
  // AGGREGATE MAPS
  // -------------------------------
  const verticalMap = {};
  const fulfillmentMap = {};
  let totalNetSales = 0;

  APP_STATE.data.GMV.forEach(r => {
    if (r.ACC !== acc) return;

    const d = parseDate(r["Order Date"]);
    if (!d || (start && d < start) || (end && d > end)) return;

    const vertical = r["Vertical"] || "Unknown";
    const fulfillment = r["Fulfillment Type"] || "Unknown";

    const grossUnits = +r["Gross Units"] || 0;
    const grossSales = +r["GMV"] || 0;
    const netUnits = +r["Final Sale Units"] || 0;
    const netSales = +r["Final Sale Amount"] || 0;

    totalNetSales += netSales;

    if (!verticalMap[vertical]) {
      verticalMap[vertical] = {
        vertical,
        grossUnits: 0,
        grossSales: 0,
        netUnits: 0,
        netSales: 0
      };
    }

    verticalMap[vertical].grossUnits += grossUnits;
    verticalMap[vertical].grossSales += grossSales;
    verticalMap[vertical].netUnits += netUnits;
    verticalMap[vertical].netSales += netSales;

    fulfillmentMap[fulfillment] =
      (fulfillmentMap[fulfillment] || 0) + netSales;
  });

  // ================================
  // PIE CHART – FULFILLMENT
  // ================================
  const canvas = document.createElement("canvas");
  wrapper.appendChild(canvas);

  new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: Object.keys(fulfillmentMap),
      datasets: [
        {
          data: Object.values(fulfillmentMap)
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });

  chartsSection.appendChild(wrapper);

  // ================================
  // TABLE – VERTICAL PERFORMANCE
  // ================================
  const tableWrapper = document.createElement("div");
  tableWrapper.style.marginTop = "32px";

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Vertical</th>
        <th>Gross Units</th>
        <th>Gross Sales</th>
        <th>Net Units</th>
        <th>Net Sales</th>
        <th>Net Sales %</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  Object.values(verticalMap)
    .sort((a, b) => b.netSales - a.netSales)
    .forEach(v => {
      const share =
        totalNetSales > 0 ? (v.netSales / totalNetSales) * 100 : 0;

      tbody.innerHTML += `
        <tr>
          <td>${v.vertical}</td>
          <td>${v.grossUnits.toLocaleString()}</td>
          <td>₹ ${v.grossSales.toLocaleString()}</td>
          <td>${v.netUnits.toLocaleString()}</td>
          <td>₹ ${v.netSales.toLocaleString()}</td>
          <td>${share.toFixed(2)}%</td>
        </tr>
      `;
    });

  tableWrapper.appendChild(table);
  tableSection.appendChild(tableWrapper);
};
