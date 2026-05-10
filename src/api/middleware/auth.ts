import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../types/errors';

type AuthService = {
    verifyAccessToken(token: string): { sub: string };
};

export function createAuthMiddleware(authService: AuthService) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return next(new UnauthorizedError('Missing bearer token'));
        }

        const token = header.slice('Bearer '.length).trim();
        if (!token) {
            return next(new UnauthorizedError('Missing bearer token'));
        }

        const payload = authService.verifyAccessToken(token);
        (req as any).auth = { userId: payload.sub };
        return next();
    };
}
