import type { CreateUserInput, UpdateUserInput } from '../types/schemas';
import { EmailAlreadyExistsError, UserNotFoundError } from '../types/errors';

type UserRepository = {
    findById(id: string): Promise<any | null>;
    findByEmail(email: string): Promise<any | null>;
    list(params?: { take?: number; skip?: number }): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    softDelete(id: string): Promise<any>;
};

type EventService = {
    queueEvent(input: {
        eventType: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DEACTIVATED';
        aggregateId: string;
        aggregateType: string;
        data: unknown;
        metadata?: unknown;
        actorId?: string | null;
    }): Promise<any>;
};

export function createIdentityService(deps: { userRepository: UserRepository; eventService?: EventService }) {
    const { userRepository, eventService } = deps;

    return {
        async createUser(input: CreateUserInput) {
            const existingUser = await userRepository.findByEmail(input.email);

            if (existingUser) {
                throw new EmailAlreadyExistsError();
            }

            const user = await userRepository.create({
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                phoneNumber: input.phoneNumber,
                whatsappNumber: input.whatsappNumber,
                profileImageUrl: input.profileImageUrl,
                status: input.status,
                metadata: input.metadata ?? {}
            });
            await eventService?.queueEvent({
                eventType: 'USER_CREATED',
                aggregateId: user.id,
                aggregateType: 'canonical_user',
                data: { userId: user.id, email: user.email, status: user.status }
            });
            return user;
        },
        async getUserById(id: string) {
            const user = await userRepository.findById(id);

            if (!user) {
                throw new UserNotFoundError();
            }

            return user;
        },
        async getUserByEmail(email: string) {
            const user = await userRepository.findByEmail(email);

            if (!user) {
                throw new UserNotFoundError();
            }

            return user;
        },
        listUsers(params?: { take?: number; skip?: number }) {
            return userRepository.list(params);
        },
        async updateUser(id: string, input: UpdateUserInput) {
            await userRepository.findById(id) ?? (() => { throw new UserNotFoundError(); })();
            const updated = await userRepository.update(id, input);
            await eventService?.queueEvent({
                eventType: 'USER_UPDATED',
                aggregateId: updated.id,
                aggregateType: 'canonical_user',
                data: { userId: updated.id, changes: input }
            });
            return updated;
        },
        async deactivateUser(id: string) {
            await userRepository.findById(id) ?? (() => { throw new UserNotFoundError(); })();
            const deactivated = await userRepository.softDelete(id);
            await eventService?.queueEvent({
                eventType: 'USER_DEACTIVATED',
                aggregateId: deactivated.id,
                aggregateType: 'canonical_user',
                data: { userId: deactivated.id }
            });
            return deactivated;
        },
        async deleteUser(id: string) {
            await userRepository.findById(id) ?? (() => { throw new UserNotFoundError(); })();
            const deleted = await userRepository.softDelete(id);
            await eventService?.queueEvent({
                eventType: 'USER_DEACTIVATED',
                aggregateId: deleted.id,
                aggregateType: 'canonical_user',
                data: { userId: deleted.id }
            });
            return deleted;
        }
    };
}
