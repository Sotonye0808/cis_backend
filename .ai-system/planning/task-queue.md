# Development Task Queue: Accelerated CIS (May 7+)

> **Overview:** Sprint-level execution tasks for all phases. Execution speed: comprehensive planning + sufficient context = 2 weeks total. Mark [ ] complete to [x] when done.
> **Current Focus:** Phase 3.5 (Role Mapping & Governance)

---

## Phase 1: Foundation & Schema (May 7–10) ✅ COMPLETE

> **Duration:** 4 days (accelerated) | **Deliverable:** Schema, migrations, CRUD API, tests | **Completed:** All tasks

### Day 1 (May 7): Setup & Schema

- [x] **T1.1** Confirm Supabase PostgreSQL access (all developers can connect)
- [x] **T1.2** Create CIS repository with structure (src/, prisma/, tests/, docs/)
- [x] **T1.3** Initialize Node.js + install dependencies (express, prisma, typescript, zod, pino, jest)
- [x] **T1.4** Set up Prisma: `npx prisma init` → connect to Supabase
- [x] **T1.5** Design & implement full Prisma schema (9 tables, 6 enums, all relationships)
- [x] **T1.6** Create initial migration: `npx prisma migrate dev --name init`
- [x] **T1.7** Create seed data (1 OrgGroup, 2 Campuses, 5 users, 5 roles)

**Completion Check:** ✅ Database schema designed, migrations ready, seed structure prepared

### Day 2 (May 8): Data & Service Layers

- [x] **T1.8** Implement repository layer (user, role, org, permission repositories)
- [x] **T1.9** Implement service layer (IdentityService, RoleService, OrgService)
- [x] **T1.10** Create Zod validation schemas (input validation)
- [x] **T1.11** Create typed error classes (AppError, UserNotFoundError, etc.)
- [x] **T1.12** Write unit tests for repositories & services (70%+ coverage target)
- [x] **T1.13** Set up basic Express app with middleware (logging, error handling)

**Completion Check:** ✅ All services implemented, unit tests passing, 84.39% coverage

### Day 3 (May 9): API & Verification

- [x] **T1.14** Create user API routes (GET, POST, PATCH, DELETE endpoints)
- [x] **T1.15** Create role API routes (assign, revoke, list)
- [x] **T1.16** Create org API routes (get hierarchy)
- [x] **T1.17** Wire all routes into Express app
- [x] **T1.18** Write integration tests for all endpoints
- [x] **T1.19** Manual testing: test 5 endpoints with curl
- [x] **T1.20** Create API documentation (Swagger or Markdown)
- [x] **T1.21** Verify database state (migrations clean, seed data present, no orphans)

**Completion Check:** ✅ All endpoints responding, 23/23 tests passing, zero errors

### Day 4 (May 10): Prisma 7.x Upgrade

- [x] **T1.22** Upgrade Prisma to 7.x (latest conventions)
- [x] **T1.23** Create prisma/prisma.config.ts with DATABASE_URL
- [x] **T1.24** Remove datasource url from schema.prisma
- [x] **T1.25** Implement PrismaPg adapter for direct PostgreSQL connection
- [x] **T1.26** Validate all tests pass with Prisma 7.x
- [x] **T1.27** Verify TypeScript build clean

**Completion Check:** ✅ Prisma 7.8.0 client generated, all 23 tests passing, build clean

**Phase 1 Exit Criteria:**

- ✅ `npm test` passes with **84.39% coverage** (exceeds 70% target)
- ✅ All CRUD operations work
- ✅ Database schema ready (no active connection needed for Phase 1)
- ✅ Zero hardcoded config
- ✅ **Prisma 7.x with latest conventions locked in**
- ✅ Ready for Phase 2 (auth + events)

---

## Phase 2: Auth, Permissions & Events (May 11–13) ✅ COMPLETE

> **Duration:** 3 days | **Deliverable:** JWT auth, permission system, async event infrastructure

### Day 1 (May 11): Auth & Permissions

- [x] **T2.1** Implement JWT token generation/validation (AuthService)
- [x] **T2.2** Implement permission service with caching (in-memory or Redis)
- [x] **T2.3** Implement ConfigService for reading config-driven roles/permissions
- [x] **T2.4** Implement role inheritance logic
- [x] **T2.5** Create permission check endpoint + tests
- [x] **T2.6** Implement token refresh flow
- [x] **T2.7** Add authentication middleware to all protected routes

