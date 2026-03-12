import { applyFilters } from "../../core/filterEngine.js";

export function getSkuReport() {

    const data = applyFilters("CFR");

    const skuMap = {};

    data.forEach(row => {

        const sku = row["Sku Id"];
        const name = row["Product Name"];
        const key = sku + "||" + name;

        if (!skuMap[key]) {
            skuMap[key] = {
                sku,
                name,
                views: 0,
                clicks: 0,
                directUnits: 0,
                indirectUnits: 0,
                revenue: 0
            };
        }

        skuMap[key].views += Number(row["Views"] || 0);
        skuMap[key].clicks += Number(row["Clicks"] || 0);
        skuMap[key].directUnits += Number(row["Direct Units Sold"] || 0);
        skuMap[key].indirectUnits += Number(row["Indirect Units Sold"] || 0);
        skuMap[key].revenue += Number(row["Total Revenue (Rs.)"] || 0);
    });

    const result = Object.values(skuMap).map(s => {

        const totalUnits = s.directUnits + s.indirectUnits;
        const ctr = s.views ? s.clicks / s.views : 0;
        const cvr = s.clicks ? totalUnits / s.clicks : 0;

        return {
            ...s,
            totalUnits,
            ctr,
            cvr
        };
    });

    // Sort by Revenue Desc
    result.sort((a, b) => b.revenue - a.revenue);

    return result;
}
