
import { uploadJson } from "../controller/admin-controller";
import { Router } from "express";
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const adminRouter: any = Router();

adminRouter.post("/upload-json", upload.single('file'), uploadJson);

export default adminRouter;
