import { STATE, setAdsSubPage } from "../core/stateManager.js";
import { renderCampaignSection } from "./adsCampaignBinder.js";
import { renderSkuSection } from "./adsSkuBinder.js";
import { renderPlacementSection } from "./adsPlacementBinder.js";
import { renderKeywordSection } from "./adsKeywordBinder.js";
import { renderBlendedSkuSection } from "./adsBlendedSkuBinder.js";
import { renderAdsOverviewPage } from "./adsOverviewBinder.js";

export function renderAdsPage() {

    const container = document.getElementById("app-content");

    container.innerHTML = `
        <div class="section">
            <div class="section-title">Ads Reports</div>

            <div class="ads-tabs">

                <div class="ads-tab ${STATE.ui.adsSubPage === "overview" ? "active" : ""}" data-tab="overview">
                    Overview
                </div>

                <div class="ads-tab ${STATE.ui.adsSubPage === "campaign" ? "active" : ""}" data-tab="campaign">
                    Campaign
                </div>

                <div class="ads-tab ${STATE.ui.adsSubPage === "sku" ? "active" : ""}" data-tab="sku">
                    SKU
                </div>

                <div class="ads-tab ${STATE.ui.adsSubPage === "placement" ? "active" : ""}" data-tab="placement">
                    Placement
                </div>

                <div class="ads-tab ${STATE.ui.adsSubPage === "keyword" ? "active" : ""}" data-tab="keyword">
                    Keyword
                </div>

                <div class="ads-tab ${STATE.ui.adsSubPage === "blended" ? "active" : ""}" data-tab="blended">
                    Blended SKU
                </div>

            </div>

            <div id="ads-sub-content"></div>
        </div>
    `;

    document.querySelectorAll(".ads-tab").forEach(tab => {
        tab.onclick = () => {
            setAdsSubPage(tab.dataset.tab);
        };
    });

    renderActiveSubPage();
}

function renderActiveSubPage() {

    if (STATE.ui.adsSubPage === "overview") renderAdsOverviewPage();
    if (STATE.ui.adsSubPage === "campaign") renderCampaignSection();
    if (STATE.ui.adsSubPage === "sku") renderSkuSection();
    if (STATE.ui.adsSubPage === "placement") renderPlacementSection();
    if (STATE.ui.adsSubPage === "keyword") renderKeywordSection();
    if (STATE.ui.adsSubPage === "blended") renderBlendedSkuSection();
}
