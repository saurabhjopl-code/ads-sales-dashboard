import { applyFilters } from "../../core/filterEngine.js";

export function getCampaignEfficiency() {

    const cdr = applyFilters("CDR");
    const gmv = applyFilters("GMV");

    const map = {};

    // Ads aggregation
    cdr.forEach(r => {

        const id = r["Campaign ID"];
        const name = r["Campaign Name"];

        if (!map[id]) {
            map[id] = {
                campaign: name,
                spend: 0,
                views: 0,
                clicks: 0,
                adUnits: 0,
                adRevenue: 0,
                finalRevenue: 0
            };
        }

        map[id].spend += Number(r["Ad Spend"] || 0);
        map[id].views += Number(r["Views"] || 0);
        map[id].clicks += Number(r["Clicks"] || 0);
        map[id].adUnits += Number(r["Total converted units"] || 0);
        map[id].adRevenue += Number(r["Total Revenue (Rs.)"] || 0);

    });

    // GMV aggregation
    gmv.forEach(r => {

        const revenue = Number(r["Final Sale Amount"] || 0);

        Object.values(map).forEach(c => {
            c.finalRevenue += revenue;
        });

    });

    const result = Object.values(map).map(c => {

        const ctr = c.views ? c.clicks / c.views : 0;
        const cvr = c.clicks ? c.adUnits / c.clicks : 0;

        const roi = c.spend ? c.adRevenue / c.spend : 0;
        const netROI = c.spend ? c.finalRevenue / c.spend : 0;

        return {
            ...c,
            ctr,
            cvr,
            roi,
            netROI
        };

    });

    result.sort((a,b)=>b.spend-a.spend);

    return result;

}
