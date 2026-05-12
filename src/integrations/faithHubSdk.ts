import type { PlatformIntegrationUserInput } from '../types/schemas';

type PlatformIntegrationService = {
    syncUsers(source: { platformId: string; sourceSystem?: string }, users: PlatformIntegrationUserInput[]): Promise<any>;
    getMapping(platformId: string, externalUserId: string): Promise<any>;
    subscribeToIdentityChanges(handler: (event: any) => void | Promise<void>): Promise<() => Promise<void>>;
};

export function createFaithHubSdk(platformIntegrationService: PlatformIntegrationService) {
    return {
        platformId: 'faith-hub',
        syncUsers(users: PlatformIntegrationUserInput[]) {
            return platformIntegrationService.syncUsers(
                { platformId: 'faith-hub', sourceSystem: 'faith_hub_users' },
                users
            );
        },
        getMapping(externalUserId: string) {
            return platformIntegrationService.getMapping('faith-hub', externalUserId);
        },
        subscribeToIdentityChanges(handler: (event: any) => void | Promise<void>) {
            return platformIntegrationService.subscribeToIdentityChanges(handler);
        }
    };
}