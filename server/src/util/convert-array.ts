export function convertToArray(data: { [key: string]: number }): number[] {
    if (!data || typeof data !== 'object') {
        console.warn('Invalid data: not an object');
        return [];
    }

    const values = Object.values(data);
    if (values.length !== 384) {
        console.warn(`Invalid data: expected 384 dimensions, got ${values.length}`);
        return [];
    }

    if (values.some(v => typeof v !== 'number' || isNaN(v))) {
        console.warn('Invalid data: contains NaN or non-number values');
        return [];
    }

    return values;
}