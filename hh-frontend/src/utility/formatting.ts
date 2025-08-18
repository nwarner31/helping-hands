export const formatDate = (dateTimeString: string) => {
    const [year, month, day] = dateTimeString.split("T")[0].split('-');
    return `${month}/${day}/${year}`;
}

export const formatShortDate = (dateTimeString: string) => {
    const [_, month, day] = dateTimeString.split("T")[0].split('-');
    return `${month}/${day}`;
}
export const formatTime = (dateTimeString: string) => {
    const [hour, minute] = dateTimeString.split("T")[1].split(":");
    return `${hour}:${minute}`;
}