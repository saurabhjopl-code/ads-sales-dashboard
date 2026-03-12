import { applyFilters } from "../../core/filterEngine.js";

export function getGmvCategoryReport() {

    const data = applyFilters("GMV");

    const map = {};

    data.forEach(row => {

        const category = row["Category"] || "Unknown";
        const vertical = row["Vertical"] || "Unknown";

        const key = category + "||" + vertical;

        if (!map[key]) {
            map[key] = {
                category,
                vertical,
                grossUnits: 0,
                cancelUnits: 0,
                returnUnits: 0,
                finalUnits: 0,
                finalRevenue: 0
            };
        }

        map[key].grossUnits += Number(row["Gross Units"] || 0);
        map[key].cancelUnits += Number(row["Cancellation Units"] || 0);
        map[key].returnUnits += Number(row["Return Units"] || 0);
        map[key].finalUnits += Number(row["Final Sale Units"] || 0);
        map[key].finalRevenue += Number(row["Final Sale Amount"] || 0);

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
