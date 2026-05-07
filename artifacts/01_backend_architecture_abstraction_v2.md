# Harvesters Digital Estate
## Backend Architecture Abstraction, Data Model Inventory & Consolidation Strategy
### Version 2.0 — May 2026 | Based on Real Prisma Schemas

---

> **Revision Note:** v2.0 supersedes the inferred v1.0. Every model, field, enum, and pattern in this document is derived directly from the actual committed Prisma schema files for report-sys, MyHarvestHub, and DMHicc. Divergences from v1.0 assumptions are explicitly flagged.

---

## PART ONE: REAL SCHEMA ABSTRACTIONS

---

### 1. REPORTING SYSTEM (report-sys)

**35 models | 32 enums | ID strategy: `uuid()` | Table naming: `snake_case` via `@@map`**

#### 1.1 Identity & Org Hierarchy

```
User (users)
  id                    uuid — primary identity
  organisationId        String? — multi-tenancy scope (env-driven, nullable)
  email                 String @unique
  pendingEmail          String? @unique — email change pending state
  emailVerifiedAt       DateTime?
  emailVerificationSentAt / pendingEmailRequestedAt / pendingEmailSentAt — full audit trail
  passwordHash          String
  firstName / lastName  String
  phone                 String?
  gender                Gender? (MALE | FEMALE | PREFER_NOT_TO_SAY)
  role                  UserRole @default(MEMBER)
  campusId              String? → Campus
  orgGroupId            String? → OrgGroup
  avatar / avatarUrl    String? — dual field (legacy + new)
  isActive              Boolean

OrgGroup (org_groups)          — top-level org unit
  id / name / description / country / leaderId / isActive
  → children: Campus[], User[], Report[], Goal[]

Campus (campuses)              — mid-level, always under an OrgGroup
  id / name / description / parentId → OrgGroup / adminId → User
  country / location / address / phone / memberCount / inviteCode / isActive
  → children: User[], Report[], Goal[], MetricEntry[]
```

**`UserRole` enum (12 values — the most domain-specific in the estate):**
`SUPERADMIN | SPO | CEO | CHURCH_MINISTRY | GROUP_PASTOR | GROUP_ADMIN | CAMPUS_PASTOR | CAMPUS_ADMIN | DATA_ENTRY | MEMBER | OFFICE_OF_CEO | USHER`

> **Key finding:** This is a bespoke pastoral role hierarchy — it cannot be mapped 1:1 to the other systems' role enums. The Canonical Identity Service must treat these as *platform-specific roles*, not as universal roles.

#### 1.2 Reporting Core

The reporting stack is the most sophisticated domain model in the entire estate. It uses a three-layer template→report→metric structure:

```
ReportTemplate (report_templates)
  organisationId / name / description / version / isActive / isDefault
  deadlineOffsetHours / deadlinePolicy (PERIOD_START|PERIOD_MIDDLE|PERIOD_END|AFTER_PERIOD_HOURS)
  recurrenceFrequency / recurrenceDays / autoFillTitleTemplate
  → sections: ReportTemplateSection[]

ReportTemplateSection (report_template_sections)
  templateId / name / description / order / isRequired / correlationGroup
  → metrics: ReportTemplateMetric[]

ReportTemplateMetric (report_template_metrics)
  sectionId / name / description
  fieldType (NUMBER|PERCENTAGE|TEXT|CURRENCY)
  calculationType (SUM|AVERAGE|SNAPSHOT)
  isRequired / minValue / maxValue / order
  capturesGoal / capturesAchieved / capturesYoY  — three-mode metric capture
  correlationGroup  — groups metrics for Pearson correlation analytics

Report (reports)
  organisationId? / title? / templateId / templateVersionId?
  campusId / orgGroupId / period?
  periodType (WEEKLY|MONTHLY|YEARLY) / periodYear / periodMonth? / periodWeek?
  status (DRAFT|SUBMITTED|REQUIRES_EDITS|APPROVED|REVIEWED|LOCKED)
  createdById / submittedById / reviewedById / approvedById
  deadline / lockedAt / isDataEntry / dataEntryById / dataEntryDate
  notes / autoCreated

  ⚠️  NO source/externalRef fields — the CAS bridge must add these as an additive migration.

ReportSection (report_sections)       — instantiated from ReportTemplateSection per report
ReportMetric (report_metrics)         — instantiated from ReportTemplateMetric per section
  monthlyGoal / monthlyAchieved / yoyGoal / computedPercentage
  isLocked / lockedAt / lockedById / comment

MetricEntry (metric_entries)          — flat historical store (campus × metric × year × month)
  Separate from ReportMetric — acts as the analytics rollup table
```

#### 1.3 Workflow & Governance

