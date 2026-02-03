// =======================================
// WEEK FILTER (REAL WEEK BUCKETS)
// Monday → Sunday
// Version: V1.0 (LOCKED)
// =======================================

(function () {
  const weekSelect = document.getElementById("weekSelector");

  if (!weekSelect) return;

  // -------------------------------
  // Helpers
  // -------------------------------
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

  // -------------------------------
  // Build weeks from data
  // -------------------------------
  function buildWeeks() {
    const dates = [];

    // Collect dates from GMV & CTR (sales truth)
    ["GMV", "CTR"].forEach(key => {
      (APP_STATE.data[key] || []).forEach(r => {
        const raw = r["Order Date"];
        if (!raw) return;

        const d = new Date(raw.includes("/") ? raw.split("/").reverse().join("-") : raw);
        if (!isNaN(d)) dates.push(d);
      });
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

    // -------------------------------
    // Populate dropdown
    // -------------------------------
    weekSelect.innerHTML = `<option value="">All</option>`;

    weeks.forEach(w => {
      const opt = document.createElement("option");
      opt.value = `${w.start}|${w.end}`;
      opt.textContent = w.label;
      weekSelect.appendChild(opt);
    });
  }

  // -------------------------------
  // On change
  // -------------------------------
  weekSelect.addEventListener("change", e => {
    const val = e.target.value;

    if (!val) {
      APP_STATE.week = null;
      return;
    }

    const [start, end] = val.split("|");
    APP_STATE.week = val;
    APP_STATE.startDate = start;
    APP_STATE.endDate = end;

    // Sync date inputs
    const s = document.getElementById("startDate");
    const en = document.getElementById("endDate");
    if (s) s.value = start;
    if (en) en.value = end;

    window.renderAll?.();
  });

  // -------------------------------
  // Init once data is loaded
  // -------------------------------
  document.addEventListener("dataLoaded", buildWeeks);
  setTimeout(buildWeeks, 800); // fallback safety
})();
