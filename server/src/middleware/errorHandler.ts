import { NextFunction, Request, Response } from 'express';
    import { logger } from '../logger';

    /**
    * Typed application error. Throw this from route handlers for known error cases.
    *
    * @example
    *   throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document does not exist');
    */
    export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(statusCode: number, code: string, message: string) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
      this.code = code;
      Error.captureStackTrace(this, this.constructor);
    }
    }

    /** Handles requests that match no route. */
    export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'The requested resource was not found',
      code: 404,
    });
    }

    /** Global error handler — must be registered last with app.use(). */
    export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
    ): void {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.code,
        message: err.message,
        code: err.statusCode,
      });
      return;
    }

    logger.error(
      { err, method: req.method, path: req.path },
      'Unhandled error',
    );

    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      code: 500,
    });
    }
    