```
ReportEdit (report_edits)             — post-submission edit requests
  status (DRAFT|SUBMITTED|APPROVED|REJECTED)
  reason / sections (Json snapshot) / reviewedById / reviewNotes

ReportUpdateRequest (report_update_requests)
  Separate from ReportEdit — initiated by higher-level roles to unlock reports

ReportEvent (report_events)           — full audit event log per report
  eventType enum (18 values incl. AUTO_APPROVED, UNLOCKED, DATA_ENTRY_CREATED)
  previousStatus / newStatus / snapshotId

ReportVersion (report_versions)       — full JSON snapshots at each status change
  versionNumber / snapshot (Json) / reason

Goal (goals)
  campusId / orgGroupId? / templateId? / templateMetricId
  mode (ANNUAL|MONTHLY|CAMPUS_OVERRIDE)
  year / month? / targetValue
  isLocked / lockedAt / lockedById
  @@unique([campusId, templateMetricId, year, mode, month])

GoalEditRequest (goal_edit_requests)  — formal workflow to change locked goals
  proposedValue / status (PENDING|APPROVED|REJECTED)
```

#### 1.4 Supporting Infrastructure

```
AdminConfigEntry (admin_config_entries)   — THE config substrate
  namespace / version / payload (Json) / isFallback / actorId / notes
  @@index([namespace, version])          — versioned, auditable config records
  NOTE: No orgId field — relies on namespace scoping for multi-tenancy

FormAssignment (form_assignments)         — granular data-entry delegation
  reportId / assigneeId / assignedById / metricIds (String[])
  dueAt / completedAt / cancelledAt / ruleId / periodKey

FormAssignmentRule (form_assignment_rules) — standing rules that auto-create assignments
  templateId / role? / assigneeId? / campusId? / orgGroupId?
  metricIds (String[]) / cadenceOverride (Json?) / isActive

ImportJob (import_jobs)                   — spreadsheet import pipeline
  status (DRAFT|FILE_UPLOADED|MAPPED|VALIDATED|COMMITTED|FAILED|CANCELLED)
  fileName / fileMime / fileBytes / storageRef
  mapping (Json) / validationSummary (Json) / commitSummary (Json)

ImportJobItem (import_job_items)          — per-row outcome tracking
  rowIndex / rawValues / normalizedValues / outcome (OK|WARNING|ERROR|COMMITTED)

ImportMappingProfile (import_mapping_profiles)  — reusable column mappings

MediaAsset (media_assets)                 — Cloudinary asset lifecycle state machine
  domain (BUG_REPORT_SCREENSHOT — only domain so far, extensible)
  state (TEMP|READY|DISCARDED|DELETE_PENDING|DELETED|FAILED)
  provider (CLOUDINARY|LEGACY_URL)
  publicId / secureUrl / resourceType / format / bytes / width / height

AssetUploadSession (asset_upload_sessions)  — manages upload flow
  mode (DEFERRED_SUBMIT|PREUPLOAD_DRAFT)
  state (OPEN|TEMP_UPLOADED|FINALIZED|DISCARDED|EXPIRED)
  idempotencyKey — prevents duplicate upload sessions

AssetLifecycleEvent (asset_lifecycle_events)  — audit trail for every asset state change

BulkInviteBatch (bulk_invite_batches)     — batch invite operations with counters
InviteLink (invite_links)                 — typed invite links (CAMPUS|GROUP|DIRECT)
ImpersonationSession/Event               — superadmin role impersonation with full audit
UserActivationToken (user_activation_tokens)
PwaPromptDismissal (pwa_prompt_dismissals)
EmailActionToken (email_action_tokens)    — token-based email verification/change flow
```

#### 1.5 Critical Observations

- **Most mature audit trail in the estate.** `ReportEvent`, `ReportVersion`, `AssetLifecycleEvent`, and `ImpersonationEvent` together constitute a production-grade, court-admissible audit log. This pattern should be the standard for CAS.
- **`AdminConfigEntry` uses `namespace + version`** not `namespace + key`. This is an append-only log approach (each change creates a new row, highest version wins). Fundamentally different from a key-value store — reading config requires `ORDER BY version DESC LIMIT 1` per namespace.
- **`correlationGroup` on `ReportTemplateMetric`** enables the Pearson correlation analytics. This is a clever normalised approach — correlation is defined at template design time, not hardcoded.
- **`MetricEntry` is the analytics rollup table** — reports are mutable, but once a period closes, the achieved values are snapshotted here. CAS attendance data should write into MetricEntry-compatible rows, not into the mutable Report/ReportMetric hierarchy.
- **No EventOutbox.** Zero. None. None of the three systems have one. This is the most critical missing infrastructure piece across the entire estate.
- **`Campus` as a model (not enum).** Unlike MyHarvestHub which hardcodes campuses as an enum (33 values), report-sys correctly uses a relational Campus model. This is the right approach and is what the CIS should reference.

---

### 2. MYHARVESTHUB (harvesthub-reboot)

**33 models | 36 enums | ID strategy: `cuid()` | Table naming: `snake_case` via `@@map`**

