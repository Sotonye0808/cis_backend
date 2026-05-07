import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '../../types/errors';

export function validateBody(schema: ZodTypeAny) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return next(new ValidationError('Invalid request payload', parsed.error.flatten()));
        }

        req.body = parsed.data;
        next();
    };
}
