import { logger } from '../lib/logger';
import type { EventBus, PublishedEvent } from './eventBus';

type EventRepository = {
    findPendingOutbox(limit: number, retryAfterMs?: number): Promise<any[]>;
    markOutboxProcessing(id: string): Promise<any>;
    markOutboxProcessed(id: string): Promise<any>;
    markOutboxFailed(id: string, errorMessage: string): Promise<any>;
};

export function createOutboxProcessorService(deps: {
    eventRepository: EventRepository;
    eventBus: EventBus;
    retryAfterMs?: number;
}) {
    const { eventRepository, eventBus, retryAfterMs = 30_000 } = deps;

    return {
        async processPending(limit = 50) {
            const pending = await eventRepository.findPendingOutbox(limit, retryAfterMs);
            let processed = 0;
            let failed = 0;

            for (const item of pending) {
                await eventRepository.markOutboxProcessing(item.id);

                try {
                    const event = item.event;
                    const payload: PublishedEvent = {
                        eventId: event.eventId,
                        eventType: event.eventType,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        data: event.data,
                        metadata: event.metadata ?? undefined,
                        actorId: event.actorId ?? null,
                        createdAt: event.createdAt.toISOString()
                    };

                    await eventBus.publish(`identity:${event.eventType}`, payload);
                    await eventBus.publish('identity:*', payload);
                    await eventRepository.markOutboxProcessed(item.id);
                    processed += 1;
                } catch (error) {
                    failed += 1;
                    const message = error instanceof Error ? error.message : 'Unknown event processing error';
                    logger.error({ outboxId: item.id, error: message }, 'Failed to publish outbox event');
                    await eventRepository.markOutboxFailed(item.id, message);
                }
            }

            return {
                picked: pending.length,
                processed,
                failed
            };
        }
    };
}
