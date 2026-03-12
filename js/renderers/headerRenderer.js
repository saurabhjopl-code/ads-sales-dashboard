export function renderHeader() {
    const header = document.querySelector(".app-header .title");
    if (!header) return;
    header.innerText = "Flipkart Sales & PLA Analytics";
}
