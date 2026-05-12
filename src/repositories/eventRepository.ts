import type { Prisma, PrismaClient } from '@prisma/client';

const MAX_ERROR_MESSAGE_LENGTH = 1000;

export function createEventRepository(prisma: PrismaClient) {
    return {
        createEventWithOutbox(data: Prisma.IdentityEventCreateInput) {
            return prisma.identityEvent.create({
                data: {
                    ...data,
                    outbox: { create: {} }
                }
            });
        },
        findPendingOutbox(limit: number, retryAfterMs = 30_000) {
            const retryCutoff = new Date(Date.now() - retryAfterMs);

            return prisma.identityEventOutbox.findMany({
                where: {
                    processedAt: null,
                    OR: [{ processingStartedAt: null }, { processingStartedAt: { lt: retryCutoff } }]
                },
                orderBy: { createdAt: 'asc' },
                take: limit,
                include: { event: true }
            });
        },
        markOutboxProcessing(id: string) {
            return prisma.identityEventOutbox.update({
                where: { id },
                data: { processingStartedAt: new Date() }
            });
        },
        markOutboxProcessed(id: string) {
            return prisma.identityEventOutbox.update({
                where: { id },
                data: { processedAt: new Date(), lastError: null }
            });
        },
        markOutboxFailed(id: string, errorMessage: string) {
            return prisma.identityEventOutbox.update({
                where: { id },
                data: {
                    failureCount: { increment: 1 },
                    lastError: errorMessage.slice(0, MAX_ERROR_MESSAGE_LENGTH),
                    processingStartedAt: null
                }
            });
        }
    };
}
