# Harvesters International Christian Centre
## Unified Digital Platform
### Product Requirements Document & Engineering Roadmap
#### Version 1.0 — April 2026

---

> **Document Scope:** This PRD synthesizes the full Harvesters technology estate — Faith Hub (web + mobile), the Reporting System PWA, the DMHicc Digital Marketing Platform, the MyHarvestHub E-Commerce Platform, and the Church Fellowship CRM — into a single architectural direction with phased execution strategy. It is addressed simultaneously to the web developer, mobile developer, and organizational leadership.

---

## 1. Executive Summary

### System Vision

Harvesters International Christian Centre is building a multi-platform digital ecosystem that will serve its congregation, workforce, and leadership through a unified, data-driven platform. The long-term destination is a **Harvesters Unified CRM** — a single source of truth for all member records, operational data, engagement metrics, and ministry reporting, accessible via web and native mobile interfaces.

### Current Problem

The organization currently operates **five distinct, loosely coupled digital products** built independently, with separate databases, separate user identity systems, and no shared data contracts. This creates several cascading problems:

- A member who registers on Faith Hub is an entirely different record from the same member in the Reporting System. There is no identity reconciliation.
- Small group attendance data captured in the CRM cannot enrich the reporting system without manual cross-referencing.
- The DMHicc campaign platform tracks mobilizer activity but has no pathway to surface that data in pastoral care tools.
- MyHarvestHub commerce operates with its own user and role model, entirely disconnected from church membership.
- The mobile app for Faith Hub is under active development against a web backend that was not designed to serve a mobile client consistently.

Additionally, there is a **critical near-term deadline of May 20** for Faith Hub mobile app progress and reporting system sync. The roadmap must honour this without compromising the longer architectural direction.

### Proposed Direction

The strategy is phased unification, not a rewrite. Each platform is preserved and stabilized while a shared identity layer and API contract layer are introduced beneath them. Platforms become **federated nodes** that progressively migrate toward a common data backbone.

### Key Architectural Philosophy

**Config-Driven. Single Source of Truth. Interface-First. Migration-Safe.**

Nothing describing organizational structure, roles, metrics, or workflows should be hardcoded. The system must be reusable across other church organizations with zero code changes. Every architectural decision is evaluated against these four principles before acceptance.

---

## 2. Current State Analysis

### 2.1 System Inventory

| System | Type | Stack | DB | Status | Primary Gap |
|---|---|---|---|---|---|
| Faith Hub | Mobile (in dev) | Next.js, App Router | PostgreSQL (Prisma) | Web: Active. Mobile: In progress | No mobile-specific API layer; no push notification infra |
| Reporting System | Web PWA | Next.js, App Router, Ant Design | PostgreSQL (Prisma) + Upstash Redis | Active, production-grade | Separate DB; partially config-driven |
| Church Fellowship CRM | Web PWA | Next.js (specified) | PostgreSQL (Prisma) | Designed, partially built | Separate DB; no user identity bridge |
| DMHicc | Web (desktop-first) | Next.js | PostgreSQL (Prisma) | MVP phase  | platform tracks mobilizer activity but has no pathway to surface that data; isolated |
| MyHarvestHub | Web (Next.js 15) | Next.js 15, App Router | PostgreSQL (Prisma) | Active, production-grade | Entirely separate user/role model; no church CRM linkage |

### 2.2 Current Architecture (Fragmented View)

```
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│     Faith Hub        │   │  Reporting System    │   │  Church CRM (PRD)   │
│  DB: faithhub_db    │   │  DB: reporting_db    │   │  DB: crm_db         │
│  Users: FH Members  │   │  Users: Leaders/Staff│   │  Users: Members     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
          │                          │                          │
          ✗ No link                  ✗ No link                  ✗ No link
┌─────────────────────┐   ┌─────────────────────┐
│      DMHicc          │   │   MyHarvestHub       │
│  DB: dmhicc_db    │   │  DB: myharvest_db   │
│  Users: Mobilizers  │   │  Users: Buyers/Vendors│
└─────────────────────┘   └─────────────────────┘
```

### 2.3 Identified Pain Points

**Data Inconsistency.** A member's name appears differently across systems because there is no canonical profile. Reports may count the same person multiple times.

**Identity Duplication.** Email is the de facto identifier across all platforms, but no system enforces uniqueness or resolution across the estate. A member email appearing in the Reporting System has no guaranteed counterpart in Faith Hub.

**No Shared API Contract.** The mobile Faith Hub app is being developed against a web-first API. There is no versioned, mobile-explicit contract defining payload shapes, pagination, push notifications, or offline sync behavior.

**Reporting Silos.** The 5-Purpose reporting template captures rich church metrics (attendance, salvations, discipleship completions, small group data) but this data lives entirely in the Reporting System and cannot be queried from Faith Hub, CRM, or DMHicc.

**Config Debt.** The Reporting System has begun migrating to a config-driven model but roles, org hierarchy levels, and metric definitions are still partially hardcoded. The CRM and Faith Hub have not started this migration.

**DMHicc in Isolation.** DMHicc is currently isolated from other systems. Campaign analytics being captured are not surfaced in other platforms.

**Scalability Risk.** With five separate PostgreSQL databases, cross-entity analytics (e.g., "show me attendance trends for small group members who are also active mobilizers") require manual ETL or are simply impossible.

---

## 3. Organizational Structure Model

### 3.1 Team Hierarchy

Harvesters operates across five primary organizational teams, each containing multiple departments:

