import { STATE } from "./stateManager.js";
import { parseDDMMYYYY } from "./dateEngine.js";

export function applyFilters(sheetName) {

    const data = STATE.rawData[sheetName];
    const { acc, startDate, endDate } = STATE.filters;

    return data.filter(row => {

        // ACC filter
        if (acc.length > 0 && !acc.includes(row.ACC)) return false;

        // Date filter only if both exist
        if ((row.Date || row["Order Date"]) && startDate && endDate) {

            const rawDate = row.Date || row["Order Date"];
            const rowDate = parseDDMMYYYY(rawDate);

            if (!rowDate) return false;

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (rowDate < start || rowDate > end) return false;
        }

        return true;
    });
}
