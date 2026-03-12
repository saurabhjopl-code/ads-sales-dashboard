import { applyFilters } from "../../core/filterEngine.js";

export function getGmvBrandReport() {

    const data = applyFilters("GMV");

    const brandMap = {};

    data.forEach(row => {

        const brand = row["Brand"] || "Unknown";

        if (!brandMap[brand]) {
            brandMap[brand] = {
                brand,
                grossUnits: 0,
                gmv: 0,
                cancelUnits: 0,
                returnUnits: 0,
                finalUnits: 0,
                finalRevenue: 0
            };
        }

        brandMap[brand].grossUnits += Number(row["Gross Units"] || 0);
        brandMap[brand].gmv += Number(row["GMV"] || 0);
        brandMap[brand].cancelUnits += Number(row["Cancellation Units"] || 0);
        brandMap[brand].returnUnits += Number(row["Return Units"] || 0);
        brandMap[brand].finalUnits += Number(row["Final Sale Units"] || 0);
        brandMap[brand].finalRevenue += Number(row["Final Sale Amount"] || 0);
    });

    const result = Object.values(brandMap).map(b => {

        const cancelRate = b.grossUnits ? b.cancelUnits / b.grossUnits : 0;
        const returnRate = b.grossUnits ? b.returnUnits / b.grossUnits : 0;

        return {
            ...b,
            cancelRate,
            returnRate
        };
    });

    // Sort by Final Revenue Desc
    result.sort((a, b) => b.finalRevenue - a.finalRevenue);

    return result;
}
