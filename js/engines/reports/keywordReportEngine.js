import { applyFilters } from "../../core/filterEngine.js";

export function getKeywordReport() {

    const data = applyFilters("CKR");

    const keywordMap = {};

    data.forEach(row => {

        const keyword = row["attributed_keyword"];
        const matchType = row["keyword_match_type"];
        const key = keyword + "||" + matchType;

        if (!keywordMap[key]) {
            keywordMap[key] = {
                keyword,
                matchType,
                spend: 0,
                views: 0,
                clicks: 0,
                directUnits: 0,
                indirectUnits: 0,
                directRevenue: 0,
                indirectRevenue: 0
            };
        }

        keywordMap[key].spend += Number(row["SUM(cost)"] || 0);
        keywordMap[key].views += Number(row["Views"] || 0);
        keywordMap[key].clicks += Number(row["Clicks"] || 0);

        keywordMap[key].directUnits += Number(row["Direct Units Sold"] || 0);
        keywordMap[key].indirectUnits += Number(row["Indirect Units Sold"] || 0);

        keywordMap[key].directRevenue += Number(row["Direct Revenue"] || 0);
        keywordMap[key].indirectRevenue += Number(row["Indirect Revenue"] || 0);
    });

    const result = Object.values(keywordMap).map(k => {

        const totalUnits = k.directUnits + k.indirectUnits;
        const revenue = k.directRevenue + k.indirectRevenue;

        const ctr = k.views ? k.clicks / k.views : 0;
        const cpc = k.clicks ? k.spend / k.clicks : 0;
        const cvr = k.clicks ? k.directUnits / k.clicks : 0;

        const roi = k.spend ? revenue / k.spend : 0;
        const directROI = k.spend ? k.directRevenue / k.spend : 0;

        return {
            ...k,
            totalUnits,
            revenue,
            ctr,
            cpc,
            cvr,
            roi,
            directROI
        };
    });

    // Sort by Revenue Desc
    result.sort((a, b) => b.revenue - a.revenue);

    return result;
}
