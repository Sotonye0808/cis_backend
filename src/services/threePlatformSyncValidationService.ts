type PlatformIntegrationService = {
    syncUsers(source: { platformId: string; sourceSystem?: string }, users: Array<{ externalUserId: string; email: string; firstName?: string; lastName?: string }>): Promise<any>;
};

type PlatformRoleMappingService = {
    listMappings(platformId?: string): Promise<Array<{ platformId: string; platformRoleKey: string; canonicalRoleKey: string }>>;
    getMapping(platformId: string, platformRoleKey: string): Promise<{ canonicalRoleKey: string } | null>;
};

type PlatformRoleMappingBackfillService = {
    backfill(platformId?: string): Promise<{ requestedPlatformId: string | null; total: number; created: number; skipped: number }>;
};

export function createThreePlatformSyncValidationService(deps: {
    platformIntegrationService: PlatformIntegrationService;
    platformRoleMappingService: PlatformRoleMappingService;
    platformRoleMappingBackfillService: PlatformRoleMappingBackfillService;
}) {
    const { platformIntegrationService, platformRoleMappingService, platformRoleMappingBackfillService } = deps;

    return {
        async validate() {
            const backfill = await platformRoleMappingBackfillService.backfill();
            const reportingUsers = await platformIntegrationService.syncUsers(
                { platformId: 'reporting', sourceSystem: 'reporting_users' },
                [
                    {
                        externalUserId: 'reporting-demo-1',
                        email: 'reporting.demo@example.com',
                        firstName: 'Reporting',
                        lastName: 'Member'
                    }
                ]
            );
            const faithHubUsers = await platformIntegrationService.syncUsers(
                { platformId: 'faith-hub', sourceSystem: 'faith_hub_users' },
                [
                    {
                        externalUserId: 'faith-demo-1',
                        email: 'faith.demo@example.com',
                        firstName: 'Faith',
                        lastName: 'Member'
                    }
                ]
            );
            const reportingMapping = await platformRoleMappingService.getMapping('reporting', 'SPO');
            const faithHubMapping = await platformRoleMappingService.getMapping('faith-hub', 'MEMBER');
            const allMappings = await platformRoleMappingService.listMappings();

            return {
                status: 'ok',
                backfill,
                reportingUsers: {
                    total: reportingUsers.total,
                    created: reportingUsers.created,
                    linked: reportingUsers.linked,
                    updated: reportingUsers.updated
                },
                faithHubUsers: {
                    total: faithHubUsers.total,
                    created: faithHubUsers.created,
                    linked: faithHubUsers.linked,
                    updated: faithHubUsers.updated
                },
                roleMappings: {
                    total: allMappings.length,
                    reportingSPO: reportingMapping?.canonicalRoleKey ?? null,
                    faithHubMember: faithHubMapping?.canonicalRoleKey ?? null
                }
            };
        }
    };
}