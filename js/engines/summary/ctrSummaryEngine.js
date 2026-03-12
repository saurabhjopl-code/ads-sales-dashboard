import { applyFilters } from "../../core/filterEngine.js";

export function getCTRSummary() {
    const data = applyFilters("CTR");

    let grossUnits = 0;
    let cancelUnits = 0;
    let returnUnits = 0;

    let grossRevenue = 0;
    let cancelRevenue = 0;
    let returnRevenue = 0;

    data.forEach(row => {
        const type = row["Event Type"];
        const qty = Number(row["Item Quantity"] || 0);
        const amount = Number(row["Price before discount"] || 0);

        if (type === "Sale") {
            grossUnits += qty;
            grossRevenue += amount;
        }
        if (type === "Cancel") {
            cancelUnits += qty;
            cancelRevenue += amount;
        }
        if (type === "Return") {
            returnUnits += qty;
            returnRevenue += amount;
        }
    });

    const netUnits = grossUnits - cancelUnits - returnUnits;
    const netRevenue = grossRevenue - cancelRevenue - returnRevenue;

    return {
        grossUnits,
        cancelUnits,
        returnUnits,
        netUnits,
        grossRevenue,
        cancelRevenue,
        returnRevenue,
        netRevenue
    };
}
