# CIS Project Plan: Phased Development Roadmap

> **Overview:** The Canonical Identity Service will be built in 5 phased increments, each delivering measurable value while progressively integrating existing platforms. This roadmap spans May–August 2026, with Faith Hub mobile (due May 20) handled as a parallel stream.

---

## Phase 1 — Foundation & Schema (May 7–10) ✅ COMPLETE

**Duration:** 4 days (accelerated) | **Deliverable:** Schema + migrations + basic CRUD API  
**Completed:** May 10

> **Section summary:** Establish the database schema, migration pipeline, and foundational API endpoints. No platform integration yet — purely internal CIS infrastructure.

### Core Tasks

- [ ] Set up CIS repository structure and Prisma project
- [ ] Design and implement Prisma schema (CanonicalUser, CanonicalRole, RolePermission, PlatformUserMapping, ConfigEntry, IdentityEvent, IdentityEventOutbox, OrgGroup, Campus)
- [ ] Create initial migrations and seed data (test roles, orgs, users)
- [ ] Implement base CRUD operations for users (create, read, update, soft delete)
- [ ] Implement base CRUD operations for roles and permissions
- [ ] Build organization hierarchy service (OrgGroup, Campus management)
- [ ] Set up PostgreSQL database on Supabase
- [ ] Build basic Express API scaffolding with middleware (logging, error handling, validation)
- [ ] Write unit tests for data access layer
- [ ] Document API endpoints using Swagger/OpenAPI

### Acceptance Criteria

- ✅ All 9 core tables created with proper indexes and constraints
- ✅ Prisma 7.x migrations run without errors (config in prisma/prisma.config.ts)
- ✅ Can create/read/update/delete users via API
- ✅ Can create/read/update roles, assign to users
- ✅ Can read org hierarchy (OrgGroup → Campus)
- ✅ API documentation published
- ✅ Unit test coverage **84.39%** (exceeds target)
- ✅ **All 23 tests passing** with Prisma 7.x client
- ✅ **Prisma upgraded to 7.x with PrismaPg adapter** (latest conventions)

### Known Risks

- Supabase PostgreSQL setup delays → **Mitigation:** Have team confirm access by May 8
- Schema misses edge cases from existing platforms → **Mitigation:** Review report-sys, MyHarvestHub, DMHicc schemas against CIS before finalizing

---

## Phase 2 — Auth, Permissions, & Event System (May 17–30) ✅ COMPLETE

**Duration:** 2 weeks | **Deliverable:** JWT auth, permission checking, async event infrastructure  
**Target Completion:** May 30
**Status:** Implemented and validated in the current codebase (38 tests passing).

> **Section summary:** Implement authentication, permission resolution, and the critical async event system that will broadcast identity changes to all platforms without blocking.

### Core Tasks

- [ ] Implement JWT token generation and validation (AuthService)
- [ ] Build PermissionService with permission caching (Redis)
- [ ] Implement ConfigService for reading config-driven roles and permissions
- [ ] Build event publishing system (publish to Redis pub/sub)
- [ ] Implement IdentityEventOutbox pattern with worker processor
- [ ] Create test events and verify end-to-end delivery
- [ ] Build role inheritance logic (role A includes permissions from role B)
- [ ] Implement token refresh flow
- [ ] Add request authentication middleware
- [ ] Write integration tests for permission checking
- [ ] Set up Redis (Upstash) connection and pub/sub

### Acceptance Criteria

- ✅ JWT tokens can be generated and validated
- ✅ Permission checks execute in < 5ms (cache hit) or < 50ms (cache miss)
- ✅ Outbox processor reliably delivers events to Redis
- ✅ Events published via Redis can be subscribed to by external systems
- ✅ Config-driven role/permission system works: adding role in config is immediately reflected in permission checks
- ✅ Role inheritance works: assigning role A grants all permissions of role B
- ✅ Token refresh works without re-prompting user
- ✅ Integration tests pass for event flow
- ✅ No synchronous blocking when broadcasting events

**Implementation Note:** Phase 2 is already delivered in the repository, including JWT auth, permission caching, config-driven role resolution, event outbox processing, and authenticated route protection.

### Known Risks

