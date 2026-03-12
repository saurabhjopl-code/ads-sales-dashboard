import { applyFilters } from "../../core/filterEngine.js";

export function getAdsOverview(){

const adsRows = applyFilters("CDR");
const gmvRows = applyFilters("GMV");

let spend = 0;
let views = 0;
let clicks = 0;
let units = 0;
let revenue = 0;

/* NET SALES */

let netSales = 0;

gmvRows.forEach(r=>{
netSales += Number(r["Final Sale Amount"] || 0);
});

/* ADS DATA */

const campaignMap = {};

adsRows.forEach(row=>{

const campaign = row["Campaign Name"] || "Unknown";

const s = Number(row["Ad Spend"] || 0);
const v = Number(row["Views"] || 0);
const c = Number(row["Clicks"] || 0);
const u = Number(row["Total converted units"] || 0);
const r = Number(row["Total Revenue (Rs.)"] || 0);

spend += s;
views += v;
clicks += c;
units += u;
revenue += r;

if(!campaignMap[campaign]){

campaignMap[campaign] = {
campaign,
spend:0,
views:0,
clicks:0,
units:0,
revenue:0
};

}

campaignMap[campaign].spend += s;
campaignMap[campaign].views += v;
campaignMap[campaign].clicks += c;
campaignMap[campaign].units += u;
campaignMap[campaign].revenue += r;

});

/* METRICS */

const roi = spend ? revenue/spend : 0;
const ctr = views ? (clicks/views)*100 : 0;
const cvr = clicks ? (units/clicks)*100 : 0;

/* FIXED ADS (5% OF NET SALES) */

const fixedAds = netSales * 0.03;

const diff = spend - fixedAds;

return{

spend,
views,
clicks,
units,
revenue,
roi,
ctr,
cvr,
netSales,
fixedAds,
diff,
campaigns:Object.values(campaignMap)

};

}
