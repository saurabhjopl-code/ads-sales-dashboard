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
// CSV URL CONFIG
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
// CSV PARSER
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
// LOAD DATA
// ================================
async function loadAllData() {
  for (const key of Object.keys(CSV_URLS)) {
    const res = await fetch(CSV_URLS[key]);
    const text = await res.text();
    APP_STATE.data[key] = parseCSV(text);
  }

  initACCList();
  initNavigation();
  renderAll();
}

// ================================
// ACC
// ================================
function initACCList() {
  const accSet = new Set();
  Object.values(APP_STATE.data).forEach(arr => {
    arr.forEach(r => r.ACC && accSet.add(r.ACC));
  });

  APP_STATE.accList = [...accSet];
  APP_STATE.activeACC = APP_STATE.accList[0] || null;

  window.renderACCTabs();
}

// ================================
// NAVIGATION
// ================================
function initNavigation() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.onclick = () => {
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      APP_STATE.activeRoute = item.dataset.route;
      document.getElementById("reportTitle").innerText = item.innerText;
      renderAll();
    };
  });
}

// ================================
// MASTER RENDER
// ================================
function renderAll() {
  // Summaries
  window.renderSummaryGMV?.();
  window.renderSummaryCTR?.();
  window.renderSummaryAds?.();
  window.renderSummaryEfficiency?.();

  // Reports
  if (APP_STATE.activeRoute === "sales-health") window.renderSalesHealth?.();
  if (APP_STATE.activeRoute === "spend-vs-sales") window.renderSpendVsSales?.();
  if (APP_STATE.activeRoute === "campaign-performance") window.renderCampaignPerformance?.();
  if (APP_STATE.activeRoute === "keyword-performance") window.renderKeywordPerformance?.();
  if (APP_STATE.activeRoute === "placement-performance") window.renderPlacementPerformance?.();
  if (APP_STATE.activeRoute === "sku-performance") window.renderSkuPerformance?.();
}

// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", loadAllData);
