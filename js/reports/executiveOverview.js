// =======================================
// REPORT: Executive Overview (UI Shell)
// Version: V3.2+
// =======================================

window.renderExecutiveOverview = function () {
  const chartsSection = document.getElementById("chartsSection");
  const tableSection = document.getElementById("tableSection");

  chartsSection.innerHTML = "";
  tableSection.innerHTML = "";

  // Tabs
  const tabs = document.createElement("div");
  tabs.className = "report-tabs";
  tabs.innerHTML = `
    <button class="tab active" data-tab="gmv">GMV BASED OVERVIEW</button>
    <button class="tab" data-tab="ctr">TRANSACTION (CTR) BASED OVERVIEW</button>
  `;

  // Table wrapper
  const tableWrapper = document.createElement("div");
  tableWrapper.id = "execTableWrapper";

  function renderEmptyTable(type) {
    tableWrapper.innerHTML = `
      <table>
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
        <tbody>
          <tr>
            <td colspan="15" style="text-align:center; padding:20px;">
              ${type === "gmv"
                ? "GMV Based Executive Overview – Data will load here"
                : "CTR Based Executive Overview – Data will load here"}
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }

  renderEmptyTable("gmv");

  tabs.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      tabs.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderEmptyTable(tab.dataset.tab);
    };
  });

  chartsSection.appendChild(tabs);
  tableSection.appendChild(tableWrapper);
};
