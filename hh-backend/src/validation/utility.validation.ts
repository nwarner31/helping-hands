export const stringIsDefined = (value?: string) => {
    return  !!(value && value.trim().length > 0);
}

export const isValidMonth = (value: string) => {
    const yearRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])/;
    return yearRegex.test(value);
}

export const isValidDate = (value: string) => {
    const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return dateRegex.test(value);
}