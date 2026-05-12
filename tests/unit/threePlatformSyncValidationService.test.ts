import { createThreePlatformSyncValidationService } from '../../src/services/threePlatformSyncValidationService';

describe('threePlatformSyncValidationService', () => {
    it('validates Reporting, Faith Hub, and role translation in one pass', async () => {
        const platformIntegrationService = {
            syncUsers: jest
                .fn()
                .mockResolvedValueOnce({ total: 1, created: 1, linked: 0, updated: 0 })
                .mockResolvedValueOnce({ total: 1, created: 1, linked: 0, updated: 0 })
        };

        const platformRoleMappingService = {
            listMappings: jest.fn().mockResolvedValue([
                { platformId: 'reporting', platformRoleKey: 'SPO', canonicalRoleKey: 'PASTOR' },
                { platformId: 'faith-hub', platformRoleKey: 'MEMBER', canonicalRoleKey: 'MEMBER' }
            ]),
            getMapping: jest.fn().mockImplementation(async (platformId: string, platformRoleKey: string) => {
                if (platformId === 'reporting' && platformRoleKey === 'SPO') {
                    return { canonicalRoleKey: 'PASTOR' };
                }

                if (platformId === 'faith-hub' && platformRoleKey === 'MEMBER') {
                    return { canonicalRoleKey: 'MEMBER' };
                }

                return null;
            })
        };

        const platformRoleMappingBackfillService = {
            backfill: jest.fn().mockResolvedValue({ requestedPlatformId: null, total: 2, created: 2, skipped: 0 })
        };

        const service = createThreePlatformSyncValidationService({
            platformIntegrationService: platformIntegrationService as any,
            platformRoleMappingService: platformRoleMappingService as any,
            platformRoleMappingBackfillService: platformRoleMappingBackfillService as any
        });

        const result = await service.validate();

        expect(platformRoleMappingBackfillService.backfill).toHaveBeenCalledWith();
        expect(platformIntegrationService.syncUsers).toHaveBeenCalledTimes(2);
        expect(result.status).toBe('ok');
        expect(result.reportingUsers.total).toBe(1);
        expect(result.faithHubUsers.total).toBe(1);
        expect(result.roleMappings.reportingSPO).toBe('PASTOR');
        expect(result.roleMappings.faithHubMember).toBe('MEMBER');
    });
});