**Completion Check:** JWT tokens issued/validated, permission checks < 5ms (cached)

### Day 2 (May 12): Event System & Infrastructure

- [x] **T2.8** Create event publishing service (Redis pub/sub)
- [x] **T2.9** Implement outbox processor worker (handles IdentityEventOutbox table)
- [x] **T2.10** Create event subscription/webhook endpoints
- [x] **T2.11** Implement backoff + retry logic for failed event deliveries
- [x] **T2.12** Integration tests for event flow (end-to-end)

**Completion Check:** Events published, outbox processor working, E2E test passes

### Day 3 (May 13): Testing & Validation

- [x] **T2.13** Load test permission checks (p99 < 5ms)
- [x] **T2.14** Test non-blocking behavior (client gets 200 OK before events processed)
- [x] **T2.15** Verify outbox processor under load (batch processing)
- [x] **T2.16** Full integration test suite (auth + events + CRUD)
- [x] **T2.17** Update API documentation with auth examples

**Completion Check:** All performance targets met, 0 test failures, docs updated

**Phase 2 Exit Criteria:**

- ✅ JWT tokens working with refresh flow
- ✅ Permissions checked in < 5ms (p99)
- ✅ Events publishing via Redis async queue
- ✅ Outbox processor reliable under load
- ✅ All routes protected with auth middleware
- ✅ Ready for Phase 3 (platform integrations)

**Validation Note:** Phase 2 is implemented and passing in the current codebase; Phase 3 integration work has started with CIS-side sync routes and SDK facades.

---

## Phase 3: Platform Integrations (May 13–14) [IN PROGRESS]

> **Duration:** 2 days | **Deliverable:** Reporting System & Faith Hub synced with CIS

### Day 1 (May 13): Reporting System Integration

- [x] **T3.1** Create PlatformUserMapping support in CIS repository layer
- [x] **T3.2** Build user migration/sync utility: reporting_users → CIS CanonicalUser
- [x] **T3.3** Create Reporting System SDK facade (`@harvesters/cis-reporting-sdk` pattern)
- [ ] **T3.4** Update Reporting System auth middleware to use CIS JWT
- [ ] **T3.5** Update Reporting System permission checks to use CIS API
- [x] **T3.6** Implement event listener in Reporting System (subscribe to identity:\*)
- [x] **T3.7** Test: user update in CIS → appears in Reporting System within 500ms

**Completion Check:** Existing users migrated, bidirectional sync working, no data loss

### Day 2 (May 14): Faith Hub Integration

- [x] **T3.8** Build user migration/sync utility: faith_hub_users → CIS CanonicalUser
- [x] **T3.9** Create Faith Hub SDK facade (`@harvesters/cis-faith-hub-sdk` pattern)
- [ ] **T3.10** Update Faith Hub auth endpoint to use CIS
- [x] **T3.11** Implement event listener in Faith Hub
- [ ] **T3.12** Test: 3-platform sync (CIS ↔ Reporting ↔ Faith Hub)
- [ ] **T3.13** Create integration test suite (all 3 platforms)

**Completion Check:** All users migrated, cross-platform events working, E2E test passes

**Phase 3 Exit Criteria:**

- ✅ Reporting System synced
- ✅ Faith Hub synced
- ✅ Bidirectional event flow working
- ✅ Zero data loss during migration
- ✅ Ready for Phase 4 (documentation + launch)

---

## Phase 3.5: Role Mapping & Governance (May 14–18) [IN PROGRESS]

> **Duration:** 1 week | **Deliverable:** Config-backed platform role translation, mapping endpoints, governance scaffolding

### Day 1 (May 14): Role Translation Core

- [x] **T3.14** Build config-backed platform role mapping service
- [x] **T3.15** Create role mapping API routes for list/get/upsert
- [x] **T3.16** Add platform role mapping schemas and validation
- [x] **T3.17** Write unit tests for mapping translation and versioning

**Completion Check:** Platform roles can be mapped to canonical roles via CIS config

### Day 2 (May 15): Governance Expansion

