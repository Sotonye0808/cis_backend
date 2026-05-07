import { Router } from 'express';
import { createCampusSchema, createOrgGroupSchema } from '../../types/schemas';
import { validateBody } from '../middleware/validateRequest';
import { handleAsync } from '../../utils/handleAsync';

type OrgService = {
    listOrgGroups(): Promise<any[]>;
    getOrgGroup(id: string): Promise<any>;
    getCampus(id: string): Promise<any>;
    listCampuses(orgGroupId: string): Promise<any[]>;
    createCampus(input: any): Promise<any>;
    createOrgGroup(input: any): Promise<any>;
};

export function createOrgRouter(orgService: OrgService) {
    const router = Router();

    router.get(
        '/groups',
        handleAsync(async (_req, res) => {
            const groups = await orgService.listOrgGroups();
            res.json({ data: groups });
        })
    );

    router.post(
        '/groups',
        validateBody(createOrgGroupSchema),
        handleAsync(async (req, res) => {
            const group = await orgService.createOrgGroup(req.body);
            res.status(201).json({ data: group });
        })
    );

    router.get(
        '/groups/:id',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const group = await orgService.getOrgGroup(id);
            res.json({ data: group });
        })
    );

    router.get(
        '/groups/:id/campuses',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const campuses = await orgService.listCampuses(id);
            res.json({ data: campuses });
        })
    );

    router.get(
        '/campuses/:id',
        handleAsync(async (req, res) => {
            const id = String(req.params.id);
            const campus = await orgService.getCampus(id);
            res.json({ data: campus });
        })
    );

    router.post(
        '/campuses',
        validateBody(createCampusSchema),
        handleAsync(async (req, res) => {
            const campus = await orgService.createCampus(req.body);
            res.status(201).json({ data: campus });
        })
    );

    return router;
}
