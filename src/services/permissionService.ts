type PermissionRepository = {
    findPermissionsByRole(roleId: string): Promise<Array<{ permissionKey: string; metadata?: unknown }>>;
    addPermissionToRole(data: any): Promise<any>;
    removePermissionFromRole(roleId: string, permissionKey: string): Promise<any>;
};

type RoleAssignment = {
    roleId?: string;
    scopeId?: string | null;
    expiresAt?: Date | null;
    role?: {
        id?: string;
        roleKey?: string;
        platformId?: string;
        inherits?: string[];
        permissions?: string[];
        permissionsRef?: Array<{ permissionKey: string }>;
    };
};

type RoleRepository = {
    findById(id: string): Promise<any | null>;
    findForUser(userId: string): Promise<RoleAssignment[]>;
};

type ConfigService = {
    getRolePermissionOverrides(): Promise<Map<string, { permissions: string[]; inherits: string[] }>>;
};

export function createPermissionService(deps: {
    permissionRepository: PermissionRepository;
    roleRepository?: RoleRepository;
    configService?: ConfigService;
    cacheTtlMs?: number;
}) {
    const { permissionRepository, roleRepository, configService, cacheTtlMs = 5_000 } = deps;
    const userPermissionCache = new Map<string, { expiresAt: number; hasPermission: boolean }>();
    const rolePermissionCache = new Map<string, string[]>();

    const getRolePermissions = async (roleId: string, visited = new Set<string>()): Promise<string[]> => {
        if (visited.has(roleId)) {
            return [];
        }
        visited.add(roleId);

        const cached = rolePermissionCache.get(roleId);
        if (cached) {
            return cached;
        }

        if (!roleRepository) {
            const fromPermissionTable = await permissionRepository.findPermissionsByRole(roleId);
            const permissions = fromPermissionTable.map((item) => item.permissionKey);
            rolePermissionCache.set(roleId, permissions);
            return permissions;
        }

        const role = await roleRepository.findById(roleId);
        if (!role) {
            return [];
        }

        const basePermissions = new Set<string>();
        for (const permission of role.permissions ?? []) {
            basePermissions.add(permission);
        }
        for (const permission of role.permissionsRef ?? []) {
            if (permission?.permissionKey) {
                basePermissions.add(permission.permissionKey);
            }
        }
        for (const permission of await permissionRepository.findPermissionsByRole(roleId)) {
            basePermissions.add(permission.permissionKey);
        }

        const roleKey = role.roleKey ? `${role.platformId}:${role.roleKey}` : null;
        if (roleKey && configService) {
            const overrides = await configService.getRolePermissionOverrides();
            const override = overrides.get(roleKey);
            if (override) {
                override.permissions.forEach((permission) => basePermissions.add(permission));
                role.inherits = [...(role.inherits ?? []), ...override.inherits];
            }
        }

        for (const inheritedRoleId of role.inherits ?? []) {
            const inheritedPermissions = await getRolePermissions(inheritedRoleId, visited);
            inheritedPermissions.forEach((permission) => basePermissions.add(permission));
        }

        const resolvedPermissions = Array.from(basePermissions);
        rolePermissionCache.set(roleId, resolvedPermissions);
        return resolvedPermissions;
    };

    return {
        getPermissionsByRole(roleId: string) {
            return permissionRepository.findPermissionsByRole(roleId);
        },
        addPermissionToRole(roleId: string, permissionKey: string, metadata?: unknown) {
            return permissionRepository.addPermissionToRole({
                role: { connect: { id: roleId } },
                permissionKey,
                metadata
            });
        },
        removePermissionFromRole(roleId: string, permissionKey: string) {
            return permissionRepository.removePermissionFromRole(roleId, permissionKey);
        },
        async hasPermission(roleId: string, permissionKey: string) {
            const permissions = await getRolePermissions(roleId);
            return permissions.includes(permissionKey);
        },
        async userHasPermission(userId: string, permissionKey: string, scopeId?: string) {
            if (!roleRepository) {
                return false;
            }

            const cacheKey = `${userId}:${scopeId ?? '*'}:${permissionKey}`;
            const now = Date.now();
            const cached = userPermissionCache.get(cacheKey);
            if (cached && cached.expiresAt > now) {
                return cached.hasPermission;
            }

            const assignments = await roleRepository.findForUser(userId);
            const candidates = assignments.filter((assignment) => {
                if (!assignment.roleId || !assignment.role) {
                    return false;
                }
                if (assignment.expiresAt && assignment.expiresAt.getTime() <= now) {
                    return false;
                }
                if (scopeId && assignment.scopeId && assignment.scopeId !== scopeId) {
                    return false;
                }
                return true;
            });

            const checks = await Promise.all(
                candidates.map(async (assignment) => {
                    const permissions = await getRolePermissions(assignment.roleId as string);
                    return permissions.includes(permissionKey);
                })
            );
            const hasPermission = checks.some(Boolean);

            userPermissionCache.set(cacheKey, {
                hasPermission,
                expiresAt: now + cacheTtlMs
            });

            return hasPermission;
        }
    };
}
