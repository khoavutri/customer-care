
import { cleanupVectors, createLabel, deleteUser, getUsers, grantAdmin, uploadJson } from "../controller/admin-controller";
import { Router } from "express";
const multer = require('multer');
const upload = multer({ dest: 'data/files' });
const uploadLabel = multer({ storage: multer.memoryStorage() });
const adminRouter: any = Router();

adminRouter.post("/upload-json", upload.single('file'), uploadJson);
adminRouter.post("/user-list", getUsers);
adminRouter.put("/grant-admin", grantAdmin);
adminRouter.delete("/delete-user/:userId", deleteUser);
adminRouter.delete("/clean-up", cleanupVectors);
adminRouter.post("/upload-label", uploadLabel.single('file'), createLabel);

export default adminRouter;
