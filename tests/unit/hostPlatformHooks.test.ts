import { createHostPlatformAuthHook, createHostPlatformPermissionHook } from '../../src/integrations/hostPlatformHooks';

describe('hostPlatformHooks', () => {
    it('hydrates CIS user context from a bearer token', () => {
        const authService = {
            verifyAccessToken: jest.fn().mockReturnValue({ sub: 'user-1' })
        };

        const middleware = createHostPlatformAuthHook(authService as any);
        const req: any = {
            headers: {
                authorization: 'Bearer access-token'
            }
        };
        const next = jest.fn();

        middleware(req, {} as any, next);

        expect(authService.verifyAccessToken).toHaveBeenCalledWith('access-token');
        expect(req.hostPlatform).toEqual({ cisUserId: 'user-1', token: 'access-token' });
        expect(next).toHaveBeenCalledWith();
    });

    it('checks permissions using the hydrated CIS user id', async () => {
        const permissionService = {
            userHasPermission: jest.fn().mockResolvedValue(true)
        };

        const middleware = createHostPlatformPermissionHook(permissionService as any)('users.read');
        const req: any = {
            hostPlatform: {
                cisUserId: 'user-1'
            }
        };
        const next = jest.fn();

        await middleware(req, {} as any, next);

        expect(permissionService.userHasPermission).toHaveBeenCalledWith('user-1', 'users.read', undefined);
        expect(next).toHaveBeenCalledWith();
    });
});