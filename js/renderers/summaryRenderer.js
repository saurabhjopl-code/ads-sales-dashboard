import { renderLineChart } from "../engines/charts/chartFactory.js";

function formatINR(num) {
    return "₹ " + Number(num || 0).toLocaleString("en-IN");
}

function percent(val) {
    return (val * 100).toFixed(2) + "%";
}

export function renderFullDashboard(gmv, ads, traffic, chartData) {

    const container = document.getElementById("app-content");

    container.innerHTML = `
        <div class="section">
            <div class="section-title">GMV Performance Summary</div>
            <div class="kpi-row">
                <div class="kpi-card"><div class="kpi-label">Gross Units Sold</div><div class="kpi-value">${gmv.grossUnits}</div></div>
                <div class="kpi-card"><div class="kpi-label">Gross Merchandise Value</div><div class="kpi-value">${formatINR(gmv.gmv)}</div></div>
                <div class="kpi-card"><div class="kpi-label">Cancelled Units (${percent(gmv.cancelUnits/gmv.grossUnits)})</div><div class="kpi-value">${gmv.cancelUnits}</div></div>
                <div class="kpi-card"><div class="kpi-label">Returned Units (${percent(gmv.returnUnits/gmv.grossUnits)})</div><div class="kpi-value">${gmv.returnUnits}</div></div>
                <div class="kpi-card"><div class="kpi-label">Final Units Delivered</div><div class="kpi-value">${gmv.finalUnits}</div></div>
                <div class="kpi-card"><div class="kpi-label">Net Revenue</div><div class="kpi-value">${formatINR(gmv.finalAmount)}</div></div>
            </div>
            <div class="chart-card"><canvas id="gmvChart"></canvas></div>
        </div>

        <div class="section">
            <div class="section-title">Ads Performance Summary</div>
            <div class="kpi-row">
                <div class="kpi-card"><div class="kpi-label">Ad Spend</div><div class="kpi-value">${formatINR(ads.spend)}</div></div>
                <div class="kpi-card"><div class="kpi-label">Converted Units</div><div class="kpi-value">${ads.units}</div></div>
                <div class="kpi-card"><div class="kpi-label">Revenue</div><div class="kpi-value">${formatINR(ads.revenue)}</div></div>
                <div class="kpi-card"><div class="kpi-label">ROI</div><div class="kpi-value">${ads.roi.toFixed(2)}</div></div>
            </div>
            <div class="chart-card"><canvas id="adsChart"></canvas></div>
        </div>

        <div class="section">
            <div class="section-title">Traffic Performance Summary</div>
            <div class="kpi-row">
                <div class="kpi-card"><div class="kpi-label">Total Views</div><div class="kpi-value">${traffic.views}</div></div>
                <div class="kpi-card"><div class="kpi-label">Total Clicks</div><div class="kpi-value">${traffic.clicks}</div></div>
                <div class="kpi-card"><div class="kpi-label">Total Sales</div><div class="kpi-value">${traffic.units}</div></div>
                <div class="kpi-card"><div class="kpi-label">Avg CTR</div><div class="kpi-value">${percent(traffic.ctr)}</div></div>
                <div class="kpi-card"><div class="kpi-label">Avg Conversion Rate</div><div class="kpi-value">${percent(traffic.cr)}</div></div>
            </div>
            <div class="chart-card"><canvas id="trafficChart"></canvas></div>
        </div>
    `;

    renderLineChart("gmvChart", chartData.gmv.labels, chartData.gmv.datasets);
    renderLineChart("adsChart", chartData.ads.labels, chartData.ads.datasets);
    renderLineChart("trafficChart", chartData.traffic.labels, chartData.traffic.datasets);
}
