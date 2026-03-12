import { STATE } from "../core/stateManager.js";
import { getCtrSummary } from "../engines/reports/ctrSummaryEngine.js";
import { getCtrFulfilment } from "../engines/reports/ctrFulfilmentEngine.js";
import { getCtrTrend } from "../engines/reports/ctrTrendEngine.js";

function formatINR(n){
return "₹ " + Number(n || 0).toLocaleString("en-IN");
}

function percent(v){
return (v * 100).toFixed(2) + "%";
}

export function renderCtrPage(){

const container = document.getElementById("app-content");

if(!STATE.ui.ctrTab) STATE.ui.ctrTab = "performance";

container.innerHTML = `

<div class="section">

<div class="section-title">CTR Analytics</div>

<div class="ads-tabs">

<div class="ads-tab ${STATE.ui.ctrTab==="performance"?"active":""}" data-tab="performance">
Order Performance
</div>

<div class="ads-tab ${STATE.ui.ctrTab==="fulfilment"?"active":""}" data-tab="fulfilment">
Fulfilment Analysis
</div>

</div>

<div id="ctr-content"></div>

</div>
`;

document.querySelectorAll(".ads-tab").forEach(tab=>{
tab.onclick=()=>{
STATE.ui.ctrTab = tab.dataset.tab;
renderCtrPage();
};
});

if(STATE.ui.ctrTab==="performance") renderPerformance();
if(STATE.ui.ctrTab==="fulfilment") renderFulfilment();

}

function renderPerformance(){

const c = document.getElementById("ctr-content");

const s = getCtrSummary();

c.innerHTML = `

<div class="kpi-row">

<div class="kpi-card">
<div class="kpi-label">Sale Value</div>
<div class="kpi-value">${formatINR(s.saleValue)}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Cancel Value</div>
<div class="kpi-value">${formatINR(s.cancelValue)}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Return Value</div>
<div class="kpi-value">${formatINR(s.returnValue)}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Net Value</div>
<div class="kpi-value">${formatINR(s.netValue)}</div>
</div>

</div>

<div class="kpi-row">

<div class="kpi-card">
<div class="kpi-label">Sale Orders</div>
<div class="kpi-value">${s.saleOrders}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Cancel Orders</div>
<div class="kpi-value">${s.cancelOrders}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Return Orders</div>
<div class="kpi-value">${s.returnOrders}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Net Orders</div>
<div class="kpi-value">${s.netOrders}</div>
</div>

</div>

<div class="chart-card">
<canvas id="ctrTrendChart"></canvas>
</div>
`;

renderTrendChart();

}

function renderTrendChart(){

const data = getCtrTrend();

const ctx = document.getElementById("ctrTrendChart");

new Chart(ctx,{
type:"line",
data:{
labels:data.labels,
datasets:[

{
label:"Sales",
data:data.sales,
borderColor:"#2563eb",
backgroundColor:"transparent",
tension:0.3
},

{
label:"Cancel",
data:data.cancel,
borderColor:"#dc2626",
backgroundColor:"transparent",
tension:0.3
},

{
label:"Return",
data:data.return,
borderColor:"#f59e0b",
backgroundColor:"transparent",
tension:0.3
},

{
label:"Net",
data:data.net,
borderColor:"#16a34a",
backgroundColor:"transparent",
tension:0.3
}

]
},
options:{
responsive:true,
plugins:{
legend:{position:"top"}
},
scales:{
y:{beginAtZero:true}
}
}
});

}

function renderFulfilment(){

const c = document.getElementById("ctr-content");

const rows = getCtrFulfilment();

c.innerHTML = `

<div class="chart-card">

<table class="modern-table">

<thead>
<tr>
<th>Fulfilment</th>
<th>Sale Value</th>
<th>Cancel Value</th>
<th>Return Value</th>
<th>Net Value</th>
<th>Cancel %</th>
<th>Return %</th>
</tr>
</thead>

<tbody>

${rows.map(r=>`
<tr>
<td>${r.fulfilment}</td>
<td>${formatINR(r.saleValue)}</td>
<td>${formatINR(r.cancelValue)}</td>
<td>${formatINR(r.returnValue)}</td>
<td>${formatINR(r.netValue)}</td>
<td>${percent(r.cancelRate)}</td>
<td>${percent(r.returnRate)}</td>
</tr>
`).join("")}

</tbody>

</table>

</div>

`;

}
