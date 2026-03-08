import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

// Express identifies error handlers by the 4-parameter signature; _next must be declared.
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";

  console.error(`[ErrorHandler] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