#### 2.1 Identity Model (Split Architecture)

MyHarvestHub uses a **three-table identity split** which is the most structurally unusual pattern in the estate:

```
User (users)                    — authentication + core identity
  id (cuid) / email @unique / password (NOTE: not passwordHash — field name differs)
  firstName / lastName / phoneNumber
  role (ADMIN|VENDOR|BUYER) / profilePicture
  emailVerified / isActive / status (ACTIVE|INACTIVE|BANNED)
  resetToken / resetTokenExpiry                      — password reset
  emailVerificationToken / emailVerificationExpiry   — email verify
  registrationSequence Int?                          — milestone tracking

Buyer (buyers)                  — buyer-specific profile extension
  userId @unique → User
  dateOfBirth / gender (MALE|FEMALE|OTHER) / preferences (Json)
  → cart, orders, reviews, bookings, availabilityRequests

Vendor (vendors)                — vendor-specific profile extension
  userId @unique → User
  storeName / storeDescription / category (VendorCategory)
  whatsappNumber / campus (Campus enum!) / position (Position enum)
  status (PENDING|APPROVED|REJECTED|SUSPENDED) / isChurchAffiliated
  commissionRate / storeLogo / storeBanner
  businessVerification (Json) / storeSettings (Json)
  Denormalized analytics: totalSales, totalOrders, totalProducts,
                          averageRating, totalReviews, conversionRate
```

> **Key finding — `password` vs `passwordHash`:** MyHarvestHub uses `password` as the field name while report-sys and DMHicc use `passwordHash`. This is a naming divergence that must be normalised in the canonical user model. The underlying hashing algorithm (bcrypt) is the same; only the field name differs.

> **Key finding — `Campus` as hardcoded enum:** MyHarvestHub hardcodes 34 campus names as an enum value on the `Vendor` model. This creates a breaking migration every time a new campus opens. The CIS org config must own campus definitions; MyHarvestHub's `campus` field should become a `String` referencing the canonical campus code.

> **Key finding — `Position` enum:** MyHarvestHub carries church positional data (`MEMBER | NON_MEMBER | WORKER | HOD | ... | DISTRICT_PASTOR`) directly on the vendor record. This is the clearest evidence of church-identity leaking into the commerce domain. In the unified system, this should come from the CIS member profile, not be stored independently in MyHarvestHub.

#### 2.2 Commerce Domain

```
Product (products)
  vendorId / name / description / category (ProductCategory — 80+ values)
  price / compareAtPrice / discount / stock / images (String[]) / mainImage
  variants (Json) / tags (String[]) / isActive / isFeatured
  views / sales / averageRating / totalReviews   — denormalized counters
  listingType (PRODUCT|SERVICE) / serviceDetails (Json)

Cart (carts) → CartItem (cart_items)
  Per-buyer cart, subtotal maintained, unique per (cartId, productId)

Order (orders)
  orderNumber String @unique
  buyerId → Buyer / vendorId → Vendor
  status (8 values: PENDING→DELIVERED + CANCELLED + REFUNDED)
  subtotal / deliveryFee / total
  paymentStatus (PENDING|PAID|FAILED|REFUNDED)
  paymentMethod (WALLET|BANK_TRANSFER|BANK_TRANSFER_PROOF|CARD|USSD)
  deliveryMethod (PICKUP|DELIVERY)
  deliveryAddress (Json) / pickupDetails (Json)
  statusHistory (Json @default("[]")) — embedded audit trail

OrderItem (order_items)
  Denormalized: productName + productImage captured at order time (correct pattern)

Wallet (wallets) → Transaction (transactions)
  balanceBefore / balanceAfter — ✅ critical double-entry safety pattern
  reference String @unique — idempotency key for payment operations
  type (DEPOSIT|WITHDRAWAL|PAYMENT|REFUND|COMMISSION|PAYOUT)

ProofOfTransfer (proof_of_transfers)   — manual bank transfer evidence
Review (reviews) → ReviewVote (review_votes)
Booking (bookings)                     — service bookings with time slots
ProductAvailabilityRequest             — buyer→vendor availability enquiry
```

#### 2.3 Advertising & Content

```
Banner (banners)
  position (TOP|HERO|SIDEBAR) / theme (BUSINESS|CHURCH|EVENT|PROMOTION)
  targetAudience UserRole[] — role-filtered banner display
  clickCount / impressionCount — engagement tracking

AdApplication (ad_applications)       — external ad request workflow
Advertisement (advertisements)        — live ad with impression/click tracking
AdvertiserPayment (advertiser_payments)
AdRateConfig                          — singleton config for ad pricing

VendorContent (vendor_content)         — vendor-submitted media, moderated
  type (IMAGE|VIDEO|TEXT|PROMO_BANNER)
  status (PENDING|APPROVED|REJECTED|ACTIVE|EXPIRED)

PublicContent (public_content)         — CMS-lite, slug-based

Voucher (vouchers) → VoucherRedemption (voucher_redemptions)
UserMilestone (user_milestones)        — gamification (first 1000 vendors, etc.)
```

