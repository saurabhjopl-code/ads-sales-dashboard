import { getSkuReport } from "../engines/reports/skuReportEngine.js";

function formatINR(num) {
    return "₹ " + Number(num || 0).toLocaleString("en-IN");
}

function percent(val) {
    return (val * 100).toFixed(2) + "%";
}

export function renderSkuSection() {

    const container = document.getElementById("ads-sub-content");
    const skus = getSkuReport();

    let totalRevenue = 0;
    let totalUnits = 0;
    let totalClicks = 0;
    let totalViews = 0;

    skus.forEach(s => {
        totalRevenue += s.revenue;
        totalUnits += s.totalUnits;
        totalClicks += s.clicks;
        totalViews += s.views;
    });

    const avgCTR = totalViews ? totalClicks / totalViews : 0;
    const avgCVR = totalClicks ? totalUnits / totalClicks : 0;

    container.innerHTML = `
        <div class="kpi-row">
            <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value">${formatINR(totalRevenue)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Units</div><div class="kpi-value">${totalUnits}</div></div>
            <div class="kpi-card"><div class="kpi-label">Avg CTR</div><div class="kpi-value">${percent(avgCTR)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Avg CVR</div><div class="kpi-value">${percent(avgCVR)}</div></div>
        </div>

        <div class="chart-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Product</th>
                        <th>Revenue</th>
                        <th>Total Units</th>
                        <th>Direct Units</th>
                        <th>Indirect Units</th>
                        <th>Views</th>
                        <th>Clicks</th>
                        <th>CTR</th>
                        <th>CVR</th>
                    </tr>
                </thead>
                <tbody>
                    ${skus.map(s => `
                        <tr>
                            <td>${s.sku}</td>
                            <td>${s.name}</td>
                            <td>${formatINR(s.revenue)}</td>
                            <td>${s.totalUnits}</td>
                            <td>${s.directUnits}</td>
                            <td>${s.indirectUnits}</td>
                            <td>${s.views}</td>
                            <td>${s.clicks}</td>
                            <td>${percent(s.ctr)}</td>
                            <td>${percent(s.cvr)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}
