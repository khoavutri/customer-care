import fs from 'fs/promises';
import path from 'path';

export async function loadVectorsFromFolder(folderPath: string): Promise<any[]> {
    const files = await fs.readdir(folderPath);
    const vectorFiles = files.filter(f => f.endsWith('.json'));
    let allVectors: any[] = [];
    const idSet = new Set();
    for (const file of vectorFiles) {
        const content = await fs.readFile(path.join(folderPath, file), 'utf8');
        const vectors = JSON.parse(content);

        for (const vector of vectors) {
            if (!idSet.has(vector.id)) {
                idSet.add(vector.id);
                allVectors.push(vector);
            }
        }
    }
    return allVectors;
}

export const readLabelFileSimple = async () => {
    const filePath = path.join('data/label', 'label.json');

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};