| Team | Departments (Count) | System Relevance |
|---|---|---|
| Missions | Evangelism, Publicity, HSAP, Sports Outreach, Target Missions, God Encounters, Academic Outreach, Entertainment, Family-Friendly, Business School (10) | Member engagement, outreach tracking, campaign participation (DMHicc) |
| Programs | Ushering, Greeters, Traffic, HIU, Venue Management, Sound, Drama, Dance, Programs Managers, Media, Protocol, Choir, Quality Assurance (13) | Attendance tracking, worker reporting, service quality metrics |
| Membership | Guest Welcome, Growth Track, Interactors & Connectors, New Converts, Benevolence, Counselling, Celebration, Call Centre, Bus System, Data Management, Executive Support, Ceremonies (12) | CRM core — member lifecycle, onboarding, pastoral care |
| Maturity | HSDC, Prayer & Bible Study, Content Development, Midweek Support, Spiritual Campaigns, Resource, Group Partnership (7) | Small groups, discipleship reporting, spiritual development tracking |
| Ministry | Recruitment, Training, Leadership Development, Pastoring, Ministry Admin, House of Dorcas, Kids Support, Career & Finance Support, Business Support, Widows Ministry, Prison Ministry, Capacity Building, Elder's Care, Leadership Efficiency (14) | Worker management, pastoral care, CRM |
| Next-Gen (Kids & Teens) | Attraction, Membership, Discipleship, Volunteering, Admin (5) | Separate engagement stream; distinct metrics in reporting |
| General Services | Finance, Facilities Management, Procurement, Project Management, Communications, Information Hub (6) | Infrastructure and admin; low direct system interaction |

**Total: 7 Teams, 67+ Departments** — all of which generate reportable data, require member assignment, and participate in the 5-Purpose reporting template.

### 3.2 Impact on System Design

This complexity directly drives the requirement for a **fully config-driven organizational hierarchy** in the CRM. No system should hardcode department names, team groupings, or reporting lines. The 67+ departments must be stored as records in a configuration database, editable by authorized administrators, with:

- Configurable hierarchy levels (Team → Department → Sub-unit)
- Configurable metric ownership per department
- Configurable role assignments per department context
- Multi-campus support (the reporting system already surfaces "campus" as a scope concept)

### 3.3 The 25 Interest-Based Cell Groups

The 25 cell groups (across Spiritual Growth, Career/Business, Relationships, Skills/Creativity, Social/Sports) form the backbone of the small groups system. They are explicitly interest-based, not structure-based. This means:

- Cell group membership is **member-driven** (interest-matching), not administratively assigned
- The CRM must support **both** the administrative department structure **and** the organic cell group layer as two parallel but distinct organizational graphs
- Reports must be able to aggregate across both dimensions

---

## 4. User Roles & Permissions Model

### 4.1 Consolidated Role Taxonomy

Across all current systems, the following role types exist. These must be unified into a single config-driven role registry:

| Canonical Role | Appears As | Systems | Scope |
|---|---|---|---|
| `SUPER_ADMIN` | Superadmin, System Admin | All | Full platform governance |
| `CAMPUS_ADMIN` | — (inferred from reporting scopes) | Reporting | Campus-level oversight |
| `PASTOR` | — (inferred from CRM pastoral care) | CRM, Faith Hub | Pastoral care, member visibility |
| `DEPARTMENT_LEADER` | Group Leader | CRM | Department/cell group management |
| `DATA_ENTRY` / `USHER` | Usher (planned), Data Entry | Reporting | Metric entry for specific reports |
| `WORKER` | Worker | Reporting, CRM | General church workforce |
| `MOBILIZER` | User, Mobilizer | DMHicc | Campaign participation |
| `TEAM_LEADER` | Team Lead | DMHicc | Sub-team performance monitoring |
| `VENDOR` | Vendor | MyHarvestHub | Product listing, store management |
| `BUYER` | Buyer | MyHarvestHub | Purchase and wallet operations |
| `MEMBER` | Member | CRM, Faith Hub | Regular church member |
| `GUEST` | — | Faith Hub | Unauthenticated or first-visit user |

### 4.2 Cross-Platform Identity Model

The long-term identity model is email-anchored with UUID-based federation:

```
┌─────────────────────────────────────────────────┐
│              CANONICAL USER RECORD               │
│  id: UUID (global)                               │
│  email: string (unique, immutable anchor)        │
│  canonicalName: string                           │
│  phoneNumber: string                             │
│  platformRoles: [{ platformId, role, context }]  │
│  memberSince: timestamp                          │
│  status: ACTIVE | INACTIVE | SUSPENDED           │
└─────────────────────────────────────────────────┘
         │               │               │
    FaithHub        Reporting         CRM
    Profile         Profile           Profile
    (extends)       (extends)         (extends)
```

Each platform maintains a **profile extension** linked to the canonical user record via UUID. The canonical record lives in the CRM Core database. Platform profiles hold platform-specific data (e.g., vendor store details, reporting scope assignments, cell group memberships).

### 4.3 Role-Based Access (Config-Driven)

Roles are not hardcoded. The system must support a `RoleConfig` table with:

```typescript
interface RoleConfig {
  id: string;
  name: string;
  displayName: string;
  platformScopes: PlatformScope[];    // Which platforms this role applies to
  permissions: Permission[];           // Granular permission list
  hierarchyLevel: number;             // For organizational scoping
  isSystemRole: boolean;              // Prevents deletion of core roles
  organizationId: string;             // Multi-tenancy support
}
```

Permissions are resolved at request time from this config, not from compiled code.

---

## 5. Product & System Breakdown

### 5.1 Faith Hub

**Purpose:** Centralized digital church experience — content delivery, community engagement, spiritual growth tools, and event access for all members.

**Current Features:**
- Home/dashboard with announcements and featured content
- Live streaming and video-on-demand sermon library
- Small groups directory with join/interest functionality
- Events and programs with RSVP capability
- Spiritual engagement tools (devotionals, prayer requests, growth tracks)
- Community interaction layer (group-based)
- User profiles and personalization
- Giving/donations (flagged as optional/future)

**Current State:** Mobile app is under active development targeting the May 20 milestone. The payload contracts, authentication flows, and push notification infrastructure need to be explicitly defined for mobile consumption.

**Future Role in Unified System:** Faith Hub becomes the **primary member-facing interface** of the Unified CRM. It is the surface through which members interact with their profile, their small groups, their discipleship journey, and church-wide content. It draws from — rather than duplicates — data held in the CRM Core.

**Key Architecture Gap:** Faith Hub's small groups module is currently independent of the Church Fellowship CRM's group management system. These must converge into one group model. Attendance tracked in Faith Hub's small groups must feed the same data store as the CRM's meeting tracking.

