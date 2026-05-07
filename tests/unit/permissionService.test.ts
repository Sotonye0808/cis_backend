import { createPermissionService } from '../../src/services/permissionService';

describe('permissionService', () => {
    const permissionRepository = {
        findPermissionsByRole: jest.fn(),
        addPermissionToRole: jest.fn(),
        removePermissionFromRole: jest.fn()
    };

    const service = createPermissionService({ permissionRepository });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('checks permissions and mutates role permissions', async () => {
        permissionRepository.findPermissionsByRole.mockResolvedValue([{ permissionKey: 'READ' }]);
        permissionRepository.addPermissionToRole.mockResolvedValue({ permissionKey: 'WRITE' });
        permissionRepository.removePermissionFromRole.mockResolvedValue({ count: 1 });

        expect(await service.getPermissionsByRole('role-1')).toEqual([{ permissionKey: 'READ' }]);
        expect(await service.hasPermission('role-1', 'READ')).toBe(true);
        expect(await service.addPermissionToRole('role-1', 'WRITE')).toEqual({ permissionKey: 'WRITE' });
        expect(await service.removePermissionFromRole('role-1', 'READ')).toEqual({ count: 1 });
    });
});
