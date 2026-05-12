import { Router } from 'express';
import { handleAsync } from '../../utils/handleAsync';
import { validateBody } from '../middleware/validateRequest';
import {
    integrationPlatformSchema,
    platformRoleMappingBackfillSchema,
    platformRoleMappingListQuerySchema,
    platformRoleMappingSchema,
    platformSyncUsersSchema
} from '../../types/schemas';

type ReportingSdk = {
    syncUsers(users: any[]): Promise<any>;
    getMapping(externalUserId: string): Promise<any>;
};

type FaithHubSdk = {
    syncUsers(users: any[]): Promise<any>;
    getMapping(externalUserId: string): Promise<any>;
};

type PlatformIntegrationService = {
    getMapping(platformId: string, externalUserId: string): Promise<any>;
};

type PlatformRoleMappingService = {
    listMappings(platformId?: string): Promise<any[]>;
    getMapping(platformId: string, platformRoleKey: string): Promise<any>;
    upsertMapping(input: any): Promise<any>;
    translateRole(platformId: string, platformRoleKey: string): Promise<any>;
};

type PlatformRoleMappingBackfillService = {
    backfill(platformId?: string): Promise<any>;
};

type ThreePlatformSyncValidationService = {
    validate(): Promise<any>;
};

export function createIntegrationRouter(deps: {
    reportingSdk: ReportingSdk;
    faithHubSdk: FaithHubSdk;
    platformIntegrationService: PlatformIntegrationService;
    platformRoleMappingService?: PlatformRoleMappingService;
    platformRoleMappingBackfillService?: PlatformRoleMappingBackfillService;
    threePlatformSyncValidationService?: ThreePlatformSyncValidationService;
}) {
    const {
        reportingSdk,
        faithHubSdk,
        platformIntegrationService,
        platformRoleMappingService,
        platformRoleMappingBackfillService,
        threePlatformSyncValidationService
    } = deps;
    const router = Router();

    router.post(
        '/:platform/sync',
        validateBody(platformSyncUsersSchema),
        handleAsync(async (req, res) => {
            const platform = integrationPlatformSchema.parse(req.params.platform);
            const payload = req.body as { sourceSystem?: string; users: any[] };

            const result =
                platform === 'reporting'
                    ? await reportingSdk.syncUsers(payload.users)
                    : await faithHubSdk.syncUsers(payload.users);

            res.status(201).json({
                data: {
                    ...result,
                    platform,
                    sourceSystem: payload.sourceSystem ?? null
                }
            });
        })
    );

    router.get(
        '/:platform/mappings/:externalUserId',
        handleAsync(async (req, res) => {
            const platform = integrationPlatformSchema.parse(req.params.platform);
            const externalUserId = String(req.params.externalUserId);
            const mapping = await platformIntegrationService.getMapping(platform, externalUserId);
            res.json({ data: mapping });
        })
    );

    router.get(
        '/:platform/status',
        handleAsync(async (req, res) => {
            const platform = integrationPlatformSchema.parse(req.params.platform);
            res.json({
                data: {
                    platform,
                    status: 'ready'
                }
            });
        })
    );

    if (platformRoleMappingService) {
        if (platformRoleMappingBackfillService) {
            router.post(
                '/role-mappings/backfill',
                validateBody(platformRoleMappingBackfillSchema),
                handleAsync(async (req, res) => {
                    const result = await platformRoleMappingBackfillService.backfill(req.body.platformId);
                    res.status(201).json({ data: result });
                })
            );
        }

        router.get(
            '/role-mappings',
            handleAsync(async (req, res) => {
                const query = platformRoleMappingListQuerySchema.parse(req.query);
                const mappings = await platformRoleMappingService.listMappings(query.platformId);
                res.json({ data: mappings });
            })
        );

        router.post(
            '/role-mappings',
            validateBody(platformRoleMappingSchema),
            handleAsync(async (req, res) => {
                const mapping = await platformRoleMappingService.upsertMapping(req.body);
                res.status(201).json({ data: mapping });
            })
        );

        router.get(
            '/role-mappings/:platformId/:platformRoleKey',
            handleAsync(async (req, res) => {
                const mapping = await platformRoleMappingService.getMapping(
                    String(req.params.platformId),
                    String(req.params.platformRoleKey)
                );
                res.json({ data: mapping });
            })
        );
    }

    if (threePlatformSyncValidationService) {
        router.post(
            '/validation/three-platform-sync',
            handleAsync(async (_req, res) => {
                const result = await threePlatformSyncValidationService.validate();
                res.json({ data: result });
            })
        );
    }

    return router;
}