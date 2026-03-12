import { applyFilters } from "../../core/filterEngine.js";

export function getCampaignReport() {

    const data = applyFilters("CDR");

    const campaignMap = {};

    data.forEach(row => {

        const id = row["Campaign ID"];
        const name = row["Campaign Name"];
        const key = id + "||" + name;

        if (!campaignMap[key]) {
            campaignMap[key] = {
                id,
                name,
                spend: 0,
                revenue: 0,
                units: 0,
                views: 0,
                clicks: 0
            };
        }

        campaignMap[key].spend += Number(row["Ad Spend"] || 0);
        campaignMap[key].revenue += Number(row["Total Revenue (Rs.)"] || 0);
        campaignMap[key].units += Number(row["Total converted units"] || 0);
        campaignMap[key].views += Number(row["Views"] || 0);
        campaignMap[key].clicks += Number(row["Clicks"] || 0);
    });

    const result = Object.values(campaignMap).map(c => {

        const ctr = c.views ? c.clicks / c.views : 0;
        const cpc = c.clicks ? c.spend / c.clicks : 0;
        const cvr = c.clicks ? c.units / c.clicks : 0;
        const roi = c.spend ? c.revenue / c.spend : 0;

        return {
            ...c,
            ctr,
            cpc,
            cvr,
            roi
        };
    });

    // Default sort by Revenue Desc
    result.sort((a, b) => b.revenue - a.revenue);

    return result;
}
