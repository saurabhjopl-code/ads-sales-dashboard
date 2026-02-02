// ================================
// GLOBAL APP STATE
// ================================
window.APP_STATE = {
  data: {
    CDR: [],
    CFR: [],
    CKR: [],
    PPR: [],
    CTR: [],
    GMV: []
  },
  accList: [],
  activeACC: null,
  startDate: null,
  endDate: null,
  week: null,
  activeRoute: "sales-health"
};

// ================================
// CSV URL CONFIG (LOCKED)
// ================================
const CSV_URLS = {
  CDR: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_uFyNN_LsA0hZ4EuRYflMnzY-NwSAn9sRhvPbbeRrRkAe5d07tIEJ_gilGwvR5-H1l3jjTOdjq6j/pub?gid=0&single=true&output=csv",
  CFR: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_uFyNN_LsA0hZ4EuRYflMnzY-NwSAn9sRhvPbbeRrRkAe5d07tIEJ_gilGwvR5-H1l3jjTOdjq6j/pub?gid=70878993&single=true&output=csv",
  CKR: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_uFyNN_LsA0hZ4EuRYflMnzY-NwSAn9sRhvPbbeRrRkAe5d07tIEJ_gilGwvR5-H1l3jjTOdjq6j/pub?gid=1766288207&single=true&output=csv",
  PPR: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_uFyNN_LsA0hZ4EuRYflMnzY-NwSAn9sRhvPbbeRrRkAe5d07tIEJ_gilGwvR5-H1l3jjTOdjq6j/pub?gid=83055390&single=true&output=csv",
  CTR: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_uFyNN_LsA0hZ4EuRYflMnzY-NwSAn9sRhvPbbeRrRkAe5d07tIEJ_gilGwvR5-H1l3jjTOdjq6j/pub?gid=1305519024&single=true&output=csv",
  GMV: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTd_uFyNN_LsA0hZ4EuRYflMnzY-NwSAn9sRhvPbbeRrRkAe5d07tIEJ_gilGwvR5-H1l3jjTOdjq6j/pub?gid=1218209311&single=true&output=csv"
};

// ================================
// CSV PARSER (SAFE, GENERIC)
// ================================
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(row => {
    const values = row.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() || "";
    });
    return obj;
  });
}

// ================================
// LOAD ALL DATA
// ================================
async function loadAllData() {
  const keys = Object.keys(CSV_URLS);

  for (let key of keys) {
    const res = await fetch(CSV_URLS[key]);
    const text = await res.text();
    APP_STATE.data[key] = parseCSV(text);
  }

  initACCList();
  initNavigation();
  renderActiveRoute();
}

// ================================
// ACC HANDLING
// ================================
function initACCList() {
  const accSet = new Set();

  Object.values(APP_STATE.data).forEach(dataset => {
    dataset.forEach(row => {
      if (row.ACC) accSet.add(row.ACC);
    });
  });

  APP_STATE.accList = Array.from(accSet);
  APP_STATE.activeACC = APP_STATE.accList[0] || null;

  window.renderACCTabs();
}

// ================================
// ROUTING
// ================================
function initNavigation() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      APP_STATE.activeRoute = item.dataset.route;
      document.getElementById("reportTitle").innerText = item.innerText;

      renderActiveRoute();
    });
  });
}

function renderActiveRoute() {
  const route = APP_STATE.activeRoute;

  if (route === "sales-health") window.renderSalesHealth();
  if (route === "spend-vs-sales") window.renderSpendVsSales();
  if (route === "campaign-performance") window.renderCampaignPerformance();
  if (route === "keyword-performance") window.renderKeywordPerformance();
  if (route === "placement-performance") window.renderPlacementPerformance();
  if (route === "sku-performance") window.renderSkuPerformance();
}

// ================================
// INIT APP
// ================================
document.addEventListener("DOMContentLoaded", loadAllData);
