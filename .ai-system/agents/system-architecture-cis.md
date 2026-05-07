# System Architecture: Canonical Identity Service

> **Overview:** CIS is a TypeScript/Node.js service built on Prisma + Supabase PostgreSQL that acts as the unified identity and authorization layer for the Harvesters digital estate. It provides a canonical user profile, role mapping, permission validation, and async event broadcasting without blocking platform workflows.

---

## High-Level Architecture Diagram

```
External Systems (Faith Hub, Reporting System, CRM, DMHicc, MyHarvestHub)
        ↓
┌────────────────────────────────────────────────────────────────┐
│              CIS API Layer (REST/JSON)                         │
│  (authentication, user lookups, role checks, permission queries)│
└────────────────────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────────────────────┐
│              Service Layer                                      │
│  ├─ IdentityService (user ops)                                 │
│  ├─ RoleService (role management)                              │
│  ├─ PermissionService (permission resolution)                  │
│  ├─ OrgService (hierarchy)                                     │
│  └─ EventService (async broadcasts)                            │
└────────────────────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────────────────────┐
│              Data Access Layer (Prisma)                        │
│  (repositories, queries, migrations)                           │
└────────────────────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                               │
│  ├─ CanonicalUser, CanonicalRole, RolePermission              │
│  ├─ OrgGroup, Campus, User                                    │
│  ├─ PlatformUserMapping (identity federation)                 │
│  ├─ IdentityEvent, IdentityEventOutbox (audit + async)        │
│  └─ ConfigEntry (role/permission definitions)                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

Each module has a single, clear responsibility:

| Module               | Responsibility                                                                  | Key Files                                                                  | Dependencies                                             |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| **IdentityModule**   | User lifecycle (create, read, update, deactivate)                               | `src/identity/service.ts`, `src/identity/repository.ts`                    | Prisma, EventService                                     |
| **RoleModule**       | Role definitions, role-permission mappings, role assignments                    | `src/roles/service.ts`, `src/roles/repository.ts`                          | Prisma, ConfigService, EventService                      |
| **PermissionModule** | Permission checking, permission caching, permission validation                  | `src/permissions/service.ts`, `src/permissions/cache.ts`                   | Prisma, CacheService                                     |
| **OrgModule**        | Org hierarchy (OrgGroup, Campus), org-user relationships                        | `src/org/service.ts`, `src/org/repository.ts`                              | Prisma, IdentityService                                  |
| **PlatformModule**   | Platform-specific identity mapping (Faith Hub user → CIS user → Reporting user) | `src/platform/service.ts`, `src/platform/mappings.ts`                      | Prisma, IdentityService                                  |
| **EventModule**      | Identity event generation, async outbox, event subscriptions                    | `src/events/service.ts`, `src/events/outbox.ts`, `src/events/publisher.ts` | Prisma, Redis (pub/sub), Queue                           |
| **AuthModule**       | JWT generation/validation, token refresh, session management                    | `src/auth/service.ts`, `src/auth/jwt.ts`                                   | jsonwebtoken, IdentityService                            |
| **ConfigModule**     | Runtime configuration (roles, permissions, org hierarchy)                       | `src/config/service.ts`, `src/config/loader.ts`                            | Prisma, CacheService                                     |
| **CacheModule**      | In-memory caching for permissions, roles, org hierarchy                         | `src/cache/service.ts`, `src/cache/redis.ts`                               | Redis, Upstash                                           |
| **APIModule**        | HTTP endpoints, request/response contracts, validation                          | `src/api/routes/`, `src/api/middleware/`                                   | Express, IdentityService, RoleService, PermissionService |

---

## Data Flow

### Standard Identity Lookup Flow

```
Client sends: GET /api/v1/users/me (with JWT token)
        ↓
AuthMiddleware validates JWT, extracts userId
        ↓
IdentityService.getUserById(userId)
        ↓
Check cache (Redis) → if hit, return
        ↓
Query CanonicalUser + roles + permissions from Prisma
        ↓
Populate cache (5 min TTL)
        ↓
Return to client with roles and permissions
```

**Performance Target:** < 50ms (p99) from external system

---

### Identity Update Flow (Non-blocking)

```
Client sends: PATCH /api/v1/users/{id} { name: "New Name" }
        ↓
