import { Router } from 'express';
import { z } from 'zod';
import { assignRoleSchema, createRoleSchema } from '../../types/schemas';
import { validateBody } from '../middleware/validateRequest';
import { handleAsync } from '../../utils/handleAsync';

type RoleService = {
    listRoles(): Promise<any[]>;
    getRoleById(id: string): Promise<any>;
    createRole(input: any): Promise<any>;
    assignRoleToUser(input: any): Promise<any>;
    revokeRoleFromUser(userId: string, roleId: string, scopeId?: string): Promise<any>;
    getRolesForUser(userId: string): Promise<any[]>;
};

const assignRoleBodySchema = z.object({
    scopeId: assignRoleSchema.shape.scopeId.optional(),
    expiresAt: assignRoleSchema.shape.expiresAt.optional()
});

export function createRoleRouter(roleService: RoleService) {
    const router = Router();

    router.get(
        '/',
        handleAsync(async (_req, res) => {
            const roles = await roleService.listRoles();
            res.json({ data: roles });
        })
    );

    router.post(
        '/',
        validateBody(createRoleSchema),
        handleAsync(async (req, res) => {
            const role = await roleService.createRole(req.body);
            res.status(201).json({ data: role });
        })
    );

    router.get(
        '/:id',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const role = await roleService.getRoleById(id);
            res.json({ data: role });
        })
    );

    router.get(
        '/users/:userId/roles',
        handleAsync(async (req, res) => {
            const userId = String(req.params.userId);
            const roles = await roleService.getRolesForUser(userId);
            res.json({ data: roles });
        })
    );

    router.post(
        '/users/:userId/roles/:roleId',
        validateBody(assignRoleBodySchema),
        handleAsync(async (req, res) => {
            const userId = String(req.params.userId);
            const roleId = String(req.params.roleId);
            const assignment = await roleService.assignRoleToUser({
                userId,
                roleId,
                scopeId: req.body.scopeId,
                expiresAt: req.body.expiresAt
            });
            res.status(201).json({ data: assignment });
        })
    );

    router.delete(
        '/users/:userId/roles/:roleId',
        handleAsync(async (req, res) => {
            const userId = String(req.params.userId);
            const roleId = String(req.params.roleId);
            const result = await roleService.revokeRoleFromUser(
                userId,
                roleId,
                req.query.scopeId ? String(req.query.scopeId) : undefined
            );
            res.json({ data: result });
        })
    );

    return router;
}
