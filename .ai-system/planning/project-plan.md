# CIS Project Plan: Accelerated 4-Phase Execution (May 7–16)

> **Overview:** Canonical Identity Service will be built in 4 intensive phases, each delivering measurable value. Full execution in 10 days due to comprehensive planning, sufficient context, and efficient AI-guided development.

---

## Phase 1 — Foundation & Schema (May 7–10)

**Duration:** 3 days | **Deliverable:** Complete schema + migrations + CRUD API + tests

- [x] Supabase PostgreSQL setup confirmed
- [ ] CIS repository created with proper structure
- [ ] Prisma schema designed (9 tables, 6 enums)
- [ ] Initial migration applied
- [ ] Seed data: 1 OrgGroup, 2 Campuses, 5 test users, 5 test roles
- [ ] Repository layer (data access) implemented
- [ ] Service layer (business logic) implemented
- [ ] Basic CRUD API routes implemented (GET, POST, PATCH)
- [ ] Unit tests written (70%+ coverage)

**Success Criteria:**

- ✅ `npm test` passes with > 70% coverage
- ✅ All CRUD operations work via API
- ✅ Database migrated cleanly
- ✅ Zero hardcoded configuration
- ✅ Ready for Phase 2 (auth + events)

---

## Phase 2 — Auth, Permissions & Events (May 11–12)

**Duration:** 2 days | **Deliverable:** JWT auth + permission system + async event infrastructure

- [ ] JWT token generation and validation
- [ ] Permission service with caching (Redis or in-memory)
- [ ] Config-driven role/permission resolution
- [ ] IdentityEvent + IdentityEventOutbox tables
- [ ] Event publisher (Redis pub/sub or polling)
- [ ] Outbox processor worker
- [ ] Token refresh flow
- [ ] Integration tests for auth flows
- [ ] Permission caching validation (< 5ms cache hits)

**Success Criteria:**

- ✅ JWT tokens issued and validated
- ✅ Permission checks < 5ms (cached)
- ✅ Events published via Redis (or queue)
- ✅ Outbox processor runs reliably
- ✅ Role inheritance working

---

## Phase 3 — Platform Integrations (May 13–14)

**Duration:** 2 days | **Deliverable:** Reporting System & Faith Hub integration complete

- [ ] PlatformUserMapping table functional
- [ ] Reporting System user sync (existing users → CIS)
- [ ] Faith Hub user sync
- [ ] Event listeners for both platforms
- [ ] Bidirectional sync verified
- [ ] Zero data loss during migration
- [ ] Platform SDK documentation
- [ ] Integration tests (CIS ↔ Reporting ↔ Faith Hub)

**Success Criteria:**

- ✅ Existing users migrated without data loss
- ✅ Cross-platform event flow working
- ✅ Identity updates propagate within 500ms
- ✅ E2E test passes

---

## Phase 4 — Testing, Documentation & Launch (May 15–16)

**Duration:** 2 days | **Deliverable:** Production-ready system, documentation, launch prep

- [ ] Security audit (input validation, JWT edge cases, secrets handling)
- [ ] Performance benchmarks (p99 latency validation)
- [ ] Load test (100 req/sec sustained)
- [ ] API documentation complete (Swagger/OpenAPI)
- [ ] Platform migration guides published
- [ ] .env.example with all required variables
- [ ] README with setup + running instructions
- [ ] Developer onboarding guide
- [ ] Error handling and logging validated
- [ ] Code coverage final check (70%+)
- [ ] Final code review and merge to main
- [ ] Team sign-off on launch readiness

**Success Criteria:**

- ✅ All p99 latencies < 100ms
- ✅ No security vulnerabilities
- ✅ API fully documented
- ✅ Platform teams trained
- ✅ Ready for May 20 Faith Hub mobile integration

---

## Completed

- [x] Bootstrap session: Architecture, schema design, task planning (May 7)
- [x] AI system configured with CIS context

---

## Success Definition (May 16)

CIS is successfully launched when:

1. ✅ All 5 platforms synced (Reporting, Faith Hub, CRM, DMHicc, MyHarvestHub)
2. ✅ Zero identity conflicts (email uniqueness enforced)
3. ✅ < 100ms p99 latency for identity operations
4. ✅ 99.9% event delivery to platforms (async outbox)
5. ✅ Zero hardcoded roles/permissions (100% config-driven)
6. ✅ Complete audit trail (all changes logged)
7. ✅ All developers trained and self-sufficient
8. ✅ Security audit passed
9. ✅ Documentation complete
10. ✅ Ready for Faith Hub mobile integration (May 20)
