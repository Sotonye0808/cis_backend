import type { Prisma, PrismaClient } from '@prisma/client';

export function createPermissionRepository(prisma: PrismaClient) {
    return {
        findPermissionsByRole(roleId: string) {
            return prisma.rolePermission.findMany({ where: { roleId }, orderBy: { permissionKey: 'asc' } });
        },
        addPermissionToRole(data: Prisma.RolePermissionCreateInput) {
            return prisma.rolePermission.create({ data });
        },
        removePermissionFromRole(roleId: string, permissionKey: string) {
            return prisma.rolePermission.deleteMany({ where: { roleId, permissionKey } });
        }
    };
}
