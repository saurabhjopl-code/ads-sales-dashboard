import { applyFilters } from "../../core/filterEngine.js";

export function getCDRSummary() {
    const data = applyFilters("CDR");

    let spend = 0;
    let revenue = 0;
    let clicks = 0;
    let views = 0;
    let units = 0;

    data.forEach(row => {
        spend += Number(row["Ad Spend"] || 0);
        revenue += Number(row["Total Revenue (Rs.)"] || 0);
        clicks += Number(row["Clicks"] || 0);
        views += Number(row["Views"] || 0);
        units += Number(row["Total converted units"] || 0);
    });

    const roi = spend ? revenue / spend : 0;

    return { spend, revenue, clicks, views, units, roi };
}
