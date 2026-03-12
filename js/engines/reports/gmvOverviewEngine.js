import { applyFilters } from "../../core/filterEngine.js";
import { parseDDMMYYYY } from "../../core/dateEngine.js";

export function getGmvOverview() {

    const data = applyFilters("GMV");

    let grossUnits = 0;
    let gmv = 0;
    let cancelUnits = 0;
    let returnUnits = 0;
    let finalUnits = 0;
    let finalRevenue = 0;

    const dailyMap = {};

    data.forEach(row => {

        const date = row["Order Date"];

        const gross = Number(row["Gross Units"] || 0);
        const gmvVal = Number(row["GMV"] || 0);
        const cancel = Number(row["Cancellation Units"] || 0);
        const ret = Number(row["Return Units"] || 0);
        const finalU = Number(row["Final Sale Units"] || 0);
        const finalRev = Number(row["Final Sale Amount"] || 0);

        grossUnits += gross;
        gmv += gmvVal;
        cancelUnits += cancel;
        returnUnits += ret;
        finalUnits += finalU;
        finalRevenue += finalRev;

        if (!dailyMap[date]) {
            dailyMap[date] = {
                gmv: 0,
                finalRevenue: 0,
                cancelUnits: 0,
                returnUnits: 0
            };
        }

        dailyMap[date].gmv += gmvVal;
        dailyMap[date].finalRevenue += finalRev;
        dailyMap[date].cancelUnits += cancel;
        dailyMap[date].returnUnits += ret;
    });

    const dates = Object.keys(dailyMap)
        .sort((a, b) => parseDDMMYYYY(a) - parseDDMMYYYY(b));

    const chartData = {
        labels: dates,
        datasets: [
            {
                label: "GMV",
                data: dates.map(d => dailyMap[d].gmv),
                borderColor: "#2563eb",
                tension: 0.3
            },
            {
                label: "Final Revenue",
                data: dates.map(d => dailyMap[d].finalRevenue),
                borderColor: "#16a34a",
                tension: 0.3
            },
            {
                label: "Cancel Units",
                data: dates.map(d => dailyMap[d].cancelUnits),
                borderColor: "#dc2626",
                tension: 0.3
            },
            {
                label: "Return Units",
                data: dates.map(d => dailyMap[d].returnUnits),
                borderColor: "#f59e0b",
                tension: 0.3
            }
        ]
    };

    return {
        grossUnits,
        gmv,
        cancelUnits,
        returnUnits,
        finalUnits,
        finalRevenue,
        chartData
    };
}
