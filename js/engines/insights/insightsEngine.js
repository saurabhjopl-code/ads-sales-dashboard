import { STATE } from "../../core/stateManager.js";

export function getInsights(){

const insights=[];

  insights.push({
type:"warning",
text:"Insights engine running correctly"
});

/* SAFE DATA ACCESS */
const ctr = STATE.data?.ctr || [];
const cdr = STATE.data?.cdr || [];
const cfr = STATE.data?.cfr || [];

/* =========================
SKU CANCEL / RETURN CHECK
========================= */

let skuStats={};

ctr.forEach(r=>{

const sku=r.sku;
if(!sku) return;

if(!skuStats[sku]){
skuStats[sku]={sales:0,cancel:0,return:0};
}

const type=(r.event_type||"").toUpperCase();

if(type==="SALE") skuStats[sku].sales+=Number(r.item_quantity||0);
if(type==="CANCEL") skuStats[sku].cancel+=Number(r.item_quantity||0);
if(type==="RETURN") skuStats[sku].return+=Number(r.item_quantity||0);

});

Object.keys(skuStats).forEach(sku=>{

const s=skuStats[sku];

const cancelRate=s.cancel/(s.sales||1);
const returnRate=s.return/(s.sales||1);

if(cancelRate>0.25){

insights.push({
type:"alert",
text:`High cancel rate SKU ${sku} (${(cancelRate*100).toFixed(1)}%)`
});

}

if(returnRate>0.25){

insights.push({
type:"alert",
text:`High return rate SKU ${sku} (${(returnRate*100).toFixed(1)}%)`
});

}

});

/* =========================
CAMPAIGN CHECK
========================= */

cdr.forEach(c=>{

const spend=Number(c.ad_spend||0);
const revenue=Number(c.total_revenue_rs||0);
const clicks=Number(c.clicks||0);
const views=Number(c.views||0);

const ctrRate=clicks/(views||1);
const roi=revenue/(spend||1);

if(spend>5000 && revenue===0){

insights.push({
type:"alert",
text:`Campaign "${c.campaign_name}" spending but no revenue`
});

}

if(ctrRate<0.005 && views>1000){

insights.push({
type:"warning",
text:`Low CTR campaign "${c.campaign_name}"`
});

}

if(roi>8 && spend>2000){

insights.push({
type:"opportunity",
text:`Scale campaign "${c.campaign_name}" ROI ${roi.toFixed(1)}`
});

}

});

/* LIMIT PANEL SIZE */
return insights.slice(0,6);

}
