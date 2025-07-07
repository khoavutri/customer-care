import fs from 'fs/promises';
import path from 'path';
export async function loadVectorsFromFolder(folderPath: string): Promise<any[]> {
    const files = await fs.readdir(folderPath);
    const vectorFiles = files.filter(f => f.endsWith('.json'));
    let allVectors: any[] = [];
    for (const file of vectorFiles) {
        const content = await fs.readFile(path.join(folderPath, file), 'utf8');
        const vectors = JSON.parse(content);
        allVectors = allVectors.concat(vectors);
    }
    return allVectors;
}
