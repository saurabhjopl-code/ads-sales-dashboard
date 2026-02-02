window.renderACCTabs = function () {
  const container = document.getElementById("accTabs");
  container.innerHTML = "";

  APP_STATE.accList.forEach(acc => {
    const tab = document.createElement("div");
    tab.className = "acc-tab" + (acc === APP_STATE.activeACC ? " active" : "");
    tab.innerText = acc;

    tab.onclick = () => {
      APP_STATE.activeACC = acc;
      document.querySelectorAll(".acc-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      renderActiveRoute();
    };

    container.appendChild(tab);
  });
};
