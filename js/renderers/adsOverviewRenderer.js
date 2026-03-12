export function renderAdsOverview(data){

const container = document.getElementById("ads-sub-content");

const s = data.summary;

const diffColor = s.diff > 0 ? "red" : "green";

container.innerHTML = `

<div class="summary-grid">

<div class="summary-card">
<div class="summary-title">Ad Spends</div>
<div class="summary-value">₹${s.spend.toLocaleString()}</div>
</div>

<div class="summary-card">
<div class="summary-title">ROI</div>
<div class="summary-value">${s.roi.toFixed(2)}</div>
</div>

<div class="summary-card">
<div class="summary-title">Views</div>
<div class="summary-value">${s.views.toLocaleString()}</div>
</div>

<div class="summary-card">
<div class="summary-title">Clicks</div>
<div class="summary-value">${s.clicks.toLocaleString()}</div>
</div>

<div class="summary-card">
<div class="summary-title">CTR</div>
<div class="summary-value">${s.ctr.toFixed(2)}%</div>
</div>

<div class="summary-card">
<div class="summary-title">Total Units Sold</div>
<div class="summary-value">${s.units.toLocaleString()}</div>
</div>

<div class="summary-card">
<div class="summary-title">CVR</div>
<div class="summary-value">${s.cvr.toFixed(2)}%</div>
</div>

<div class="summary-card">
<div class="summary-title">GMV</div>
<div class="summary-value">₹${s.revenue.toLocaleString()}</div>
</div>

<div class="summary-card">
<div class="summary-title">Fixed Ads (3%)</div>
<div class="summary-value">₹${s.fixedAds.toLocaleString()}</div>
</div>

<div class="summary-card">
<div class="summary-title">Ads Amount Diff</div>
<div class="summary-value" style="color:${diffColor}">
₹${s.diff.toLocaleString()}
</div>
</div>

</div>

<div class="report-table-container">

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

<tbody>

${data.campaigns.map(r=>`

<tr>
<td>${r.campaign}</td>
<td>₹${r.spend.toLocaleString()}</td>
<td>${r.views.toLocaleString()}</td>
<td>${r.clicks.toLocaleString()}</td>
<td>${r.units.toLocaleString()}</td>
<td>₹${r.revenue.toLocaleString()}</td>
</tr>

`).join("")}

</tbody>

</table>

</div>

`;

}
