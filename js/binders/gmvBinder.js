import { STATE } from "../core/stateManager.js";
import { getGmvOverview } from "../engines/reports/gmvOverviewEngine.js";
import { getGMVSummary } from "../engines/summary/gmvSummaryEngine.js";
import { getGmvBrandReport } from "../engines/reports/gmvBrandReportEngine.js";
import { getGmvCategoryReport } from "../engines/reports/gmvCategoryReportEngine.js";
import { getGmvFulfillmentReport } from "../engines/reports/gmvFulfillmentReportEngine.js";
import { getGmvLocationReport } from "../engines/reports/gmvLocationReportEngine.js";
import { renderLineChart } from "../engines/charts/chartFactory.js";

function inr(n){
return "₹ "+Number(n||0).toLocaleString("en-IN");
}

function percent(v){
return (v*100).toFixed(2)+"%";
}

function compare(curr,prev){
if(!prev) return {txt:"",cls:""};
const diff=((curr-prev)/prev)*100;
return{
txt:`${diff>=0?"▲":"▼"} ${Math.abs(diff).toFixed(1)}% (From previous period)`,
cls:diff>=0?"kpi-up":"kpi-down"
};
}

export function renderGmvPage(){

const container=document.getElementById("app-content");

if(!STATE.ui.gmvSubPage) STATE.ui.gmvSubPage="overview";
if(!STATE.ui.gmvChartMode) STATE.ui.gmvChartMode="revenue";

container.innerHTML=`

<div class="section">

<div class="section-title">GMV Reports</div>

<div class="ads-tabs">
<div class="ads-tab ${STATE.ui.gmvSubPage==="overview"?"active":""}" data-tab="overview">Overview</div>
<div class="ads-tab ${STATE.ui.gmvSubPage==="brand"?"active":""}" data-tab="brand">Brand</div>
<div class="ads-tab ${STATE.ui.gmvSubPage==="category"?"active":""}" data-tab="category">Category</div>
<div class="ads-tab ${STATE.ui.gmvSubPage==="fulfillment"?"active":""}" data-tab="fulfillment">Fulfillment</div>
<div class="ads-tab ${STATE.ui.gmvSubPage==="location"?"active":""}" data-tab="location">Location</div>
</div>

<div id="gmv-sub-content"></div>

</div>
`;

document.querySelectorAll(".ads-tab").forEach(tab=>{
tab.onclick=()=>{
STATE.ui.gmvSubPage=tab.dataset.tab;
renderGmvPage();
};
});

if(STATE.ui.gmvSubPage==="overview") renderOverview();
if(STATE.ui.gmvSubPage==="brand") renderBrand();
if(STATE.ui.gmvSubPage==="category") renderCategory();
if(STATE.ui.gmvSubPage==="fulfillment") renderFulfillment();
if(STATE.ui.gmvSubPage==="location") renderLocation();

}

