import { createConfigRepository } from '../../src/repositories/configRepository';
import { createEventRepository } from '../../src/repositories/eventRepository';
import { createOrgRepository } from '../../src/repositories/orgRepository';
import { createPermissionRepository } from '../../src/repositories/permissionRepository';
import { createPlatformRepository } from '../../src/repositories/platformRepository';
import { createRoleRepository } from '../../src/repositories/roleRepository';
import { createUserRepository } from '../../src/repositories/userRepository';

describe('repository factories', () => {
    const prisma = {
        canonicalUser: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        },
        canonicalRole: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn()
        },
        userRole: {
            findMany: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn()
        },
        rolePermission: {
            findMany: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn()
        },
        platformUserMapping: {
            findUnique: jest.fn(),
            create: jest.fn()
        },
        orgGroup: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn()
        },
        campus: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn()
        },
        configEntry: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn()
        },
        identityEvent: {
            create: jest.fn()
        },
        identityEventOutbox: {
            findMany: jest.fn(),
            update: jest.fn()
        }
    } as any;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('covers user repository methods', async () => {
        const repository = createUserRepository(prisma);
        prisma.canonicalUser.findUnique.mockResolvedValue({ id: 'user-1' });
        prisma.canonicalUser.findMany.mockResolvedValue([{ id: 'user-1' }]);
        prisma.canonicalUser.create.mockResolvedValue({ id: 'user-1' });
        prisma.canonicalUser.update.mockResolvedValue({ id: 'user-1' });

        expect(await repository.findById('user-1')).toEqual({ id: 'user-1' });
        expect(await repository.findByEmail('member@example.com')).toEqual({ id: 'user-1' });
        expect(await repository.list()).toEqual([{ id: 'user-1' }]);
        expect(await repository.create({} as any)).toEqual({ id: 'user-1' });
        expect(await repository.update('user-1', {} as any)).toEqual({ id: 'user-1' });
        expect(await repository.softDelete('user-1')).toEqual({ id: 'user-1' });
    });

    it('covers role repository methods', async () => {
        const repository = createRoleRepository(prisma);
        prisma.canonicalRole.findUnique.mockResolvedValue({ id: 'role-1' });
        prisma.canonicalRole.findMany.mockResolvedValue([{ id: 'role-1' }]);
        prisma.userRole.findMany.mockResolvedValue([{ id: 'assignment-1' }]);
        prisma.canonicalRole.create.mockResolvedValue({ id: 'role-1' });
        prisma.userRole.create.mockResolvedValue({ id: 'assignment-1' });
        prisma.userRole.deleteMany.mockResolvedValue({ count: 1 });

        expect(await repository.findById('role-1')).toEqual({ id: 'role-1' });
        expect(await repository.list()).toEqual([{ id: 'role-1' }]);
        expect(await repository.findForUser('user-1')).toEqual([{ id: 'assignment-1' }]);
        expect(await repository.create({} as any)).toEqual({ id: 'role-1' });
        expect(await repository.assignRoleToUser({} as any)).toEqual({ id: 'assignment-1' });
        expect(await repository.revokeRoleFromUser('user-1', 'role-1')).toEqual({ count: 1 });
    });

    it('covers permission repository methods', async () => {
        const repository = createPermissionRepository(prisma);
        prisma.rolePermission.findMany.mockResolvedValue([{ permissionKey: 'READ' }]);
        prisma.rolePermission.create.mockResolvedValue({ permissionKey: 'WRITE' });
        prisma.rolePermission.deleteMany.mockResolvedValue({ count: 1 });

        expect(await repository.findPermissionsByRole('role-1')).toEqual([{ permissionKey: 'READ' }]);
        expect(await repository.addPermissionToRole({} as any)).toEqual({ permissionKey: 'WRITE' });
        expect(await repository.removePermissionFromRole('role-1', 'READ')).toEqual({ count: 1 });
    });

    it('covers platform repository methods', async () => {
        const repository = createPlatformRepository(prisma);
        prisma.platformUserMapping.findUnique.mockResolvedValue({ externalUserId: 'ext-1' });
        prisma.platformUserMapping.create.mockResolvedValue({ externalUserId: 'ext-1' });

        expect(await repository.findMappingByExternalId('platform', 'ext-1')).toEqual({ externalUserId: 'ext-1' });
        expect(await repository.findCanonicalUserByPlatform('platform', 'ext-1')).toEqual({ externalUserId: 'ext-1' });
        expect(await repository.createMapping({} as any)).toEqual({ externalUserId: 'ext-1' });
    });

    it('covers org repository methods', async () => {
        const repository = createOrgRepository(prisma);
        prisma.orgGroup.findUnique.mockResolvedValue({ id: 'group-1' });
        prisma.orgGroup.findMany.mockResolvedValue([{ id: 'group-1' }]);
        prisma.campus.findUnique.mockResolvedValue({ id: 'campus-1' });
        prisma.campus.findMany.mockResolvedValue([{ id: 'campus-1' }]);
        prisma.campus.create.mockResolvedValue({ id: 'campus-1' });
        prisma.orgGroup.create.mockResolvedValue({ id: 'group-1' });

        expect(await repository.findOrgGroupById('group-1')).toEqual({ id: 'group-1' });
        expect(await repository.listOrgGroups()).toEqual([{ id: 'group-1' }]);
        expect(await repository.findCampusById('campus-1')).toEqual({ id: 'campus-1' });
        expect(await repository.listCampusesByOrgGroup('group-1')).toEqual([{ id: 'campus-1' }]);
        expect(await repository.createCampus({} as any)).toEqual({ id: 'campus-1' });
        expect(await repository.createOrgGroup({} as any)).toEqual({ id: 'group-1' });
    });

    it('covers config repository methods', async () => {
        const repository = createConfigRepository(prisma);
        prisma.configEntry.findFirst.mockResolvedValue({ key: 'bootstrap' });
        prisma.configEntry.create.mockResolvedValue({ key: 'bootstrap' });
        prisma.configEntry.findMany.mockResolvedValue([{ key: 'bootstrap' }]);

        expect(await repository.findLatest('namespace', 'bootstrap')).toEqual({ key: 'bootstrap' });
        expect(await repository.create({} as any)).toEqual({ key: 'bootstrap' });
        expect(await repository.listByNamespace('namespace')).toEqual([{ key: 'bootstrap' }]);
    });

    it('covers event repository methods', async () => {
        const repository = createEventRepository(prisma);
        prisma.identityEvent.create.mockResolvedValue({ eventId: 'evt-1' });
        prisma.identityEventOutbox.findMany.mockResolvedValue([{ id: 'outbox-1' }]);
        prisma.identityEventOutbox.update.mockResolvedValue({ id: 'outbox-1' });

        expect(await repository.createEventWithOutbox({} as any)).toEqual({ eventId: 'evt-1' });
        expect(await repository.findPendingOutbox(10)).toEqual([{ id: 'outbox-1' }]);
        expect(await repository.markOutboxProcessing('outbox-1')).toEqual({ id: 'outbox-1' });
        expect(await repository.markOutboxProcessed('outbox-1')).toEqual({ id: 'outbox-1' });
        expect(await repository.markOutboxFailed('outbox-1', 'boom')).toEqual({ id: 'outbox-1' });
    });
});
