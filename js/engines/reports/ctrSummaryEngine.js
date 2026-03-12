import { applyFilters } from "../../core/filterEngine.js";

export function getCtrSummary(){

const data = applyFilters("CTR");

let saleValue = 0;
let cancelValue = 0;
let returnValue = 0;

let saleOrders = 0;
let cancelOrders = 0;
let returnOrders = 0;

data.forEach(row => {

const type = (row["Event Type"] || "").toLowerCase();
const price = Number(row["Price before discount"] || 0);

if(type === "sale"){
saleValue += price;
saleOrders++;
}

if(type === "cancel"){
cancelValue += price;
cancelOrders++;
}

if(type === "return"){
returnValue += price;
returnOrders++;
}

});

const netValue = saleValue - cancelValue - returnValue;
const netOrders = saleOrders - cancelOrders - returnOrders;

return {
saleValue,
cancelValue,
returnValue,
netValue,
saleOrders,
cancelOrders,
returnOrders,
netOrders
};

}
