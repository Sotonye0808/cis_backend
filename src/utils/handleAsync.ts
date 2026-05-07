import type { RequestHandler } from 'express';

export function handleAsync(handler: RequestHandler): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
