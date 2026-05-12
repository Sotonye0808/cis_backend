import { Router } from 'express';
import { ForbiddenError } from '../../types/errors';
import { permissionCheckSchema } from '../../types/schemas';
import { handleAsync } from '../../utils/handleAsync';
import { validateBody } from '../middleware/validateRequest';

type PermissionService = {
    userHasPermission(userId: string, permissionKey: string, scopeId?: string): Promise<boolean>;
};

export function createPermissionRouter(permissionService: PermissionService) {
    const router = Router();

    router.post(
        '/check',
        validateBody(permissionCheckSchema),
        handleAsync(async (req, res) => {
            const authUserId = (req as any).auth?.userId as string | undefined;
            const userId = req.body.userId ?? authUserId;

            if (!userId) {
                throw new ForbiddenError('User context is required for permission checks');
            }

            const allowed = await permissionService.userHasPermission(
                userId,
                req.body.permissionKey,
                req.body.scopeId
            );

            res.json({ data: { userId, permissionKey: req.body.permissionKey, allowed } });
        })
    );

    return router;
}