#### 2.4 Config Infrastructure

```
CommerceLifecycleConfig                — ✅ single-row config pattern
  key String @unique @default("default")
  autoConfirmEnabled / autoConfirmHours (48h)
  refundWindowHours (72h) / withdrawalSettlementHoldHours (72h)
  paymentsEnabled / commissionDefaultRate / commissionPremiumRate
  minOrderAmount / maxBookingAdvanceDays

CommissionConfig                       — per-VendorCategory commission rates
```

> **Key finding — `CommerceLifecycleConfig`:** This is the most config-driven model in the estate. It correctly externalises all commerce timing and rate parameters. This pattern is what CAS's `AdminConfig` should emulate for session timing, health scoring weights, etc. The report-sys `AdminConfigEntry` table is the more general-purpose version of the same concept.

#### 2.5 Supporting Infrastructure

```
PushSubscription (push_subscriptions)    — Web Push VAPID endpoint + keys
NotificationPreference (notification_preferences)
EmailDeliveryLog (email_delivery_logs)   — ✅ retry/backoff pattern with nextRetryAt
BugReport (bug_reports)                  — lightweight, no asset linkage (unlike report-sys)
```

> **Key finding — `EmailDeliveryLog`:** MyHarvestHub is the only system with a proper email delivery retry log. Report-sys and DMHicc fire-and-forget via Resend. This pattern should be standardised across all platforms and is the right model for the CAS outbox worker.

---

### 3. DMHICC (cmpgn-mgmt)

**17 models | 14 enums | ID strategy: `cuid()` | Table naming: none (Prisma default)**

#### 3.1 Identity

```
User
  id (cuid) / email @unique / passwordHash
  firstName / lastName / role (USER|TEAM_LEAD|ADMIN|SUPER_ADMIN)
  profilePicture / whatsappNumber / campus (String — not typed)
  teamId → Team / trustScore Int @default(100)
  isActive / weaponsOfChoice SocialPlatform[]  — preferred social platforms

TrustScore                             — separate trust record per user
  score Int @default(100) / flags TrustFlag[] / lastReviewedAt
```

#### 3.2 Team Hierarchy (Internal to DMHicc)

```
Group → Team → User
  Group: name / description / maxTeams(4)
  Team: name / groupId / teamLeadId? / maxMembers(10) / TeamInviteLink[]
  TeamInviteLink: token @unique / targetRole / usedCount / maxUses(50) / expiresAt
```

> **Key finding:** DMHicc has its own Group→Team→User hierarchy completely separate from report-sys's OrgGroup→Campus→User hierarchy and MyHarvestHub's flat user model. All three systems model the church's organizational structure differently. The CIS must treat all of these as *platform-specific organizational contexts*, not attempt to unify them prematurely.

#### 3.3 Campaign & Engagement Engine

```
Campaign
  title / description (Text) / content (Text) / media (Json[])
  mediaType / mediaUrl / thumbnailUrl / ctaText / ctaUrl
  createdById → User / status (DRAFT|ACTIVE|PAUSED|COMPLETED|ARCHIVED)
  goalType (SHARES|CLICKS|REFERRALS|DONATIONS|PARTICIPANTS)
  goalTarget / goalCurrent / startDate / endDate / targetAudience (String[])
  publishedAt / metaTitle / metaDescription / metaImage   — SEO fields
  viewCount / clickCount / shareCount / likeCount / participantCount
  isMegaCampaign / parentCampaignId → Campaign (self-relation: sub-campaigns)
  bankAccountIds (String[])   — for donation attribution

CampaignParticipation               — junction: User ↔ Campaign
  @@unique([userId, campaignId])

SmartLink
  slug String @unique / userId / campaignId
  originalUrl / clickCount / uniqueClickCount / conversionCount
  isActive / isExpired / expiresAt
  @@unique([userId, campaignId])    — one link per user per campaign

LinkEvent                           — ⚠️ SCHEMA EVOLUTION WARNING
  linkId → SmartLink.id / smartLinkId String? (redundant nullable field)
  eventType LinkEventType / type LinkEventType? (duplicate nullable field)
  slug String?                      — denormalized for query performance
  ipAddress / ipHash / userAgent / referrer / referer (duplicate!) / country
  NOTE: linkId is the active FK; smartLinkId, type, referer are legacy aliases

Referral
  inviterId / inviteeId / campaignId / slug
  @@unique([inviteeId, slug])       — prevents double-counting referrals

Donation
  userId / campaignId / amount Decimal(12,2) — ✅ correct financial type
  currency / status (6 values) / reference @unique
  proofScreenshotUrl / verifiedById / verifiedAt

PointsLedgerEntry
  userId / campaignId? / type (IMPACT|CONSISTENCY|LEADERSHIP|RELIABILITY)
  value Int / description / referenceId

LeaderboardSnapshot
  userId / campaignId? / period / rank Int / score Int
  Per-user-per-period snapshot (not a JSON blob of all rankings)

ViewProof
  userId / campaignId / smartLinkId / platform SocialPlatform
  screenshotUrl / viewCount / status (PENDING|APPROVED|REJECTED)
  reviewedById / reviewedAt / notes

CampaignAuditEvent
  campaignId / actorId / actorRole / eventType (7 values)
  before (Json) / after (Json) / note
```

