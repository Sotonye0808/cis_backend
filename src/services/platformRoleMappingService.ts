import type { PlatformRoleMappingInput } from '../types/schemas';

type ConfigRepository = {
    findLatest(namespace: string, key: string): Promise<{ version: number; value: unknown } | null>;
    create(data: any): Promise<any>;
    listByNamespace(namespace: string): Promise<Array<{ key: string; value: unknown; version?: number }>>;
};

type RoleMappingRecord = {
    platformId: string;
    platformRoleKey: string;
    canonicalRoleKey: string;
    permissions: string[];
    inherits: string[];
    notes?: string;
    version: number;
};

const NAMESPACE = 'platform-role-mappings';

function toRecord(key: string, value: unknown, version: number): RoleMappingRecord | null {
    const [platformId, platformRoleKey] = key.split(':', 2);
    if (!platformId || !platformRoleKey) {
        return null;
    }

    const payload = (value ?? {}) as Partial<RoleMappingRecord>;
    if (typeof payload.canonicalRoleKey !== 'string') {
        return null;
    }

    return {
        platformId,
        platformRoleKey,
        canonicalRoleKey: payload.canonicalRoleKey,
        permissions: Array.isArray(payload.permissions) ? payload.permissions.filter((item): item is string => typeof item === 'string') : [],
        inherits: Array.isArray(payload.inherits) ? payload.inherits.filter((item): item is string => typeof item === 'string') : [],
        notes: typeof payload.notes === 'string' ? payload.notes : undefined,
        version
    };
}

export function createPlatformRoleMappingService(deps: { configRepository: ConfigRepository }) {
    const { configRepository } = deps;

    return {
        async listMappings(platformId?: string) {
            const entries = await configRepository.listByNamespace(NAMESPACE);
            const latestByKey = new Map<string, { value: unknown; version: number }>();

            for (const entry of entries) {
                const currentVersion = entry.version ?? 1;
                const existing = latestByKey.get(entry.key);
                if (!existing || currentVersion > existing.version) {
                    latestByKey.set(entry.key, { value: entry.value, version: currentVersion });
                }
            }

            return Array.from(latestByKey.entries())
                .map(([key, entry]) => toRecord(key, entry.value, entry.version))
                .filter((item): item is RoleMappingRecord => Boolean(item))
                .filter((item) => !platformId || item.platformId === platformId)
                .sort((left, right) => `${left.platformId}:${left.platformRoleKey}`.localeCompare(`${right.platformId}:${right.platformRoleKey}`));
        },
        async getMapping(platformId: string, platformRoleKey: string) {
            const entry = await configRepository.findLatest(NAMESPACE, `${platformId}:${platformRoleKey}`);
            if (!entry) {
                return null;
            }

            return toRecord(`${platformId}:${platformRoleKey}`, entry.value, entry.version ?? 1);
        },
        async upsertMapping(input: PlatformRoleMappingInput) {
            const key = `${input.platformId}:${input.platformRoleKey}`;
            const existing = await configRepository.findLatest(NAMESPACE, key);
            const version = (existing?.version ?? 0) + 1;
            const record: RoleMappingRecord = {
                platformId: input.platformId,
                platformRoleKey: input.platformRoleKey,
                canonicalRoleKey: input.canonicalRoleKey,
                permissions: input.permissions,
                inherits: input.inherits,
                notes: input.notes,
                version
            };

            await configRepository.create({
                namespace: NAMESPACE,
                key,
                version,
                value: record,
                notes: input.notes ?? null
            });

            return record;
        },
        async translateRole(platformId: string, platformRoleKey: string) {
            return this.getMapping(platformId, platformRoleKey);
        }
    };
}