import type { Prisma, PrismaClient } from '@prisma/client';

export function createConfigRepository(prisma: PrismaClient) {
    return {
        findLatest(namespace: string, key: string) {
            return prisma.configEntry.findFirst({
                where: { namespace, key },
                orderBy: { version: 'desc' }
            });
        },
        create(data: Prisma.ConfigEntryCreateInput) {
            return prisma.configEntry.create({ data });
        },
        listByNamespace(namespace: string) {
            return prisma.configEntry.findMany({
                where: { namespace },
                orderBy: [{ key: 'asc' }, { version: 'desc' }]
            });
        }
    };
}
