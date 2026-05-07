import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLoggingMiddleware } from './api/middleware/logging';
import { errorHandler } from './api/middleware/errorHandler';
import { createUserRouter } from './api/routes/users';
import { createRoleRouter } from './api/routes/roles';
import { createOrgRouter } from './api/routes/org';
import { createIdentityService } from './services/identityService';
import { createRoleService } from './services/roleService';
import { createOrgService } from './services/orgService';
import { createPermissionService } from './services/permissionService';
import { createUserRepository } from './repositories/userRepository';
import { createRoleRepository } from './repositories/roleRepository';
import { createOrgRepository } from './repositories/orgRepository';
import { createPermissionRepository } from './repositories/permissionRepository';
import { prisma } from './lib/prisma';

export function createApp(deps?: {
    identityService?: ReturnType<typeof createIdentityService>;
    roleService?: ReturnType<typeof createRoleService>;
    orgService?: ReturnType<typeof createOrgService>;
}) {
    const userRepository = createUserRepository(prisma);
    const roleRepository = createRoleRepository(prisma);
    const orgRepository = createOrgRepository(prisma);
    const permissionRepository = createPermissionRepository(prisma);

    const identityService = deps?.identityService ?? createIdentityService({ userRepository });
    const roleService = deps?.roleService ?? createRoleService({ roleRepository, userRepository });
    const orgService = deps?.orgService ?? createOrgService({ orgRepository });
    createPermissionService({ permissionRepository });

    const app = express();

    app.use(cors());
    app.use(helmet());
    app.use(express.json({ limit: '1mb' }));
    app.use(requestLoggingMiddleware);

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'cis-backend' });
    });

    app.use('/api/v1/users', createUserRouter(identityService));
    app.use('/api/v1/roles', createRoleRouter(roleService));
    app.use('/api/v1/org', createOrgRouter(orgService));

    app.use((_req, res) => {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
    });

    app.use(errorHandler);

    return app;
}