- Redis connection issues → **Mitigation:** Test Upstash connectivity by May 18
- Permission caching causes stale data → **Mitigation:** Short TTL (5–10 sec) + explicit invalidation on role change
- Outbox processor falls behind under load → **Mitigation:** Use batch processing, monitor queue depth

---

## Phase 3 — Platform Integration Layer 1 (May 31–June 13) [IN PROGRESS]

**Duration:** 2 weeks | **Deliverable:** Integration with Reporting System & Faith Hub (web)  
**Target Completion:** June 13

> **Section summary:** Build SDKs and integration points for the first two platforms. Each platform integration follows the same pattern: map external user ID → canonical user, set up event listeners, implement reconciliation logic.

> **Current Implementation:** CIS-side platform integration service, reporting/faith-hub SDK facades, sync routes, host-platform hook helpers, and a 3-platform validation route are in place. Remaining work moves into Phase 4 testing and launch prep.

### Phase 3.5 — Role Mapping & Governance (Started May 14)

**Purpose:** Add config-backed translation between platform-specific roles and canonical CIS roles so Reporting System and Faith Hub can share identity without sharing identical role enums.

**Implemented So Far:**

- Platform role mapping service backed by config entries
- Role mapping list/get/upsert routes
- Validation schemas and unit tests for versioned mappings
- Role-mapping backfill utility and CLI for curated defaults

**Next Steps:**

- Phase 4 security audit
- Phase 4 performance benchmarks
- Swagger/OpenAPI documentation
- Deployment and troubleshooting guides

### Core Tasks

- [ ] Build PlatformIntegrationService (abstract pattern for all platforms)
- [ ] Create Reporting System SDK: `@harvesters/cis-reporting-sdk`
  - [ ] Sync existing users from reporting_users → CanonicalUser
  - [ ] Create PlatformUserMapping entries for each
  - [ ] Set up event listener to update reporting system on user changes
  - [ ] Add identity check middleware to reporting API
  - [ ] Test user lookup from reporting system perspective
- [ ] Create Faith Hub (web) SDK: `@harvesters/cis-faith-hub-sdk`
  - [ ] Sync Faith Hub users → CanonicalUser
  - [ ] Create platform mappings
  - [ ] Set up event listener
  - [ ] Add identity check to Faith Hub API
  - [ ] Test end-to-end user flow
- [ ] Build migration utility to backfill platform mappings (one-time tool)
- [ ] Write integration tests between CIS ↔ Reporting System
- [ ] Write integration tests between CIS ↔ Faith Hub
- [ ] Publish SDKs to internal npm registry or monorepo
- [ ] Document integration process for each platform

### Acceptance Criteria

- ✅ Reporting System users migrated to CIS with bidirectional sync working
- ✅ Faith Hub users migrated to CIS with bidirectional sync working
- ✅ When a user is updated in Reporting System, CIS event system broadcasts change to Faith Hub within 500ms
- ✅ When a user is updated in Faith Hub, CIS captures it and broadcasts to Reporting System
- ✅ SDKs are documented and easy for platform teams to integrate
- ✅ Zero data loss during migration
- ✅ E2E tests pass for 3-platform sync scenario (CIS ↔ Reporting ↔ Faith Hub)

### Known Risks

- Existing user email duplicates across platforms → **Mitigation:** Build deduplication tool, manual review before migration
- Role mapping mismatch (reporting roles ≠ faith hub roles) → **Mitigation:** Build role mapping config table in Phase 3.5
- Data migration deadlock → **Mitigation:** Run migration in read-only mode first, verify, then activate writes

---

## Phase 3.5 — Role Mapping & Governance (June 14–18)

**Duration:** 1 week | **Deliverable:** Role translation layer, admin config interface  
**Target Completion:** June 18

> **Section summary:** Reporting System has 12 pastoral roles; Faith Hub may have different roles. This phase builds the translation layer that maps platform-specific roles to shared permissions, enabling a pastor to have different role names on different platforms while maintaining consistent permissions.

### Core Tasks

- [ ] Build role mapping configuration system
- [ ] Create admin CLI tool to define platform role mappings
- [ ] Implement role translation service (Reporting SPO → Faith Hub equivalent)
- [ ] Build permission resolution with platform context (same user, different roles per platform)
- [ ] Test role inheritance across platform boundaries
- [ ] Document role mapping patterns for future platforms

