export function parseDDMMYYYY(dateStr) {
    const [dd, mm, yyyy] = dateStr.split("/");
    return new Date(`${yyyy}-${mm}-${dd}`);
}

export function formatToISO(date) {
    return date.toISOString().split("T")[0];
}

export function getTodayISO() {
    return formatToISO(new Date());
}

export function getLast30Days() {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 30);

    return {
        start: formatToISO(past),
        end: formatToISO(today)
    };
}
