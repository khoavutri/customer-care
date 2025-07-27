
import { cleanupVectors, createLabel, deleteUser, getUsers, grantAdmin, uploadData } from "../controller/admin-controller";
import { Router } from "express";
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

const ensureUploadDir: any = (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
): void => {
    const outPath = path.join('data/files');

    if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath, { recursive: true });
    }

    cb(null, outPath);
};

const storage: StorageEngine = multer.diskStorage({
    destination: ensureUploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        const filename = `${base}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });
const uploadLabel = multer({ storage: multer.memoryStorage() });
const adminRouter: any = Router();

adminRouter.post("/upload-data", upload.single('file'), uploadData);
adminRouter.post("/user-list", getUsers);
adminRouter.put("/grant-admin", grantAdmin);
adminRouter.delete("/delete-user/:userId", deleteUser);
adminRouter.delete("/clean-up", cleanupVectors);
adminRouter.post("/upload-label", uploadLabel.single('file'), createLabel);

export default adminRouter;
