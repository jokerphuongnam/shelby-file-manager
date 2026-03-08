import { Request, Response, NextFunction } from "express";
import * as fileService from "../services/fileService.js";

export async function prepareUpload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file provided." });
      return;
    }

    const accountAddress = req.body.accountAddress as string;
    if (!accountAddress) {
      res.status(400).json({ success: false, error: "Wallet not connected." });
      return;
    }

    const { originalname, buffer } = req.file;
    const result = await fileService.prepareUpload(originalname, buffer, accountAddress);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function commitUpload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { blobName, accountAddress, txHash } = req.body as {
      blobName: string;
      accountAddress: string;
      txHash: string;
    };

    if (!blobName || !accountAddress || !txHash) {
      res.status(400).json({ success: false, error: "blobName, accountAddress, and txHash are required." });
      return;
    }

    const result = await fileService.commitUpload(blobName, accountAddress, txHash);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listFiles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const account = req.query.account as string;

    if (!account) {
      res.status(400).json({ success: false, error: "account query parameter is required." });
      return;
    }

    const files = await fileService.listFiles(account);
    res.status(200).json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
}

export async function downloadFile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name } = req.params;
    const account = req.query.account as string;

    if (!name) {
      res.status(400).json({ success: false, error: "File name is required." });
      return;
    }

    if (!account) {
      res.status(400).json({ success: false, error: "account query parameter is required." });
      return;
    }

    const { buffer, contentType, fileName } = await fileService.downloadFile(name, account);

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
}
