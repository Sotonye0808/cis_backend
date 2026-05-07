# Project Context: Canonical Identity Service (CIS)

> **Overview:** The CIS is a unified identity and authorization service that will act as the single source of truth for all user/member records across the Harvesters digital estate (Faith Hub, Reporting System, Church CRM, DMHicc, MyHarvestHub). It replaces the current fragmented identity model with a federated architecture where each platform integrates with CIS while retaining its own specialized domain models.

---

## Project Purpose

The organization currently operates five independent digital systems with separate databases and no cross-platform identity reconciliation. This creates several critical problems:

1. **Identity Fragmentation:** A member registered on Faith Hub is an entirely different database record from the same person in the Reporting System.
2. **Role Incompatibility:** Each platform defines roles differently (Reporting System has 12 pastoral roles; MyHarvestHub has e-commerce roles). No unified permission model exists.
3. **Data Silos:** Small group attendance data, member engagement metrics, and campaign participation are scattered across disconnected systems.
4. **Analytics Blindness:** Cross-system analytics (e.g., "show me attendance trends for members who are also active mobilizers") are impossible without manual ETL.
5. **Onboarding Burden:** New platforms must re-implement identity from scratch, each with custom role/permission logic.

**The CIS solves this** by providing:

- A **canonical user profile** as the single source of truth
- A **unified authorization layer** that maps platform-specific roles to shared permissions
- An **async event infrastructure** that broadcasts identity changes to all platforms without blocking critical paths
- A **configuration-driven** role and permission model that works across organizations
- A **federated architecture** where each platform can evolve independently while staying synchronized

---

## Target Users

| User Type                                                  | Needs                                                                  | Key Interactions                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Platform Integrators** (Faith Hub, CRM, Reporting, etc.) | Consume user identity, check permissions, subscribe to identity events | API calls to CIS for user data, JWT validation, webhook subscriptions |
| **Administrators**                                         | Configure roles, permissions, org hierarchy, manage org data           | Admin dashboard (future: separate admin app)                          |
| **Church Leadership**                                      | Unified view of member data, attendance, engagement                    | Reporting dashboards in Reporting System fed by CIS data              |
| **Mobile App Clients**                                     | Fast identity checks, offline access support                           | REST API with consistent response contracts                           |

---

## Business Constraints

These are non-negotiable requirements:

- **Config-driven architecture:** No hardcoded roles, permissions, org hierarchy, or platform-specific logic. Everything lives in configuration.
- **Non-breaking integration:** Must work alongside existing systems without rewriting them. Existing databases remain intact; CIS is additive.
- **Async-first:** All identity broadcasts must be non-blocking. No synchronous writes to 5 databases on a single identity change.
- **Multi-org capable:** Schema must support multiple organizations with complete data isolation (current deployment is single-org, but design for future scaling).
- **Audit trail:** All identity changes must be immutably logged. Compliance requirement.
- **Mobile-first API:** Identity checks must be fast. No N+1 queries. Support offline token validation.
- **Zero hardcoding:** Roles, platforms, org hierarchy, permissions. All in config tables.

---

## Current Project Phase

**Phase:** Planning + Bootstrap (starting May 7, 2026)

**Active Sprint Focus:**

1. Finalize CIS Prisma schema
2. Bootstrap .ai-system documentation
3. Create detailed technical architecture
4. Plan Phase 1 implementation (foundational schema + migrations)

**Deadline Awareness:**

- Faith Hub mobile app has a May 20 deadline for progress
- CIS does not block this — CIS provides identity layer _after_ Faith Hub mobile basic structure is in place
- CIS integration with Faith Hub is Phase 3 (2–3 weeks out)

---

## Tech Decisions Already Made

| Decision                                       | Reason                                                                                      | Locked?   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| **ORM: Prisma**                                | All existing platforms use Prisma. Consistency. Type safety.                                | ✅ Locked |
| **Database: Supabase PostgreSQL**              | User preference. Managed service. Familiar to team.                                         | ✅ Locked |
| **Language: TypeScript**                       | All platforms are TypeScript. Unified developer experience.                                 | ✅ Locked |
| **ID Strategy: UUID**                          | Reporting System uses `uuid()`. Standard practice. Distributed-safe.                        | ✅ Locked |
| **Event Infrastructure: Async Outbox Pattern** | Observed in report-sys (ReportEvent + ReportVersion). Required for non-blocking broadcasts. | ✅ Locked |
| **Config Storage: Database-backed**            | Following AdminConfigEntry pattern from report-sys. Enables zero-downtime config changes.   | ✅ Locked |
| **Architecture: Federated**                    | Each platform integrates CIS; no monolith rewrite. Progressive migration strategy.          | ✅ Locked |

