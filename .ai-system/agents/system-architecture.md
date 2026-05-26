# System Architecture

> **Overview:** CIS is a unified identity and authorization service that acts as the single source of truth for all user/member records across the Harvesters digital estate. It exposes REST APIs for identity CRUD, authentication, permissions, events, and platform integration.

---

## Architecture Diagram

```
Client Apps (MyHarvestHub / Report-Sys / DMHicc / Faith Hub)
        ↓
    CIS REST API (Express + TypeScript)
        ↓
    Service Layer (Identity, Auth, Permissions, Events, Platform Integration)
        ↓
    Repository Layer (Prisma ORM)
        ↓
    Supabase PostgreSQL / Upstash Redis
```

---

## Module Breakdown

| Module | Responsibility | Key Files | Dependencies |
|--------|---------------|-----------|-------------|
| **Identity Service** | User CRUD, email uniqueness, profile management | `src/services/identityService.ts` | UserRepository, EventService |
| **Platform Integration Service** | Cross-platform user sync, email check, mapping queries | `src/services/platformIntegrationService.ts` | UserRepository, PlatformRepository, EventService, EventBus |
| **Auth Service** | JWT token generation/validation, token refresh | `src/services/authService.ts` | UserRepository |
| **Permission Service** | RBAC checks, permission caching | `src/services/permissionService.ts` | PermissionRepository, RoleRepository, ConfigService |
| **Role Service** | Role CRUD, assignment, inheritance | `src/services/roleService.ts` | RoleRepository, UserRepository, EventService |
| **Org Service** | OrgGroup/Campus hierarchy CRUD | `src/services/orgService.ts` | OrgRepository |
| **Config Service** | Database-backed config storage | `src/services/configService.ts` | ConfigRepository |
| **Event Service** | Event creation, outbox queueing | `src/services/eventService.ts` | EventRepository |
| **Platform Role Mapping Service** | Platform role ↔ canonical role translation | `src/services/platformRoleMappingService.ts` | ConfigRepository |

---

## Data Flow

### Standard Request Flow
```
HTTP Request → Express middleware (CORS, Helmet, JSON parse, Logging)
    → Auth middleware (JWT verification, for protected routes)
    → Route handler → Service method → Repository → Database
    → JSON response
```

### Cross-Platform Email Check Flow
```
Client App (signup form, email onBlur)
    → GET /api/v1/users/check-email/:email
    → PlatformIntegrationService.checkEmailCrossPlatform()
    → UserRepository.findByEmail() → CanonicalUser lookup
    → PlatformRepository.findMappingsByCanonicalUserId() → PlatformUserMapping query
    → Response: { exists, canonicalUser, platforms[] }
```

### Authentication Flow
```
Client → POST /api/v1/auth/token { email, password? }
    → AuthService.issueTokensForUser() → JWT access + refresh tokens
    → Protected routes: verifyAccessToken() → req.auth.userId
```

### Event Flow (Outbox Pattern)
```
Service mutation → EventService.queueEvent()
    → IdentityEvent created
    → Outbox processor polls IdentityEventOutbox
    → Publishes to Redis pub/sub channels
    → Platform listeners receive identity:event webhooks
```

---

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/v1/users | No | List users |
| GET | /api/v1/users/by-email/:email | No | Get user by email (strict match) |
| GET | /api/v1/users/check-email/:email | No | Cross-platform email check |
| GET/POST/PATCH/DELETE | /api/v1/users/:id | Yes | User CRUD |
| GET/POST | /api/v1/roles | Yes | Role CRUD |
| POST | /api/v1/auth/token | No | Issue JWT |
| POST | /api/v1/auth/refresh | No | Refresh JWT |
| POST | /api/v1/permissions/check | Yes | RBAC check |
| POST | /api/v1/integrations/:platform/sync | Yes | Platform user sync |
| GET | /api/v1/integrations/:platform/mappings/:externalUserId | Yes | Get platform mapping |
| POST/GET | /api/v1/integrations/role-mappings | Yes | Role translation |
| POST | /api/v1/events/outbox/process | Yes | Trigger outbox processing |

---

## Configuration Points

| Config Key | Purpose | Location | Default |
|-----------|---------|----------|---------|
| DATABASE_URL | Supabase PostgreSQL connection | .env | - |
| JWT_SECRET | Token signing key | .env | - |
| JWT_ACCESS_EXPIRES_IN | Access token TTL | .env | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token TTL | .env | 7d |
| REDIS_URL | Upstash Redis for caching/pub-sub | .env | - |
| AUTH_RATE_LIMIT_WINDOW_MS | Auth rate limit window | .env | 60000 |
| AUTH_RATE_LIMIT_MAX | Auth rate limit max requests | .env | 30 |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Node.js / Express | 4.18+ |
| ORM | Prisma | 7.x |
| Database | Supabase PostgreSQL | 15+ |
| Auth | JWT (jsonwebtoken) | 9.x |
| Validation | Zod | 3.x |
| Logging | Pino | 8.x |
| Testing | Jest | 29.x |
| Caching | Upstash Redis | optional |

---

## Known Constraints & Technical Debt

- Platform SDK facades (reporting, faith-hub) use in-memory mocks pending real integrations
- No admin UI dashboard yet (planned for Phase 4)
- Event outbox processor uses polling; Redis pub/sub is optional
- Cross-platform email check endpoint is unauthenticated by design (called during pre-signup)

---

## Architecture History

| Date | Change | Reason |
|------|--------|--------|
| 2026-05-26 | Added check-email endpoint + platformIntegrationService wiring | Enable cross-platform account detection during signup |
