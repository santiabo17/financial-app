export const formatDate = (date: string) => {
    const dateObject = new Date(date);
    
    const day = String(dateObject.getUTCDate()).padStart(2, '0');
    const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObject.getUTCFullYear();
    
    const formattedDateUTC = `${day}/${month}/${year}`;

    return formattedDateUTC;
}