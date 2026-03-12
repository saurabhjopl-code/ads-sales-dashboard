import { applyFilters } from "../../core/filterEngine.js";

export function getPlacementReport() {

    const data = applyFilters("PPR");

    const placementMap = {};

    data.forEach(row => {

        const placement = row["Placement Type"];

        if (!placementMap[placement]) {
            placementMap[placement] = {
                placement,
                spend: 0,
                revenue: 0,
                directUnits: 0,
                indirectUnits: 0,
                views: 0,
                clicks: 0
            };
        }

        placementMap[placement].spend += Number(row["Ad Spend"] || 0);
        placementMap[placement].views += Number(row["Views"] || 0);
        placementMap[placement].clicks += Number(row["Clicks"] || 0);

        placementMap[placement].directUnits += Number(row["Direct Units Sold"] || 0);
        placementMap[placement].indirectUnits += Number(row["Indirect Units Sold"] || 0);

        placementMap[placement].revenue +=
            Number(row["Direct Revenue"] || 0) +
            Number(row["Indirect Revenue"] || 0);
    });

    const result = Object.values(placementMap).map(p => {

        const totalUnits = p.directUnits + p.indirectUnits;
        const ctr = p.views ? p.clicks / p.views : 0;
        const cpc = p.clicks ? p.spend / p.clicks : 0;
        const cvr = p.clicks ? totalUnits / p.clicks : 0;
        const roi = p.spend ? p.revenue / p.spend : 0;

        return {
            ...p,
            totalUnits,
            ctr,
            cpc,
            cvr,
            roi
        };
    });

    // Sort by Revenue Desc
    result.sort((a, b) => b.revenue - a.revenue);

    return result;
}