#### 3.4 Critical Observations

- **`LinkEvent` schema evolution debt.** The model has `linkId`+`smartLinkId`, `eventType`+`type`, `referrer`+`referer` — three pairs of effectively duplicate fields. This is the footprint of a mid-build schema change that wasn't cleaned up. The production migration to PostgreSQL is the right moment to run a cleanup migration that removes the legacy aliases.
- **`Donation.amount` uses `Decimal(12,2)`.** Correct. Matches MyHarvestHub's wallet transaction precision. Both systems handle money right.
- **No table-level `@@map` directives.** DMHicc is the only system without explicit table name mappings. Prisma will use PascalCase model names as table names by default (e.g., `User`, `Campaign`). This is inconsistent with report-sys and MyHarvestHub which both use `snake_case` mapped names. When the CIS schema is created, it should use `@@map` consistently.
- **No `organisationId` scope.** DMHicc has no org scoping at all. All campaign data is effectively global. Adding `organisationId` before production deployment is essential.

---

## PART TWO: AUTHORITATIVE CROSS-SYSTEM COMPARISON

### 2.1 Identity Field Matrix (Actual vs. Inferred)

| Field | report-sys | myharvesthub | dmhicc | CIS Target |
|---|---|---|---|---|
| Primary key type | `uuid()` | `cuid()` | `cuid()` | `uuid()` |
| email | `@unique` | `@unique` | `@unique` | `@unique` — anchor |
| password field name | `passwordHash` | `password` | `passwordHash` | `passwordHash` |
| firstName/lastName | ✅ split | ✅ split | ✅ split | ✅ split |
| phone | `phone String?` | `phoneNumber String` | `whatsappNumber String?` | `phone` + `whatsappNumber` |
| gender enum | MALE/FEMALE/PREFER_NOT_TO_SAY | MALE/FEMALE/OTHER | ❌ absent | MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY |
| campus | `campusId → Campus (model)` | `campus Campus (enum!)` | `campus String?` | `campusCode String?` → CIS Campus |
| org scope | `organisationId String?` | ❌ none | ❌ none | `organisationId String` (required) |
| role model | 12-value domain enum | 3-value commerce enum | 4-value campaign enum | Platform-specific, stored in CIS link |
| Status field | `isActive Boolean` | `status UserStatus + isActive` | `isActive Boolean` | `status CanonicalStatus` |
| canonicalUserId | ❌ missing | ❌ missing | ❌ missing | Is the primary key |
| Push tokens | ❌ none | `PushSubscription (Web Push)` | ❌ none | CAS adds FCM; unified in CIS |
| Email verify pattern | `emailVerifiedAt DateTime?` | `emailVerified Boolean` | ❌ inferred | `emailVerifiedAt DateTime?` |

### 2.2 Enum Divergences That Create Consolidation Risk

**`UserRole` — three incompatible enums:**
- report-sys: 12 pastoral/operational roles (SUPERADMIN through USHER)
- myharvesthub: 3 commerce roles (ADMIN, VENDOR, BUYER)
- dmhicc: 4 campaign roles (USER, TEAM_LEAD, ADMIN, SUPER_ADMIN)

These enums serve completely different purposes and **must not be merged**. The CIS stores platform-specific roles as `String[]` on the `user_platform_links` record. Each platform retains its own `UserRole` enum unchanged.

**`Gender` — two incompatible values for the same concept:**
- report-sys: `PREFER_NOT_TO_SAY`
- myharvesthub: `OTHER`

The canonical `Gender` enum should include both: `MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY`.

**`NotificationType` — three entirely separate enum sets with zero overlap.** This is correct and expected — notification types are domain-specific. No unification needed.

**`Campus` — model vs. enum vs. string:**
The critical divergence. report-sys is correct (relational `Campus` model). MyHarvestHub's enum approach hardcodes 34 campuses and requires a migration every time a campus is added. DMHicc's `campus String?` is the worst — untyped and unvalidated. The CIS org config owns the canonical campus list; platforms reference campus codes.

### 2.3 What Every Platform Is Missing

