import { Router } from 'express';
import { issueTokenSchema, refreshTokenSchema } from '../../types/schemas';
import { validateBody } from '../middleware/validateRequest';
import { handleAsync } from '../../utils/handleAsync';

type AuthService = {
    issueTokensForUser(userId: string): Promise<{ accessToken: string; refreshToken: string; tokenType: string }>;
    refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; tokenType: string }>;
};

export function createAuthRouter(authService: AuthService) {
    const router = Router();

    router.post(
        '/token',
        validateBody(issueTokenSchema),
        handleAsync(async (req, res) => {
            const tokens = await authService.issueTokensForUser(req.body.userId);
            res.status(201).json({ data: tokens });
        })
    );

    router.post(
        '/refresh',
        validateBody(refreshTokenSchema),
        handleAsync(async (req, res) => {
            const tokens = await authService.refreshTokens(req.body.refreshToken);
            res.json({ data: tokens });
        })
    );

    return router;
}