---

### 5.2 Reporting System

**Purpose:** Church leadership analytics and reporting — structured collection of 5-Purpose metrics across all campuses and departments, with trend analysis, aggregation, and exportable insights.

**Current Features:**
- Multi-tenant reporting (campus/district/global scopes)
- Configurable report templates with metric sections
- Goals tracking with year-on-year and percentage-achieved views
- Org hierarchy management with server-side fallback
- Analytics dashboard with Recharts visualizations
- Redis-backed caching with Upstash
- Email notifications via Resend
- Asset management via Cloudinary
- PWA with offline-tolerant design
- Bug report module with managed screenshot lifecycle

**Current State:** Production-grade. The most architecturally mature of all five systems. Has a clear technical debt backlog including: full admin-editability of config, usher/data-entry role, Excel import, and refined analytical views.

**Future Role in Unified System:** The Reporting System becomes the **operational intelligence layer** of the Unified CRM. Its metric data is a downstream consumer of data produced by the CRM Core — attendance records, small group meetings, new convert tracking, and salvations that are captured in the CRM flow directly into report metrics rather than being entered manually. This eliminates double-entry.

**Key Architecture Gap:** Metrics are currently entered manually by leaders. The path to automation requires the CRM to emit structured events that the Reporting System can consume and aggregate automatically.

---

### 5.3 Church Fellowship CRM

**Purpose:** Member lifecycle management — onboarding, small group assignment, meeting attendance, pastoral touchpoints, engagement scoring, and leadership oversight.

**Current Features (Designed):**
- Three-tier role model: Superadmin, Group Leader, Member
- User onboarding with full profile (name, email, phone, location, age, marital/employment status, interests)
- Group creation and management with biweekly meeting tracking
- Attendance capture (numeric count + optional member checkbox + screenshot upload)
- Communication and pastoral touchpoint logging (calls, follow-ups, check-ins)
- Membership transfer requests and approvals
- Engagement scoring and analytics
- Interest-based group recommendations
- Admin oversight dashboard with exportable reports

**Current State:** PRD defined. Partially built. The data model and feature set are well-specified but the system is not yet production-ready, and no user identity bridge to other platforms exists.

**Future Role in Unified System:** The CRM becomes the **canonical member data authority** — the source of truth for who a member is, which groups they belong to, and how they are engaging. All other platforms reference this authority rather than maintaining their own member stores.

---

### 5.4 DMHicc (Digital Marketing Platform)

**Purpose:** Trackable campaign management for church mobilizers — smart links, points/gamification, leaderboards, referral tracking, and donation attribution.

**Current Features:**
- Campaign lifecycle management (Draft → Active → Paused → Completed → Archived)
- Smart link engine with per-user per-campaign tracking slugs
- Engagement tracking (clicks, views, conversions, referrals)
- Multi-tier points system (Impact, Consistency, Leadership, Reliability Points)
- Leaderboard engine (individual, team, group, global)
- Donation module with per-campaign attribution
- Trust and fraud detection engine
- Analytics dashboards (user and admin views)

**Current State:** MVP phase running on PostgreSQL (Phase 14 in its own roadmap). Campaign data being generated is isolated.

**Future Role in Unified System:** DMHicc becomes the **digital engagement and reach** module of the CRM. Mobilizer activity (link shares, click-throughs, campaign conversions) is surfaced in member CRM profiles, enriching pastoral understanding of how members are engaging with outreach. Campaign goals align with the same organizational goal-setting framework used in the Reporting System.

**Critical Near-Term Action:** DMHicc must be moved from mock DB to real PostgreSQL before any data generated is treated as meaningful. This is a Phase 0 task.

---

### 5.5 MyHarvestHub (E-Commerce Platform)

**Purpose:** Church-adjacent marketplace for member and vendor products/services — multi-vendor commerce, wallet system, banner advertising, push notifications, and vendor management.

**Current Features:**
- Multi-vendor marketplace with buyer/vendor/admin/superadmin roles
- Product catalog with categories, discovery, and filter/search
- Full checkout with Paystack payment integration
- Wallet system (deposits, withdrawals, vendor settlements)
- Order lifecycle with settlement release, refund review, and auto-confirm
- Banner/advertising system with placement tiers (top strip, hero, sidebar)
- Push notification system with health diagnostics
- Email notifications via Resend
- Vendor verification and moderation workflows
- RBAC-enforced route policy with `/operations/*` namespace

**Current State:** Production-grade. Highly mature architecture. The most complex commerce-domain codebase in the estate. Has a well-defined RBAC model and config-driven discovery/content system.

**Future Role in Unified System:** MyHarvestHub remains a **semi-autonomous commerce module**. In the unified system, a member's identity from the CRM Core links to their MyHarvestHub buyer/vendor profile, enabling the church to understand members' commercial engagement and economic participation in the community ecosystem.

---

## 6. Unified Data Architecture Design

### 6.1 Single User Identity Model

The canonical user record is the foundation. All platform profiles are extensions, not replacements.

```sql
-- Canonical Users (lives in CRM Core DB)
CREATE TABLE canonical_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  email_verified  BOOLEAN DEFAULT FALSE,
  phone           TEXT,
  full_name       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  status          TEXT DEFAULT 'ACTIVE' -- ACTIVE | INACTIVE | SUSPENDED
);

-- Platform Registry
CREATE TABLE platforms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL, -- 'faith_hub', 'reporting', 'crm', 'dmhicc', 'myharvesthub'
  display_name    TEXT NOT NULL,
  base_url        TEXT,
  api_version     TEXT DEFAULT 'v1',
  is_active       BOOLEAN DEFAULT TRUE
);

-- Cross-Platform User Links
CREATE TABLE user_platform_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_user_id UUID NOT NULL REFERENCES canonical_users(id),
  platform_id       UUID NOT NULL REFERENCES platforms(id),
  platform_user_id  TEXT NOT NULL, -- The user's ID in the external platform's own DB
  roles             TEXT[],        -- Platform-specific roles
  linked_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_id, platform_user_id)
);
```

