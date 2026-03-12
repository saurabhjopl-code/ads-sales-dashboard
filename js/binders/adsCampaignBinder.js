import { getCampaignReport } from "../engines/reports/campaignReportEngine.js";

function formatINR(num) {
    return "₹ " + Number(num || 0).toLocaleString("en-IN");
}

function percent(val) {
    return (val * 100).toFixed(2) + "%";
}

export function renderCampaignSection() {

    const container = document.getElementById("ads-sub-content");
    const campaigns = getCampaignReport();

    container.innerHTML = `
        <div class="chart-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Spend</th>
                        <th>Revenue</th>
                        <th>Units</th>
                        <th>ROI</th>
                        <th>CTR</th>
                        <th>CPC</th>
                        <th>CVR</th>
                    </tr>
                </thead>
                <tbody>
                    ${campaigns.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td>${formatINR(c.spend)}</td>
                            <td>${formatINR(c.revenue)}</td>
                            <td>${c.units}</td>
                            <td>${c.roi.toFixed(2)}</td>
                            <td>${percent(c.ctr)}</td>
                            <td>${formatINR(c.cpc)}</td>
                            <td>${percent(c.cvr)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}
