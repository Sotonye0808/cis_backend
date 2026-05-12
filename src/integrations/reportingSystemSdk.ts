import type { PlatformIntegrationUserInput } from '../types/schemas';

type PlatformIntegrationService = {
    syncUsers(source: { platformId: string; sourceSystem?: string }, users: PlatformIntegrationUserInput[]): Promise<any>;
    getMapping(platformId: string, externalUserId: string): Promise<any>;
    subscribeToIdentityChanges(handler: (event: any) => void | Promise<void>): Promise<() => Promise<void>>;
};

export function createReportingSystemSdk(platformIntegrationService: PlatformIntegrationService) {
    return {
        platformId: 'reporting',
        syncUsers(users: PlatformIntegrationUserInput[]) {
            return platformIntegrationService.syncUsers(
                { platformId: 'reporting', sourceSystem: 'reporting_users' },
                users
            );
        },
        getMapping(externalUserId: string) {
            return platformIntegrationService.getMapping('reporting', externalUserId);
        },
        subscribeToIdentityChanges(handler: (event: any) => void | Promise<void>) {
            return platformIntegrationService.subscribeToIdentityChanges(handler);
        }
    };
}