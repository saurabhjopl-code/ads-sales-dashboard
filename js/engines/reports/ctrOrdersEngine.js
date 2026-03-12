import { applyFilters } from "../../core/filterEngine.js";

export function getCtrOrders(){

const rows = applyFilters("CTR");

const data = rows.map(row => {

const date = row["Order Date"] || "";
const sku = row["SKU"] || "";
const type = row["Event Type"] || "";
const fulfilment = row["Fulfilment Type"] || "";
const price = Number(row["Price before discount"] || 0);

return {
date,
sku,
type,
fulfilment,
price
};

});

data.sort((a,b)=>{

const d1 = new Date(a.date.split("/").reverse().join("-"));
const d2 = new Date(b.date.split("/").reverse().join("-"));

return d2 - d1;

});

return data.slice(0,200);

}
