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

type EventService = {
    queueEvent(input: {
        eventType: 'ROLE_CREATED' | 'ROLE_ASSIGNED' | 'ROLE_REVOKED';
        aggregateId: string;
        aggregateType: string;
        data: unknown;
        metadata?: unknown;
        actorId?: string | null;
    }): Promise<any>;
};

export function createRoleService(deps: {
    roleRepository: RoleRepository;
    userRepository: UserRepository;
    eventService?: EventService;
}) {
    const { roleRepository, userRepository, eventService } = deps;

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
        async createRole(input: CreateRoleInput) {
            const role = await roleRepository.create({
                platformId: input.platformId,
                roleKey: input.roleKey,
                displayName: input.displayName,
                scope: input.scope,
                inherits: input.inherits,
                permissions: input.permissions
            });
            await eventService?.queueEvent({
                eventType: 'ROLE_CREATED',
                aggregateId: role.id,
                aggregateType: 'canonical_role',
                data: {
                    roleId: role.id,
                    roleKey: role.roleKey,
                    platformId: role.platformId
                }
            });
            return role;
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

            const assignment = await roleRepository.assignRoleToUser({
                user: { connect: { id: input.userId } },
                role: { connect: { id: input.roleId } },
                scopeId: input.scopeId ?? null,
                expiresAt: input.expiresAt ?? null
            });
            await eventService?.queueEvent({
                eventType: 'ROLE_ASSIGNED',
                aggregateId: assignment.id,
                aggregateType: 'user_role',
                data: {
                    userId: input.userId,
                    roleId: input.roleId,
                    scopeId: input.scopeId ?? null
                }
            });
            return assignment;
        },
        async revokeRoleFromUser(userId: string, roleId: string, scopeId?: string) {
            const result = await roleRepository.revokeRoleFromUser(userId, roleId, scopeId ?? null);
            await eventService?.queueEvent({
                eventType: 'ROLE_REVOKED',
                aggregateId: roleId,
                aggregateType: 'canonical_role',
                data: {
                    userId,
                    roleId,
                    scopeId: scopeId ?? null,
                    revokedCount: result?.count ?? 0
                }
            });
            return result;
        },
        getRolesForUser(userId: string) {
            return roleRepository.findForUser(userId);
        }
    };
}
