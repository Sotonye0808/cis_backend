type ConfigRepository = {
    listByNamespace(namespace: string): Promise<Array<{ key: string; value: unknown }>>;
};

export function createConfigService(deps: { configRepository: ConfigRepository }) {
    const { configRepository } = deps;

    return {
        async getRolePermissionOverrides() {
            const entries = await configRepository.listByNamespace('roles');
            const result = new Map<string, { permissions: string[]; inherits: string[] }>();

            for (const entry of entries) {
                const value = entry.value as { permissions?: unknown; inherits?: unknown } | null;
                const permissions = Array.isArray(value?.permissions)
                    ? value.permissions.filter((item): item is string => typeof item === 'string')
                    : [];
                const inherits = Array.isArray(value?.inherits)
                    ? value.inherits.filter((item): item is string => typeof item === 'string')
                    : [];
                result.set(entry.key, { permissions, inherits });
            }

            return result;
        }
    };
}
