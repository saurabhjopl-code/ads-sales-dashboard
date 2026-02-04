// =======================================
// REPORT: Compare Reports (MTD vs MTD)
// Sections:
// 1. Executive Summary
// 2. Expandable Detail (GMV / CTR / ADS)
// 3. Cumulative Trend Chart
// Version: V4.2 (LOCKED)
// =======================================

window.renderCompareReports = function () {
  const tableSection = document.getElementById("tableSection");
  const chartsSection = document.getElementById("chartsSection");

  tableSection.innerHTML = "";
  chartsSection.innerHTML = "";

  // -------------------------------
  // DATE LOGIC (GMV ANCHOR)
  // -------------------------------
  function parseDate(v) {
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v);
    const p = v.includes("/") ? v.split("/") : v.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  const allDates = APP_STATE.data.GMV
    .map(r => parseDate(r["Order Date"]))
    .filter(Boolean);

  if (!allDates.length) {
    tableSection.innerHTML = "<p>No GMV data available</p>";
    return;
  }

  const latestDate = new Date(Math.max(...allDates));
  const cutoffDay = latestDate.getDate();

  const currStart = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
  const currEnd = latestDate;

  const prevStart = new Date(latestDate.getFullYear(), latestDate.getMonth() - 1, 1);
  const prevEnd = new Date(latestDate.getFullYear(), latestDate.getMonth() - 1, cutoffDay);

  // -------------------------------
  // AGGREGATORS
  // -------------------------------
  function blank() {
    return { units: 0, value: 0, returns: 0, cancels: 0 };
  }

  const GMV_CURR = blank(), GMV_PREV = blank();
  const CTR_CURR = blank(), CTR_PREV = blank();
  const ADS_CURR = { spend: 0, revenue: 0, units: 0 };
  const ADS_PREV = { spend: 0, revenue: 0, units: 0 };

  // -------------------------------
  // GMV
  // -------------------------------
  APP_STATE.data.GMV.forEach(r => {
    const d = parseDate(r["Order Date"]);
    if (!d) return;

    const tgt =
      d >= currStart && d <= currEnd ? GMV_CURR :
      d >= prevStart && d <= prevEnd ? GMV_PREV : null;

    if (!tgt) return;

    tgt.units += +r["Final Sale Units"] || 0;
    tgt.value += +r["Final Sale Amount"] || 0;
    tgt.returns += +r["Return Units"] || 0;
    tgt.cancels += +r["Cancellation Units"] || 0;
  });

  // -------------------------------
  // CTR
  // -------------------------------
  APP_STATE.data.CTR.forEach(r => {
    const d = parseDate(r["Order Date"]);
    if (!d) return;

    const tgt =
      d >= currStart && d <= currEnd ? CTR_CURR :
      d >= prevStart && d <= prevEnd ? CTR_PREV : null;

    if (!tgt) return;

    const qty = +r["Item Quantity"] || 0;
    const amt = +r["Price before discount"] || 0;
    const t = r["Event Sub Type"];

    if (t === "Sale") {
      tgt.units += qty;
      tgt.value += amt;
    }
    if (t === "Return") tgt.returns += qty;
    if (t === "Cancellation") tgt.cancels += qty;
  });

  // -------------------------------
  // ADS (CDR)
  // -------------------------------
  APP_STATE.data.CDR.forEach(r => {
    const d = parseDate(r["Date"]);
    if (!d) return;

    const tgt =
      d >= currStart && d <= currEnd ? ADS_CURR :
      d >= prevStart && d <= prevEnd ? ADS_PREV : null;

    if (!tgt) return;

    tgt.spend += +r["Ad Spend"] || 0;
    tgt.revenue += +r["Total Revenue (Rs.)"] || 0;
    tgt.units += +r["Total converted units"] || 0;
  });

  // -------------------------------
  // HELPERS
  // -------------------------------
  function delta(a, b) {
    return {
      v: a - b,
      p: b ? ((a - b) / b) * 100 : 0
    };
  }

  function row(label, c, p) {
    const d = delta(c, p);
    const cls = d.p > 3 ? "trend-green" : d.p < -3 ? "trend-red" : "trend-amber";
    return `
      <tr>
        <td>${label}</td>
        <td>${c.toLocaleString()}</td>
        <td>${p.toLocaleString()}</td>
        <td class="${cls}">${d.v.toLocaleString()}</td>
        <td class="${cls}">${d.p.toFixed(2)}%</td>
      </tr>
    `;
  }

  // ===============================
  // SECTION 1 – EXEC SUMMARY
  // ===============================
  tableSection.innerHTML = `
    <h3>Executive Summary (MTD vs MTD)</h3>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Current MTD</th>
          <th>Last MTD</th>
          <th>Δ</th>
          <th>Δ %</th>
        </tr>
      </thead>
      <tbody>
        ${row("Net Sales (GMV)", GMV_CURR.value, GMV_PREV.value)}
        ${row("Units Sold", GMV_CURR.units, GMV_PREV.units)}
        ${row("Ads Spend", ADS_CURR.spend, ADS_PREV.spend)}
        ${row("ROI", 
          ADS_CURR.spend ? ADS_CURR.revenue / ADS_CURR.spend : 0,
          ADS_PREV.spend ? ADS_PREV.revenue / ADS_PREV.spend : 0
        )}
      </tbody>
    </table>
  `;

  // ===============================
  // SECTION 2 – EXPAND / COLLAPSE
  // ===============================
  function expandable(title, rows) {
    return `
      <details open>
        <summary><strong>${title}</strong></summary>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Last</th>
              <th>Δ</th>
              <th>Δ %</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </details>
    `;
  }

  tableSection.innerHTML += expandable(
    "GMV Comparison",
    row("Net Sale", GMV_CURR.value, GMV_PREV.value) +
    row("Units", GMV_CURR.units, GMV_PREV.units) +
    row("Returns", GMV_CURR.returns, GMV_PREV.returns) +
    row("Cancellations", GMV_CURR.cancels, GMV_PREV.cancels)
  );

  tableSection.innerHTML += expandable(
    "CTR Comparison",
    row("Sale Units", CTR_CURR.units, CTR_PREV.units) +
    row("Returns", CTR_CURR.returns, CTR_PREV.returns) +
    row("Cancellations", CTR_CURR.cancels, CTR_PREV.cancels)
  );

  tableSection.innerHTML += expandable(
    "Ads Comparison (CDR)",
    row("Spend", ADS_CURR.spend, ADS_PREV.spend) +
    row("Revenue", ADS_CURR.revenue, ADS_PREV.revenue) +
    row("Units", ADS_CURR.units, ADS_PREV.units)
  );
};

