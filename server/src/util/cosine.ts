export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) throw new Error('Vectors must have same length');
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}


export function meanPool(embedding: any) {
    const length = embedding.length;
    const dim = embedding[0].length;
    const pooled = Array(dim).fill(0);
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < dim; j++) {
            pooled[j] += embedding[i][j];
        }
    }
    for (let j = 0; j < dim; j++) {
        pooled[j] /= length;
    }
    return pooled;
}
