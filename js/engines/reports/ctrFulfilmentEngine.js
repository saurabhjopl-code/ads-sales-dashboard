import { applyFilters } from "../../core/filterEngine.js";

export function getCtrFulfilment(){

const data = applyFilters("CTR");

const map = {};

data.forEach(row => {

const fulfilment = row["Fulfilment Type"] || "Unknown";
const type = (row["Event Type"] || "").toLowerCase();
const price = Number(row["Price before discount"] || 0);

if(!map[fulfilment]){

map[fulfilment] = {
fulfilment,
saleValue:0,
cancelValue:0,
returnValue:0,
saleOrders:0,
cancelOrders:0,
returnOrders:0
};

}

if(type==="sale"){
map[fulfilment].saleValue += price;
map[fulfilment].saleOrders += 1;
}

if(type==="cancel"){
map[fulfilment].cancelValue += price;
map[fulfilment].cancelOrders += 1;
}

if(type==="return"){
map[fulfilment].returnValue += price;
map[fulfilment].returnOrders += 1;
}

});

const rows = Object.values(map).map(r => {

const netValue = r.saleValue - r.cancelValue - r.returnValue;

const cancelRate = r.saleOrders ? r.cancelOrders / r.saleOrders : 0;
const returnRate = r.saleOrders ? r.returnOrders / r.saleOrders : 0;

return {
...r,
netValue,
cancelRate,
returnRate
};

});

return rows;

}
