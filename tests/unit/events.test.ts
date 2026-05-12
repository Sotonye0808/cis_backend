import { createEventService } from '../../src/services/eventService';
import { createOutboxProcessorService } from '../../src/services/outboxProcessorService';
import { createInMemoryEventBus } from '../../src/services/eventBus';
import { createEventSubscriptionService } from '../../src/services/eventSubscriptionService';
import { createIdentityService } from '../../src/services/identityService';

describe('event services', () => {
    it('queues events into outbox repository', async () => {
        const eventRepository = {
            createEventWithOutbox: jest.fn().mockResolvedValue({ eventId: 'evt-1' })
        };
        const service = createEventService({ eventRepository });

        const event = await service.queueEvent({
            eventType: 'USER_CREATED',
            aggregateId: 'user-1',
            aggregateType: 'canonical_user',
            data: { userId: 'user-1' }
        });

        expect(event.eventId).toBe('evt-1');
        expect(eventRepository.createEventWithOutbox).toHaveBeenCalled();
    });

    it('processes outbox records and publishes events', async () => {
        const eventRepository = {
            findPendingOutbox: jest.fn().mockResolvedValue([
                {
                    id: 'outbox-1',
                    event: {
                        eventId: 'evt-1',
                        eventType: 'USER_CREATED',
                        aggregateId: 'user-1',
                        aggregateType: 'canonical_user',
                        data: { userId: 'user-1' },
                        metadata: null,
                        actorId: null,
                        createdAt: new Date()
                    }
                }
            ]),
            markOutboxProcessing: jest.fn().mockResolvedValue({}),
            markOutboxProcessed: jest.fn().mockResolvedValue({}),
            markOutboxFailed: jest.fn().mockResolvedValue({})
        };
        const eventBus = {
            publish: jest.fn().mockResolvedValue(undefined),
            subscribe: jest.fn().mockResolvedValue(async () => {})
        };

        const service = createOutboxProcessorService({ eventRepository, eventBus });
        const result = await service.processPending(10);

        expect(result.processed).toBe(1);
        expect(eventBus.publish).toHaveBeenCalledTimes(2);
        expect(eventRepository.markOutboxProcessed).toHaveBeenCalledWith('outbox-1');
    });

    it('supports subscription polling through in-memory event bus', async () => {
        const bus = createInMemoryEventBus();
        const subscriptions = createEventSubscriptionService({ eventBus: bus });
        const subscription = await subscriptions.createSubscription('identity:*');

        await bus.publish('identity:*', {
            eventId: 'evt-1',
            eventType: 'USER_CREATED',
            aggregateId: 'user-1',
            aggregateType: 'canonical_user',
            data: {},
            createdAt: new Date().toISOString()
        });

        const firstRead = subscriptions.getMessages(subscription.id);
        const secondRead = subscriptions.getMessages(subscription.id);

        expect(firstRead).toHaveLength(1);
        expect(secondRead).toHaveLength(0);

        await subscriptions.deleteSubscription(subscription.id);
    });

    it('keeps user mutation non-blocking from event publishing by only enqueueing', async () => {
        const userRepository = {
            findById: jest.fn().mockResolvedValue({ id: 'user-1' }),
            findByEmail: jest.fn().mockResolvedValue(null),
            list: jest.fn(),
            create: jest.fn().mockResolvedValue({ id: 'user-1', email: 'member@example.com' }),
            update: jest.fn(),
            softDelete: jest.fn()
        };
        const eventService = {
            queueEvent: jest.fn().mockResolvedValue({ eventId: 'evt-1' })
        };
        const identityService = createIdentityService({
            userRepository,
            eventService
        });

        const result = await identityService.createUser({ email: 'member@example.com' });

        expect(result.id).toBe('user-1');
        expect(eventService.queueEvent).toHaveBeenCalledWith(
            expect.objectContaining({ eventType: 'USER_CREATED', aggregateId: 'user-1' })
        );
    });
});