function renderOverview(){

const container=document.getElementById("gmv-sub-content");

const summary=getGMVSummary();
const overview=getGmvOverview();

const afterCancel=summary.gmv-summary.cancelAmount;

const prevFilters={...STATE.filters};

const start=new Date(prevFilters.startDate);
const end=new Date(prevFilters.endDate);
const diff=end-start;

const prevEnd=new Date(start);
prevEnd.setDate(prevEnd.getDate()-1);

const prevStart=new Date(prevEnd);
prevStart.setTime(prevEnd.getTime()-diff);

STATE.filters.startDate=prevStart.toISOString().split("T")[0];
STATE.filters.endDate=prevEnd.toISOString().split("T")[0];

const prev=getGMVSummary();

STATE.filters=prevFilters;

const grossCompare=compare(summary.gmv,prev.gmv);
const cancelCompare=compare(summary.cancelAmount,prev.cancelAmount);
const afterCompare=compare(afterCancel,(prev.gmv-prev.cancelAmount));
const returnCompare=compare(summary.returnAmount,prev.returnAmount);
const netCompare=compare(summary.finalAmount,prev.finalAmount);

container.innerHTML=`

<div class="kpi-row">

<div class="kpi-card">
<div class="kpi-label">Gross Sales</div>
<div class="kpi-value">${inr(summary.gmv)} (${summary.grossUnits} units)</div>
<div class="kpi-compare ${grossCompare.cls}">${grossCompare.txt}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Cancellations</div>
<div class="kpi-value">${inr(summary.cancelAmount)} (${summary.cancelUnits} units)</div>
<div class="kpi-compare ${cancelCompare.cls}">${cancelCompare.txt}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Sales After Cancellations</div>
<div class="kpi-value">${inr(afterCancel)} (${summary.grossUnits-summary.cancelUnits} units)</div>
<div class="kpi-compare ${afterCompare.cls}">${afterCompare.txt}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Returns</div>
<div class="kpi-value">${inr(summary.returnAmount)} (${summary.returnUnits} units)</div>
<div class="kpi-compare ${returnCompare.cls}">${returnCompare.txt}</div>
</div>

<div class="kpi-card">
<div class="kpi-label">Net Sales</div>
<div class="kpi-value">${inr(summary.finalAmount)} (${summary.finalUnits} units)</div>
<div class="kpi-compare ${netCompare.cls}">${netCompare.txt}</div>
</div>

</div>

<div class="toggle-group">
<button id="revBtn" class="toggle-btn ${STATE.ui.gmvChartMode==="revenue"?"active":""}">Revenue</button>
<button id="unitBtn" class="toggle-btn ${STATE.ui.gmvChartMode==="units"?"active":""}">Units</button>
</div>

<div class="chart-card">
<canvas id="gmvChart"></canvas>
</div>
`;

document.getElementById("revBtn").onclick=()=>{
STATE.ui.gmvChartMode="revenue";
renderOverview();
};

document.getElementById("unitBtn").onclick=()=>{
STATE.ui.gmvChartMode="units";
renderOverview();
};

const labels=overview.chartData.labels;

const gmv=overview.chartData.datasets[0].data;
const net=overview.chartData.datasets[1].data;
const cancelUnits=overview.chartData.datasets[2].data;
const returnUnits=overview.chartData.datasets[3].data;

const avgPrice=gmv.map((v,i)=>v/(cancelUnits[i]+returnUnits[i]+1));

const cancelAmount=cancelUnits.map((u,i)=>u*avgPrice[i]);
const returnAmount=returnUnits.map((u,i)=>u*avgPrice[i]);

const grossUnits=cancelUnits.map((c,i)=>c+returnUnits[i]+1);
const netUnits=grossUnits.map((g,i)=>g-cancelUnits[i]-returnUnits[i]);

let datasets;

if(STATE.ui.gmvChartMode==="revenue"){

datasets=[
{label:"GMV",data:gmv,borderColor:"#2563eb",tension:0.3},
{label:"Cancellations",data:cancelAmount,borderColor:"#dc2626",tension:0.3},
{label:"Returns",data:returnAmount,borderColor:"#f59e0b",tension:0.3},
{label:"Net Sales",data:net,borderColor:"#16a34a",tension:0.3}
];

}else{

datasets=[
{label:"Gross Units",data:grossUnits,borderColor:"#2563eb",tension:0.3},
{label:"Cancel Units",data:cancelUnits,borderColor:"#dc2626",tension:0.3},
{label:"Return Units",data:returnUnits,borderColor:"#f59e0b",tension:0.3},
{label:"Net Units",data:netUnits,borderColor:"#16a34a",tension:0.3}
];

}

renderLineChart("gmvChart",labels,datasets);

}

function renderBrand(){
renderTable(getGmvBrandReport(),"brand");
}

function renderCategory(){
renderTable(getGmvCategoryReport(),"category");
}

function renderFulfillment(){
renderTable(getGmvFulfillmentReport(),"fulfillment");
}

function renderLocation(){
renderTable(getGmvLocationReport(),"location");
}

function renderTable(rows,type){

const container=document.getElementById("gmv-sub-content");

let header="";
let field="";

if(type==="brand"){header="Brand";field="brand";}
if(type==="category"){header="Category / Vertical";field="category";}
if(type==="fulfillment"){header="Fulfillment";field="fulfillment";}
if(type==="location"){header="Location";field="location";}

container.innerHTML=`

<div class="chart-card">
<table class="modern-table">

<thead>
<tr>
<th>${header}</th>
<th>Final Revenue</th>
<th>Gross Units</th>
<th>Final Units</th>
<th>Cancel Units</th>
<th>Return Units</th>
<th>Cancel %</th>
<th>Return %</th>
</tr>
</thead>

<tbody>
${rows.map(r=>`
<tr>
<td>${r[field]}</td>
<td>${inr(r.finalRevenue)}</td>
<td>${r.grossUnits}</td>
<td>${r.finalUnits}</td>
<td>${r.cancelUnits}</td>
<td>${r.returnUnits}</td>
<td>${percent(r.cancelRate)}</td>
<td>${percent(r.returnRate)}</td>
</tr>
`).join("")}
</tbody>

</table>
</div>
`;

}
