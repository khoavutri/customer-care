
import { cleanupVectors, createLabel, deleteUser, getUsers, grantAdmin, uploadJson } from "../controller/admin-controller";
import { Router } from "express";
import multer, { StorageEngine } from 'multer';
import path from 'path';

const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/files');
    },
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

adminRouter.post("/upload-json", upload.single('file'), uploadJson);
adminRouter.post("/user-list", getUsers);
adminRouter.put("/grant-admin", grantAdmin);
adminRouter.delete("/delete-user/:userId", deleteUser);
adminRouter.delete("/clean-up", cleanupVectors);
adminRouter.post("/upload-label", uploadLabel.single('file'), createLabel);

export default adminRouter;