### 6.2 Email-Based Identity Reconciliation (Initial Strategy)

Before full federation is built, email is used as the reconciliation key. When a user registers on any platform:

1. The platform checks the CRM Core for an existing canonical user with that email.
2. If found, a `user_platform_links` record is created linking the platform account to the canonical user.
3. If not found, a new canonical user record is created, then linked.
4. The platform stores the canonical UUID in its own user record for future lookups.

This process runs asynchronously (non-blocking) in Phase 1 to avoid introducing latency into existing auth flows.

### 6.3 Data Synchronization Strategy

**Phase 1 — Event-Based Async Sync (Recommended for Short/Mid Term)**

Each platform emits structured domain events to a shared event bus (initially a simple PostgreSQL-backed queue, later migrated to a dedicated message broker). Events are typed, versioned, and consumed by a CRM Sync Service.

```
Platform Action → Platform DB Write → Event Emitted
                                         ↓
                               CRM Sync Service Consumes
                                         ↓
                           CRM Core Record Updated / Created
```

Example events:
- `faith_hub.member.registered` → Create/link canonical user
- `crm.meeting.attendance_recorded` → Increment reporting metric
- `dmhicc.campaign.conversion_recorded` → Update member engagement score
- `reporting.report.submitted` → Archive report data to CRM analytics store

**Phase 2 — Shared API Gateway (Mid-Term)**

A lightweight API gateway layer is introduced. Platforms that need cross-platform data make calls to the gateway rather than directly to each other's databases.

**Phase 3 — Database Federation (Long-Term)**

Databases are progressively merged. Non-core platform schemas migrate into a partitioned schema on the CRM Core database. Platform-specific tables retain their namespace but share the canonical users table.

### 6.4 Migration Approach

**Rule 1: No destructive migrations.** All migrations are additive until explicitly approved for a breaking change.

**Rule 2: Dual-write period.** When introducing a new shared field, both old and new fields are populated during a transition window.

**Rule 3: Prisma `migrate deploy` only in production.** `migrate reset` is never run in production environments.

**Rule 4: Backfill scripts are idempotent.** Any data migration script can be run multiple times without creating duplicates.

---

## 7. System Architecture (Target State)

### 7.1 Layered Architecture (Per Platform)

Each platform follows this four-layer model:

```
┌─────────────────────────────────────────────┐
│  CONFIG LAYER                                │
│  org structure, roles, metrics, workflows,  │
│  features, content — all DB-driven          │
├─────────────────────────────────────────────┤
│  SERVICE LAYER                               │
│  Business logic — platform-independent     │
│  Typed interfaces, no framework coupling   │
├─────────────────────────────────────────────┤
│  DATA LAYER (Repositories)                  │
│  Prisma adapters, Redis cache,              │
│  CRM Sync Service integration              │
├─────────────────────────────────────────────┤
│  UI LAYER                                    │
│  Next.js (web), React Native (mobile)      │
│  Role-filtered, config-rendered            │
└─────────────────────────────────────────────┘
```

### 7.2 Backend Architecture

**API Layer:** RESTful API routes (Next.js route handlers) per platform, secured with JWT (httpOnly cookies for web, bearer tokens for mobile). Each API endpoint is versioned (`/api/v1/`).

**Auth:** Unified JWT structure. The JWT payload includes `canonicalUserId`, `platformRoles`, and `platformId` so any service can resolve the user's identity and permissions without a DB roundtrip for every request.

**Database:** PostgreSQL per platform (current), converging toward federated schema. Prisma as the ORM across all platforms — already the case for Reporting and MyHarvestHub.

**Cache:** Upstash Redis across platforms — already used by Reporting and MyHarvestHub. Extend to Faith Hub and CRM.

**Events:** PostgreSQL-backed outbox table per platform, consumed by CRM Sync Service. Upgrade path to Redis Streams or a dedicated broker (e.g., BullMQ) as volume increases.

**File Storage:** Cloudinary across all platforms — already used by Reporting and MyHarvestHub.

**Email:** Resend across all platforms — already used by Reporting and MyHarvestHub.

### 7.3 Mobile + Web Interaction Model

The Faith Hub mobile app introduces requirements that the web backend does not currently meet:

| Requirement | Web (Current) | Mobile (Required) |
|---|---|---|
| Authentication | JWT in httpOnly cookie | JWT as bearer token (no cookie access) |
| Payload size | Unrestricted | Minimized — mobile data considerations |
| Push notifications | Web Push (VAPID) | FCM / APNs via native bridge |
| Offline access | Service Worker (partial) | Native offline-first with sync queue |
| Image delivery | Full-size Cloudinary URLs | Responsive Cloudinary transformations |
| API versioning | Unversioned | Explicit version contract (`/api/v1/mobile/`) |

A dedicated mobile API namespace (`/api/v1/mobile/`) should be introduced that wraps existing service logic but enforces mobile-specific response contracts, authentication flow, and payload compression.

### 7.4 Config System Design

The config system is a database-backed registry of organizational and system settings:

```
config_registry
├── org_config          # Hierarchy, teams, departments, campuses
├── role_config         # Role definitions, permissions, platform scopes
├── metric_config       # Report metrics, categories, calculation rules
├── feature_flags       # Per-platform, per-role feature toggles
├── workflow_config     # Approval chains, notification triggers
├── content_config      # Static content (help text, labels, templates)
└── integration_config  # Platform registry, sync rules, event schemas
```

This is exposed via an Admin Config API that only `SUPER_ADMIN` role can write to. All platform services read from this config at startup and cache it in Redis with a short TTL, falling back to compiled defaults when the config service is unreachable.

---

## 8. Short-Term Execution Plan (Pre-May 20 Deadline)

### 8.1 Context

The May 20 deadline requires demonstrable Faith Hub mobile app progress and a mechanism for reporting sync with existing systems. This section defines what is strictly necessary versus what should be deferred.

### 8.2 What to Build NOW

**Faith Hub Mobile App — Critical Path Items**

1. **Mobile Auth Flow** — Implement bearer token authentication path in the Faith Hub API. This is a purely additive change to existing auth endpoints. The API must accept `Authorization: Bearer <token>` in addition to the existing cookie-based auth.