### Acceptance Criteria

- ✅ A user can have "SPO" role in Reporting System and "Admin" role in Faith Hub
- ✅ Both roles grant appropriate permissions within their respective platforms
- ✅ Permissions are resolved correctly regardless of platform context
- ✅ Admin can add new role mappings without code changes

---

## Phase 4 — Platform Integration Layer 2 & Admin Dashboard (June 19–July 10)

**Duration:** 3 weeks | **Deliverable:** Integration with CRM, DMHicc, MyHarvestHub + admin UI  
**Target Completion:** July 10

> **Section summary:** Integrate the remaining three platforms and build the admin dashboard for non-technical org leaders to manage users, roles, and org hierarchy.

### Core Tasks

- [ ] Create Church CRM SDK: `@harvesters/cis-crm-sdk`
  - [ ] User sync, platform mappings, event listeners
  - [ ] Member lifecycle management (onboarding, inactivation, deletion)
  - [ ] Small group membership integration
- [ ] Create DMHicc SDK: `@harvesters/cis-dmhicc-sdk`
  - [ ] Mobilizer sync and tracking
  - [ ] Campaign participation tracking
  - [ ] Event listener integration
- [ ] Create MyHarvestHub SDK: `@harvesters/cis-myharvesthub-sdk`
  - [ ] E-commerce user sync
  - [ ] Vendor/customer distinction handling
  - [ ] Event listener integration
- [ ] Build Admin Dashboard (separate Next.js app):
  - [ ] User management (search, view, edit, deactivate)
  - [ ] Org hierarchy editor (create/edit OrgGroups, Campuses)
  - [ ] Role management (view, assign, revoke)
  - [ ] Config viewer (see all roles/permissions in table)
  - [ ] Event audit log (view all identity changes)
  - [ ] Integration health dashboard (sync status per platform)
- [ ] Set up audit logging for all admin actions
- [ ] Write E2E tests for admin operations
- [ ] Document admin workflows

### Acceptance Criteria

- ✅ All 5 platforms synced with CIS, bidirectional event flow working
- ✅ Admin can view all users across all platforms in dashboard
- ✅ Admin can assign roles to users directly in CIS (updates propagate to platforms)
- ✅ Admin can create new org hierarchy (OrgGroups, Campuses)
- ✅ Audit log shows all identity changes with actor, timestamp, old/new values
- ✅ Integration health dashboard shows sync status per platform (green/yellow/red)
- ✅ All platform SDKs published and documented

---

## Phase 5 — Performance, Security & Launch (July 11–31)

**Duration:** 3 weeks | **Deliverable:** Hardened, production-ready system  
**Target Completion:** July 31

> **Section summary:** Performance optimization, security hardening, comprehensive testing, documentation, and final deployment preparation.

### Core Tasks

- [ ] Performance audit: identify N+1 queries, missing indexes
- [ ] Optimize database queries (batch fetches, connection pooling tuning)
- [ ] Load test: simulate 10k users, 100 req/sec. Target: < 100ms p99 latency
- [ ] Security audit:
  - [ ] Validate all inputs (Zod schemas)
  - [ ] Test JWT validation edge cases
  - [ ] Check for SQL injection, XSS vulnerabilities
  - [ ] Verify secrets are not logged
  - [ ] Test permission bypass attempts
- [ ] Build rate limiting (per-user, per-IP)
- [ ] Set up APM monitoring (e.g., DataDog, New Relic)
- [ ] Write comprehensive API documentation (Postman collection, Swagger UI)
- [ ] Create operator runbooks (how to recover from common failures)
- [ ] Set up alerting (high latency, error rate, outbox lag)
- [ ] Create backup/restore procedures
- [ ] Write user migration guide for platform teams
- [ ] Hold security review with stakeholders
- [ ] Final integration testing (all 5 platforms)
- [ ] Prepare go-live checklist

### Acceptance Criteria

- ✅ All p99 latencies < 100ms under load
- ✅ No security vulnerabilities identified in audit
- ✅ Rate limiting works: 1000 req/user/hour limit enforced
- ✅ APM monitoring integrated; alerting rules tested
- ✅ Runbooks documented and tested
- ✅ Backup/restore tested (1 hour RTO, zero RPO for events)
- ✅ All platform teams completed integration training
- ✅ Go-live date set, stakeholders aligned

