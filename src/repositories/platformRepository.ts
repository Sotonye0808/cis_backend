import type { Prisma, PrismaClient } from '@prisma/client';

export function createPlatformRepository(prisma: PrismaClient) {
    return {
        findMappingByExternalId(platformId: string, externalUserId: string) {
            return prisma.platformUserMapping.findUnique({
                where: { platformId_externalUserId: { platformId, externalUserId } },
                include: { canonicalUser: true }
            });
        },
        findCanonicalUserByPlatform(platformId: string, externalUserId: string) {
            return prisma.platformUserMapping.findUnique({
                where: { platformId_externalUserId: { platformId, externalUserId } },
                include: { canonicalUser: true }
            });
        },
        createMapping(data: Prisma.PlatformUserMappingCreateInput) {
            return prisma.platformUserMapping.create({ data });
        }
    };
}
