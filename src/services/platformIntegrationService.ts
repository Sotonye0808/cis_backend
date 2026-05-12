import type { Prisma } from '@prisma/client';
import type { PlatformIntegrationUserInput } from '../types/schemas';

type UserRepository = {
    findById(id: string): Promise<any | null>;
    findByEmail(email: string): Promise<any | null>;
    create(data: Prisma.CanonicalUserCreateInput): Promise<any>;
    update(id: string, data: Prisma.CanonicalUserUpdateInput): Promise<any>;
};

type PlatformRepository = {
    findMappingByExternalId(platformId: string, externalUserId: string): Promise<any | null>;
    findCanonicalUserByPlatform(platformId: string, externalUserId: string): Promise<any | null>;
    createMapping(data: Prisma.PlatformUserMappingCreateInput): Promise<any>;
};

type EventService = {
    queueEvent(input: {
        eventType: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DEACTIVATED' | 'PLATFORM_LINKED';
        aggregateId: string;
        aggregateType: string;
        data: unknown;
        metadata?: unknown;
        actorId?: string | null;
    }): Promise<any>;
};

type EventBus = {
    subscribe(channel: string, handler: (event: any) => void | Promise<void>): Promise<() => Promise<void>>;
};

type SyncSource = {
    platformId: string;
    sourceSystem?: string;
};

function buildUserData(input: PlatformIntegrationUserInput): Prisma.CanonicalUserCreateInput | Prisma.CanonicalUserUpdateInput {
    return {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        whatsappNumber: input.whatsappNumber,
        profileImageUrl: input.profileImageUrl,
        status: input.status,
        metadata: input.metadata ?? {}
    };
}

export function createPlatformIntegrationService(deps: {
    userRepository: UserRepository;
    platformRepository: PlatformRepository;
    eventService?: EventService;
    eventBus?: EventBus;
}) {
    const { userRepository, platformRepository, eventService, eventBus } = deps;

    return {
        async syncUsers(source: SyncSource, users: PlatformIntegrationUserInput[]) {
            const results: Array<{
                platformId: string;
                externalUserId: string;
                canonicalUserId: string;
                action: 'created' | 'updated' | 'linked';
            }> = [];

            for (const input of users) {
                const mapping = await platformRepository.findMappingByExternalId(source.platformId, input.externalUserId);
                const existingUser = mapping?.canonicalUser ?? (await userRepository.findByEmail(input.email));
                let canonicalUser;
                let action: 'created' | 'updated' | 'linked' = 'created';

                if (mapping?.canonicalUser) {
                    canonicalUser = await userRepository.update(mapping.canonicalUser.id, buildUserData(input));
                    action = 'updated';
                } else if (existingUser) {
                    canonicalUser = await userRepository.update(existingUser.id, buildUserData(input));
                    action = 'linked';
                } else {
                    canonicalUser = await userRepository.create(buildUserData(input) as Prisma.CanonicalUserCreateInput);
                }

                if (!mapping) {
                    await platformRepository.createMapping({
                        platformId: source.platformId,
                        externalUserId: input.externalUserId,
                        canonicalUser: { connect: { id: canonicalUser.id } }
                    });
                }

                await eventService?.queueEvent({
                    eventType: action === 'created' ? 'USER_CREATED' : 'USER_UPDATED',
                    aggregateId: canonicalUser.id,
                    aggregateType: 'canonical_user',
                    data: {
                        canonicalUserId: canonicalUser.id,
                        platformId: source.platformId,
                        externalUserId: input.externalUserId,
                        sourceSystem: source.sourceSystem ?? null,
                        action
                    },
                    metadata: {
                        platformId: source.platformId,
                        externalUserId: input.externalUserId,
                        sourceSystem: source.sourceSystem ?? null
                    }
                });

                results.push({
                    platformId: source.platformId,
                    externalUserId: input.externalUserId,
                    canonicalUserId: canonicalUser.id,
                    action
                });
            }

            return {
                platformId: source.platformId,
                sourceSystem: source.sourceSystem ?? null,
                total: users.length,
                created: results.filter((item) => item.action === 'created').length,
                linked: results.filter((item) => item.action === 'linked').length,
                updated: results.filter((item) => item.action === 'updated').length,
                mappings: results
            };
        },
        getMapping(platformId: string, externalUserId: string) {
            return platformRepository.findCanonicalUserByPlatform(platformId, externalUserId);
        },
        subscribeToIdentityChanges(handler: (event: any) => void | Promise<void>) {
            if (!eventBus) {
                return Promise.reject(new Error('Event bus is not configured'));
            }

            return eventBus.subscribe('identity:*', handler);
        }
    };
}