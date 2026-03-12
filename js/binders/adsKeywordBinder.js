import { getKeywordReport } from "../engines/reports/keywordReportEngine.js";

function formatINR(num) {
    return "₹ " + Number(num || 0).toLocaleString("en-IN");
}

function percent(val) {
    return (val * 100).toFixed(2) + "%";
}

export function renderKeywordSection() {

    const container = document.getElementById("ads-sub-content");
    const keywords = getKeywordReport();

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalClicks = 0;
    let totalViews = 0;

    keywords.forEach(k => {
        totalSpend += k.spend;
        totalRevenue += k.revenue;
        totalUnits += k.totalUnits;
        totalClicks += k.clicks;
        totalViews += k.views;
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
                        <th>Keyword</th>
                        <th>Match</th>
                        <th>Spend</th>
                        <th>Total Revenue</th>
                        <th>Direct Revenue</th>
                        <th>Total Units</th>
                        <th>ROI</th>
                        <th>Direct ROI</th>
                        <th>CTR</th>
                        <th>CPC</th>
                        <th>CVR</th>
                    </tr>
                </thead>
                <tbody>
                    ${keywords.map(k => `
                        <tr>
                            <td>${k.keyword}</td>
                            <td>${k.matchType}</td>
                            <td>${formatINR(k.spend)}</td>
                            <td>${formatINR(k.revenue)}</td>
                            <td>${formatINR(k.directRevenue)}</td>
                            <td>${k.totalUnits}</td>
                            <td>${k.roi.toFixed(2)}</td>
                            <td>${k.directROI.toFixed(2)}</td>
                            <td>${percent(k.ctr)}</td>
                            <td>${formatINR(k.cpc)}</td>
                            <td>${percent(k.cvr)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}
