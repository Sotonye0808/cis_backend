# Migration Guide: Reporting System → CIS

> **Platform:** Reporting System (report-sys)  
> **Current State:** PostgreSQL (Prisma), 35 models, 12-role pastoral hierarchy  
> **Target:** Federated with CIS, linked via email  
> **Timeline:** Phase 3 (May 13–14)  
> **Effort:** 1–2 days for experienced team

---

## Current State

The Reporting System has the most sophisticated schema in the estate:

- **Users:** `User` table with `email`, `firstName`, `lastName`, role-based access
- **Roles:** `UserRole` enum with 12 values (SUPERADMIN, SPO, CEO, CHURCH_MINISTRY, GROUP_PASTOR, GROUP_ADMIN, CAMPUS_PASTOR, CAMPUS_ADMIN, DATA_ENTRY, MEMBER, OFFICE_OF_CEO, USHER)
- **Org Hierarchy:** `OrgGroup` (top-level) → `Campus` (mid-level) relational structure
- **Audit Trail:** `ReportEvent` + `ReportVersion` (excellent pattern; CIS will adopt this)
- **Config:** `AdminConfigEntry` with namespace + version pattern (CIS will adopt this too)

---

## What Changes

| Aspect                | Before                                | After                                                   |
| --------------------- | ------------------------------------- | ------------------------------------------------------- |
| **User Source**       | Local `users` table only              | `users` table + CIS CanonicalUser (linked)              |
| **Role Definition**   | `UserRole` enum (hardcoded in schema) | ConfigEntry table (zero-code)                           |
| **Auth**              | Custom JWT + local validation         | CIS JWT + CIS permission checks                         |
| **Org Hierarchy**     | Local OrgGroup/Campus                 | CIS OrgGroup/Campus (single source of truth)            |
| **Permission Checks** | `if (user.role === 'SPO')`            | `await cis.permissions.check(userId, 'REPORT_APPROVE')` |
| **New Users**         | Register in Reporting System          | Register in CIS, auto-linked to Reporting System        |

---

## What Stays the Same

- ✅ All existing `users` records remain (no deletion)
- ✅ All existing `reports`, `goals`, `metrics` data untouched
- ✅ ReportEvent + ReportVersion pattern continues (CIS adopts this)
- ✅ AdminConfigEntry pattern continues (CIS adopts this)
- ✅ Report workflows unchanged

---

## Integration Steps

### Step 1: Add CIS Linking Table (Day 1, 2 hours)

```prisma
// prisma/schema.prisma - add to report-sys

model CISUserLink {
  id                String    @id @default(cuid())
  canonicalUserId   String    // CIS user email or ID
  reportingUserId   String    // Your local user ID

  syncedAt          DateTime  @default(now())
  syncStatus        String    // "ACTIVE", "INACTIVE"

  @@unique([reportingUserId])
  @@index([canonicalUserId])
}
```

Then:

```bash
npm run prisma migrate dev --name add_cis_linking
```

### Step 2: Migrate Existing Users (Day 1, 4 hours)

Create a one-time migration script:

```typescript
// scripts/migrate-users-to-cis.ts

import { PrismaClient } from "@prisma/client";
import CIS from "@harvesters/cis-reporting-sdk";

const prisma = new PrismaClient();
const cis = new CIS({
  endpoint: process.env.CIS_API_URL,
  apiKey: process.env.CIS_API_KEY,
});

async function migrateUsers() {
  // 1. Get all active users from Reporting System
  const users = await prisma.user.findMany({
    where: { isActive: true },
  });

  console.log(`Migrating ${users.length} users...`);

  for (const user of users) {
    try {
      // 2. Create or get CanonicalUser in CIS by email
      const canonicalUser = await cis.users.findOrCreateByEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
      });

      // 3. Create link in local database
      await prisma.cISUserLink.create({
        data: {
          canonicalUserId: canonicalUser.id,
          reportingUserId: user.id,
          syncStatus: "ACTIVE",
        },
      });

      console.log(`✓ Migrated ${user.email}`);
    } catch (error) {
      console.error(`✗ Failed to migrate ${user.email}:`, error.message);
    }
  }

  console.log("Migration complete!");
}

migrateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:

```bash
npx ts-node scripts/migrate-users-to-cis.ts
```

**Verify:**

```sql
SELECT COUNT(*) FROM "CISUserLink";
-- Should equal number of active users
```

### Step 3: Update Auth Middleware (Day 1, 2 hours)

Replace your current auth middleware:

```typescript
// BEFORE: src/middleware/auth.ts (old)
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// AFTER: src/middleware/auth.ts (new - CIS)
import CIS from "@harvesters/cis-reporting-sdk";

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // 1. Validate JWT with CIS
    const decoded = await cis.auth.validateToken(token);

    // 2. Get canonical user from CIS
    const canonicalUser = decoded;

    // 3. Get local user link
    const link = await prisma.cISUserLink.findUnique({
      where: { canonicalUserId: canonicalUser.id },
    });

    // 4. Load local user context (for domain-specific logic)
    const localUser = link
      ? await prisma.user.findUnique({ where: { id: link.reportingUserId } })
      : null;

    req.canonicalUser = canonicalUser;
    req.user = localUser; // For backward compatibility

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
```

### Step 4: Update Permission Checks (Day 1, 2 hours)

Replace all permission checks:

```typescript
// BEFORE: src/routes/reports.ts (old)
app.post("/reports", async (req, res) => {
  if (req.user.userRole !== "SPO" && req.user.userRole !== "GROUP_ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  // ... create report
});

// AFTER: src/routes/reports.ts (new - CIS)
import CIS from "@harvesters/cis-reporting-sdk";

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

app.post("/reports", async (req, res) => {
  // Check permission via CIS
  const canCreate = await cis.permissions.check(
    req.canonicalUser.id,
    "REPORT_CREATE",
    req.body.scopeId, // campus or org group ID
  );

  if (!canCreate) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // ... create report
});
```

### Step 5: Subscribe to Identity Events (Day 2, 2 hours)

Listen for user/role changes from CIS:

```typescript
// src/services/cis-sync.ts

import CIS from "@harvesters/cis-reporting-sdk";

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

export async function startCISEventListener() {
  cis.events.subscribe("identity:*", async (event) => {
    const { eventType, data } = event;

    console.log(`[CIS Event] ${eventType}`, data);

    switch (eventType) {
      case "USER_UPDATED":
        await syncUserUpdate(data.userId, data.changes);
        break;

      case "ROLE_ASSIGNED":
        await syncRoleAssignment(data.userId, data.roleId);
        break;

      case "ROLE_REVOKED":
        await syncRoleRevocation(data.userId, data.roleId);
        break;

      case "USER_DEACTIVATED":
        await deactivateUser(data.userId);
        break;
    }
  });
}

async function syncUserUpdate(canonicalUserId, changes) {
  // 1. Find local user link
  const link = await prisma.cISUserLink.findUnique({
    where: { canonicalUserId },
  });

  if (!link) return; // User not in Reporting System

  // 2. Update local user record with canonical data
  if (changes.firstName || changes.lastName || changes.phoneNumber) {
    await prisma.user.update({
      where: { id: link.reportingUserId },
      data: {
        firstName: changes.firstName,
        lastName: changes.lastName,
        phoneNumber: changes.phoneNumber,
      },
    });

    console.log(`✓ Synced user update: ${canonicalUserId}`);
  }
}

async function syncRoleAssignment(canonicalUserId, roleId) {
  // This is platform-specific role translation
  // E.g., CIS role "SPO" → Reporting System UserRole "SPO"
  // (implementation depends on role mapping config)

  console.log(`✓ Role assigned: ${canonicalUserId} → ${roleId}`);
  // Update local role if applicable
}

async function deactivateUser(canonicalUserId) {
  const link = await prisma.cISUserLink.findUnique({
    where: { canonicalUserId },
  });

  if (link) {
    await prisma.user.update({
      where: { id: link.reportingUserId },
      data: { isActive: false },
    });

    console.log(`✓ Deactivated user: ${canonicalUserId}`);
  }
}
```

Add to your app startup:

```typescript
// src/index.ts
import { startCISEventListener } from "./services/cis-sync";

app.listen(PORT, async () => {
  console.log(`Reporting System running on port ${PORT}`);

  // Start CIS event listener
  await startCISEventListener();
  console.log("CIS event listener started");
});
```

### Step 6: Update New User Registration (Day 2, 1 hour)

When a new user registers, route through CIS:

```typescript
// BEFORE: src/routes/auth.ts (old)
app.post("/auth/register", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      email: req.body.email,
      firstName: req.body.firstName,
      password: bcrypt.hash(req.body.password, 10),
    },
  });

  res.json({ user });
});