| Gap | report-sys | myharvesthub | dmhicc |
|---|---|---|---|
| `canonicalUserId` on User | ❌ | ❌ | ❌ |
| `organisationId` scope | Partial (nullable) | ❌ | ❌ |
| EventOutbox table | ❌ | ❌ | ❌ |
| `@@map` table naming | ✅ complete | ✅ complete | ❌ missing |
| Config-driven architecture | ✅ `AdminConfigEntry` | ✅ `CommerceLifecycleConfig` | ❌ none |
| Email retry log | ❌ | ✅ `EmailDeliveryLog` | ❌ |
| Balance safety (before/after) | N/A | ✅ | N/A |

### 2.4 What Each Platform Does Exceptionally Well (Worth Replicating)

**report-sys:**
- Full versioned audit trail (`ReportEvent` + `ReportVersion` + `AssetLifecycleEvent` + `ImpersonationEvent`)
- `AdminConfigEntry` as append-only versioned config log — more auditable than a mutable key-value store
- `ImportJob` pipeline with row-level outcome tracking — the right pattern for any bulk data operation
- `FormAssignmentRule` — standing automation rules that auto-create assignments, eliminating repetitive admin work

**myharvesthub:**
- `Transaction.balanceBefore` / `balanceAfter` — double-entry safety, prevents silent balance corruption
- `CommerceLifecycleConfig` — single-row config with sensible defaults, the cleanest config pattern in the estate
- `EmailDeliveryLog` with `nextRetryAt` and `attempts` — proper async delivery with backoff
- `OrderItem` denormalized `productName` + `productImage` — correct pattern, order history doesn't break when product is deleted
- `registrationSequence` on User — elegant milestone tracking without a separate counter table

**dmhicc:**
- `SmartLink.@@unique([userId, campaignId])` — prevents duplicate links at the DB level, not just application level
- `Referral.@@unique([inviteeId, slug])` — prevents double-counted referrals at the DB level
- `CampaignAuditEvent` with `before`/`after` JSON diff — portable audit pattern that CAS should replicate
- `TrustScore` as a separate model — concerns correctly separated from the User model

---

## PART THREE: THE CANONICAL IDENTITY SERVICE (CIS) — AUTHORITATIVE DESIGN

### 3.1 Schema

Based on the real field analysis, the CIS schema is now precisely specified:

```prisma
// Database: harvesters_canonical (separate PostgreSQL instance or schema)
// Table naming: snake_case via @@map throughout

generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"
}

model CanonicalUser {
  id              String   @id @default(uuid())
  organisationId  String   @default("harvesters-org-prod")

  // Core identity — email is the immutable reconciliation anchor
  email           String   @unique
  emailVerifiedAt DateTime?
  phone           String?              // normalised: +2348012345678
  whatsappNumber  String?              // may differ from phone
  firstName       String
  lastName        String
  gender          CanonicalGender?
  profilePicture  String?

  // Church-specific identity (from CRM when available)
  campusCode      String?              // references CIS Campus.code
  churchPosition  String?              // from Position enum, stored as String

  // Lifecycle
  status          CanonicalStatus  @default(ACTIVE)
  mergedIntoId    String?          // for deduplication: points to surviving record
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relations
  platformLinks   UserPlatformLink[]
  orgMemberships  OrgMembership[]
  auditLog        CisAuditLog[]

  @@index([email])
  @@index([phone])
  @@index([organisationId, status])
  @@map("canonical_users")
}

enum CanonicalStatus { ACTIVE INACTIVE SUSPENDED MERGED }
enum CanonicalGender { MALE FEMALE OTHER PREFER_NOT_TO_SAY }

model Platform {
  id             String   @id @default(uuid())
  name           String   @unique  // 'report_sys' | 'myharvesthub' | 'dmhicc' | 'cas' | 'faithhub' | 'crm'
  displayName    String
  apiKeyHash     String             // bcrypt hash of the platform's API key
  webhookSecret  String             // HMAC secret for event verification
  baseUrl        String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  links          UserPlatformLink[]
  events         EventOutbox[]

  @@map("platforms")
}

model UserPlatformLink {
  id                String   @id @default(uuid())
  canonicalUserId   String
  platformId        String
  platformUserId    String   // The id in that platform's own DB
  platformEmail     String?  // Email as known by that platform (may differ during migration)
  platformRoles     String[] @default([])   // e.g. ["CAMPUS_ADMIN"] or ["VENDOR", "BUYER"]
  linkedAt          DateTime @default(now())
  delinkedAt        DateTime?  // soft delete — never hard delete

  canonicalUser CanonicalUser @relation(fields: [canonicalUserId], references: [id])
  platform      Platform      @relation(fields: [platformId], references: [id])

  @@unique([platformId, platformUserId])
  @@unique([canonicalUserId, platformId])    // one link per user per platform
  @@index([canonicalUserId])
  @@index([platformId, platformEmail])
  @@map("user_platform_links")
}

// Canonical campus/org structure — owned by CIS, read by all platforms
model OrgUnit {
  id          String      @id @default(uuid())
  orgId       String      @default("harvesters-org-prod")
  type        OrgUnitType
  code        String      @unique   // e.g. "GBG", "LND", "PHC"
  name        String
  country     String
  parentId    String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  parent      OrgUnit?    @relation("OrgTree", fields: [parentId], references: [id])
  children    OrgUnit[]   @relation("OrgTree")
  memberships OrgMembership[]

  @@index([orgId, type, isActive])
  @@map("org_units")
}

enum OrgUnitType { GLOBAL ORG_GROUP CAMPUS DISTRICT ZONE }

model OrgMembership {
  id              String   @id @default(uuid())
  canonicalUserId String
  orgUnitId       String
  role            String   // freeform, platform-specific context
  since           DateTime @default(now())
  until           DateTime?

  canonicalUser CanonicalUser @relation(fields: [canonicalUserId], references: [id])
  orgUnit       OrgUnit       @relation(fields: [orgUnitId], references: [id])

  @@index([canonicalUserId, orgUnitId])
  @@map("org_memberships")
}

// THE most critical missing piece across the entire estate
model EventOutbox {
  id              String       @id @default(uuid())
  platformId      String
  eventType       String       // e.g. 'cas.attendance.session_completed'
  eventVersion    String       @default("1.0")
  payload         Json
  targetEndpoints String[]     // Which systems should receive this event
  status          OutboxStatus @default(PENDING)
  retries         Int          @default(0)
  maxRetries      Int          @default(5)
  lastError       String?
  idempotencyKey  String       @unique  // Prevents duplicate delivery
  createdAt       DateTime     @default(now())
  deliveredAt     DateTime?
  deadAt          DateTime?    // Set when retries exhausted

  platform Platform @relation(fields: [platformId], references: [id])

  @@index([status, retries, createdAt])
  @@index([platformId, createdAt])
  @@map("event_outbox")
}

enum OutboxStatus { PENDING IN_FLIGHT DELIVERED FAILED DEAD }

model CisAuditLog {
  id              String   @id @default(uuid())
  canonicalUserId String?
  actorPlatformId String?
  action          String
  entity          String
  entityId        String
  before          Json?
  after           Json?
  requestId       String?
  createdAt       DateTime @default(now())

  canonicalUser CanonicalUser? @relation(fields: [canonicalUserId], references: [id])

  @@index([canonicalUserId, createdAt])
  @@index([entity, entityId])
  @@map("cis_audit_log")
}
```

