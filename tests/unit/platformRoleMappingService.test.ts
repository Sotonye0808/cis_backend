import { createPlatformRoleMappingService } from '../../src/services/platformRoleMappingService';

describe('platformRoleMappingService', () => {
    const configRepository = {
        findLatest: jest.fn(),
        create: jest.fn(),
        listByNamespace: jest.fn()
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('upserts and retrieves role mappings by platform', async () => {
        configRepository.findLatest.mockResolvedValue(null);
        configRepository.create.mockResolvedValue({});
        configRepository.listByNamespace.mockResolvedValue([]);

        const service = createPlatformRoleMappingService({ configRepository });

        const created = await service.upsertMapping({
            platformId: 'reporting',
            platformRoleKey: 'SPO',
            canonicalRoleKey: 'PASTOR',
            permissions: ['users.read'],
            inherits: ['MEMBER'],
            notes: 'Reporting SPO maps to canonical pastor'
        });

        expect(created.canonicalRoleKey).toBe('PASTOR');
        expect(configRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                namespace: 'platform-role-mappings',
                key: 'reporting:SPO',
                version: 1
            })
        );

        configRepository.findLatest.mockResolvedValue({
            version: 1,
            value: created
        });

        const mapping = await service.getMapping('reporting', 'SPO');
        expect(mapping?.canonicalRoleKey).toBe('PASTOR');
    });

    it('lists the latest mapping per platform role key', async () => {
        configRepository.listByNamespace.mockResolvedValue([
            { key: 'faith-hub:MEMBER', value: { canonicalRoleKey: 'MEMBER', permissions: [], inherits: [] }, version: 1 },
            { key: 'faith-hub:MEMBER', value: { canonicalRoleKey: 'MEMBER', permissions: ['profile.read'], inherits: [] }, version: 2 }
        ]);

        const service = createPlatformRoleMappingService({ configRepository });
        const mappings = await service.listMappings('faith-hub');

        expect(mappings).toHaveLength(1);
        expect(mappings[0].version).toBe(2);
    });
});