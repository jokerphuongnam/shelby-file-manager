import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { config } from "../config/env";

const storage = multer.memoryStorage();

function fileFilter(
  _req: Request,
  _file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeBytes,
  },
});