// AFTER: src/routes/auth.ts (new - CIS)
import CIS from "@harvesters/cis-reporting-sdk";

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

app.post("/auth/register", async (req, res) => {
  try {
    // 1. Create canonical user in CIS
    const canonicalUser = await cis.users.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    // 2. Create local user (for Reporting System-specific fields)
    const localUser = await prisma.user.create({
      data: {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // password handling depends on your auth flow
      },
    });

    // 3. Link them
    await prisma.cISUserLink.create({
      data: {
        canonicalUserId: canonicalUser.id,
        reportingUserId: localUser.id,
        syncStatus: "ACTIVE",
      },
    });

    // 4. Return JWT from CIS
    const token = await cis.auth.createToken(canonicalUser.id);

    res.json({ user: canonicalUser, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Step 7: Testing (Day 2, 1 hour)

```typescript
// tests/cis-integration.test.ts

describe("Reporting System ↔ CIS Integration", () => {
  it("should migrate existing users", async () => {
    const count = await prisma.cISUserLink.count();
    expect(count).toBeGreaterThan(0);
  });

  it("should validate JWT with CIS", async () => {
    const token = await cis.auth.createToken("test-user-id");
    const decoded = await cis.auth.validateToken(token);
    expect(decoded.id).toBe("test-user-id");
  });

  it("should check permissions via CIS", async () => {
    const hasPermission = await cis.permissions.check(
      "test-user-id",
      "REPORT_CREATE",
    );
    expect(typeof hasPermission).toBe("boolean");
  });

  it("should sync role assignments", async () => {
    // Emit CIS event
    const event = {
      eventType: "ROLE_ASSIGNED",
      data: { userId: "test-user-id", roleId: "role-spo" },
    };

    // Handle it
    await handleCISEvent(event);

    // Verify local state updated
    // (depends on role mapping implementation)
  });
});
```

---

## Rollback Plan

If integration fails:

1. Set `CISUserLink.syncStatus = 'INACTIVE'` for all users
2. Revert auth middleware to old implementation
3. Keep both systems running until CIS is stable
4. No data loss

---

## Checklist

- [ ] CISUserLink table created
- [ ] Users migrated (no errors)
- [ ] Auth middleware updated
- [ ] Permission checks updated to use CIS
- [ ] Event listener implemented and tested
- [ ] New user registration routes through CIS
- [ ] All tests passing (70%+ coverage)
- [ ] Manual testing with sample user
- [ ] Documentation updated for team
- [ ] Ready for Phase 3 go-live

---

## Support

- Questions about role mapping → See [Role Mapping Guide](ROLE_MAPPING.md)
- Questions about event subscriptions → See [Event System Guide](EVENT_SYSTEM.md)
- Troubleshooting → See `.env.example` and `PLATFORM_INTEGRATION_GUIDE.md`
