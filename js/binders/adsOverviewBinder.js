import { getAdsOverview } from "../engines/reports/adsOverviewEngine.js";

export function renderAdsOverviewPage() {

const container = document.getElementById("ads-sub-content");

if (!container) return;

container.innerHTML = `
<div class="section">
<div class="section-title">Ads Efficiency & Budget Control</div>

<div class="summary-grid">
<div class="summary-card"><div class="summary-label">Ad Spends</div><div id="ads-spend">₹0</div></div>
<div class="summary-card"><div class="summary-label">ROI</div><div id="ads-roi">0</div></div>
<div class="summary-card"><div class="summary-label">Views</div><div id="ads-views">0</div></div>
<div class="summary-card"><div class="summary-label">Clicks</div><div id="ads-clicks">0</div></div>
<div class="summary-card"><div class="summary-label">CTR</div><div id="ads-ctr">0%</div></div>
<div class="summary-card"><div class="summary-label">Total Units Sold</div><div id="ads-units">0</div></div>
<div class="summary-card"><div class="summary-label">CVR</div><div id="ads-cvr">0%</div></div>
<div class="summary-card"><div class="summary-label">GMV</div><div id="ads-revenue">₹0</div></div>
<div class="summary-card"><div class="summary-label">Fixed Ads (5%)</div><div id="ads-fixed">₹0</div></div>
<div class="summary-card"><div class="summary-label">Ads Amount Diff</div><div id="ads-diff">₹0</div></div>
</div>

<table class="report-table">
<thead>
<tr>
<th>Campaign Name</th>
<th>Ad Spend</th>
<th>Views</th>
<th>Clicks</th>
<th>Total Units Sold</th>
<th>Total Revenue</th>
</tr>
</thead>
<tbody id="ads-overview-table"></tbody>
</table>
</div>
`;

try {

const data = getAdsOverview();

document.getElementById("ads-spend").innerText = "₹" + data.spend.toLocaleString();
document.getElementById("ads-roi").innerText = data.roi.toFixed(2);
document.getElementById("ads-views").innerText = data.views.toLocaleString();
document.getElementById("ads-clicks").innerText = data.clicks.toLocaleString();
document.getElementById("ads-ctr").innerText = data.ctr.toFixed(2) + "%";
document.getElementById("ads-units").innerText = data.units.toLocaleString();
document.getElementById("ads-cvr").innerText = data.cvr.toFixed(2) + "%";
document.getElementById("ads-revenue").innerText = "₹" + data.revenue.toLocaleString();
document.getElementById("ads-fixed").innerText ="₹" + data.fixedAds.toLocaleString();
document.getElementById("ads-diff").innerText ="₹" + data.diff.toLocaleString(); 

const table = document.getElementById("ads-overview-table");

data.campaigns.forEach(r => {

const tr = document.createElement("tr");

tr.innerHTML = `
<td>${r.campaign}</td>
<td>₹${r.spend.toLocaleString()}</td>
<td>${r.views.toLocaleString()}</td>
<td>${r.clicks.toLocaleString()}</td>
<td>${r.units.toLocaleString()}</td>
<td>₹${r.revenue.toLocaleString()}</td>
`;

table.appendChild(tr);

});

} catch (e) {
console.error("Ads Overview failed:", e);
}

}
