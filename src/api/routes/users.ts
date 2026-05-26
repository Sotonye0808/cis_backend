import { Router } from 'express';
import { createUserSchema, updateUserSchema } from '../../types/schemas';
import { validateBody } from '../middleware/validateRequest';
import { handleAsync } from '../../utils/handleAsync';

type IdentityService = {
    createUser(input: any): Promise<any>;
    getUserById(id: string): Promise<any>;
    getUserByEmail(email: string): Promise<any>;
    listUsers(params?: { take?: number; skip?: number }): Promise<any[]>;
    updateUser(id: string, input: any): Promise<any>;
    deactivateUser(id: string): Promise<any>;
    deleteUser(id: string): Promise<any>;
};

type PlatformIntegrationService = {
    checkEmailCrossPlatform(email: string): Promise<{
        exists: boolean;
        canonicalUser: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
        platforms: string[];
    }>;
};

export function createUserRouter(
    identityService: IdentityService,
    platformIntegrationService?: PlatformIntegrationService
) {
    const router = Router();

    router.get(
        '/',
        handleAsync(async (req, res) => {
            const take = req.query.take ? Number(req.query.take) : undefined;
            const skip = req.query.skip ? Number(req.query.skip) : undefined;
            const users = await identityService.listUsers({ take, skip });
            res.json({ data: users });
        })
    );

    router.get(
        '/by-email/:email',
        handleAsync(async (req, res) => {
            const email = String(req.params.email);
            const user = await identityService.getUserByEmail(email);
            res.json({ data: user });
        })
    );

    router.get(
        '/check-email/:email',
        handleAsync(async (req, res) => {
            const email = String(req.params.email);
            if (!platformIntegrationService) {
                res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Platform integration service not configured' } });
                return;
            }
            const result = await platformIntegrationService.checkEmailCrossPlatform(email);
            res.json({ data: result });
        })
    );

    router.get(
        '/:id',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const user = await identityService.getUserById(id);
            res.json({ data: user });
        })
    );

    router.post(
        '/',
        validateBody(createUserSchema),
        handleAsync(async (req, res) => {
            const user = await identityService.createUser(req.body);
            res.status(201).json({ data: user });
        })
    );

    router.patch(
        '/:id',
        validateBody(updateUserSchema),
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const user = await identityService.updateUser(id, req.body);
            res.json({ data: user });
        })
    );

    router.post(
        '/:id/deactivate',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const user = await identityService.deactivateUser(id);
            res.json({ data: user });
        })
    );

    router.delete(
        '/:id',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const user = await identityService.deleteUser(id);
            res.json({ data: user });
        })
    );

    return router;
}
