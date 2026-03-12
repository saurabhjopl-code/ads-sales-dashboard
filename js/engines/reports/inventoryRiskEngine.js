import { applyFilters } from "../../core/filterEngine.js";

export function getInventoryRisk(){

    const ctr=applyFilters("CTR");
    const gmv=applyFilters("GMV");

    const map={};

    // CTR orders
    ctr.forEach(r=>{

        const sku=r["SKU"]||"Unknown";

        if(!map[sku]){
            map[sku]={
                sku,
                orders:0,
                finalUnits:0,
                cancelUnits:0,
                returnUnits:0
            };
        }

        const type = (r["Event Type"] || "").toLowerCase();
        if (type === "sale"){
            map[sku].orders+=Number(r["Item Quantity"]||0);
        }

    });

    // GMV data
    gmv.forEach(r=>{

        const sku=r["SKU ID"]||"Unknown";

        if(!map[sku]){
            map[sku]={
                sku,
                orders:0,
                finalUnits:0,
                cancelUnits:0,
                returnUnits:0
            };
        }

        map[sku].finalUnits+=Number(r["Final Sale Units"]||0);
        map[sku].cancelUnits+=Number(r["Cancellation Units"]||0);
        map[sku].returnUnits+=Number(r["Return Units"]||0);

    });

    const result=Object.values(map).map(s=>{

        const cancelRate=s.orders? s.cancelUnits/s.orders:0;
        const returnRate=s.orders? s.returnUnits/s.orders:0;

        let riskScore=0;

        if(cancelRate>0.1) riskScore++;
        if(returnRate>0.1) riskScore++;
        if(s.finalUnits<s.orders) riskScore++;

        return{
            ...s,
            cancelRate,
            returnRate,
            riskScore
        };

    });

    result.sort((a,b)=>b.riskScore-a.riskScore);

    return result;

}
