import type { IdentityEventType } from '@prisma/client';

type EventRepository = {
    createEventWithOutbox(data: any): Promise<any>;
};

export function createEventService(deps: { eventRepository: EventRepository }) {
    const { eventRepository } = deps;

    return {
        queueEvent(input: {
            eventType: IdentityEventType;
            aggregateId: string;
            aggregateType: string;
            data: unknown;
            metadata?: unknown;
            actorId?: string | null;
        }) {
            return eventRepository.createEventWithOutbox({
                eventType: input.eventType,
                aggregateId: input.aggregateId,
                aggregateType: input.aggregateType,
                data: input.data as any,
                metadata: input.metadata as any,
                actorId: input.actorId ?? null
            });
        }
    };
}
