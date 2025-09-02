export const validateMonth = (monthString: string, errorName: string) => {
    if (!monthString.trim()) {
        return `${errorName} is required`;
    }
    // Check format YYYY-MM
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regex.test(monthString )) {
        return "Month must be in YYYY-MM format";
    }

    // Ensure it's a valid month
    const [year, month] = monthString.split("-").map(Number);
    if (month < 1 || month > 12 || year < 1900 || year > 2100) {
        return "Invalid month";
    }

    return undefined;
}

export const validateDate = (dateString: string, errorName: string, comparison?: "past" | "future") => {
    if(!dateString) {
        return `${errorName} is required`;
    }
    const inputDate = new Date(dateString);
    inputDate.setUTCHours(0, 0, 0, 0)
    const today = new Date();

    today.setUTCHours(0,0,0,0);
    if (isNaN(inputDate.getTime())) {
        return `${errorName} must be a valid date`;
    }
    if (comparison === "future" && inputDate < today) {
        return `${errorName} must be today or later`;
    }
    if(comparison === "past" && inputDate > today) {
        return `${errorName} must be today or earlier`;
    }

    return undefined;
}

export const validateTime = (
    timeString: string,
    errorName: string,
): string | undefined => {
    if (!timeString) {
        return `${errorName} is required`;
    }

    // Validate 24-hour time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(timeString)) {
        return `${errorName} must be a valid time`;
    }
    return undefined;
};