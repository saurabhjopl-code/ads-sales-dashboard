import { applyFilters } from "../../core/filterEngine.js";
import { parseDDMMYYYY } from "../../core/dateEngine.js";

export function getCtrTrend(){

const rows = applyFilters("CTR");

const map = {};

rows.forEach(r=>{

const date = r["Order Date"];
const type = (r["Event Type"] || "").trim();
const value = Number(r["Price before discount"] || 0);

if(!date) return;

if(!map[date]){
map[date] = {
sales:0,
cancel:0,
return:0
};
}

if(type === "Sale") map[date].sales += value;
if(type === "Cancel") map[date].cancel += value;
if(type === "Return") map[date].return += value;

});

const labels = Object.keys(map)
.sort((a,b)=>parseDDMMYYYY(a) - parseDDMMYYYY(b));

const sales = [];
const cancel = [];
const ret = [];
const net = [];

labels.forEach(d=>{

const s = map[d].sales;
const c = map[d].cancel;
const r = map[d].return;

sales.push(s);
cancel.push(c);
ret.push(r);
net.push(s - c - r);

});

return {
labels,
sales,
cancel,
return:ret,
net
};

}
