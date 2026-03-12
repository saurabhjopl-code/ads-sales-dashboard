import { getGMVSummary } from "../engines/summary/gmvSummaryEngine.js";
import { getCDRSummary } from "../engines/summary/adsSummaryEngine.js";
import { applyFilters } from "../core/filterEngine.js";
import { renderFullDashboard } from "../renderers/summaryRenderer.js";
import { parseDDMMYYYY } from "../core/dateEngine.js";

export function renderHome() {

    const gmvData = applyFilters("GMV");
    const adsData = applyFilters("CDR");

    const gmv = getGMVSummary();
    const ads = getCDRSummary();

    // =========================
    // TRAFFIC SUMMARY (From CDR)
    // =========================

    let views = 0, clicks = 0, units = 0;

    adsData.forEach(r => {
        views += Number(r["Views"] || 0);
        clicks += Number(r["Clicks"] || 0);
        units += Number(r["Total converted units"] || 0);
    });

    const traffic = {
        views,
        clicks,
        units,
        ctr: views ? clicks / views : 0,
        cr: clicks ? units / clicks : 0
    };

    // =========================
    // GMV CHART GROUPING
    // =========================

    const gmvGrouped = {};

    gmvData.forEach(r => {
        const d = r["Order Date"];
        if (!gmvGrouped[d]) {
            gmvGrouped[d] = {
                gmv: 0,
                cancel: 0,
                return: 0,
                net: 0
            };
        }

        gmvGrouped[d].gmv += Number(r["GMV"] || 0);
        gmvGrouped[d].cancel += Number(r["Cancellation Units"] || 0);
        gmvGrouped[d].return += Number(r["Return Units"] || 0);
        gmvGrouped[d].net += Number(r["Final Sale Amount"] || 0);
    });

    const gmvDates = Object.keys(gmvGrouped)
        .sort((a, b) => parseDDMMYYYY(a) - parseDDMMYYYY(b));

    // =========================
    // ADS CHART GROUPING
    // =========================

    const adsGrouped = {};

    adsData.forEach(r => {
        const d = r["Date"];
        if (!adsGrouped[d]) {
            adsGrouped[d] = {
                spend: 0,
                revenue: 0,
                units: 0
            };
        }

        adsGrouped[d].spend += Number(r["Ad Spend"] || 0);
        adsGrouped[d].revenue += Number(r["Total Revenue (Rs.)"] || 0);
        adsGrouped[d].units += Number(r["Total converted units"] || 0);
    });

    const adsDates = Object.keys(adsGrouped)
        .sort((a, b) => parseDDMMYYYY(a) - parseDDMMYYYY(b));

    // =========================
    // TRAFFIC CHART GROUPING
    // =========================

    const trafficGrouped = {};

    adsData.forEach(r => {
        const d = r["Date"];
        if (!trafficGrouped[d]) {
            trafficGrouped[d] = {
                views: 0,
                clicks: 0,
                units: 0
            };
        }

        trafficGrouped[d].views += Number(r["Views"] || 0);
        trafficGrouped[d].clicks += Number(r["Clicks"] || 0);
        trafficGrouped[d].units += Number(r["Total converted units"] || 0);
    });

    const trafficDates = Object.keys(trafficGrouped)
        .sort((a, b) => parseDDMMYYYY(a) - parseDDMMYYYY(b));

    // =========================
    // FINAL CHART DATA OBJECT
    // =========================

    const chartData = {

        gmv: {
            labels: gmvDates,
            datasets: [
                {
                    label: "GMV",
                    data: gmvDates.map(d => gmvGrouped[d].gmv),
                    borderColor: "#2563eb",
                    tension: 0.3
                },
                {
                    label: "Cancel Units",
                    data: gmvDates.map(d => gmvGrouped[d].cancel),
                    borderColor: "#dc2626",
                    tension: 0.3
                },
                {
                    label: "Return Units",
                    data: gmvDates.map(d => gmvGrouped[d].return),
                    borderColor: "#f59e0b",
                    tension: 0.3
                },
                {
                    label: "Net Revenue",
                    data: gmvDates.map(d => gmvGrouped[d].net),
                    borderColor: "#16a34a",
                    tension: 0.3
                }
            ]
        },

        ads: {
            labels: adsDates,
            datasets: [
                {
                    label: "Ad Spend",
                    data: adsDates.map(d => adsGrouped[d].spend),
                    borderColor: "#7c3aed",
                    tension: 0.3
                },
                {
                    label: "Revenue",
                    data: adsDates.map(d => adsGrouped[d].revenue),
                    borderColor: "#0ea5e9",
                    tension: 0.3
                },
                {
                    label: "Converted Units",
                    data: adsDates.map(d => adsGrouped[d].units),
                    borderColor: "#f97316",
                    tension: 0.3
                }
            ]
        },

        traffic: {
            labels: trafficDates,
            datasets: [
                {
                    label: "Views",
                    data: trafficDates.map(d => trafficGrouped[d].views),
                    borderColor: "#2563eb",
                    tension: 0.3
                },
                {
                    label: "Clicks",
                    data: trafficDates.map(d => trafficGrouped[d].clicks),
                    borderColor: "#f59e0b",
                    tension: 0.3
                },
                {
                    label: "Sales",
                    data: trafficDates.map(d => trafficGrouped[d].units),
                    borderColor: "#16a34a",
                    tension: 0.3
                }
            ]
        }
    };

    renderFullDashboard(gmv, ads, traffic, chartData);
}
