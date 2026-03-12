export function renderLineChart(canvasId, labels, datasets) {

    const ctx = document.getElementById(canvasId).getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "top" }
            },
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });
}
