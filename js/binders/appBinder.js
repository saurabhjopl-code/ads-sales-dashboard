import { renderHeader } from "../renderers/headerRenderer.js";
import { renderSidebar } from "../renderers/sidebarRenderer.js";
import { renderFilters } from "../renderers/filterRenderer.js";
import { loadAllData } from "../core/dataLoader.js";
import { subscribe, STATE } from "../core/stateManager.js";

import { renderHome } from "./homeBinder.js";
import { renderAdsPage } from "./adsBinder.js";
import { renderGmvPage } from "./gmvBinder.js";
import { renderCtrPage } from "./ctrBinder.js";
import { renderSmartPage } from "./smartBinder.js";

async function init() {

    renderHeader();
    renderSidebar();

    await loadAllData();

    renderFilters();

    renderHome();

    subscribe(() => {

        if (STATE.ui.activePage === "ads") {
            renderAdsPage();
        }

        else if (STATE.ui.activePage === "gmv") {
            renderGmvPage();
        }

        else if (STATE.ui.activePage === "ctr") {
            renderCtrPage();
        }

        else if (STATE.ui.activePage === "smart") {
            renderSmartPage();
        }

        else {
            renderHome();
        }

    });

}

init();
