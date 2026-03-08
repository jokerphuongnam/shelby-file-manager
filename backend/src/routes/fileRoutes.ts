import { Router } from "express";
import { upload } from "../middleware/upload.js";
import * as fileController from "../controllers/fileController.js";

const router = Router();

router.post("/upload/prepare", upload.single("file"), fileController.prepareUpload);
router.post("/upload/commit", fileController.commitUpload);
router.get("/files", fileController.listFiles);
router.get("/file/:name", fileController.downloadFile);

export default router;
