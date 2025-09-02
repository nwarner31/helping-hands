

/**
 * Compute the UTC start and end dates based on query parameters.
 */
export function getDateRange(month?: string, fromDate?: string, toDate?: string) {
    if (month) {
        const [yearStr, monthStr] = month.split("-");
        const year = Number(yearStr);
        const monthIndex = Number(monthStr) - 1;

        const from = new Date(Date.UTC(year, monthIndex, 1));
        const to = new Date(Date.UTC(year, monthIndex + 1, 0));
        return { from, to };
    }

    if (fromDate && toDate) {
        const from = new Date(`${fromDate}T00:00:00Z`);
        const to = new Date(`${toDate}T00:00:00Z`);
        return { from, to };
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const monthIndex = now.getUTCMonth();
    return {
        from: new Date(Date.UTC(year, monthIndex, 1)),
        to: new Date(Date.UTC(year, monthIndex + 1, 0)),
    };
}