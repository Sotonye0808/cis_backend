import type { Prisma, PrismaClient } from '@prisma/client';

export function createRoleRepository(prisma: PrismaClient) {
    return {
        findById(id: string) {
            return prisma.canonicalRole.findUnique({
                where: { id },
                include: { userRoles: { include: { user: true } }, permissionsRef: true }
            });
        },
        list() {
            return prisma.canonicalRole.findMany({
                orderBy: [{ platformId: 'asc' }, { roleKey: 'asc' }],
                include: { permissionsRef: true }
            });
        },
        findForUser(userId: string) {
            return prisma.userRole.findMany({
                where: { userId },
                include: { role: { include: { permissionsRef: true } } }
            });
        },
        create(data: Prisma.CanonicalRoleCreateInput) {
            return prisma.canonicalRole.create({ data });
        },
        assignRoleToUser(data: Prisma.UserRoleCreateInput) {
            return prisma.userRole.create({ data });
        },
        revokeRoleFromUser(userId: string, roleId: string, scopeId?: string | null) {
            return prisma.userRole.deleteMany({
                where: {
                    userId,
                    roleId,
                    scopeId: scopeId ?? undefined
                }
            });
        }
    };
}
