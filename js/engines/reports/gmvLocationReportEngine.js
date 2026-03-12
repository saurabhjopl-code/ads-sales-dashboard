import { applyFilters } from "../../core/filterEngine.js";

const LOCATION_MAP = {
    "LOC979d1d9aca154ae0a5d72fc1a199aece": "RJN - SELLER",
    "ulub_bts": "ulub_bts",
    "bhi_vas_wh_nl_01nl": "bhi_vas_wh_nl_01nl",
    "malur_bts": "malur_bts",
    "gur_san_wh_nl_01nl": "gur_san_wh_nl_01nl",
    "hyderabad_medchal_01": "hyderabad_medchal_01",
    "luc_has_wh_nl_02nl": "luc_has_wh_nl_02nl",
    "NA": "SELLER",
    "LOC96f93bdd28734ad7aa0b515706cacf0f": "VIHAAN - SELLER",
    "LOC6a5bf58d26564e63a674107e04e49a37": "ARF - SELLER",
    "LOCb4cb006d47634bdb8a01c83986fa9c68": "SGB - SELLER",
    "LOC3f97c23e40ca4cdd8e20ba509c1ae86b": "SVF - SELLER",
    "LOC89e6b8298c5c446eb6266ecf10af5156": "WW - SELLER"
};

export function getGmvLocationReport() {

    const data = applyFilters("GMV");

    const map = {};

    data.forEach(row => {

        const locId = row["Location Id"];
        const location = LOCATION_MAP[locId] || locId || "Unknown";

        if (!map[location]) {
            map[location] = {
                location,
                grossUnits: 0,
                cancelUnits: 0,
                returnUnits: 0,
                finalUnits: 0,
                finalRevenue: 0
            };
        }

        map[location].grossUnits += Number(row["Gross Units"] || 0);
        map[location].cancelUnits += Number(row["Cancellation Units"] || 0);
        map[location].returnUnits += Number(row["Return Units"] || 0);
        map[location].finalUnits += Number(row["Final Sale Units"] || 0);
        map[location].finalRevenue += Number(row["Final Sale Amount"] || 0);

    });

    const result = Object.values(map).map(r => {

        const cancelRate = r.grossUnits ? r.cancelUnits / r.grossUnits : 0;
        const returnRate = r.grossUnits ? r.returnUnits / r.grossUnits : 0;

        return {
            ...r,
            cancelRate,
            returnRate
        };
    });

    result.sort((a, b) => b.finalRevenue - a.finalRevenue);

    return result;
}
