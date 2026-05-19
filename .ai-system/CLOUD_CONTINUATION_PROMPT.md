# Cloud Session Continuation Prompt

**Use this prompt to resume CIS development in any cloud session without context loss.**

---

## Current Project State (as of May 12, 2026)

### ✅ Phase 1 Complete

- **All 23 tests passing** (84.39% coverage)
- **Prisma 7.x fully upgraded** with PrismaPg adapter and prisma.config.ts
- **9 tables + 6 enums** designed and ready
- **6 repositories, 4 services, 9 routes** fully implemented
- **TypeScript strict mode** enabled throughout

### 📊 Project Metrics

- Lines of Code: ~2000+ (src/, tests/)
- Test Suites: 8 passing
- Coverage: Statements 84.39%, Lines 85.16%, Functions 78.09%, Branches 45.45%
- Build: Clean (no TypeScript errors)
- Database: Schema designed, ready for connection

### ✅ Phase 2 Complete

- JWT token generation + validation working
- Permission service with caching working
- Async event infrastructure and outbox processor working
- Authenticated route protection in place
- Full test suite passing

### 🎯 Next: Phase 4 (Testing, Documentation & Launch)

**Estimated Duration:** 2 days
**Key Deliverables:**

- Security audit and JWT edge-case review are complete
- Performance benchmarks and load checks are complete
- Swagger/OpenAPI documentation is complete
- Deployment guide and troubleshooting docs are complete
- Final launch readiness sign-off and deploy remain

---

## Quick Context

**Project:** Canonical Identity Service (CIS) — unified identity layer for Harvesters digital estate

**Tech Stack:**

- Language: TypeScript 5.7.2 (strict mode)
- ORM: Prisma 7.8.0 with PrismaPg adapter (PostgreSQL)
- Framework: Express 4.21.2
- Testing: Jest 29.7.0 with supertest
- Validation: Zod 3.23.8
- Logging: Pino 9.4.0
- Auth: JWT (jsonwebtoken 9.0.2) — Phase 2

**Key Directories:**

```
cis_backend/
├── src/
│   ├── api/
│   │   ├── middleware/    (logging, validation, error handling)
│   │   └── routes/        (users, roles, org, auth, permissions, events, integrations)
│   ├── repositories/      (6 repos with full CRUD)
│   ├── services/          (identity, role, org, permission, auth, event, platform integration)
│   ├── integrations/      (reporting and Faith Hub SDK facades)
│   ├── types/             (Zod schemas, error classes)
│   ├── lib/               (prisma singleton, utils)
│   ├── app.ts             (Express app setup)
│   └── index.ts           (server startup)
├── prisma/
│   ├── schema.prisma      (9 tables, 6 enums, no datasource url)
│   ├── prisma.config.ts   (DATABASE_URL config — Prisma 7.x)
│   └── seed.ts            (test data seeding)
├── tests/
│   ├── unit/              (repo, service, middleware tests)
│   └── integration/       (full route + error handling tests)
├── .env.example           (60+ config variables)
└── package.json           (Prisma 7.x, all dependencies)
```

---

## Command Reference

### Development

```bash
npm run dev              # Start dev server (watches changes)
npm run build           # Compile TypeScript
npm test                # Run all tests (unit + integration)
npm run test:watch      # Watch tests
npm run seed            # Seed database with test data
npx prisma generate    # Regenerate client after schema changes
npx prisma migrate dev --name <name>  # Create new migration
```

### Verification

```bash
npm run build && npm test  # Build + test (CI check)
```

---

## Phase 2 Task Breakdown

### Day 1: Auth & Permissions

1. **AuthService** — JWT token generation/validation, refresh flow
2. **PermissionService** — Check permissions, caching strategy, < 5ms target
3. **ConfigService** — Read config-driven roles/permissions from ConfigEntry table
4. **Auth Middleware** — Validate JWT, extract user from token
5. **Role Inheritance** — Permission resolution with role hierarchy

### Day 2: Event System

1. **EventPublisher** — Publish IdentityEvent to Redis pub/sub
2. **OutboxProcessor** — Worker that processes IdentityEventOutbox, delivers to Redis
3. **Event Subscription** — Endpoints for platforms to subscribe to identity changes
4. **Retry Logic** — Exponential backoff for failed deliveries
5. **Integration Tests** — End-to-end event flow validation

### Day 3: Testing & Validation

1. **Load Testing** — Verify permission checks stay < 5ms (p99)
2. **Non-blocking Validation** — Confirm client gets 200 OK before events processed
3. **Full Integration Suite** — Test auth + events + CRUD together
4. **Documentation** — Update API docs with auth examples

---

## Key Files to Review Before Starting

1. **`.ai-system/agents/project-context-cis.md`** — Full project purpose, constraints, tech decisions
2. **`.ai-system/memory/lessons-learned.md`** — Lessons from Phase 1 (Prisma version management)
3. **`.ai-system/checkpoints/session-log.md`** — What was done, what blockers exist
4. **`src/lib/prisma.ts`** — Prisma client initialization pattern (uses PrismaPg adapter)
5. **`prisma/schema.prisma`** — Schema design (no datasource url — in prisma.config.ts)

