import { getBlendedSkuReport } from "../engines/reports/blendedSkuReportEngine.js";

function formatINR(num) {
    return "₹ " + Number(num || 0).toLocaleString("en-IN");
}

function percent(val) {
    return (val * 100).toFixed(2) + "%";
}

export function renderBlendedSkuSection() {

    const container = document.getElementById("ads-sub-content");
    const skus = getBlendedSkuReport();

    container.innerHTML = `
        <div class="chart-card">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Final Revenue</th>
                        <th>Ad Revenue</th>
                        <th>Organic Revenue</th>
                        <th>Ad Units</th>
                        <th>Net Units</th>
                        <th>Cancel %</th>
                        <th>Return %</th>
                    </tr>
                </thead>
                <tbody>
                    ${skus.map(s => `
                        <tr>
                            <td>${s.sku}</td>
                            <td>${formatINR(s.finalRevenue)}</td>
                            <td>${formatINR(s.adRevenue)}</td>
                            <td>${formatINR(s.organicRevenue)}</td>
                            <td>${s.adUnits}</td>
                            <td>${s.finalUnits}</td>
                            <td>${percent(s.cancelRate)}</td>
                            <td>${percent(s.returnRate)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}
