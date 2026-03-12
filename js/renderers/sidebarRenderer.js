import { renderHome } from "../binders/homeBinder.js";
import { renderAdsPage } from "../binders/adsBinder.js";
import { renderGmvPage } from "../binders/gmvBinder.js";
import { renderCtrPage } from "../binders/ctrBinder.js";
import { renderSmartPage } from "../binders/smartBinder.js";
import { setActivePage } from "../core/stateManager.js";

export function renderSidebar(){

const sidebar = document.getElementById("sidebar");

sidebar.innerHTML = `

<div class="sidebar-menu">

<div id="nav-home" class="sidebar-item active">
<div class="sidebar-icon">🏠</div>
<div class="sidebar-label">Home</div>
</div>

<div id="nav-ads" class="sidebar-item">
<div class="sidebar-icon">📢</div>
<div class="sidebar-label">Ads</div>
</div>

<div id="nav-gmv" class="sidebar-item">
<div class="sidebar-icon">📦</div>
<div class="sidebar-label">GMV</div>
</div>

<div id="nav-ctr" class="sidebar-item">
<div class="sidebar-icon">📊</div>
<div class="sidebar-label">CTR</div>
</div>

<div id="nav-smart" class="sidebar-item">
<div class="sidebar-icon">⚡</div>
<div class="sidebar-label">Smart</div>
</div>

</div>
`;

function setActive(id){

document.querySelectorAll(".sidebar-item")
.forEach(el=>el.classList.remove("active"));

document.getElementById(id).classList.add("active");

}

document.getElementById("nav-home").onclick = () => {
setActivePage("home");
setActive("nav-home");
renderHome();
};

document.getElementById("nav-ads").onclick = () => {
setActivePage("ads");
setActive("nav-ads");
renderAdsPage();
};

document.getElementById("nav-gmv").onclick = () => {
setActivePage("gmv");
setActive("nav-gmv");
renderGmvPage();
};

document.getElementById("nav-ctr").onclick = () => {
setActivePage("ctr");
setActive("nav-ctr");
renderCtrPage();
};

document.getElementById("nav-smart").onclick = () => {
setActivePage("smart");
setActive("nav-smart");
renderSmartPage();
};

}
