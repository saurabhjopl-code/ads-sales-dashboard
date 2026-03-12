import { applyFilters } from "../../core/filterEngine.js";

export function getGMVSummary() {
    const data = applyFilters("GMV");

    let grossUnits = 0;
    let cancelUnits = 0;
    let returnUnits = 0;
    let finalUnits = 0;

    let gmv = 0;
    let cancelAmount = 0;
    let returnAmount = 0;
    let finalAmount = 0;

    data.forEach(row => {
        grossUnits += Number(row["Gross Units"] || 0);
        cancelUnits += Number(row["Cancellation Units"] || 0);
        returnUnits += Number(row["Return Units"] || 0);
        finalUnits += Number(row["Final Sale Units"] || 0);

        gmv += Number(row["GMV"] || 0);
        cancelAmount += Number(row["Cancellation Amount"] || 0);
        returnAmount += Number(row["Return Amount"] || 0);
        finalAmount += Number(row["Final Sale Amount"] || 0);
    });

    return {
        grossUnits,
        cancelUnits,
        returnUnits,
        finalUnits,
        gmv,
        cancelAmount,
        returnAmount,
        finalAmount
    };
}
