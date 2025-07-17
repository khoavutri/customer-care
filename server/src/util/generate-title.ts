export const generateTitle = (input: string, maxLength = 30) => {
    if (!input || typeof input !== 'string') return 'Cuộc trò chuyện mới';

    const words = input.trim().split(/\s+/);
    let title = '';
    let currentLength = 0;

    for (const word of words) {
        if (currentLength + word.length + (title ? 1 : 0) > maxLength) {
            break;
        }
        title += (title ? ' ' : '') + word;
        currentLength += word.length + (title ? 1 : 0);
    }

    if (!title || (currentLength < input.length && words.length > 1)) {
        title = title.slice(0, Math.max(0, maxLength - 3)) + (title ? '...' : 'Cuộc trò chuyện mới');
    }

    return title || 'Cuộc trò chuyện mới';
}