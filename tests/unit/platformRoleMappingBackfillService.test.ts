import { createPlatformRoleMappingBackfillService } from '../../src/services/platformRoleMappingBackfillService';

describe('platformRoleMappingBackfillService', () => {
    const platformRoleMappingService = {
        getMapping: jest.fn(),
        upsertMapping: jest.fn()
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('backs fill default mappings and skips existing matches', async () => {
        platformRoleMappingService.getMapping.mockImplementation(async (platformId: string, platformRoleKey: string) => {
            if (platformId === 'reporting' && platformRoleKey === 'SUPERADMIN') {
                return {
                    canonicalRoleKey: 'SUPER_ADMIN',
                    permissions: [],
                    inherits: [],
                    version: 1
                };
            }

            return null;
        });
        platformRoleMappingService.upsertMapping.mockResolvedValue({});

        const service = createPlatformRoleMappingBackfillService({ platformRoleMappingService });
        const result = await service.backfill('reporting');

        expect(result.requestedPlatformId).toBe('reporting');
        expect(result.total).toBeGreaterThan(0);
        expect(result.skipped).toBe(1);
        expect(platformRoleMappingService.upsertMapping).toHaveBeenCalled();
    });

    it('can backfill all curated mappings', async () => {
        platformRoleMappingService.getMapping.mockResolvedValue(null);
        platformRoleMappingService.upsertMapping.mockResolvedValue({});

        const service = createPlatformRoleMappingBackfillService({ platformRoleMappingService });
        const result = await service.backfill();

        expect(result.total).toBeGreaterThan(1);
        expect(result.created).toBe(result.total);
        expect(platformRoleMappingService.upsertMapping).toHaveBeenCalledTimes(result.total);
    });
});