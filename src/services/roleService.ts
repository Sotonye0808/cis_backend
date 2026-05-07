import type { AssignRoleInput, CreateRoleInput } from '../types/schemas';
import { RoleNotFoundError, UserNotFoundError } from '../types/errors';

type RoleRepository = {
    findById(id: string): Promise<any | null>;
    list(): Promise<any[]>;
    findForUser(userId: string): Promise<any[]>;
    create(data: any): Promise<any>;
    assignRoleToUser(data: any): Promise<any>;
    revokeRoleFromUser(userId: string, roleId: string, scopeId?: string | null): Promise<any>;
};

type UserRepository = {
    findById(id: string): Promise<any | null>;
};

export function createRoleService(deps: { roleRepository: RoleRepository; userRepository: UserRepository }) {
    const { roleRepository, userRepository } = deps;

    return {
        listRoles() {
            return roleRepository.list();
        },
        async getRoleById(id: string) {
            const role = await roleRepository.findById(id);

            if (!role) {
                throw new RoleNotFoundError();
            }

            return role;
        },
        createRole(input: CreateRoleInput) {
            return roleRepository.create({
                platformId: input.platformId,
                roleKey: input.roleKey,
                displayName: input.displayName,
                scope: input.scope,
                inherits: input.inherits,
                permissions: input.permissions
            });
        },
        async assignRoleToUser(input: AssignRoleInput) {
            const user = await userRepository.findById(input.userId);
            if (!user) {
                throw new UserNotFoundError();
            }

            const role = await roleRepository.findById(input.roleId);
            if (!role) {
                throw new RoleNotFoundError();
            }

            return roleRepository.assignRoleToUser({
                user: { connect: { id: input.userId } },
                role: { connect: { id: input.roleId } },
                scopeId: input.scopeId ?? null,
                expiresAt: input.expiresAt ?? null
            });
        },
        revokeRoleFromUser(userId: string, roleId: string, scopeId?: string) {
            return roleRepository.revokeRoleFromUser(userId, roleId, scopeId ?? null);
        },
        getRolesForUser(userId: string) {
            return roleRepository.findForUser(userId);
        }
    };
}
