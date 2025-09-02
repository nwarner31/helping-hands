import { startOfDay, endOfDay } from "date-fns";

export function convertTimeToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

/**
 * Normalize a date range to inclusive full-day boundaries
 *
 * @param from - Start date (inclusive)
 * @param to   - End date (inclusive)
 * @returns { fromDate, toDate }
 */
export function normalizeDateRange(from: Date, to: Date) {
    return {
        fromDate: startOfDay(from),
        toDate: endOfDay(to),
    };
}

