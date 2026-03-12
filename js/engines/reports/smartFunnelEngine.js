import { applyFilters } from "../../core/filterEngine.js";

export function getSmartFunnel() {

    const cdr = applyFilters("CDR");
    const ctr = applyFilters("CTR");
    const gmv = applyFilters("GMV");

    let views = 0;
    let clicks = 0;
    let adUnits = 0;

    let grossUnits = 0;

    let finalUnits = 0;
    let cancelUnits = 0;
    let returnUnits = 0;

    // Ads data
    cdr.forEach(r => {

        views += Number(r["Views"] || 0);
        clicks += Number(r["Clicks"] || 0);
        adUnits += Number(r["Total converted units"] || 0);

    });

    // Orders (CTR sheet)
    ctr.forEach(r => {

        const type = (r["Event Type"] || "").toLowerCase();

        if (type === "sale") {
            grossUnits += Number(r["Item Quantity"] || 0);
        }

    });

    // GMV
    gmv.forEach(r => {

        finalUnits += Number(r["Final Sale Units"] || 0);
        cancelUnits += Number(r["Cancellation Units"] || 0);
        returnUnits += Number(r["Return Units"] || 0);

    });

    const ctrRate = views ? clicks / views : 0;
    const adCVR = clicks ? adUnits / clicks : 0;

    return {
        views,
        clicks,
        adUnits,
        grossUnits,
        finalUnits,
        cancelUnits,
        returnUnits,
        ctrRate,
        adCVR
    };
}
