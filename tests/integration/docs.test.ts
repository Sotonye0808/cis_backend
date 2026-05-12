import request from 'supertest';
import { createApp } from '../../src/app';

describe('docs routes', () => {
    const app = createApp({
        identityService: { createUser: jest.fn(), getUserById: jest.fn(), getUserByEmail: jest.fn(), listUsers: jest.fn(), updateUser: jest.fn(), deactivateUser: jest.fn(), deleteUser: jest.fn() } as any,
        roleService: { listRoles: jest.fn(), getRoleById: jest.fn(), createRole: jest.fn(), assignRoleToUser: jest.fn(), revokeRoleFromUser: jest.fn(), getRolesForUser: jest.fn() } as any,
        orgService: { listOrgGroups: jest.fn(), getOrgGroup: jest.fn(), getCampus: jest.fn(), listCampuses: jest.fn(), createCampus: jest.fn(), createOrgGroup: jest.fn() } as any,
        authService: { issueTokensForUser: jest.fn(), refreshTokens: jest.fn(), verifyAccessToken: jest.fn() } as any,
        permissionService: { userHasPermission: jest.fn() } as any,
        outboxProcessorService: { processPending: jest.fn() } as any,
        eventSubscriptionService: { createSubscription: jest.fn(), getMessages: jest.fn(), deleteSubscription: jest.fn() } as any,
        platformIntegrationService: { syncUsers: jest.fn(), getMapping: jest.fn() } as any,
        platformRoleMappingService: { listMappings: jest.fn(), getMapping: jest.fn(), upsertMapping: jest.fn(), translateRole: jest.fn() } as any,
        platformRoleMappingBackfillService: { backfill: jest.fn() } as any
    });

    it('serves openapi json', async () => {
        const response = await request(app).get('/api/docs/openapi.json');

        expect(response.status).toBe(200);
        expect(response.body.openapi).toBe('3.0.3');
    });
});
