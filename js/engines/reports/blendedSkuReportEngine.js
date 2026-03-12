import { applyFilters } from "../../core/filterEngine.js";

export function getBlendedSkuReport() {

    const gmvData = applyFilters("GMV");
    const cfrData = applyFilters("CFR");

    const skuMap = {};

    // GMV Aggregation
    gmvData.forEach(row => {

        const sku = row["SKU ID"];
        const key = sku;

        if (!skuMap[key]) {
            skuMap[key] = {
                sku,
                product: "",
                grossUnits: 0,
                cancelUnits: 0,
                returnUnits: 0,
                finalUnits: 0,
                finalRevenue: 0,
                adUnits: 0,
                adRevenue: 0
            };
        }

        skuMap[key].grossUnits += Number(row["Gross Units"] || 0);
        skuMap[key].cancelUnits += Number(row["Cancellation Units"] || 0);
        skuMap[key].returnUnits += Number(row["Return Units"] || 0);
        skuMap[key].finalUnits += Number(row["Final Sale Units"] || 0);
        skuMap[key].finalRevenue += Number(row["Final Sale Amount"] || 0);
    });

    // CFR Aggregation
    cfrData.forEach(row => {

        const sku = row["Sku Id"];
        const key = sku;

        if (!skuMap[key]) {
            skuMap[key] = {
                sku,
                product: row["Product Name"] || "",
                grossUnits: 0,
                cancelUnits: 0,
                returnUnits: 0,
                finalUnits: 0,
                finalRevenue: 0,
                adUnits: 0,
                adRevenue: 0
            };
        }

        skuMap[key].product = row["Product Name"] || skuMap[key].product;

        const direct = Number(row["Direct Units Sold"] || 0);
        const indirect = Number(row["Indirect Units Sold"] || 0);

        skuMap[key].adUnits += direct + indirect;
        skuMap[key].adRevenue += Number(row["Total Revenue (Rs.)"] || 0);
    });

    const result = Object.values(skuMap).map(s => {

        const organicRevenue = s.finalRevenue - s.adRevenue;

        const cancelRate = s.grossUnits ? s.cancelUnits / s.grossUnits : 0;
        const returnRate = s.grossUnits ? s.returnUnits / s.grossUnits : 0;

        return {
            ...s,
            organicRevenue,
            cancelRate,
            returnRate
        };
    });

    // Sort by Final Revenue Desc
    result.sort((a, b) => b.finalRevenue - a.finalRevenue);

    return result;
}