### 3.2 CIS API Surface

```
Authentication: X-Platform-API-Key header (bcrypt-verified against Platform.apiKeyHash)

POST   /api/cis/users/link              Link or create canonical user from platform registration
GET    /api/cis/users/by-email          Lookup canonical user + all platform links by email
GET    /api/cis/users/by-phone          Lookup by phone (normalised E.164)
GET    /api/cis/users/:id               Get canonical user + links + org memberships
PUT    /api/cis/users/:id               Update canonical profile fields
POST   /api/cis/users/:id/merge         Merge duplicate records (SUPER_ADMIN only)

GET    /api/cis/org/units               List org units (campus list for all platforms)
GET    /api/cis/org/units/:code         Get single campus/zone by code

POST   /api/cis/events                  Receive EventOutbox record from a platform worker
GET    /api/cis/events/pending          Poll pending events for delivery (internal worker)
PUT    /api/cis/events/:id/status       Mark delivered/failed

GET    /api/cis/health                  System health
```

---

## PART FOUR: SHORT-TERM CONSOLIDATION PLAN (8 WEEKS)

### Week 1–2: Foundation

**Action 1 — Deploy CIS schema.**
Create `harvesters_canonical` PostgreSQL database. Run the CIS Prisma migrations. Register all five platforms (report_sys, myharvesthub, dmhicc, cas, faithhub) in the `platforms` table. Generate API keys. Store hashed keys.

**Action 2 — Add `EventOutbox` to each platform schema.**
This is the single most important additive migration across the estate. Zero risk — it's a new table. Schema change per platform:

```prisma
// Add to report_sys, myharvesthub, dmhicc schemas
model EventOutbox {
  id             String   @id @default(uuid())   // uuid() to match each platform's convention
  eventType      String
  eventVersion   String   @default("1.0")
  payload        Json
  cisIdempotencyKey String @unique               // Forward to CIS on delivery
  status         String   @default("PENDING")
  retries        Int      @default(0)
  maxRetries     Int      @default(5)
  lastError      String?
  createdAt      DateTime @default(now())
  deliveredAt    DateTime?

  @@index([status, retries, createdAt])
  @@map("event_outbox")
}
```

**Action 3 — Email backfill script (idempotent).**
Run per platform. Matches by email, creates canonical user + platform link. Log reconciliation rate.

### Week 3–4: Platform Integration Points

**Action 4 — Add `canonicalUserId` to each platform's User model.**
Additive migration — nullable initially:

```prisma
// Add to User in each platform
canonicalUserId  String?   // UUID from CIS — nullable during transition
@@index([canonicalUserId])
```

