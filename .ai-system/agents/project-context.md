# Project Context: Canonical Identity Service (CIS)

> **Overview:** CIS is a unified identity and authorization service that acts as the single source of truth for all user/member records across the Harvesters digital estate (Faith Hub, Reporting System, Church CRM, DMHicc, MyHarvestHub). It replaces the fragmented identity model with a federated architecture where each platform integrates with CIS while retaining its own specialized domain models.

---

## Project Purpose

The organization currently operates five independent digital systems with separate databases and no cross-platform identity reconciliation. CIS solves this by providing:

- **Unified User Profile:** Single canonical record per person (email-based identity)
- **Federated Integration:** Each platform syncs independently; no monolithic rewrite
- **Config-Driven Authorization:** Roles, permissions, org hierarchy all table-driven (zero hardcoding)
- **Async Event Broadcasting:** Identity changes propagate to all platforms without blocking requests
- **Complete Audit Trail:** All changes logged immutably with actor, timestamp, reason (compliance-ready)

---

## Target Users

| User Type                 | Needs                                                         | Key Interactions                                      |
| ------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| **Platform Integrators**  | Consume user identity, check permissions, subscribe to events | REST API calls, JWT validation, webhook subscriptions |
| **System Administrators** | Configure roles, manage org hierarchy, view audit logs        | Admin dashboard (future) or API                       |
| **Church Leadership**     | Unified member data, attendance, engagement across systems    | Reporting dashboards fed by CIS data                  |
| **Mobile App Clients**    | Fast identity checks, offline token validation                | REST API with optimized contracts                     |
| **Future Platforms**      | Generic identity layer for new systems                        | SDK + documentation pattern                           |

---

## Business Constraints

These are non-negotiable:

- **Config-Driven:** No hardcoded roles, permissions, org hierarchy, or platform-specific logic
- **Non-Blocking:** All identity broadcasts must be async (outbox pattern). Zero synchronous writes to multiple databases
- **Multi-Org Capable:** Schema designed for future multi-org support (current: single org)
- **Audit Compliance:** All identity changes immutably logged (7-year retention ready)
- **Performance:** User lookups < 50ms (p99), permission checks < 5ms (cached)
- **Mobile-First:** API designed for mobile clients, supports offline token validation
- **Zero Downtime:** Config changes don't require server restart (database-backed config)

---

## Current Project Phase

**Phase:** Active Development (starting immediately May 7, 2026)

**Active Sprint Focus:**

1. **Accelerated Phase 1** (May 7–10): Schema, migrations, CRUD (3 days, not 10)
2. **Phase 2** (May 11–12): Auth, permissions, events (2 days)
3. **Phase 3** (May 13–14): Platform integrations (2 days)
4. **Phase 4** (May 15–16): Testing, documentation, launch prep (2 days)

**Hard Deadline Awareness:** May 20 Faith Hub mobile app. CIS ready by May 15 for integration tests.

---

## Tech Decisions Already Made (Locked)

| Decision                            | Reason                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| **ORM: Prisma**                     | All platforms use Prisma; type safety; consistency                     |
| **Database: Supabase PostgreSQL**   | Managed service; familiar to team; cost-effective                      |
| **Language: TypeScript**            | All platforms are TypeScript; unified DX                               |
| **ID Strategy: UUID**               | Reporting System uses it; distributed-safe                             |
| **Event Pattern: Async Outbox**     | Non-blocking; guarantees delivery; follows report-sys pattern          |
| **Config Storage: Database-backed** | Enables zero-downtime config changes; follows AdminConfigEntry pattern |
| **Architecture: Federated**         | Each platform independent; no monolithic rewrite                       |
| **Auth: JWT**                       | Stateless; mobile-friendly; standard practice                          |

---

## Out of Scope (for Phase 1)

- SSO implementation (Phase 2)
- Admin UI dashboard (Phase 4)
- Multi-org support (Phase 4)
- Mobile push notifications (separate service)
- Analytics warehouse (Phase 5)
- External identity provider integration (Azure AD, Google) (Phase 3+)

---

## External Integrations

| Service                  | Purpose                     | Status                                  |
| ------------------------ | --------------------------- | --------------------------------------- |
| **Supabase PostgreSQL**  | Primary data store          | Required for Phase 1 kickoff            |
| **Upstash Redis**        | Permission caching, pub/sub | Phase 2 (optional: fallback to polling) |
| **Faith Hub API**        | Platform sync via webhook   | Phase 3 integration                     |
| **Reporting System API** | Platform sync via webhook   | Phase 3 integration                     |
| **Church CRM API**       | Platform sync via webhook   | Phase 3 integration                     |
| **DMHicc API**           | Platform sync via webhook   | Phase 3 integration                     |
| **MyHarvestHub API**     | Platform sync via webhook   | Phase 3 integration                     |

---

## Success Criteria

**Phase 1 (May 10):** Schema + CRUD + test coverage (70%+)  
**Phase 4 (May 16):** All integrations working, documentation complete, launch-ready  
**End of Day:** 100% of Harvesters users unified, zero identity conflicts, < 100ms latency, 99.9% event delivery
