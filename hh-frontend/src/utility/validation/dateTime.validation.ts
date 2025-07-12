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

    // // Match 12-hour format (e.g., 01:23 PM or 1:23 am)
    // const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    // if (!timeRegex.test(timeString)) {
    //     return `${errorName} must be a valid 12-hour time (e.g., 02:30 PM)`;
    // }

    // Validate 24-hour time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(timeString)) {
        return `${errorName} must be a valid time`;
    }
    return undefined;
};