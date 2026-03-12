import { STATE, setMeta } from "./stateManager.js";
import { startProgress, finishProgress } from "./progressEngine.js";
import { API_CONFIG } from "../config/apiConfig.js";

function parseCSV(text) {

const rows = text.trim().split(/\r?\n/);
const headers = rows[0].split(",").map(h => h.trim());

return rows.slice(1).map(row => {

const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
const obj = {};

headers.forEach((h,i)=>{

let val = values[i] || "";
val = val.replace(/^"|"$/g,"").trim();

obj[h] = val;

});

return obj;

});

}

async function loadCSV(url){

const response = await fetch(url);
const text = await response.text();

return parseCSV(text);

}

function buildACCList(){

const accSet = new Set();

Object.values(STATE.rawData).forEach(sheet=>{

sheet.forEach(row=>{

if(row.ACC){
accSet.add(row.ACC.trim());
}

});

});

const accList = Array.from(accSet).sort();

setMeta({accList});

console.log("ACC Loaded:", accList);

}

export async function loadAllData(){

startProgress();

/* ensure rawData exists */
STATE.rawData = {};
STATE.data = {};

for(const key in API_CONFIG){

const data = await loadCSV(API_CONFIG[key]);

/* keep old structure (engines depend on this) */
STATE.rawData[key] = data;

/* also keep normalized structure */
STATE.data[key.toLowerCase()] = data;

}

buildACCList();

console.log("Data Loaded:", STATE.data);

finishProgress();

}
