import { Router } from "express";
import { upload } from "../middleware/upload";
import * as fileController from "../controllers/fileController";

const router = Router();

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.post("/confirm", fileController.confirmUpload);
router.get("/files", fileController.listFiles);
router.get("/file/:name", fileController.downloadFile);

export default router;
