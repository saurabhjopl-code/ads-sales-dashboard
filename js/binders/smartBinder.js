import { STATE } from "../core/stateManager.js";
import { getSmartFunnel } from "../engines/reports/smartFunnelEngine.js";
import { getBrandProfitability } from "../engines/reports/brandProfitabilityEngine.js";
import { getCampaignEfficiency } from "../engines/reports/campaignEfficiencyEngine.js";
import { getInventoryRisk } from "../engines/reports/inventoryRiskEngine.js";
import { getInsights } from "../engines/insights/insightsEngine.js";

function percent(v){return (v*100).toFixed(2)+"%";}
function formatINR(n){return "₹ "+Number(n||0).toLocaleString("en-IN");}

export function renderSmartPage(){

const container=document.getElementById("app-content");

if(!STATE.ui.smartSubPage) STATE.ui.smartSubPage="funnel";

container.innerHTML=`

<div class="section">

<div class="section-title">Smart Reports</div>

<div class="ads-tabs">

<div class="ads-tab ${STATE.ui.smartSubPage==="funnel"?"active":""}" data-tab="funnel">
Ads vs Sales Funnel
</div>

<div class="ads-tab ${STATE.ui.smartSubPage==="brand"?"active":""}" data-tab="brand">
Brand Profitability
</div>

<div class="ads-tab ${STATE.ui.smartSubPage==="campaign"?"active":""}" data-tab="campaign">
Campaign Efficiency
</div>

<div class="ads-tab ${STATE.ui.smartSubPage==="risk"?"active":""}" data-tab="risk">
Inventory Risk
</div>

</div>

${renderInsightsPanel()}

<div id="smart-sub-content"></div>

</div>
`;

document.querySelectorAll(".ads-tab").forEach(tab=>{
tab.onclick=()=>{
STATE.ui.smartSubPage=tab.dataset.tab;
renderSmartPage();
};
});

if(STATE.ui.smartSubPage==="funnel") renderFunnel();
if(STATE.ui.smartSubPage==="brand") renderBrand();
if(STATE.ui.smartSubPage==="campaign") renderCampaign();
if(STATE.ui.smartSubPage==="risk") renderRisk();

}

function renderInsightsPanel(){

const insights=getInsights();

if(!insights.length){

return `
<div class="chart-card" style="margin-bottom:20px">

<div style="font-weight:600;margin-bottom:10px">
Critical Actions
</div>

<div style="
background:#e8f7e8;
padding:10px;
border-radius:8px;
font-size:14px;
">
✅ No issues detected. Performance looks healthy.
</div>

</div>
`;

}

return `

<div class="chart-card" style="margin-bottom:20px">

<div style="font-weight:600;margin-bottom:10px">
Critical Actions
</div>

${insights.map(i=>{

let color="#eee";
let icon="⚠";

if(i.type==="alert"){color="#ffe5e5";icon="🚨";}
if(i.type==="warning"){color="#fff5d6";icon="⚠";}
if(i.type==="opportunity"){color="#e8f7e8";icon="🚀";}

return `

<div style="
background:${color};
padding:10px;
border-radius:8px;
margin-bottom:8px;
font-size:14px;
">

${icon} ${i.text}

</div>

`;

}).join("")}

</div>

`;

}

function renderFunnel(){

const c=document.getElementById("smart-sub-content");
const f=getSmartFunnel();

c.innerHTML=`

<div class="kpi-row">

<div class="kpi-card"><div class="kpi-label">Views</div><div class="kpi-value">${f.views}</div></div>
<div class="kpi-card"><div class="kpi-label">Clicks</div><div class="kpi-value">${f.clicks}</div></div>
<div class="kpi-card"><div class="kpi-label">Ad Units</div><div class="kpi-value">${f.adUnits}</div></div>
<div class="kpi-card"><div class="kpi-label">Gross Orders</div><div class="kpi-value">${f.grossUnits}</div></div>
<div class="kpi-card"><div class="kpi-label">Final Sales</div><div class="kpi-value">${f.finalUnits}</div></div>

</div>

<div class="chart-card">
<canvas id="funnelCanvas" height="360"></canvas>
</div>

`;

drawFunnel(f);

}

