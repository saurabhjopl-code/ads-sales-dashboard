export function createBarChart(containerId, labels, values) {

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const max = Math.max(...values, 1);

    labels.forEach((label, i) => {

        const row = document.createElement("div");
        row.style.marginBottom = "10px";

        const bar = document.createElement("div");
        bar.style.height = "18px";
        bar.style.borderRadius = "6px";
        bar.style.background = "#4f46e5";
        bar.style.width = (values[i] / max) * 100 + "%";

        const text = document.createElement("div");
        text.style.fontSize = "12px";
        text.style.marginBottom = "4px";
        text.innerText = label + " — ₹" + values[i];

        row.appendChild(text);
        row.appendChild(bar);

        container.appendChild(row);
    });
}
