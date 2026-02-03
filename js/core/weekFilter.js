// =======================================
// WEEK FILTER (GMV ONLY)
// Monday → Sunday
// Version: V1.1 (LOCKED)
// =======================================

(function () {
  const weekSelect = document.getElementById("weekSelector");
  if (!weekSelect) return;

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function format(d) {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short"
    });
  }

  function toISO(d) {
    return d.toISOString().split("T")[0];
  }

  function parseDate(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    const p = value.includes("/") ? value.split("/") : value.split("-");
    return new Date(p[2], p[1] - 1, p[0]);
  }

  function buildWeeks() {
    const dates = [];

    // 🔒 ONLY GMV DATA
    (APP_STATE.data.GMV || []).forEach(r => {
      const d = parseDate(r["Order Date"]);
      if (d && !isNaN(d)) dates.push(d);
    });

    if (!dates.length) return;

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const weeks = [];
    let current = getMonday(minDate);

    while (current <= maxDate) {
      const start = new Date(current);
      const end = new Date(current);
      end.setDate(start.getDate() + 6);

      weeks.push({
        label: `${format(start)} – ${format(end)}`,
        start: toISO(start),
        end: toISO(end)
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
      APP_STATE.startDate = null;
      APP_STATE.endDate = null;
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
})();
