import { createRoleService } from '../../src/services/roleService';

describe('roleService', () => {
    const roleRepository = {
        findById: jest.fn(),
        list: jest.fn(),
        findForUser: jest.fn(),
        create: jest.fn(),
        assignRoleToUser: jest.fn(),
        revokeRoleFromUser: jest.fn()
    };

    const userRepository = {
        findById: jest.fn()
    };

    const service = createRoleService({ roleRepository, userRepository });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('creates a role', async () => {
        roleRepository.create.mockResolvedValue({ id: 'role-1', roleKey: 'MEMBER' });

        const result = await service.createRole({
            platformId: 'cis',
            roleKey: 'MEMBER',
            displayName: 'Member',
            scope: 'GLOBAL',
            inherits: [],
            permissions: []
        });

        expect(result.roleKey).toBe('MEMBER');
    });
});
