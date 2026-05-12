import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLoggingMiddleware } from './api/middleware/logging';
import { errorHandler } from './api/middleware/errorHandler';
import { createUserRouter } from './api/routes/users';
import { createRoleRouter } from './api/routes/roles';
import { createOrgRouter } from './api/routes/org';
import { createAuthRouter } from './api/routes/auth';
import { createPermissionRouter } from './api/routes/permissions';
import { createEventRouter } from './api/routes/events';
import { createAuthMiddleware } from './api/middleware/auth';
import rateLimit from 'express-rate-limit';
import { createIdentityService } from './services/identityService';
import { createRoleService } from './services/roleService';
import { createOrgService } from './services/orgService';
import { createPermissionService } from './services/permissionService';
import { createAuthService } from './services/authService';
import { createConfigService } from './services/configService';
import { createEventService } from './services/eventService';
import { createOutboxProcessorService } from './services/outboxProcessorService';
import { createEventSubscriptionService } from './services/eventSubscriptionService';
import { createEventBusFromEnv } from './services/eventBus';
import { createUserRepository } from './repositories/userRepository';
import { createRoleRepository } from './repositories/roleRepository';
import { createOrgRepository } from './repositories/orgRepository';
import { createPermissionRepository } from './repositories/permissionRepository';
import { createConfigRepository } from './repositories/configRepository';
import { createEventRepository } from './repositories/eventRepository';
import { prisma } from './lib/prisma';

export function createApp(deps?: {
    identityService?: ReturnType<typeof createIdentityService>;
    roleService?: ReturnType<typeof createRoleService>;
    orgService?: ReturnType<typeof createOrgService>;
    authService?: ReturnType<typeof createAuthService>;
    permissionService?: ReturnType<typeof createPermissionService>;
    eventService?: ReturnType<typeof createEventService>;
    outboxProcessorService?: ReturnType<typeof createOutboxProcessorService>;
    eventSubscriptionService?: ReturnType<typeof createEventSubscriptionService>;
}) {
    const userRepository = createUserRepository(prisma);
    const roleRepository = createRoleRepository(prisma);
    const orgRepository = createOrgRepository(prisma);
    const permissionRepository = createPermissionRepository(prisma);
    const configRepository = createConfigRepository(prisma);
    const eventRepository = createEventRepository(prisma);
    const eventBus = createEventBusFromEnv();
    const eventService = deps?.eventService ?? createEventService({ eventRepository });

    const identityService = deps?.identityService ?? createIdentityService({ userRepository, eventService });
    const roleService = deps?.roleService ?? createRoleService({ roleRepository, userRepository, eventService });
    const orgService = deps?.orgService ?? createOrgService({ orgRepository });
    const configService = createConfigService({ configRepository });
    const authService = deps?.authService ?? createAuthService({ userRepository });
    const permissionService =
        deps?.permissionService ??
        createPermissionService({
            permissionRepository,
            roleRepository,
            configService
        });
    const outboxProcessorService =
        deps?.outboxProcessorService ??
        createOutboxProcessorService({
            eventRepository,
            eventBus
        });
    const eventSubscriptionService =
        deps?.eventSubscriptionService ??
        createEventSubscriptionService({
            eventBus
        });
    const authMiddleware = createAuthMiddleware(authService);
    const authRouteRateLimit = rateLimit({
        windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 60_000),
        limit: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 30),
        standardHeaders: 'draft-7',
        legacyHeaders: false
    });
    const permissionRouteRateLimit = rateLimit({
        windowMs: Number(process.env.PERMISSION_RATE_LIMIT_WINDOW_MS ?? 60_000),
        limit: Number(process.env.PERMISSION_RATE_LIMIT_MAX ?? 120),
        standardHeaders: 'draft-7',
        legacyHeaders: false
    });

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
    app.use('/api/v1/auth', authRouteRateLimit, createAuthRouter(authService));
    app.use(
        '/api/v1/permissions',
        permissionRouteRateLimit,
        authMiddleware,
        createPermissionRouter(permissionService)
    );
    app.use('/api/v1/events', createEventRouter(eventSubscriptionService, outboxProcessorService));

    app.use((_req, res) => {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
    });

    app.use(errorHandler);

    return app;
}
