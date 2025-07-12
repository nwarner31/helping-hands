export function convertTimeToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}
