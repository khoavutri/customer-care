export const cleanCitations = (text) => {
    return text.replace(/\[\w+\]/g, '');
}