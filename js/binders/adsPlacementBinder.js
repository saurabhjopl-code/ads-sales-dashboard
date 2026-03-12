import { getPlacementReport } from "../engines/reports/placementReportEngine.js";

function formatINR(num) {
    return "₹ " + Number(num || 0).toLocaleString("en-IN");
}

function percent(val) {
    return (val * 100).toFixed(2) + "%";
}

export function renderPlacementSection() {

    const container = document.getElementById("ads-sub-content");
    const placements = getPlacementReport();

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalClicks = 0;
    let totalViews = 0;

    placements.forEach(p => {
        totalSpend += p.spend;
        totalRevenue += p.revenue;
        totalUnits += p.totalUnits;
        totalClicks += p.clicks;
        totalViews += p.views;
    });

    const overallROI = totalSpend ? totalRevenue / totalSpend : 0;
    const avgCPC = totalClicks ? totalSpend / totalClicks : 0;
    const avgCTR = totalViews ? totalClicks / totalViews : 0;
    const avgCVR = totalClicks ? totalUnits / totalClicks : 0;

    container.innerHTML = `
        <div class="kpi-row">
            <div class="kpi-card"><div class="kpi-label">Total Spend</div><div class="kpi-value">${formatINR(totalSpend)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value">${formatINR(totalRevenue)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Units</div><div class="kpi-value">${totalUnits}</div></div>
            <div class="kpi-card"><div class="kpi-label">Overall ROI</div><div class="kpi-value">${overallROI.toFixed(2)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Avg CPC</div><div class="kpi-value">${formatINR(avgCPC)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Avg CTR</div><div class="kpi-value">${percent(avgCTR)}</div></div>
        </div>

        <div class="chart-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Placement</th>
                        <th>Spend</th>
                        <th>Revenue</th>
                        <th>Units</th>
                        <th>ROI</th>
                        <th>Views</th>
                        <th>Clicks</th>
                        <th>CTR</th>
                        <th>CPC</th>
                        <th>CVR</th>
                    </tr>
                </thead>
                <tbody>
                    ${placements.map(p => `
                        <tr>
                            <td>${p.placement}</td>
                            <td>${formatINR(p.spend)}</td>
                            <td>${formatINR(p.revenue)}</td>
                            <td>${p.totalUnits}</td>
                            <td>${p.roi.toFixed(2)}</td>
                            <td>${p.views}</td>
                            <td>${p.clicks}</td>
                            <td>${percent(p.ctr)}</td>
                            <td>${formatINR(p.cpc)}</td>
                            <td>${percent(p.cvr)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}
