
import { cleanupVectors, deleteUser, getUsers, grantAdmin, uploadJson } from "../controller/admin-controller";
import { Router } from "express";
const multer = require('multer');
const upload = multer({ dest: 'data/files' });

const adminRouter: any = Router();

adminRouter.post("/upload-json", upload.single('file'), uploadJson);
adminRouter.post("/user-list", getUsers);
adminRouter.put("/grant-admin", grantAdmin);
adminRouter.delete("/delete-user/:userId", deleteUser);
adminRouter.delete("/clean-up", cleanupVectors);

export default adminRouter;
