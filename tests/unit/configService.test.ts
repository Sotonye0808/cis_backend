import { createConfigService } from '../../src/services/configService';

describe('configService', () => {
    it('parses role permission overrides from config entries', async () => {
        const configRepository = {
            listByNamespace: jest.fn().mockResolvedValue([
                {
                    key: 'cis:ADMIN',
                    value: {
                        permissions: ['users.read', 'users.write'],
                        inherits: ['role-member']
                    }
                }
            ])
        };

        const service = createConfigService({ configRepository });
        const overrides = await service.getRolePermissionOverrides();
        expect(overrides.get('cis:ADMIN')).toEqual({
            permissions: ['users.read', 'users.write'],
            inherits: ['role-member']
        });
    });
});