---

## Parallel Stream: Faith Hub Mobile Support (May 7–20)

**Duration:** Parallel to Phase 1 | **Deliverable:** Mobile-ready identity API  
**Target Completion:** May 20 (alignment with Faith Hub mobile deadline)

> **Section summary:** Faith Hub mobile development has a hard May 20 deadline. CIS will not block this. However, we must ensure that once CIS launches, the mobile app can integrate quickly.

### Tasks (Non-blocking to CIS core)

- [ ] Define mobile-specific API contract (response compression, pagination, offline token validation)
- [ ] Build mobile auth flow (token refresh, session persistence)
- [ ] Implement `GET /api/v1/mobile/validate-token` endpoint (fast, no DB hit if token valid)
- [ ] Test on mobile clients (iOS/Android)
- [ ] Document mobile integration guide
- [ ] Ensure Faith Hub mobile can launch on May 20 _without_ CIS (fallback to local auth)

### Acceptance Criteria

- ✅ Faith Hub mobile has working auth by May 20 (with or without CIS)
- ✅ When CIS launches in June, mobile can switch to CIS identity with minimal code changes
- ✅ Mobile auth works offline (token validation without network round-trip)

---

## Risk Management

| Risk                           | Impact                 | Likelihood | Mitigation                                                          |
| ------------------------------ | ---------------------- | ---------- | ------------------------------------------------------------------- |
| Supabase setup delays          | Blocks entire project  | Medium     | Confirm access by May 8; have alternative (local PostgreSQL) ready  |
| Existing user email duplicates | Data loss risk         | High       | Build deduplication tool; run in preview mode first                 |
| Role mapping complexity        | Integration delays     | Medium     | Allocate extra time in Phase 3.5; start role analysis early         |
| Performance under load         | Launch delay           | Medium     | Benchmark early (Phase 2); add caching layer if needed              |
| Platform team adoption         | Low uptake             | Medium     | Provide SDKs, docs, training; assign integration leads per platform |
| Redis availability             | Event delivery failure | Low        | Use Upstash managed service; failover to database polling           |

---

## Success Metrics (End of Phase 5)

- ✅ **100% of Harvesters users** (across all 5 platforms) have a canonical CIS record
- ✅ **Zero cross-platform identity conflicts** (email uniqueness enforced)
- ✅ **< 100ms p99 latency** for all identity operations
- ✅ **99.9% event delivery** to all platforms (async outbox guarantees delivery)
- ✅ **Zero hardcoded roles/permissions** (100% config-driven)
- ✅ **All platform teams trained** and self-sufficient with CIS SDKs
- ✅ **Audit trail complete:** Every identity change logged with actor, timestamp, reason
- ✅ **Mobile-first API:** Faith Hub mobile integrated with < 1 week effort

---

## Checkpoint Milestones

| Date    | Checkpoint                                         | Approval Gate                                     |
| ------- | -------------------------------------------------- | ------------------------------------------------- |
| May 16  | Phase 1 complete: Schema + base CRUD               | Tech lead review of schema and migrations         |
| May 30  | Phase 2 complete: Auth + permissions + events      | Performance benchmark shows < 50ms per-check      |
| June 13 | Phase 3 complete: Reporting + Faith Hub integrated | E2E test passes; no data loss in migration        |
| June 18 | Phase 3.5 complete: Role mapping                   | Platform leads confirm role mappings correct      |
| July 10 | Phase 4 complete: All 5 platforms + admin UI       | All platforms report successful sync              |
| July 31 | Phase 5 complete: Production-ready                 | Security audit passes; performance benchmarks met |
| Aug 7   | **Go-Live**                                        | All stakeholders signed off                       |

---

## Success Definition

CIS is considered **successfully launched** when:

1. All 5 existing platforms are synced and operational
2. A member can be uniquely identified across all platforms by email
3. Role changes in one platform propagate to others within 500ms
4. No synchronous blocking on identity writes (async pattern verified)
5. Admin can manage users/roles/orgs without code changes
6. All events are immutably logged (audit trail)
7. Performance benchmarks met (< 100ms p99)
8. Security audit passed
9. All platform teams trained
10. Operations team has runbooks and monitoring in place