2. **Mobile API Contract Documentation** — Define the explicit JSON payload contracts for the four most critical mobile endpoints: (a) user profile, (b) events list, (c) small groups list, (d) sermon/media feed. These must be stable before the mobile developer builds against them.

3. **Push Notification Infrastructure** — Register FCM/APNs credentials in the backend. Extend the existing VAPID push system to also support Firebase Cloud Messaging for native mobile delivery. Store device tokens in the Faith Hub database against user profiles.

4. **Offline-Tolerant Endpoints** — The mobile app needs to function with stale data during network loss. Identify the five highest-traffic read endpoints and ensure they return `Cache-Control` headers suitable for client-side caching. This is a configuration change, not a rewrite.

5. **Reporting System: Mobile Dashboard** — The Reporting System is a PWA. For the mobile milestone, ensure the existing PWA is installable on mobile with a proper manifest, splash screen, and install prompt. This is a low-effort, high-visibility win.

**Reporting System — Sync Foundations**

6. **CRM Attendance Bridge (MVP)** — Introduce a lightweight API endpoint in the Reporting System that accepts attendance data in the CRM's event format. This allows the CRM to POST attendance counts directly into a report metric without requiring the full data federation to be built. This is a temporary bridge, not the final architecture.

7. **Event Outbox Table** — Add an `event_outbox` table to both the Faith Hub database and the CRM database. Events are written to this table synchronously with the main write operation. A background worker polls this table and emits events to a queue. This can be as simple as a cron job initially.

### 8.3 What to Defer

The following are important but must not be allowed to threaten the May 20 deadline:

- Full database federation and canonical user unification
- Admin config UI for organizational hierarchy
- Excel import for the Reporting System
- MyHarvestHub / CRM integration
- Full mobile-specific API namespace

### 8.4 Minimal Viable Integration Strategy

The MVP integration for May 20 is: **Faith Hub mobile app can authenticate, read church content, and see their small group. The Reporting System can receive attendance data from a CRM write.**

No shared database. No canonical user. Just an agreed API contract and an outbox event.

### 8.5 Risks and Tradeoffs

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mobile API contract changes post-build | Medium | High | Document and freeze contracts before mobile dev begins |
| Push notification infrastructure delays (Apple APNs cert) | Medium | Medium | Start APNs enrollment immediately; FCM Android is faster |
| Faith Hub DB schema not ready for mobile token storage | Low | Medium | Add device_tokens table as an additive migration |
| Reporting System attendance bridge creates data inconsistency | Medium | Medium | Tag bridged data with `source: 'crm_bridge'` for auditability |

---

## 9. Mid-Term Strategy (May 20 → Q3 2026)

### 9.1 Goals

Following the May 20 milestone, the focus shifts to eliminating the most painful data fragmentation and establishing the foundations of the Unified CRM.

### 9.2 Data Consolidation

**Priority 1: Canonical User Table.** Deploy the `canonical_users` and `user_platform_links` tables in the CRM Core. Run backfill scripts to link existing user records from the Reporting System and Faith Hub by email. Accept that coverage will be imperfect initially — track the reconciliation rate as a metric.

**Priority 2: Event Outbox Activation.** Activate the event outbox pattern across Faith Hub and the CRM. Start consuming events in a CRM Sync Service. Initially, the sync service simply writes to the canonical_users table. Over time, it enriches member profiles.

### 9.3 API Standardization

Introduce a shared API conventions document enforced by code review:

- All endpoints return a standard envelope: `{ success, data, error, meta }`
- All list endpoints support pagination: `{ page, limit, total, items }`
- All write endpoints are idempotent via request key (already enforced in MyHarvestHub — extend to others)
- All timestamps are ISO 8601 UTC
- All IDs are UUIDs

### 9.4 Reporting System Enhancements (Pre-Deadline)

The Reporting System's own roadmap includes several items ready for execution post-deadline:

- Admin-editable config for roles, hierarchy levels, and mappings
- Usher/data-entry role with metric-scoped form access
- Analytical view simplification for non-technical leaders
- Excel/Spreadsheet import for bulk metric entry
- PWA installation notice and optimized onboarding
- Auto-invite with query-parameter deep links

---

## 10. Long-Term Unified Roadmap (Q4 2026 and Beyond)

### 10.1 Full CRM Realization

The Unified CRM is reached when all of the following are true:

- A single login gives a member access to all platforms with role-appropriate access
- Member records are maintained in one canonical store; platforms read from it
- Attendance, discipleship, and engagement data flows automatically into the Reporting System without manual entry
- Pastoral care teams can see a complete member timeline: when they joined, which groups they've been in, their attendance history, their DMHicc campaign activity, and their MyHarvestHub participation
- Church leadership can run cross-platform queries: "show me attendance trends for members who are also active marketplace vendors"

### 10.2 Feature Unification

| Feature | Current Home | Future Home |
|---|---|---|
| Small Groups | Faith Hub + CRM (duplicate) | CRM Core → displayed in Faith Hub |
| Events | Faith Hub (standalone) | CRM Events module → Faith Hub surface |
| Member Profiles | 5 separate systems | CRM Core → federated extensions |
| Reporting Metrics | Reporting System (manual entry) | CRM Core → auto-populated from events |
| Campaign Analytics | DMHicc (isolated) | DMHicc → member engagement in CRM |
| Commerce History | MyHarvestHub (isolated) | Optional link to CRM member profile |

### 10.3 Platform Embedding

Faith Hub becomes a **CRM front-end shell** — a beautifully designed member interface that reads from the CRM Core API. The CRM's admin interfaces (dashboard, analytics, pastoral tools) remain accessible via the web PWA. The mobile app reads from the same CRM Core API as the web, with mobile-specific payload contracts.

### 10.4 Multi-Organization Scalability

The config-driven architecture means the Unified CRM can be deployed for other churches with:
- A different `organization_id` in the config registry
- Custom team/department structure loaded via the org config
- Custom metric definitions
- No code changes

