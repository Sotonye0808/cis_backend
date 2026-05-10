import { createPermissionService } from '../../src/services/permissionService';

describe('permissionService', () => {
    const permissionRepository = {
        findPermissionsByRole: jest.fn(),
        addPermissionToRole: jest.fn(),
        removePermissionFromRole: jest.fn()
    };
    const roleRepository = {
        findById: jest.fn(),
        findForUser: jest.fn()
    };
    const configService = {
        getRolePermissionOverrides: jest.fn()
    };

    const service = createPermissionService({
        permissionRepository,
        roleRepository,
        configService,
        cacheTtlMs: 1000
    });

    beforeEach(() => {
        jest.resetAllMocks();
        configService.getRolePermissionOverrides.mockResolvedValue(new Map());
    });

    it('checks permissions and mutates role permissions', async () => {
        permissionRepository.findPermissionsByRole.mockResolvedValue([{ permissionKey: 'READ' }]);
        permissionRepository.addPermissionToRole.mockResolvedValue({ permissionKey: 'WRITE' });
        permissionRepository.removePermissionFromRole.mockResolvedValue({ count: 1 });
        roleRepository.findById.mockResolvedValue({
            id: 'role-1',
            platformId: 'cis',
            roleKey: 'MEMBER',
            inherits: [],
            permissions: [],
            permissionsRef: []
        });

        expect(await service.getPermissionsByRole('role-1')).toEqual([{ permissionKey: 'READ' }]);
        expect(await service.hasPermission('role-1', 'READ')).toBe(true);
        expect(await service.addPermissionToRole('role-1', 'WRITE')).toEqual({ permissionKey: 'WRITE' });
        expect(await service.removePermissionFromRole('role-1', 'READ')).toEqual({ count: 1 });
    });

    it('resolves inherited permissions and caches user permission checks', async () => {
        roleRepository.findForUser.mockResolvedValue([
            {
                roleId: 'role-parent',
                scopeId: null,
                role: { id: 'role-parent' }
            }
        ]);

        roleRepository.findById.mockImplementation(async (roleId: string) => {
            if (roleId === 'role-parent') {
                return {
                    id: 'role-parent',
                    platformId: 'cis',
                    roleKey: 'PARENT',
                    inherits: ['role-child'],
                    permissions: [],
                    permissionsRef: [{ permissionKey: 'users.read' }]
                };
            }

            return {
                id: 'role-child',
                platformId: 'cis',
                roleKey: 'CHILD',
                inherits: [],
                permissions: ['users.write'],
                permissionsRef: []
            };
        });

        permissionRepository.findPermissionsByRole.mockResolvedValue([]);

        const firstCheck = await service.userHasPermission('user-1', 'users.write');
        const secondCheck = await service.userHasPermission('user-1', 'users.write');

        expect(firstCheck).toBe(true);
        expect(secondCheck).toBe(true);
        expect(roleRepository.findForUser).toHaveBeenCalledTimes(1);
    });
});
