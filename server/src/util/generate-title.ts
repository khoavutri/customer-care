export const generateTitle = (input: string, maxLength = 30) => {
    if (!input || typeof input !== 'string') return 'Cuộc trò chuyện mới';

    // Loại bỏ khoảng trắng thừa và tách thành mảng các từ
    const words = input.trim().split(/\s+/);
    let title = '';
    let currentLength = 0;

    // Duyệt qua từng từ để thêm vào tiêu đề
    for (const word of words) {
        // Nếu thêm từ này vượt quá maxLength, dừng lại
        if (currentLength + word.length + (title ? 1 : 0) > maxLength) {
            break;
        }
        // Thêm từ vào tiêu đề
        title += (title ? ' ' : '') + word;
        currentLength += word.length + (title ? 1 : 0);
    }

    // Nếu tiêu đề rỗng hoặc chuỗi bị cắt, thêm dấu ...
    if (!title || (currentLength < input.length && words.length > 1)) {
        title = title.slice(0, Math.max(0, maxLength - 3)) + (title ? '...' : 'Cuộc trò chuyện mới');
    }

    return title || 'Cuộc trò chuyện mới';
}