All `organizationId` fields are scaffolded on key entities now to make this future-proofed.

---

## 11. Multiple Approaches

### 11.A — Data Unification Strategy

#### Approach A1: Big Bang Migration (Not Recommended)
**Description:** All five systems' databases are merged into one schema in a single migration event. All user records are reconciled upfront.
**Pros:** Clean architecture immediately; no sync complexity.
**Cons:** Extremely high-risk; requires all systems to be offline simultaneously; existing integrations break; data reconciliation bugs compound; single point of failure for the entire estate.
**Risk:** Very high. A single schema conflict or missed migration could corrupt all systems.
**Recommended Use Case:** Only viable for greenfield deployments or if all platforms were at v0.1 with no production data.

#### Approach A2: Event-Driven Async Federation (Recommended)
**Description:** Each platform maintains its own database. A CRM Sync Service consumes events from an outbox pattern and builds the canonical user record and member timeline incrementally.
**Pros:** Zero risk to existing platforms; gradual; recoverable; reversible; production-safe.
**Cons:** Eventually consistent (not immediately consistent); requires outbox implementation per platform; CRM view of member data will lag by seconds/minutes initially.
**Risk:** Low. Each platform is insulated. The sync service can fail and retry without affecting platform operations.
**Recommended Use Case:** This organization's current state. Recommended as the primary approach.

#### Approach A3: Shared DB with Platform Schemas
**Description:** One PostgreSQL instance, multiple schemas (one per platform). A `canonical` schema houses the shared user table. Platform schemas reference it via foreign key.
**Pros:** ACID guarantees across platforms; no sync lag; simpler queries.
**Cons:** Tight coupling; schema migrations for one platform can block others; requires careful access control at schema level; harder to run platforms independently.
**Risk:** Medium. Suitable once platforms are stable and the team is comfortable with shared-DB operations.
**Recommended Use Case:** Long-term Phase 3 target after federation is proven via Approach A2.

---

### 11.B — Integration Strategy (Standalone → Unified)

#### Approach B1: API Gateway Aggregation
**Description:** A lightweight API gateway (e.g., a new Next.js app or a simple Node service) exposes unified endpoints. Platforms expose internal APIs behind the gateway. The mobile app and future third-party integrations call only the gateway.
**Pros:** Single entry point for all clients; uniform auth; platform internal APIs can evolve independently.
**Cons:** New infrastructure to maintain; adds a network hop; gateway becomes a single point of failure if not properly redundant.
**Risk:** Medium. Well-understood pattern; manageable with existing team skills.
**Recommended Use Case:** Appropriate when three or more platforms need to be consumed by a single client (e.g., the mobile app needing data from Faith Hub, CRM, and Reporting in one request).

#### Approach B2: Direct Platform API Contracts (Recommended for Now)
**Description:** Each platform exposes its own versioned API. The mobile app calls each platform's API directly. No gateway. Integration is at the data layer (via CRM Sync Service) not the API layer.
**Pros:** Simple; no new infrastructure; each platform team owns their API; fastest to implement.
**Cons:** Mobile app must manage multiple auth contexts (though a shared JWT mitigates this); harder to enforce consistent API standards without a central gateway.
**Risk:** Low short-term; medium long-term as the number of consuming clients grows.
**Recommended Use Case:** Now through the May 20 deadline and into mid-term. Graduate to B1 when the mobile app's API call volume justifies a gateway.

#### Approach B3: BFF (Backend for Frontend) per Client Type
**Description:** A dedicated "Backend for Frontend" service per client type (mobile BFF, web BFF). The BFF aggregates data from multiple platforms and returns optimized payloads.
**Pros:** Optimal payloads per client; clean separation; mobile BFF can handle pagination, compression, and FCM all in one place.
**Cons:** Another service to maintain; more complex deployment.
**Risk:** Low technically; medium organizationally (requires discipline to maintain).
**Recommended Use Case:** The natural evolution of Approach B1 when the mobile app's requirements diverge significantly from the web's.

---

### 11.C — Mobile vs. Web Synchronization

#### Approach C1: Server-Sent Events (SSE) for Real-Time
**Description:** The server pushes incremental updates to connected web clients via SSE. Mobile uses WebSocket or polling.
**Pros:** Lightweight; HTTP-native; no special infrastructure; works through proxies.
**Cons:** Unidirectional (server → client only); connection management complexity at scale; mobile battery impact if connections are persistent.
**Risk:** Low.
**Recommended Use Case:** Church announcements, live event updates, real-time attendance dashboards.

#### Approach C2: Polling + Cache-First (Recommended for MVP)
**Description:** Clients poll at defined intervals. Responses are heavily cached. Stale data is served immediately while a fresh fetch runs in the background (stale-while-revalidate).
**Pros:** Simple; robust; no connection management; works offline; already partially implemented in MyHarvestHub's `useSmartResource` pattern.
**Cons:** Not truly real-time; polling frequency must be tuned per endpoint.
**Risk:** Very low.
**Recommended Use Case:** All read operations in the mobile app for the May 20 milestone. The `useSmartResource` pattern from MyHarvestHub should be ported to Faith Hub.

#### Approach C3: WebSockets for Bi-Directional Sync
**Description:** Persistent WebSocket connection between client and server. Both parties can push data.
**Pros:** True real-time; enables collaborative features (live service participation, shared prayer walls).
**Cons:** Connection management at scale is complex; requires infrastructure (Redis pub/sub for multi-instance); significant mobile battery drain if mismanaged.
**Risk:** Medium-High for initial implementation.
**Recommended Use Case:** Phase 3+ features — live service interaction, real-time attendance marking, shared devotional sessions.

---

## 12. Tech Stack & Development Strategy

### 12.1 Consolidated Stack

