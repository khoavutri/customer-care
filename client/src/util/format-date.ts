export function formatDate(inputDate: string) {
    if (!inputDate) return ""
    const date = new Date(inputDate);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = date.getFullYear();

    // Return the formatted string
    return `${hours}:${minutes} ${day}/${month}/${year}`;
}

