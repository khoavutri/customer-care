import { pipeline } from '@xenova/transformers';
import fs from 'fs/promises';
import path from 'path';
import { cosineSimilarity } from './cosine';
import { convertToArray } from './convert-array';
import { readLabelFileSimple } from './load-vectors';
import Score from '../models/score.model';
import { readExcelDynamic } from './excel-handler';
import { v4 as uuid } from 'uuid';

const modelEmbed = "Xenova/all-MiniLM-L6-v2"
export function mixDataToTextVi(data: any): string {
    function formatValue(value: any): string {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' || typeof value === 'number') return `${value}`;
        if (Array.isArray(value)) return value.map(formatValue).join(', ');
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([key, val]) => {
                    const formatted = formatValue(val);
                    return formatted ? `${key}: ${formatted}` : '';
                })
                .filter(Boolean)
                .join(', ');
        }
        return '';
    }

    return Object.entries(data)
        .map(([key, value]) => {
            const formatted = formatValue(value);
            return formatted ? `${key}: ${formatted}` : '';
        })
        .filter(Boolean)
        .join('. ') + '.';
}

export async function generateVectors(filePath: string, outPath: string, expand: string) {
    let data: any[] = [];
    if (expand.includes("xlsx") || expand.includes("xls")) {
        const excelData = await readExcelDynamic(filePath)
        data = [...excelData];
    } else {
        const content = await fs.readFile(`${filePath}`, 'utf8');
        data = JSON.parse(content);
    }

    const embedder = await pipeline('feature-extraction', modelEmbed);
    const allVectors = [];

    for (const item of data) {
        const text = mixDataToTextVi(item);
        const output: any = await embedder(text);
        const vector = output[0][0];
        allVectors.push({
            id: item.id || uuid(),
            original: item,
            text,
            embedding: vector,
        });
    }
    // Save to file
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(allVectors, null, 2));
    return allVectors.length;
}

export async function searchVector(query: string, vectors: any, topK = 3) {
    const embedder: any = await pipeline('feature-extraction', modelEmbed);
    const queryEmbedding = (await embedder(query))[0][0];
    const scored = vectors.map((item: any) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding.data, convertToArray(item.embedding.data)),
    }));
    scored.sort((a: any, b: any) => b.score - a.score);
    return scored.slice(0, topK);
}

function calculateBM25Score(query: string, document: string, k1: number = 1.2, b: number = 0.75): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const docTerms = document.toLowerCase().split(/\s+/);
    const docLength = docTerms.length;
    const avgDocLength = 100; // Giả sử độ dài trung bình của document

    let score = 0;

    for (const term of queryTerms) {
        const termFreq = docTerms.filter(t => t.includes(term) || term.includes(t)).length;

        if (termFreq > 0) {
            const idf = Math.log((1 + docLength) / (1 + termFreq));
            const tf = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (docLength / avgDocLength)));
            score += idf * tf;
        }
    }

    return score;
}

function keywordSearch(query: string, vectors: any[], topK: number = 10): any[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    const scored = vectors.map(item => {
        const textLower = item.text.toLowerCase();
        let keywordScore = 0;

        // Tính điểm BM25
        keywordScore = calculateBM25Score(query, item.text);

        // Bonus cho exact match
        if (textLower.includes(queryLower)) {
            keywordScore += 2;
        }

        // Bonus cho match trong tên
        if (item.original.name && item.original.name.toLowerCase().includes(queryLower)) {
            keywordScore += 3;
        }

        // Bonus cho match trong tags
        if (item.original.tags && item.original.tags.some((tag: string) =>
            tag.toLowerCase().includes(queryLower) || queryLower.includes(tag.toLowerCase())
        )) {
            keywordScore += 1.5;
        }

        return {
            ...item,
            keywordScore: keywordScore
        };
    });

    return scored
        .filter(item => item.keywordScore > 0)
        .sort((a, b) => b.keywordScore - a.keywordScore)
        .slice(0, topK);
}

function normalizeScores(items: any[], scoreField: string): any[] {
    const scores = items.map(item => item[scoreField]);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore;

    if (range === 0) return items;

    return items.map(item => ({
        ...item,
        [scoreField]: (item[scoreField] - minScore) / range
    }));
}