**Action 5 — report-sys: Add `source` and `externalRef` to `Report`.**
This enables the CAS bridge to tag auto-populated reports:

```prisma
// Add to Report model in report_sys
source      String?    // 'manual' | 'cas_sync' | 'import' | 'api'
externalRef String?    // CAS AttendanceSession.id for cas_sync records
```

**Action 6 — report-sys: Add `AdminConfigEntry` for `cas_metric_mapping` namespace.**
Seed with the default metric key mapping (attendanceCount → cell_attendance_count, etc.).

**Action 7 — dmhicc: Add `@@map` directives and `organisationId`.**
Two additive changes that align DMHicc with the estate standard:

```prisma
// Add to all DMHicc models
@@map("snake_case_name")

// Add to User and Campaign in DMHicc
organisationId  String  @default("harvesters-org-prod")
```

**Action 8 — myharvesthub: `campus` field migration.**
Change `campus Campus` (enum) to `campusCode String?` on Vendor. Dual-write during transition.

### Week 5–6: CAS Integration (New System — Day-One Compliant)

CAS is built with the CIS from day one. Every registration calls CIS. Every session submission writes to `EventOutbox`. The report-sys bridge endpoint is implemented and validated. See CAS PRD v2.0 for full detail.

### Week 7–8: Outbox Worker Activation

Deploy the EventOutbox background worker as a Vercel Cron job on each platform. Initial delivery frequency: every 5 minutes. Implement retry with exponential backoff. Alert on `DEAD` status records.

---

## PART FIVE: LONG-TERM FEDERATION ROADMAP

### Phase A — Shared JWT (Month 3)

Introduce a shared HMAC secret stored in the CIS. Platforms issue JWTs that include `canonicalUserId`. Any platform that receives a JWT with a canonical ID it doesn't recognise calls `GET /api/cis/users/:id` to resolve the identity. This enables cross-platform single sign-on without a full identity provider.

```typescript
// Shared JWT payload structure
interface HarvestersJWT {
  sub: string;              // canonicalUserId (UUID)
  email: string;
  firstName: string;
  lastName: string;
  orgId: string;
  platformRoles: {
    platform: string;       // 'report_sys' | 'myharvesthub' | etc.
    roles: string[];        // Platform-specific role values
  }[];
  iat: number;
  exp: number;
}
```

### Phase B — Reporting Auto-Population (Month 4–5)

The CAS EventOutbox worker fires `cas.attendance.session_completed` events. The report-sys bridge handler receives them and writes to `MetricEntry` (the analytics rollup table) rather than the mutable `Report`/`ReportMetric` hierarchy. This keeps CAS data in the correct read-optimised store while leaving the report approval workflow intact.

### Phase C — Schema Convergence (Month 6–9)

- DMHicc `LinkEvent` cleanup migration: drop `smartLinkId`, `type`, `referer` legacy aliases
- MyHarvestHub `Campus` enum → `campusCode String?` migration complete
- report-sys `AdminConfigEntry` schema extended with `orgId` for true multi-tenancy
- All platforms have `canonicalUserId` as a NOT NULL field (after backfill confirmed 100%)

### Phase D — Database Federation (Month 10–12)

Platforms that share the most data (CRM + CAS + report-sys) migrate to a shared PostgreSQL instance with separate schemas (`cas`, `reporting`, `crm`, `canonical`). Foreign keys across schemas are enforced at the application layer (not DB level) until the team is confident in the shared-instance approach. MyHarvestHub and DMHicc remain on separate instances — commerce and campaign data have different scaling profiles.

---

## PART SIX: DATA SAFETY GUARANTEES

1. **No platform's existing tables are altered destructively.** All consolidation changes are additive (new columns nullable, new tables).
2. **The `EventOutbox` write is always in the same Prisma transaction as the triggering domain write.** Event is never orphaned.
3. **The CIS API is fully idempotent.** Every endpoint uses upsert semantics. Backfill scripts can run 100 times.
4. **`CanonicalUser` records are never deleted.** `status = MERGED` with `mergedIntoId` for deduplication. Platform links use `delinkedAt` for soft delete.
5. **`EventOutbox.idempotencyKey` is unique.** Duplicate event delivery is impossible — the CIS rejects duplicate keys.
6. **DMHicc `LinkEvent` cleanup migration uses a dual-write period.** Old aliases populated alongside new canonical fields until all readers are migrated.
7. **MyHarvestHub `campus` field migration uses dual-write.** Both `campus` (enum) and `campusCode` (String) are populated during the transition window.
8. **`Transaction.balanceBefore` / `balanceAfter` pattern is mandatory for any financial operation.** CAS's pastoral interaction has no financial data, but if giving/tithe tracking is added, this pattern must be enforced from day one.

---

*Document v2.0 — May 2026 | Based on real Prisma schemas | Harvesters Digital Estate*