AuthMiddleware checks permission (USER_UPDATE)
        ↓
IdentityService.updateUser(id, payload)
        ↓
1. Update CanonicalUser in database (atomic)
        ↓
2. Generate IdentityEvent { event: "USER_UPDATED", userId, changes, timestamp, actor }
        ↓
3. Insert into IdentityEventOutbox (non-blocking outbox insert)
        ↓
4. Return 200 OK immediately to client
        ↓
5. (ASYNC, separate worker thread) Outbox processor:
   - Read new events from IdentityEventOutbox
   - Publish via Redis pub/sub to subscribed platforms
   - Each platform receives event: { eventId, userId, eventType, canonicalData }
   - Mark event processed
   ↓
6. Each platform reconciles:
   - Faith Hub updates its faith_hub_users table via webhook listener
   - Reporting System updates reporting_users table
   - CRM, DMHicc, MyHarvestHub each reconcile independently
```

**Non-blocking guarantee:** Client receives 200 OK within 20ms, regardless of downstream system count

---

### Role Assignment Flow (Config-driven)

```
Admin calls: POST /api/v1/roles/assign
{ userId, roleId, scopeId (campus or orgGroup), expiresAt? }
        ↓
PermissionService checks: can assigner grant this role in this scope?
        ↓
RoleService.assignRole(userId, roleId, scopeId)
        ↓
1. Update UserRole join table
        ↓
2. Invalidate PermissionCache for userId
        ↓
3. Generate IdentityEvent { event: "ROLE_ASSIGNED", userId, roleId, ... }
        ↓
4. Insert into IdentityEventOutbox
        ↓
5. Return 200 OK
        ↓
6. Downstream: Each platform receives event and updates locally
```

---

### Permission Check Flow (Cached)

```
Client (internal service) calls: checkPermission(userId, 'REPORT_CREATE', scopeId)
        ↓
PermissionService checks local cache first (10 sec TTL)
        ↓
If hit: return cached result (< 5ms)
        ↓
If miss:
  1. Resolve user's roles (cached separately)
  2. For each role, resolve permissions (config-driven)
  3. Check scope applicability (org-level vs campus-level)
  4. Cache result
  5. Return boolean
        ↓
Performance: cache hit < 5ms, cache miss < 50ms
```

---

## Configuration System

All roles, permissions, and role-permission mappings are **table-driven, zero-code configuration**.

### ConfigEntry Table

```prisma
model ConfigEntry {
  id           String    @id @default(cuid())
  namespace    String    // e.g., "platform:faith-hub:roles"
  key          String    // e.g., "MEMBER" or "permission:REPORT_VIEW"
  value        Json      // role definition or permission metadata
  version      Int       // incremental, higher wins
  createdAt    DateTime  @default(now())
  createdBy    String    // userId of admin who created
  notes        String?

  @@unique([namespace, key, version])
  @@index([namespace, version])
}
```

Example configurations:

```json
// namespace: "platform:reporting-system:roles"
{
  "key": "SPO",
  "version": 1,
  "value": {
    "displayName": "Senior Pastor in Charge",
    "description": "Senior leadership role",
    "inherits": ["GROUP_ADMIN", "CAMPUS_ADMIN"],
    "permissions": [
      "REPORT_APPROVE",
      "REPORT_UNLOCK",
      "GOAL_MODIFY",
      "STAFF_MANAGE"
    ],
    "scope": "ORGANIZATION"  // applies org-wide
  }
}

// namespace: "platform:faith-hub:roles"
{
  "key": "MEMBER",
  "version": 2,
  "value": {
    "displayName": "Church Member",
    "permissions": ["EVENT_VIEW", "GIVE_ONLINE", "SMALL_GROUP_JOIN"],
    "scope": "ORGANIZATION"
  }
}

