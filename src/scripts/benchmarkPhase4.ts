import 'dotenv/config';
import { createAuthService } from '../services/authService';
import { createPermissionService } from '../services/permissionService';

function percentile(samples: number[], p: number) {
    const sorted = [...samples].sort((left, right) => left - right);
    const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[index] ?? 0;
}

async function main() {
    const authService = createAuthService({
        userRepository: { findById: async (id: string) => ({ id }) },
        jwtSecret: process.env.JWT_SECRET ?? 'benchmark-secret',
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

    const loops = Number(process.argv[2] ?? 500);
    const tokenSamples: number[] = [];
    const permissionSamples: number[] = [];

    const tokens = await authService.issueTokensForUser('user-1');
    for (let index = 0; index < loops; index += 1) {
        const start = process.hrtime.bigint();
        authService.verifyAccessToken(tokens.accessToken);
        tokenSamples.push(Number(process.hrtime.bigint() - start) / 1_000_000);
    }

    for (let index = 0; index < loops; index += 1) {
        const start = process.hrtime.bigint();
        await permissionService.userHasPermission('user-1', 'users.read');
        permissionSamples.push(Number(process.hrtime.bigint() - start) / 1_000_000);
    }

    console.log(JSON.stringify({
        loops,
        auth: { p50Ms: percentile(tokenSamples, 50), p95Ms: percentile(tokenSamples, 95), p99Ms: percentile(tokenSamples, 99) },
        permissions: { p50Ms: percentile(permissionSamples, 50), p95Ms: percentile(permissionSamples, 95), p99Ms: percentile(permissionSamples, 99) }
    }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
