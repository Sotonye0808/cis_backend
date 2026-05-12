import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../types/errors';

type AuthService = {
    verifyAccessToken(token: string): { sub: string };
};

type PermissionService = {
    userHasPermission(userId: string, permissionKey: string, scopeId?: string): Promise<boolean>;
};

export function createHostPlatformAuthHook(authService: AuthService) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return next(new UnauthorizedError('Missing bearer token'));
        }

        const token = header.slice('Bearer '.length).trim();
        if (!token) {
            return next(new UnauthorizedError('Missing bearer token'));
        }

        try {
            const payload = authService.verifyAccessToken(token);
            (req as any).hostPlatform = {
                cisUserId: payload.sub,
                token
            };
            return next();
        } catch (error) {
            return next(error);
        }
    };
}

export function createHostPlatformPermissionHook(permissionService: PermissionService) {
    return (permissionKey: string, scopeId?: string) => {
        return async (req: Request, _res: Response, next: NextFunction) => {
            const cisUserId = (req as any).hostPlatform?.cisUserId as string | undefined;
            if (!cisUserId) {
                return next(new UnauthorizedError('Missing CIS user context'));
            }

            const allowed = await permissionService.userHasPermission(cisUserId, permissionKey, scopeId);
            if (!allowed) {
                return next(new ForbiddenError('Forbidden'));
            }

            return next();
        };
    };
}