---

## Out of Scope (for Phase 1)

These are features we are NOT building yet (they are planned for later phases):

- [ ] Single sign-on (SSO) implementation — OAuth2/OIDC flows come in Phase 2
- [ ] Admin UI dashboard — Phase 4 (documented API-first, UI follows)
- [ ] Multi-org support — currently single-org; data isolation rules reserved for future
- [ ] Mobile push notifications — separate concern; CIS only handles identity
- [ ] Analytics data warehouse integration — Phase 5
- [ ] Integration with external identity providers (Azure AD, Google) — Phase 3

---

## Integration Landscape

These are the systems that CIS will eventually integrate with. Current status is "pending integration":

| System                    | Status                  | Priority | Integration Type                                      |
| ------------------------- | ----------------------- | -------- | ----------------------------------------------------- |
| **Reporting System**      | Active (report-sys-db)  | High     | Primary — audit users already exist here              |
| **Faith Hub (Web)**       | Active                  | High     | Primary — high member volume                          |
| **Faith Hub (Mobile)**    | In development          | High     | Mobile-specific API contract required                 |
| **Church Fellowship CRM** | Designed, partial build | Medium   | Mid-priority — foundational for member lifecycle      |
| **DMHicc**                | MVP phase               | Medium   | Mid-priority — campaign/mobilizer tracking            |
| **MyHarvestHub**          | Active (production)     | Medium   | Lower priority — most independent e-commerce platform |

---

## Critical Architecture Notes

The following observations from the architecture analysis (v2.0) inform CIS design:

1. **Campus as Relational Model:** Reporting System correctly uses Campus as a model, not a hardcoded enum. CIS will adopt this pattern.

2. **Audit Trail Pattern:** Reporting System's `ReportEvent` + `ReportVersion` pattern is production-grade. CIS identity events will follow this model.

3. **Role Complexity:** Reporting System has 12 pastoral roles (`SUPERADMIN, SPO, CEO, CHURCH_MINISTRY, GROUP_PASTOR, GROUP_ADMIN, CAMPUS_PASTOR, CAMPUS_ADMIN, DATA_ENTRY, MEMBER, OFFICE_OF_CEO, USHER`). These cannot be 1:1 mapped to other platforms' roles. CIS must support platform-specific role translation.

4. **Config Pattern:** AdminConfigEntry uses `namespace + version` as a log (not key-value). This is correct for append-only config history. CIS will use this pattern.

5. **No EventOutbox:** CRITICAL FINDING. None of the three existing systems have an outbox pattern. This is the most critical missing infrastructure. CIS will implement it.

6. **MetricEntry as Rollup:** Once a reporting period closes, data moves from mutable tables to MetricEntry. CIS should use a similar pattern for historical identity snapshots.

---

## Success Criteria

A successful CIS implementation will demonstrate:

1. ✅ **Unified Identity:** A single CanonicalUser record can resolve identity across all 5 platforms via email or platform-specific IDs.

2. ✅ **Non-blocking Broadcasts:** An identity change (name, role, permissions) broadcasts to all platforms via async events within 100ms, without blocking the originating request.

3. ✅ **Zero Hardcoding:** Add a new role, org level, or platform without touching source code. All config is table-driven.

4. ✅ **Immutable Audit Trail:** Every identity change is logged with timestamp, actor, old value, new value, reason. Supports 7-year compliance retention.

5. ✅ **Platform Integration SDKs:** Each platform (Faith Hub, Reporting, CRM, etc.) has a documented integration library that handles JWT validation, role caching, identity updates.

6. ✅ **Performance:** User lookups via email or platform ID < 50ms (p99). Token validation < 5ms. No N+1 queries.

---

## Development Team Guidance

- **Read First:** Architecture document, then this context, then repair-system.md
- **Consult Before Changes:** Check project-decisions.md to avoid contradicting prior reasoning
- **Log Everything:** Every error fixed goes to repair-system.md. Every significant decision goes to project-decisions.md.
- **Test Patterns:** Unit tests for identity logic. Integration tests for platform bridges. End-to-end for event broadcasts.
- **Code Pattern:** Look at report-sys for patterns (audit trails, config, error handling). Mimic those patterns in CIS.
