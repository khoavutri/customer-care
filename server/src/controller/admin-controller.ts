import dotenv from "dotenv";
import { Request, Response } from "express";
import { generateVectorsFromJson } from "../util/vector-handler";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

dotenv.config();

export const uploadJson = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 0, message: 'No file uploaded' });
        }
        const fileId = uuidv4();
        const outPath = path.join('data/vectors', `${fileId}.json`);
        const n = await generateVectorsFromJson(req.file.path, outPath);

        res.json({
            status: 1,
            message: `Đã xử lý xong ${n} records.`,
            vectorFile: outPath,
            fileId,
        });
    } catch (error: any) {
        res.status(500).json({ status: 0, message: error.message });
    }
};