import { createInMemoryEventBus } from '../../src/services/eventBus';
import { createPlatformIntegrationService } from '../../src/services/platformIntegrationService';

describe('platformIntegrationService', () => {
    const userRepository = {
        findById: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    };

    const platformRepository = {
        findMappingByExternalId: jest.fn(),
        findCanonicalUserByPlatform: jest.fn(),
        createMapping: jest.fn()
    };

    const eventService = {
        queueEvent: jest.fn()
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('syncs a reporting user, creates a mapping, and queues an event', async () => {
        platformRepository.findMappingByExternalId.mockResolvedValue(null);
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.create.mockResolvedValue({ id: 'user-1', email: 'member@example.com' });
        platformRepository.createMapping.mockResolvedValue({ id: 'mapping-1' });

        const service = createPlatformIntegrationService({
            userRepository,
            platformRepository,
            eventService
        });

        const result = await service.syncUsers(
            { platformId: 'reporting', sourceSystem: 'reporting_users' },
            [
                {
                    externalUserId: 'rep-1',
                    email: 'member@example.com',
                    firstName: 'Test',
                    lastName: 'User'
                }
            ]
        );

        expect(result.created).toBe(1);
        expect(result.updated).toBe(0);
        expect(result.linked).toBe(0);
        expect(platformRepository.createMapping).toHaveBeenCalledWith(
            expect.objectContaining({
                platformId: 'reporting',
                externalUserId: 'rep-1'
            })
        );
        expect(eventService.queueEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'USER_CREATED',
                aggregateId: 'user-1'
            })
        );
    });

    it('updates an existing mapped faith hub user', async () => {
        platformRepository.findMappingByExternalId.mockResolvedValue({
            canonicalUser: { id: 'user-2', email: 'old@example.com' }
        });
        userRepository.update.mockResolvedValue({ id: 'user-2', email: 'new@example.com' });
        platformRepository.createMapping.mockResolvedValue({ id: 'mapping-2' });

        const service = createPlatformIntegrationService({
            userRepository,
            platformRepository,
            eventService
        });

        const result = await service.syncUsers(
            { platformId: 'faith-hub', sourceSystem: 'faith_hub_users' },
            [
                {
                    externalUserId: 'fh-1',
                    email: 'new@example.com',
                    firstName: 'Faith',
                    lastName: 'Hub'
                }
            ]
        );

        expect(result.updated).toBe(1);
        expect(userRepository.update).toHaveBeenCalledWith(
            'user-2',
            expect.objectContaining({ email: 'new@example.com' })
        );
        expect(platformRepository.createMapping).not.toHaveBeenCalled();
        expect(eventService.queueEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventType: 'USER_UPDATED',
                aggregateId: 'user-2'
            })
        );
    });

    it('relays identity events to subscribers', async () => {
        const eventBus = createInMemoryEventBus();
        const service = createPlatformIntegrationService({
            userRepository,
            platformRepository,
            eventService,
            eventBus
        });

        const received: any[] = [];
        const unsubscribe = await service.subscribeToIdentityChanges((event) => {
            received.push(event);
        });

        await eventBus.publish('identity:*', {
            eventId: 'evt-1',
            eventType: 'USER_CREATED',
            aggregateId: 'user-1',
            aggregateType: 'canonical_user',
            data: { userId: 'user-1' },
            createdAt: new Date().toISOString()
        });

        expect(received).toHaveLength(1);
        await unsubscribe();
    });
});