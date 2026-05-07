import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../../types/errors';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                details: error.details
            }
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: {
                    code: 'CONFLICT',
                    message: 'A record with the supplied unique fields already exists'
                }
            });
        }

        if (error.code === 'P2025') {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'The requested record does not exist'
                }
            });
        }
    }

    return res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred'
        }
    });
}