| Layer | Technology | Platforms | Notes |
|---|---|---|---|
| Web Frontend | Next.js 15, App Router | All platforms | Standardize on App Router across all |
| Mobile Frontend | React Native (inferred) | Faith Hub | Confirm framework with mobile dev |
| UI Components | Ant Design (Reporting), Custom DS (MyHarvestHub/DMHicc) | Mixed | Align Faith Hub and CRM on a shared component library long-term |
| Styling | Tailwind CSS + CSS Variables | All | Standardize token system across platforms |
| State Management | Zustand | MyHarvestHub, DMHicc | Extend to Faith Hub and CRM |
| Backend | Next.js Route Handlers (Node.js) | All | Keep consistent; avoids separate server process |
| Database | PostgreSQL via Prisma | All (DMHicc: pending swap) | Standardized ORM across estate |
| Cache | Upstash Redis | Reporting, MyHarvestHub | Extend to Faith Hub and CRM |
| Auth | JWT (jose) + httpOnly cookies (web), bearer tokens (mobile) | All | Unified JWT structure with canonicalUserId |
| File Storage | Cloudinary | Reporting, MyHarvestHub | Extend to Faith Hub and CRM |
| Email | Resend | Reporting, MyHarvestHub | Extend to all platforms |
| Push (Web) | VAPID / Web Push | MyHarvestHub (existing), Faith Hub (planned) | Shared infrastructure |
| Push (Mobile) | Firebase Cloud Messaging + APNs | Faith Hub mobile | Requires FCM project setup |
| Validation | Zod | MyHarvestHub, Reporting | Extend to all platforms |
| Payments | Paystack | MyHarvestHub | Not required for other platforms initially |

### 12.2 Development Workflow

**Branching:** Feature branches off `main`, PR-based merges, required review before merge to production.

**Environment Structure:**
- `development` — local with mock/seed data
- `staging` — mirrors production, used for integration testing
- `production` — live environment

**Database Migrations:** `prisma migrate dev` in development, `prisma migrate deploy` in staging and production. Never `migrate reset` in staging or production.

**Code Review Standards:** All API endpoint additions must include (a) Zod input validation, (b) role/auth check, (c) idempotency consideration, (d) structured error response.

### 12.3 AI-Assisted Development

The existing systems show evidence of AI-assisted development (detailed architecture logs, ACID compliance documentation, mechanical mock→production swap designs). This approach is endorsed with the following guardrails:

- AI-generated code is always reviewed by a human before merge
- Architecture decisions are documented in a persistent architecture log (each system should maintain its own, as the Reporting System and DMHicc currently do)
- AI assistance is used for boilerplate generation, schema drafting, and test scaffolding — not for security-critical auth logic without human review

---

## 13. Config-Driven System Design (Detailed)

### 13.1 Config Registry Structure

The config system is organized as a hierarchy of namespaced configuration objects, all stored in the database and editable via an Admin Config API:

```
config_registry
├── [org_id].org.hierarchy
│     teams[], departments[], hierarchy_levels[], campus_map[]
│
├── [org_id].roles
│     role_definitions[], permission_grants[], scope_rules[]
│
├── [org_id].metrics
│     metric_definitions[], section_templates[], calculation_rules[]
│
├── [org_id].features
│     feature_flags per platform and role
│
├── [org_id].workflows
│     approval_chains[], notification_triggers[], escalation_rules[]
│
├── [org_id].content
│     labels[], help_text[], email_templates[], notification_copy[]
│
└── [org_id].integrations
      platform_registry[], sync_rules[], event_schema_versions[]
```

### 13.2 Admin-Editable Systems

All of the following must be editable by `SUPER_ADMIN` through a dedicated Admin Config UI without requiring a code deployment:

- Organizational team and department structure
- Hierarchy levels (what constitutes a "campus", a "district", a "global" scope)
- Role definitions and permission grants
- Report metric definitions and section templates
- Reporting goals per campus per metric per period
- Feature toggles (enable/disable features per platform)
- Notification message templates
- Content and label overrides

### 13.3 Dynamic UI Generation

Config-driven UI means that adding a new department to the org structure does not require a UI code change. The pattern already established in the Reporting System (config files driving navigation, roles, and report structure) should be migrated from compiled TypeScript config files to database-backed config, preserving the compiled configs as fallback defaults.

### 13.4 Multi-Tenancy Foundation

Every config record carries an `organization_id`. When the system is deployed for a new church, the organization admin runs a setup wizard that seeds the config registry with their structure. No code is changed. This makes the platform a SaaS offering when the time comes.

---

## 14. Engineering Execution Phases

### Phase 0: Planning & Architecture Finalization (Now → May 1)
**Goals:** Align both developers on architecture before writing integration code. Prevent divergence.

**Deliverables:**
- Mobile API contract documentation (auth, profile, events, groups, media)
- FCM/APNs credentials enrolled and tested
- DMHicc production database migration script drafted (not deployed)
- `event_outbox` table schema agreed and reviewed
- Reporting System attendance bridge API specification written

**Dependencies:** Web developer, mobile developer, access to Apple Developer account and Firebase console.

---

### Phase 1: Short-Term Delivery (May 1 → May 20)
**Goals:** Meet the May 20 deadline with demonstrable mobile progress and reporting integration.

**Deliverables:**
- Faith Hub API: bearer token auth support
- Faith Hub API: FCM device token storage endpoint
- Faith Hub API: 5 frozen mobile API contracts implemented and tested
- Faith Hub PWA: install prompt and mobile optimization
- Reporting System: attendance bridge endpoint (`POST /api/v1/crm-bridge/attendance`)
- DMHicc: production PostgreSQL migration (deploy to staging, validate, then production)
- `event_outbox` table deployed to Faith Hub DB and CRM DB (non-activated, for Phase 2)

**Dependencies:** Phase 0 complete. Mobile developer has agreed API contracts.

---

### Phase 2: Data Unification (June → August 2026)
**Goals:** Introduce canonical user identity and activate event-based sync.

**Deliverables:**
- `canonical_users` and `user_platform_links` tables deployed in CRM Core
- Email-based backfill scripts run against Reporting and Faith Hub DBs (with reconciliation report)
- CRM Sync Service (minimal): consumes outbox events, updates canonical user records
- `event_outbox` activated on Faith Hub and CRM with background worker
- Reporting System: admin-editable config migration (roles, hierarchy, metric definitions)
- Reporting System: usher/data-entry role and scoped metric forms
- Reporting System: Excel/Spreadsheet import