---

## Continuation Instructions

### Step 1: Verify Environment

```bash
cd cis_backend
npm install              # Install dependencies (cloud env may be fresh)
npm run build           # Verify TypeScript compiles
npm test                # Run all tests (should all pass)
```

### Step 2: Review Phase 2 Plan

1. Open `.ai-system/planning/task-queue.md` and review Phase 2 tasks (May 11–13)
2. Check `.ai-system/planning/project-plan-cis.md` for Phase 2 detailed requirements
3. Review `.ai-system/agents/project-context-cis.md` for business constraints (async-first, non-blocking, etc.)

### Step 3: Start Phase 2 Implementation

1. Create `src/services/authService.ts` (JWT generation/validation)
2. Implement `src/services/permissionService.ts` (permission checking + caching)
3. Create `src/api/middleware/authentication.ts` (JWT validation middleware)
4. Write tests for auth flow, permission resolution
5. Build event publishing + outbox processor

### Step 4: Reference Architecture

- **Auth Flow:** POST `/api/v1/auth/login` → JWT token → Bearer token in subsequent requests
- **Permission Check:** GET `/api/v1/permissions/check?permission=EDIT_USERS` → cached response < 5ms
- **Event Publishing:** Any identity change → IdentityEvent created → IdentityEventOutbox entry → OutboxProcessor picks it up → Redis pub/sub broadcast
- **Non-blocking:** Client request completes → event processing happens async in background

---

## Database Setup (When Ready)

Phase 1 doesn't require a live database connection. When ready for Phase 2+ testing:

1. Provision Supabase PostgreSQL
2. Copy DATABASE_URL to `.env`
3. Run: `npx prisma migrate deploy` (applies all migrations)
4. Run: `npm run seed` (populates test data)

For now, schema is designed and ready; tests run against mocked Prisma.

---

## Important Notes

### Prisma 7.x Pattern (Locked In)

- Connection URL in `prisma/prisma.config.ts` (not in schema.prisma)
- PrismaClient initialized with PrismaPg adapter
- `npx prisma generate` regenerates client after schema changes
- Schema.prisma contains only data model + provider (no url)

### Non-breaking Philosophy

- CIS is additive; existing platforms unchanged
- All config is database-driven (no hardcoded roles/permissions)
- Phase 2 adds auth + events without breaking Phase 1 CRUD
- Phase 3 adds platform integrations without touching CIS core

### Test-Driven

- Every new feature: write tests first, then implementation
- Integration tests validate entire flow (not just units)
- Aim to keep coverage > 80%

---

## Success Criteria for Phase 2 Completion

- [x] All 3 Phase 2 task days completed with 0 test failures
- [x] JWT tokens working (generation, validation, refresh)
- [x] Permission checks consistently < 5ms (p99)
- [x] Events publishing to Redis without blocking
- [x] OutboxProcessor reliably delivers all events
- [x] Integration test suite passes
- [x] API documentation updated with auth examples
- [x] Build clean, no TypeScript errors
- [x] Ready for Phase 3 platform integrations

## Phase 3 Progress

- CIS-side platform integration service implemented
- Reporting and Faith Hub SDK facades implemented
- Platform sync routes and mapping lookups implemented
- End-to-end integration tests added for sync and relay behavior
- Host-platform hook helpers and 3-platform validation route are now in place

## Phase 3.5 Progress

- Config-backed platform role mapping service implemented
- Role mapping list/get/upsert endpoints are available
- Versioned config storage is used for platform role translations
- Backfill utility and CLI are implemented for curated defaults
- Unit and integration tests pass for translation/versioning/backfill/validation
- Phase 3.5 is complete in this repo; next work is Phase 4 final sign-off and deployment

## Phase 4 Progress

- Security audit completed for current auth, validation, and error-handling paths
- OpenAPI endpoint implemented at `/api/docs/openapi.json`
- Deployment, troubleshooting, training, and launch checklist docs added
- Benchmark and load-test scripts added and validated locally
- Remaining work: final code review sign-off and staging/production deployment

---

## Useful Commands for Cloud Session

```bash
# Fresh start
npm ci                           # Clean install from package-lock.json
npm run build && npm test       # Verify everything works

# Development
npm run dev                     # Start dev server
npm run test:watch             # Continuous test mode

# Schema changes
npx prisma generate            # Regenerate client
npx prisma migrate dev --name <name>  # Create migration

# Cleanup
rm -rf dist/ node_modules/    # Clean build artifacts
npm ci                        # Reinstall
```

---

## Getting Help

If you get stuck:

1. Check `.ai-system/agents/repair-system.md` for known error patterns
2. Review `.ai-system/memory/lessons-learned.md` for design decisions
3. Check test files for usage examples (see `tests/` for all patterns)
4. Run `npm test` to validate your changes

---

**Ready to continue? Start with:**

```bash
npm install && npm run build && npm test
```

Then open `.ai-system/planning/task-queue.md` and begin Phase 2 Day 1 tasks.
