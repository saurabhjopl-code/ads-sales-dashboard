import { applyFilters } from "../../core/filterEngine.js";

export function getGmvFulfillmentReport() {

    const data = applyFilters("GMV");

    const map = {};

    data.forEach(row => {

        const fulfillment = row["Fulfillment Type"] || "Unknown";

        if (!map[fulfillment]) {
            map[fulfillment] = {
                fulfillment,
                grossUnits: 0,
                cancelUnits: 0,
                returnUnits: 0,
                finalUnits: 0,
                finalRevenue: 0
            };
        }

        map[fulfillment].grossUnits += Number(row["Gross Units"] || 0);
        map[fulfillment].cancelUnits += Number(row["Cancellation Units"] || 0);
        map[fulfillment].returnUnits += Number(row["Return Units"] || 0);
        map[fulfillment].finalUnits += Number(row["Final Sale Units"] || 0);
        map[fulfillment].finalRevenue += Number(row["Final Sale Amount"] || 0);

    });

    const result = Object.values(map).map(r => {

        const cancelRate = r.grossUnits ? r.cancelUnits / r.grossUnits : 0;
        const returnRate = r.grossUnits ? r.returnUnits / r.grossUnits : 0;

        return {
            ...r,
            cancelRate,
            returnRate
        };
    });

    result.sort((a, b) => b.finalRevenue - a.finalRevenue);

    return result;
}