- [x] **T3.18** Add host-platform auth middleware integration hooks
- [x] **T3.19** Add host-platform permission check integration hooks
- [x] **T3.20** Build migration utility for backfilling role mappings
- [x] **T3.21** Create 3-platform sync validation scenario

**Completion Check:** Role translation is usable by external platform teams and mappings can be backfilled from CIS

---

## Phase 4: Testing, Documentation & Launch (May 15–16)

> **Duration:** 2 days | **Deliverable:** Production-ready CIS, full documentation, team trained

### Day 1 (May 15): Testing & Security

- [ ] **T4.1** Security audit: input validation, JWT edge cases, secret handling
- [ ] **T4.2** Performance benchmarks: latency under load (100 req/sec, p99 < 100ms)
- [ ] **T4.3** Load test: sustained 100 req/sec, no timeouts
- [ ] **T4.4** Final code review: all PRs merged, no blockers
- [ ] **T4.5** Coverage verification: 70%+ across all modules

**Completion Check:** Security passed, performance targets met, coverage confirmed

### Day 2 (May 16): Documentation & Launch

- [ ] **T4.6** Create/finalize Swagger/OpenAPI documentation
- [ ] **T4.7** Create deployment guide (Docker, environment vars, database setup)
- [ ] **T4.8** Create platform migration guides (if not already done)
- [ ] **T4.9** Create troubleshooting guide (common issues, solutions)
- [ ] **T4.10** Prepare team training materials
- [ ] **T4.11** Final sign-off: tech lead confirms launch readiness
- [ ] **T4.12** Deploy to staging/production

**Completion Check:** All documentation published, team trained, ready for May 20 Faith Hub mobile integration

**Phase 4 Exit Criteria:**

- ✅ Security audit passed
- ✅ Performance benchmarks met
- ✅ API fully documented
- ✅ Team trained and self-sufficient
- ✅ Production deployment ready
- ✅ **CIS LAUNCHED** 🎉

---

## Success Checklist (May 16)

Before marking project complete:

### Code Quality

- [ ] `npm test` passes (70%+ coverage)
- [ ] `npm run build` (no TS errors)
- [ ] All linting rules pass
- [ ] Code reviewed by tech lead
- [ ] No console.logs left behind (logs via Pino only)

### Functionality

- [ ] All 9 Phase 1 CRUD endpoints working
- [ ] JWT auth working end-to-end
- [ ] Permission checks returning correct values
- [ ] Events publishing to Redis/queue
- [ ] Outbox processor reliable (no event loss)
- [ ] All 3 platforms synced and tested

### Performance

- [ ] User lookup < 50ms p99
- [ ] Permission check < 5ms p99 (cached)
- [ ] Event delivery < 500ms p99
- [ ] Load test: 100 req/sec sustained, no timeouts

### Documentation

- [ ] README with setup instructions
- [ ] API documentation (Swagger/OpenAPI)
- [ ] `.env.example` with all variables
- [ ] Migration guides for each platform
- [ ] Troubleshooting guide
- [ ] Architecture diagram up-to-date

### Deployment

- [ ] Supabase database synced
- [ ] Migrations tested (no rollback needed)
- [ ] Secrets managed (no hardcoded keys)
- [ ] Logging working (Pino configured)
- [ ] Monitoring/alerts configured (optional for Phase 4.5)

### Team

- [ ] All developers understand CIS architecture
- [ ] Platform teams received integration guides
- [ ] Support contact & escalation path defined

---

## Notes

**Dependencies:** None — all phases are sequential but can be parallelized if team is large enough.

**Blockers:** Supabase access must be confirmed by May 8 AM. If blocked, use local PostgreSQL temporarily.

**Parallel Work:** Faith Hub mobile team can continue independently; CIS integration optional until Phase 3.

**Rollback Plan:** If integration fails, set CISUserLink.syncStatus = 'INACTIVE'; both systems continue working independently. No data loss.

---

## Daily Standup Template

Use this format for daily updates:

```
Date: May 7, 2026
Phase: 1
Yesterday: [Completed T1.1–T1.5]
Today: [Planned T1.6–T1.10]
Blockers: None
Test Status: Passing (15 tests)
Coverage: 68% (target: 70%)
Notes: Schema finalized, migration runs cleanly
```

---

## Completed Phases

(None yet — Phase 1 in progress)

Once a phase completes, move tasks to `.ai-system/summaries/dev-history.md`