// namespace: "permission:definitions"
{
  "key": "REPORT_APPROVE",
  "version": 1,
  "value": {
    "display": "Approve Reports",
    "category": "Reporting",
    "risklevel": "HIGH",
    "requiresAudit": true
  }
}
```

**Reading config:** Always read `ORDER BY version DESC LIMIT 1` per namespace+key to get current value.

---

## Event System & Outbox Pattern

CIS implements the async outbox pattern to guarantee eventual delivery of identity events to all platforms:

### IdentityEvent Table

```prisma
model IdentityEvent {
  id            String    @id @default(cuid())
  eventId       String    @unique @default(cuid())  // idempotency key
  eventType     String    // e.g., "USER_CREATED", "ROLE_ASSIGNED", "USER_DEACTIVATED"
  aggregateId   String    // typically userId
  aggregateType String    // "USER", "ROLE", "ORG"

  data          Json      // event payload
  // {
  //   "userId": "...",
  //   "changes": { "name": { old: "X", new: "Y" } },
  //   "actor": "admin-user-id",
  //   "timestamp": "ISO-8601",
  //   "reason": "..."
  // }

  createdAt     DateTime  @default(now())

  @@index([aggregateId, eventType])
  @@index([createdAt])
}
```

### IdentityEventOutbox Table

```prisma
model IdentityEventOutbox {
  id            String    @id @default(cuid())
  eventId       String    @unique  // fk to IdentityEvent.eventId
  processingStartedAt   DateTime?
  processedAt   DateTime?
  failureCount  Int       @default(0)
  lastError     String?

  createdAt     DateTime  @default(now())

  @@index([processedAt])
  @@index([processingStartedAt])
}
```

**Outbox Processor Worker (runs every 100ms):**

```typescript
while (true) {
  const unprocessed = await prisma.identityEventOutbox.findMany({
    where: { processedAt: null, processingStartedAt: null },
    take: 100,
    orderBy: { createdAt: "asc" },
  });

  for (const outboxEntry of unprocessed) {
    try {
      await markProcessing(outboxEntry.id);
      const event = await getEvent(outboxEntry.eventId);

      // Publish to Redis pub/sub (non-blocking)
      await redis.publish(
        `identity:${event.aggregateType}:${event.eventType}`,
        JSON.stringify(event),
      );

      // Optional: call platform webhooks (with timeout)
      await publishToWebhooks(event);

      await markProcessed(outboxEntry.id);
    } catch (error) {
      await recordFailure(outboxEntry.id, error);
    }
  }

  await sleep(100);
}
```

---

## Database Schema (Core Tables)

See `schema.prisma` for full implementation. Key tables:

```prisma
model CanonicalUser {
  id                    String    @id @default(uuid())
  email                 String    @unique
  firstName             String?
  lastName              String?
  phoneNumber           String?
  profileImageUrl       String?

  status                UserStatus  // ACTIVE, INACTIVE, SUSPENDED, DELETED
  statusChangedAt       DateTime?
  statusChangedBy       String?

  metadata              Json?     // platform-agnostic custom fields

  createdAt             DateTime  @default(now())
  createdBy             String?
  updatedAt             DateTime  @updatedAt
  updatedBy             String?

  roles                 UserRole[]
  platformMappings      PlatformUserMapping[]
  events                IdentityEvent[]

  @@index([email])
  @@index([status])
}

model CanonicalRole {
  id                    String    @id @default(cuid())
  platformId            String    // e.g., "reporting-system"
  roleKey               String    // e.g., "SPO", "MEMBER"
  displayName           String
  description           String?

  scope                 RoleScope // ORG, CAMPUS, GROUP, DIRECT_ASSIGN
  inherits              String[]  @default([])  // list of roleIds this includes
  isActive              Boolean   @default(true)

  permissions           RolePermission[]
  assignments           UserRole[]
  configEntry           ConfigEntry?  // reference to config row

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@unique([platformId, roleKey])
  @@index([platformId, isActive])
}

model UserRole {
  id                    String    @id @default(cuid())
  userId                String
  roleId                String
  scopeId               String?   // campus or org group id

  assignedAt            DateTime  @default(now())
  assignedBy            String    // admin user who assigned
  expiresAt             DateTime? // optional expiry

  user                  CanonicalUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  role                  CanonicalRole @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId, scopeId])
  @@index([userId])
  @@index([roleId])
}

model RolePermission {
  id                    String    @id @default(cuid())
  roleId                String
  permissionKey         String    // e.g., "REPORT_VIEW", "USER_CREATE"
  grantedAt             DateTime  @default(now())

  role                  CanonicalRole @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionKey])
  @@index([roleId])
}