export async function hybridSearch(
    query: string,
    vectors: any,
    topK: number = 3,
    semanticWeight: number = 0.7,
    keywordWeight: number = 0.3
): Promise<any[]> {
    if (Math.abs(semanticWeight + keywordWeight - 1.0) > 0.001) {
        throw new Error('semanticWeight + keywordWeight phải bằng 1.0');
    }
    const semanticResults = await searchVector(query, vectors, Math.min(topK * 3, vectors.length));

    const keywordResults = keywordSearch(query, vectors, Math.min(topK * 3, vectors.length));

    const normalizedSemantic = normalizeScores(semanticResults, 'score');
    const normalizedKeyword = normalizeScores(keywordResults, 'keywordScore');

    const semanticMap = new Map(normalizedSemantic.map(item => [item.id, item.score]));
    const keywordMap = new Map(normalizedKeyword.map(item => [item.id, item.keywordScore]));

    const allIds = new Set([...semanticMap.keys(), ...keywordMap.keys()]);
    const combinedResults = Array.from(allIds).map(id => {
        const semanticScore = semanticMap.get(id) || 0;
        const keywordScore = keywordMap.get(id) || 0;
        const finalScore = (semanticScore * semanticWeight) + (keywordScore * keywordWeight);

        // Lấy item gốc (ưu tiên từ semantic results)
        const originalItem = semanticResults.find((item: any) => item.id === id) ||
            keywordResults.find(item => item.id === id) ||
            vectors.find((item: any) => item.id === id);

        return {
            ...originalItem,
            semanticScore: semanticScore,
            keywordScore: keywordScore,
            finalScore: finalScore,
            searchMethod: 'hybrid'
        };
    });

    // 6. Sắp xếp và trả về top K
    return combinedResults
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, topK);
}

export function explainHybridResults(results: any[]): void {
    console.log('=== HYBRID SEARCH RESULTS ===');
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.original.name} (ID: ${result.id})`);
        console.log(`   Final Score: ${result.finalScore.toFixed(3)} `);
        console.log(`   Semantic: ${result.semanticScore.toFixed(3)} `);
        console.log(`   Keyword: ${result.keywordScore.toFixed(3)} `);
    });
}

export async function compareSearchMethods(
    query: string,
    vectorFile: string,
    topK: number = 5
): Promise<{
    semantic: any[],
    hybrid: any[],
    analysis: any
}> {
    const semanticResults = await searchVector(query, vectorFile, topK);
    const hybridResults = await hybridSearch(query, vectorFile, topK);

    const semanticIds = new Set(semanticResults.map((r: any) => r.id));
    const hybridIds = new Set(hybridResults.map(r => r.id));
    const intersection = new Set([...semanticIds].filter(id => hybridIds.has(id)));

    const analysis = {
        overlap: intersection.size,
        overlapPercentage: (intersection.size / topK) * 100,
        uniqueInSemantic: semanticIds.size - intersection.size,
        uniqueInHybrid: hybridIds.size - intersection.size,
        avgSemanticScore: semanticResults.reduce((sum: any, r: any) => sum + r.score, 0) / semanticResults.length,
        avgHybridScore: hybridResults.reduce((sum, r) => sum + r.finalScore, 0) / hybridResults.length
    };

    return {
        semantic: semanticResults,
        hybrid: hybridResults,
        analysis
    };
}

export const dataLabeling = async (text: string, userId: any, conversationId: any) => {
    try {
        const labels = await readLabelFileSimple();

        const classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
        const candidateLabels = labels.map((label: any) => label.label);
        const result: any = await classifier(text, candidateLabels);
        const topIndex = result.scores.indexOf(Math.max(...result.scores));

        const topLabel = {
            label: result.labels[topIndex],
            score: result.scores[topIndex],
        };

        await Score.create({
            label: topLabel.label,
            score: topLabel.score,
            prompt: text,
            userId,
            conversationId,
        });

        return topLabel;
    } catch (error) {
        console.error('Lỗi khi gắn nhãn:', error);
        throw error;
    }
};