function drawFunnel(f){

const canvas=document.getElementById("funnelCanvas");
const ctx=canvas.getContext("2d");

const data=[
{label:"Impressions",value:f.views,color:"#f6b3b3"},
{label:"Clicks",value:f.clicks,color:"#f5d98e"},
{label:"Ad Units",value:f.adUnits,color:"#a9c9ff"},
{label:"Orders",value:f.grossUnits,color:"#9fd8c3"},
{label:"Final Sales",value:f.finalUnits,color:"#8ed39f"}
];

const max=data[0].value;

const width=canvas.width=canvas.parentElement.offsetWidth-60;
const height=canvas.height;

const stepHeight=height/data.length;

ctx.clearRect(0,0,width,height);

data.forEach((d,i)=>{

const topWidth=(d.value/max)*width;
const bottomWidth=(i<data.length-1?(data[i+1].value/max)*width:topWidth*0.75);

const y=i*stepHeight;

const xTop=(width-topWidth)/2;
const xBottom=(width-bottomWidth)/2;

ctx.fillStyle=d.color;

ctx.beginPath();
ctx.moveTo(xTop,y);
ctx.lineTo(xTop+topWidth,y);
ctx.lineTo(xBottom+bottomWidth,y+stepHeight);
ctx.lineTo(xBottom,y+stepHeight);
ctx.closePath();
ctx.fill();

ctx.fillStyle="#222";
ctx.font="600 14px Inter";
ctx.textAlign="center";

const label=d.label+"  "+Number(d.value).toLocaleString("en-IN");

ctx.fillText(label,width/2,y+stepHeight/2+5);

if(i>0){

const prev=data[i-1].value;
const rate=((d.value/prev)*100).toFixed(1);

ctx.font="12px Inter";
ctx.fillStyle="#777";
ctx.fillText(rate+"% conversion",width/2,y+2);

}

});

}

function renderBrand(){

const c=document.getElementById("smart-sub-content");
const brands=getBrandProfitability();

c.innerHTML=`

<div class="chart-card">
<table class="modern-table">

<thead>
<tr>
<th>Brand</th>
<th>Final Revenue</th>
<th>Ad Revenue</th>
<th>Organic Revenue</th>
<th>Ad Share</th>
<th>Cancel %</th>
<th>Return %</th>
</tr>
</thead>

<tbody>

${brands.map(b=>`

<tr>
<td>${b.brand}</td>
<td>${formatINR(b.finalRevenue)}</td>
<td>${formatINR(b.adRevenue)}</td>
<td>${formatINR(b.organicRevenue)}</td>
<td>${percent(b.adShare)}</td>
<td>${percent(b.cancelRate)}</td>
<td>${percent(b.returnRate)}</td>
</tr>
`).join("")}

</tbody>

</table>
</div>
`;
}

function renderCampaign(){

const c=document.getElementById("smart-sub-content");
const rows=getCampaignEfficiency();

c.innerHTML=`

<div class="chart-card">

<table class="modern-table">

<thead>
<tr>
<th>Campaign</th>
<th>Spend</th>
<th>Ad Revenue</th>
<th>Final Revenue</th>
<th>ROI</th>
<th>Net ROI</th>
<th>CTR</th>
<th>CVR</th>
</tr>
</thead>

<tbody>

${rows.map(r=>`

<tr>
<td>${r.campaign}</td>
<td>${formatINR(r.spend)}</td>
<td>${formatINR(r.adRevenue)}</td>
<td>${formatINR(r.finalRevenue)}</td>
<td>${r.roi.toFixed(2)}</td>
<td>${r.netROI.toFixed(2)}</td>
<td>${percent(r.ctr)}</td>
<td>${percent(r.cvr)}</td>
</tr>
`).join("")}

</tbody>

</table>

</div>
`;
}

function renderRisk(){

const c=document.getElementById("smart-sub-content");
const rows=getInventoryRisk();

c.innerHTML=`

<div class="chart-card">

<table class="modern-table">

<thead>
<tr>
<th>SKU</th>
<th>Orders</th>
<th>Final Units</th>
<th>Cancel Units</th>
<th>Return Units</th>
<th>Cancel %</th>
<th>Return %</th>
<th>Risk Score</th>
</tr>
</thead>

<tbody>

${rows.map(r=>`

<tr>
<td>${r.sku}</td>
<td>${r.orders}</td>
<td>${r.finalUnits}</td>
<td>${r.cancelUnits}</td>
<td>${r.returnUnits}</td>
<td>${percent(r.cancelRate)}</td>
<td>${percent(r.returnRate)}</td>
<td>${r.riskScore}</td>
</tr>
`).join("")}

</tbody>

</table>

</div>
`;
}
