export const formatDate = (dateTimeString: string) => {
    const [year, month, day] = dateTimeString.split("T")[0].split('-');
    return `${month}/${day}/${year}`;
}