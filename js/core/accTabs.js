// =======================================
// ACC TABS – GLOBAL CONTROLLER
// =======================================

window.renderACCTabs = function () {
  const container = document.getElementById("accTabs");
  if (!container) return;

  container.innerHTML = "";

  APP_STATE.accList.forEach(acc => {
    const tab = document.createElement("div");
    tab.className = "acc-tab" + (acc === APP_STATE.activeACC ? " active" : "");
    tab.innerText = acc;

    tab.addEventListener("click", () => {
      // Update active ACC
      APP_STATE.activeACC = acc;

      // Update UI active state
      document.querySelectorAll(".acc-tab").forEach(t =>
        t.classList.remove("active")
      );
      tab.classList.add("active");

      // 🔥 CRITICAL: re-render everything
      if (typeof renderAll === "function") {
        renderAll();
      }
    });

    container.appendChild(tab);
  });
};
