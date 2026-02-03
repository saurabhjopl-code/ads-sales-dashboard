// =======================================
// WEEK FILTER – MONTH AWARE (GMV ONLY)
// Version: V2.0 (V3.9)
// =======================================

(function () {
  const weekSelect = document.getElementById("weekSelector");
  if (!weekSelect) return;

  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function format(d) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }

  function toISO(d) {
    return d.toISOString().split("T")[0];
  }

  function buildWeeks() {
    if (!APP_STATE.startDate || !APP_STATE.endDate) return;

    const start = new Date(APP_STATE.startDate);
    const end = new Date(APP_STATE.endDate);

    let current = getMonday(start);
    const weeks = [];

    while (current <= end) {
      const wStart = new Date(current);
      const wEnd = new Date(current);
      wEnd.setDate(wStart.getDate() + 6);

      weeks.push({
        label: `${format(wStart)} – ${format(wEnd)}`,
        start: toISO(wStart),
        end: toISO(wEnd)
      });

      current.setDate(current.getDate() + 7);
    }

    weekSelect.innerHTML = `<option value="">All</option>`;
    weeks.forEach(w => {
      const opt = document.createElement("option");
      opt.value = `${w.start}|${w.end}`;
      opt.textContent = w.label;
      weekSelect.appendChild(opt);
    });
  }

  weekSelect.addEventListener("change", e => {
    const val = e.target.value;
    if (!val) {
      APP_STATE.week = null;
      window.renderAll?.();
      return;
    }

    const [start, end] = val.split("|");
    APP_STATE.week = val;
    APP_STATE.startDate = start;
    APP_STATE.endDate = end;

    document.getElementById("startDate").value = start;
    document.getElementById("endDate").value = end;

    window.renderAll?.();
  });

  document.addEventListener("dataLoaded", buildWeeks);
  document.addEventListener("monthChanged", buildWeeks);
})();
