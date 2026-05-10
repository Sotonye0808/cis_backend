import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../types/errors';

type Entry = {
    count: number;
    windowStart: number;
};

export function createRateLimitMiddleware(options?: { maxRequests?: number; windowMs?: number }) {
    const maxRequests = options?.maxRequests ?? 30;
    const windowMs = options?.windowMs ?? 60_000;
    const entries = new Map<string, Entry>();

    return (req: Request, _res: Response, next: NextFunction) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const current = entries.get(key);

        if (!current || now - current.windowStart >= windowMs) {
            entries.set(key, { count: 1, windowStart: now });
            return next();
        }

        current.count += 1;
        if (current.count > maxRequests) {
            return next(new AppError(429, 'RATE_LIMITED', 'Too many requests, please try again later'));
        }

        return next();
    };
}
