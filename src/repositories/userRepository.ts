import type { Prisma, PrismaClient } from '@prisma/client';

export function createUserRepository(prisma: PrismaClient) {
    return {
        findById(id: string) {
            return prisma.canonicalUser.findUnique({
                where: { id },
                include: { userRoles: { include: { role: true } }, platformMappings: true }
            });
        },
        findByEmail(email: string) {
            return prisma.canonicalUser.findUnique({
                where: { email },
                include: { userRoles: { include: { role: true } }, platformMappings: true }
            });
        },
        list(params: { take?: number; skip?: number } = {}) {
            return prisma.canonicalUser.findMany({
                orderBy: { createdAt: 'desc' },
                take: params.take ?? 100,
                skip: params.skip ?? 0,
                include: { userRoles: { include: { role: true } }, platformMappings: true }
            });
        },
        create(data: Prisma.CanonicalUserCreateInput) {
            return prisma.canonicalUser.create({ data });
        },
        update(id: string, data: Prisma.CanonicalUserUpdateInput) {
            return prisma.canonicalUser.update({ where: { id }, data });
        },
        softDelete(id: string) {
            return prisma.canonicalUser.update({
                where: { id },
                data: { isDeleted: true, status: 'INACTIVE' }
            });
        }
    };
}
