import type { PlatformRoleMappingInput } from '../types/schemas';

type PlatformRoleMappingService = {
    getMapping(platformId: string, platformRoleKey: string): Promise<{ canonicalRoleKey: string; permissions: string[]; inherits: string[]; notes?: string; version: number } | null>;
    upsertMapping(input: PlatformRoleMappingInput): Promise<any>;
};

export const DEFAULT_PLATFORM_ROLE_MAPPINGS: PlatformRoleMappingInput[] = [
    { platformId: 'reporting', platformRoleKey: 'SUPERADMIN', canonicalRoleKey: 'SUPER_ADMIN', permissions: [], inherits: [], notes: 'Reporting superuser' },
    { platformId: 'reporting', platformRoleKey: 'SPO', canonicalRoleKey: 'PASTOR', permissions: [], inherits: [], notes: 'Senior pastoral oversight' },
    { platformId: 'reporting', platformRoleKey: 'CHURCH_MINISTRY', canonicalRoleKey: 'PASTOR', permissions: [], inherits: [], notes: 'Church ministry leadership' },
    { platformId: 'reporting', platformRoleKey: 'GROUP_PASTOR', canonicalRoleKey: 'PASTOR', permissions: [], inherits: [], notes: 'Group pastoral leadership' },
    { platformId: 'reporting', platformRoleKey: 'GROUP_ADMIN', canonicalRoleKey: 'DEPARTMENT_LEADER', permissions: [], inherits: [], notes: 'Group administration' },
    { platformId: 'reporting', platformRoleKey: 'CAMPUS_PASTOR', canonicalRoleKey: 'PASTOR', permissions: [], inherits: [], notes: 'Campus pastoral oversight' },
    { platformId: 'reporting', platformRoleKey: 'CAMPUS_ADMIN', canonicalRoleKey: 'CAMPUS_ADMIN', permissions: [], inherits: [], notes: 'Campus administration' },
    { platformId: 'reporting', platformRoleKey: 'DATA_ENTRY', canonicalRoleKey: 'DATA_ENTRY', permissions: [], inherits: [], notes: 'Manual report data entry' },
    { platformId: 'reporting', platformRoleKey: 'MEMBER', canonicalRoleKey: 'MEMBER', permissions: [], inherits: [], notes: 'General member access' },
    { platformId: 'reporting', platformRoleKey: 'OFFICE_OF_CEO', canonicalRoleKey: 'SUPER_ADMIN', permissions: [], inherits: [], notes: 'Executive office administration' },
    { platformId: 'reporting', platformRoleKey: 'USHER', canonicalRoleKey: 'USHER', permissions: [], inherits: [], notes: 'Service ushering' },
    { platformId: 'faith-hub', platformRoleKey: 'GUEST', canonicalRoleKey: 'GUEST', permissions: [], inherits: [], notes: 'Unauthenticated or first-visit users' },
    { platformId: 'faith-hub', platformRoleKey: 'MEMBER', canonicalRoleKey: 'MEMBER', permissions: [], inherits: [], notes: 'Faith Hub member access' },
    { platformId: 'faith-hub', platformRoleKey: 'PASTOR', canonicalRoleKey: 'PASTOR', permissions: [], inherits: [], notes: 'Faith Hub pastoral access' }
];

export function createPlatformRoleMappingBackfillService(deps: { platformRoleMappingService: PlatformRoleMappingService }) {
    const { platformRoleMappingService } = deps;

    return {
        async backfill(platformId?: string) {
            const mappings = platformId
                ? DEFAULT_PLATFORM_ROLE_MAPPINGS.filter((item) => item.platformId === platformId)
                : DEFAULT_PLATFORM_ROLE_MAPPINGS;

            const results = [] as Array<{
                platformId: string;
                platformRoleKey: string;
                action: 'created' | 'skipped';
            }>;

            for (const mapping of mappings) {
                const existing = await platformRoleMappingService.getMapping(mapping.platformId, mapping.platformRoleKey);
                if (
                    existing &&
                    existing.canonicalRoleKey === mapping.canonicalRoleKey &&
                    JSON.stringify(existing.permissions ?? []) === JSON.stringify(mapping.permissions ?? []) &&
                    JSON.stringify(existing.inherits ?? []) === JSON.stringify(mapping.inherits ?? [])
                ) {
                    results.push({ platformId: mapping.platformId, platformRoleKey: mapping.platformRoleKey, action: 'skipped' });
                    continue;
                }

                await platformRoleMappingService.upsertMapping(mapping);
                results.push({ platformId: mapping.platformId, platformRoleKey: mapping.platformRoleKey, action: 'created' });
            }

            return {
                requestedPlatformId: platformId ?? null,
                total: mappings.length,
                created: results.filter((item) => item.action === 'created').length,
                skipped: results.filter((item) => item.action === 'skipped').length,
                results
            };
        }
    };
}