model PlatformUserMapping {
  id                    String    @id @default(cuid())
  canonicalUserId       String
  platformId            String    // e.g., "faith-hub", "reporting-system"
  externalUserId        String    // user's id in that platform's system

  status                MappingStatus // ACTIVE, INACTIVE, PENDING
  mappedAt              DateTime  @default(now())
  mappedBy              String?

  canonicalUser         CanonicalUser @relation(fields: [canonicalUserId], references: [id], onDelete: Cascade)

  @@unique([platformId, externalUserId])
  @@index([canonicalUserId, platformId])
}

model OrgGroup {
  id                    String    @id @default(uuid())
  name                  String
  description           String?
  country               String?

  campuses              Campus[]

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([name])
}

model Campus {
  id                    String    @id @default(uuid())
  orgGroupId            String
  name                  String
  description           String?
  adminId               String?

  orgGroup              OrgGroup @relation(fields: [orgGroupId], references: [id], onDelete: Cascade)

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([orgGroupId])
  @@index([adminId])
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum RoleScope {
  ORGANIZATION
  ORGGROUP
  CAMPUS
  DIRECT_ASSIGN
}

enum MappingStatus {
  ACTIVE
  INACTIVE
  PENDING
  LINKED
}
```

---

## API Contract

### User Endpoints

- `GET /api/v1/users/{id}` — Get canonical user by ID
- `GET /api/v1/users/by-email/{email}` — Get user by email
- `POST /api/v1/users` — Create new canonical user (admin only)
- `PATCH /api/v1/users/{id}` — Update user data
- `POST /api/v1/users/{id}/activate` — Reactivate user
- `POST /api/v1/users/{id}/deactivate` — Deactivate user

### Role Endpoints

- `GET /api/v1/roles` — List all roles
- `POST /api/v1/roles/{id}/assign` — Assign role to user
- `POST /api/v1/roles/{id}/revoke` — Revoke role from user
- `GET /api/v1/users/{id}/roles` — Get user's current roles

### Permission Endpoints

- `POST /api/v1/permissions/check` — Check if user has permission (internal, no auth required for service-to-service)
- `GET /api/v1/users/{id}/permissions` — Get all permissions for user (cached)

### Platform Mapping Endpoints

- `POST /api/v1/platform-mappings` — Link canonical user to external platform user
- `GET /api/v1/platform-mappings/by-external/{platformId}/{externalUserId}` — Lookup canonical user from platform ID

### Event Subscription Endpoints

- `POST /api/v1/subscriptions` — Subscribe to identity events
- `GET /api/v1/events` — List recent identity events (admin)

---

## Tech Stack Summary

| Layer          | Technology          | Version | Purpose                      |
| -------------- | ------------------- | ------- | ---------------------------- |
| **Runtime**    | Node.js             | 18+     | JavaScript runtime           |
| **Language**   | TypeScript          | 5.x     | Type-safe development        |
| **Framework**  | Express             | 4.18+   | HTTP server                  |
| **ORM**        | Prisma              | 5.x     | Database abstraction         |
| **Database**   | Supabase PostgreSQL | 15+     | Persistent storage           |
| **Cache**      | Upstash Redis       | —       | Session & permission caching |
| **Auth**       | jsonwebtoken        | 9.x     | JWT creation/validation      |
| **Validation** | Zod                 | 3.x     | Runtime type validation      |
| **Logging**    | Pino                | 8.x     | Structured logging           |
| **Testing**    | Jest                | 29.x    | Unit & integration tests     |

---

## Known Constraints & Technical Debt

- **Single Org (for now):** Current deployment serves one organization. Multi-org isolation is planned for Phase 4.
- **No SSO Yet:** OAuth2/OIDC flows come in Phase 2.
- **Redis Single Instance:** For Phase 1. Clustering planned for Phase 3.
- **No Rate Limiting:** Will add before public API exposure (Phase 2).
- **Admin UI Missing:** API is documented and ready; admin dashboard UI is Phase 4.

---

## Architecture History

| Date       | Change                          | Reason                                              |
| ---------- | ------------------------------- | --------------------------------------------------- |
| 2026-05-07 | Initial CIS architecture design | Bootstrap session; establishing foundational schema |
| —          | (pending)                       | (future changes logged here)                        |