**Dependencies:** Phase 1 complete. CRM Core database provisioned.

---

### Phase 3: CRM Core (September → November 2026)
**Goals:** Build and deploy the Church Fellowship CRM as the canonical member data authority.

**Deliverables:**
- CRM Core fully deployed with all designed features
- Faith Hub small groups module integrated with CRM group data (read-first, then write)
- Member timeline view in CRM (aggregates events from all platforms)
- DMHicc: CRM Sync Service integration (campaign conversions enrich member profiles)
- Admin Config UI for organizational structure, roles, metrics, and feature flags
- Mobile Faith Hub: full feature parity with web Faith Hub

**Dependencies:** Phase 2 complete. CRM Core database and schema stable.

---

### Phase 4: Full Integration (December 2026 → Q1 2027)
**Goals:** Achieve the Unified CRM target state.

**Deliverables:**
- Single sign-on across all platforms (shared JWT, shared canonical user)
- Reporting System: automated metric population from CRM events (reduce manual entry)
- Cross-platform analytics dashboard (pastoral team view: full member timeline)
- MyHarvestHub: optional canonical user link for member commerce identity
- API Gateway introduced for mobile client aggregation
- Multi-organization support validated (deploy for a second church)
- Full config-driven org structure migration complete (zero hardcoded department names)

**Dependencies:** Phase 3 complete. All platforms on versioned API contracts.

---

## 15. Risks & Mitigation

### Technical Risks

| Risk | Description | Mitigation |
|---|---|---|
| Faith Hub mobile API breakage | The web API changes and breaks the mobile contract | Freeze mobile API contracts at v1; use versioning to prevent breakage |
| Event outbox delivery failures | Events are written but not delivered; canonical user records lag | Implement outbox with retry, DLQ, and reconciliation audit table |
| Prisma schema drift between platforms | Each platform evolves its schema independently; canonical user link breaks | Enforce canonical_user_id as a required field in new user records across platforms |
| Redis availability | Upstash Redis failure degrades caching across multiple platforms | Graceful degradation to DB-direct reads is already implemented in MyHarvestHub; extend this pattern |

### Organizational Risks

| Risk | Description | Mitigation |
|---|---|---|
| Scope creep before May 20 | Stakeholders add requirements to the mobile milestone | Freeze scope explicitly. Use this document as the agreed scope boundary. |
| Key person dependency | Web developer or mobile developer is unavailable during critical phases | Document architecture decisions continuously; avoid tribal knowledge |
| Changing organizational structure | Departments are renamed or restructured mid-build | Config-driven architecture specifically mitigates this — structure in DB, not code |
| Low adoption of new systems | Members don't use the CRM or Faith Hub mobile app | Prioritize UX quality; involve church community in beta testing |

### Scope Creep Issues

The following items have appeared in documentation as "future" or "optional" but risk being pulled into current sprints. They must remain explicitly deferred:

- Giving/donations module in Faith Hub (flagged optional — defer to Phase 3+)
- Built-in messaging/calling in CRM (out of scope in the CRM PRD — maintain)
- Social media posting automation in DMHicc (out of scope for MVP — maintain)
- AI-driven predictions and recommendations (appropriate for Phase 4+)
- Payment gateway in DMHicc (donations tracked, payment via external link in MVP — maintain)

---

## 16. Review & Collaboration

### 16.1 For the Mobile Developer

This document assumes React Native for the Faith Hub mobile app but **this needs your explicit confirmation**. The following decisions are yours to validate or override:

**Decision Checkpoint M1:** What is the mobile framework? (React Native, Expo, Flutter?) The answer affects how we implement FCM, deep linking, and offline storage.

**Decision Checkpoint M2:** Is the May 20 scope — auth, profile, events, small groups, media feed — achievable for you given the current state of the API? If not, which features are highest priority to cut?

**Decision Checkpoint M3:** What is your preferred API authentication pattern for mobile? Bearer token in Authorization header is assumed. Confirm or propose an alternative.

**Decision Checkpoint M4:** Offline behavior — what does your implementation plan for offline state look like? The server can provide appropriate cache headers, but the client-side storage strategy is yours to define.

**Areas Where Your Input Will Change the Architecture:**
- If you are using Expo, push notification infrastructure changes significantly (Expo Notifications vs. raw FCM/APNs)
- If you are using a state management approach other than Zustand, the shared data contracts section may need adjustment
- If your offline approach uses a local SQLite store, we should define a formal sync protocol rather than relying on HTTP caching alone

### 16.2 For Organizational Leadership & Stakeholders

This document is your decision-making tool as much as it is a technical guide. The following decisions require your input before development continues:

**Decision Checkpoint O1 — May 20 Scope Approval.** The short-term plan (Section 8) defines what will and will not be built by May 20. Does this match your expectations? If you have unstated requirements for the May 20 demonstration, they must be surfaced now.

**Decision Checkpoint O2 — CRM as Single Source of Truth.** This plan consolidates all member data into one CRM Core. This means departments will lose ownership of "their" member lists in siloed systems. Is the organization ready for this? Who governs the canonical member record?

**Decision Checkpoint O3 — MyHarvestHub Linkage.** The plan proposes an optional link between MyHarvestHub buyer/vendor profiles and CRM member records. Is this desired? Some organizations prefer to keep commerce data separate from pastoral data for privacy reasons.

**Decision Checkpoint O4 — Multi-Church Ambitions.** Section 10.4 describes a path to deploying this platform for other churches. Is this a strategic goal? If yes, it should influence prioritization of the config-driven architecture work.

**What We Need From You:**
- Confirmation or correction of the 5-Purpose reporting template fields (used as the basis for the reporting system metric model)
- List of all active campuses and their reporting hierarchy (fed into the org config)
- Clarity on whether DMHicc campaigns are already running with real users (data migration implications)
- A decision on May 20 scope by May 1 at the latest

---

*Document Version 1.0 | Prepared April 2026 | Sotonye Dagogo | Harvesters International Christian Centre*
*For internal use only. Contact the web development team with questions or corrections.*
