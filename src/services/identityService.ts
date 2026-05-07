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

export function createIdentityService(deps: { userRepository: UserRepository }) {
    const { userRepository } = deps;

    return {
        async createUser(input: CreateUserInput) {
            const existingUser = await userRepository.findByEmail(input.email);

            if (existingUser) {
                throw new EmailAlreadyExistsError();
            }

            return userRepository.create({
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                phoneNumber: input.phoneNumber,
                whatsappNumber: input.whatsappNumber,
                profileImageUrl: input.profileImageUrl,
                status: input.status,
                metadata: input.metadata ?? {}
            });
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
            return userRepository.update(id, input);
        },
        async deactivateUser(id: string) {
            await userRepository.findById(id) ?? (() => { throw new UserNotFoundError(); })();
            return userRepository.softDelete(id);
        },
        async deleteUser(id: string) {
            await userRepository.findById(id) ?? (() => { throw new UserNotFoundError(); })();
            return userRepository.softDelete(id);
        }
    };
}
