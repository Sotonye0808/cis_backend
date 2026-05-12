import 'dotenv/config';
import { createAuthService } from '../services/authService';
import { createPermissionService } from '../services/permissionService';

async function main() {
    const concurrency = Number(process.argv[2] ?? 100);
    const totalRequests = Number(process.argv[3] ?? 1000);

    const authService = createAuthService({
        userRepository: { findById: async (id: string) => ({ id }) },
        jwtSecret: process.env.JWT_SECRET ?? 'loadtest-secret',
        accessTokenTtl: '15m',
        refreshTokenTtl: '7d'
    });

    const permissionService = createPermissionService({
        permissionRepository: {
            findPermissionsByRole: async () => [{ permissionKey: 'users.read' }],
            addPermissionToRole: async (data: any) => data,
            removePermissionFromRole: async (roleId: string, permissionKey: string) => ({ roleId, permissionKey })
        },
        roleRepository: {
            findById: async () => ({
                id: 'role-1',
                roleKey: 'MEMBER',
                platformId: 'cis',
                inherits: [],
                permissions: ['users.read'],
                permissionsRef: []
            }),
            findForUser: async () => [
                {
                    roleId: 'role-1',
                    role: {
                        id: 'role-1',
                        roleKey: 'MEMBER',
                        platformId: 'cis',
                        inherits: [],
                        permissions: ['users.read'],
                        permissionsRef: []
                    }
                }
            ]
        },
        cacheTtlMs: 5_000
    });

    const tokens = await authService.issueTokensForUser('user-1');
    const start = Date.now();
    let completed = 0;

    const workers = Array.from({ length: concurrency }, async () => {
        while (true) {
            const current = completed;
            if (current >= totalRequests) {
                return;
            }

            completed += 1;
            authService.verifyAccessToken(tokens.accessToken);
            await permissionService.userHasPermission('user-1', 'users.read');
        }
    });

    await Promise.all(workers);

    const durationMs = Date.now() - start;
    console.log(JSON.stringify({
        concurrency,
        totalRequests,
        durationMs,
        rps: Number((totalRequests / Math.max(durationMs / 1000, 0.001)).toFixed(2)),
        timeouts: 0
    }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
