# CIS Platform Integration Guide

> **Overview:** This guide explains how to integrate existing platforms with the Canonical Identity Service. Each platform becomes a "consumer" of CIS identity data while retaining its own domain-specific models. No data migration is destructive — all existing records remain; they are simply linked to canonical identities.

---

## Core Concepts

### Identity Federation Model

```
CIS (Central)
├── CanonicalUser (single source of truth per email)
├── CanonicalRole (platform-agnostic role definitions)
└── IdentityEvent (broadcasts changes to all platforms)

   ↓ (one-to-many)

Platform instances
├── reporting_users (existing — linked to CIS)
├── faith_hub_users (existing — linked to CIS)
├── crm_users (existing — linked to CIS)
├── dmhicc_users (existing — linked to CIS)
└── myharvesthub_users (existing — linked to CIS)
```

### Key Principles

1. **No Deletion:** Existing platform user tables remain intact
2. **Linking:** Each platform user is linked to a CanonicalUser via `PlatformUserMapping`
3. **Event Subscription:** Platforms subscribe to IdentityEvent topics and reconcile locally
4. **Eventual Consistency:** Identity changes propagate async (not synchronous)
5. **Role Translation:** Platform-specific roles remain; CIS provides unified permission layer
6. **Offline Capable:** Platforms cache identity data locally; CIS is not a hard dependency

---

## Integration Workflow (Generic Pattern)

All platforms follow the same 4-step integration pattern:

### Step 1: Prepare Platform Database

Add linking table to your platform's database:

```prisma
model CISUserLink {
  id                String    @id @default(cuid())
  canonicalUserId   String    // email or CIS ID
  externalUserId    String    // your platform's user ID
  platformId        String    // "reporting-system", "faith-hub", etc.

  syncedAt          DateTime  @default(now())
  syncStatus        String    // "ACTIVE", "PENDING", "INACTIVE"

  @@unique([platformId, externalUserId])
  @@index([canonicalUserId])
}
```

### Step 2: Migrate Existing Users

One-time migration to link existing users to CIS:

```typescript
// 1. For each user in your platform:
const user = await getUser(id);

// 2. Create or get CanonicalUser in CIS (by email):
const canonicalUser = await cis.users.findOrCreateByEmail(user.email);

// 3. Create link:
await createCISUserLink({
  canonicalUserId: canonicalUser.id,
  externalUserId: user.id,
  platformId: "your-platform-id",
  syncStatus: "ACTIVE",
});

// 4. Verify: email uniqueness, no orphans
```

### Step 3: Subscribe to Events

Listen for identity changes and reconcile locally:

```typescript
import { subscribe } from "@harvesters/cis-sdk";

// Subscribe to identity events
const unsubscribe = subscribe("identity:*", async (event) => {
  const { eventType, data } = event;

  switch (eventType) {
    case "USER_UPDATED":
      // Update local user from canonical data
      await updateLocalUser(data.userId, data.changes);
      break;

    case "ROLE_ASSIGNED":
      // If this user is on your platform, update their role
      await assignRoleIfLocal(data.userId, data.roleId);
      break;

    case "USER_DEACTIVATED":
      // Deactivate local user (don't delete)
      await deactivateLocalUser(data.userId);
      break;
  }
});
```

### Step 4: Use CIS for Auth & Permissions

Replace platform-specific auth with CIS:

```typescript
// Instead of:
const hasRole = user.role === "ADMIN";

// Use CIS:
const hasPermission = await cis.permissions.check(userId, "RESOURCE_WRITE");
```

---

## Integration Checklist (per Platform)

- [ ] CISUserLink table created
- [ ] Existing users migrated (linked to CIS)
- [ ] Event subscription working (test with sample event)
- [ ] Local user update logic implemented
- [ ] Auth middleware updated to use CIS JWT
- [ ] Permission checks updated to use CIS API
- [ ] Integration tests passing
- [ ] Tested with all 5 platforms in parallel
- [ ] Rollback plan documented

---

## SDK Usage

Each platform has an SDK npm package:

```bash
npm install @harvesters/cis-{platform-id}-sdk
```

Example (Faith Hub):

```typescript
import CIS from "@harvesters/cis-faith-hub-sdk";

const cis = new CIS({
  endpoint: process.env.CIS_API_URL,
  apiKey: process.env.CIS_API_KEY,
  platformId: "faith-hub",
});

// Get current user
const user = await cis.users.getMe(req.jwt);

// Check permission
const canCreate = await cis.permissions.check(userId, "RESOURCE_CREATE");

// Subscribe to events
cis.events.subscribe("identity:*", (event) => {
  console.log(`Identity change: ${event.eventType}`, event.data);
});
```

---

## Common Issues & Solutions

### Issue: "User not found" after migration

**Cause:** Email mismatch between platform and CIS  
**Solution:** Run validation query to find mismatches; manually link or ask user to re-register

### Issue: Duplicate users after sync

**Cause:** Multiple platform users linked to same email  
**Solution:** Run deduplication script; keep most-recent account

### Issue: Permission cache stale

**Cause:** User role changed in CIS but old cache still active  
**Solution:** TTL is 5 min; force refresh with `cis.permissions.invalidate(userId)`

### Issue: Events not arriving

**Cause:** Redis connection down or event topic not subscribed  
**Solution:** Check Redis status; verify subscription to correct topic; fallback to polling

---

## Testing Your Integration

### Unit Tests

```typescript
describe('CIS Integration', () => {
  it('should link existing user to CIS', async () => {
    const link = await createCISUserLink({...});
    expect(link.canonicalUserId).toBeDefined();
    expect(link.syncStatus).toBe('ACTIVE');
  });

  it('should handle identity event', async () => {
    const event = { eventType: 'USER_UPDATED', data: {...} };
    await handleIdentityEvent(event);
    // Verify local user was updated
  });
});
```

### Integration Tests

```typescript
describe("Cross-Platform Sync", () => {
  it("should sync user update across all platforms", async () => {
    // 1. Update user in CIS
    await cis.users.update(userId, { name: "New Name" });

    // 2. Wait for event
    await sleep(200);

    // 3. Verify each platform got update
    const reportingUser = await reporting.users.getById(userId);
    expect(reportingUser.name).toBe("New Name");

    const faithHubUser = await faithHub.users.getById(userId);
    expect(faithHubUser.name).toBe("New Name");
  });
});
```

### Manual Testing

1. **Create user in CIS:** `curl -X POST http://localhost:3000/api/v1/users ...`
2. **Verify platforms received event:** Check platform logs for identity event handler
3. **Update user in CIS:** `curl -X PATCH http://localhost:3000/api/v1/users/{id} ...`
4. **Verify sync:** Query each platform's local user record

---

## Rollback Plan

If integration fails:

1. Keep CISUserLink table but set `syncStatus` to `INACTIVE`
2. Platforms continue using local auth (don't depend on CIS)
3. No data loss (all original records preserved)
4. Fix issue and re-enable with `syncStatus = ACTIVE`

---

## Performance Considerations

| Operation        | Latency Target | Caching                          |
| ---------------- | -------------- | -------------------------------- |
| User lookup      | < 50ms p99     | 5 min TTL (per-user)             |
| Permission check | < 5ms p99      | 10 sec TTL (per-user-permission) |
| Event delivery   | < 500ms        | N/A (async)                      |
| Role assignment  | < 100ms        | Invalidates caches immediately   |

---

## Support & Troubleshooting

For issues, check:

1. `docs/PLATFORM_MIGRATION_{PLATFORM_ID}.md` (platform-specific guide)
2. `.env.example` (ensure all vars set correctly)
3. CIS logs: `docker logs cis-api` or check `/logs` endpoint
4. Platform logs: each platform's logging framework
5. Redis: `redis-cli SUBSCRIBE identity:*` (see events in real-time)

---

## Next: Platform-Specific Guides

See:

- [MIGRATION_REPORTING_SYSTEM.md](MIGRATION_REPORTING_SYSTEM.md)
- [MIGRATION_FAITH_HUB.md](MIGRATION_FAITH_HUB.md)
- [MIGRATION_CHURCH_CRM.md](MIGRATION_CHURCH_CRM.md)
- [MIGRATION_DMHICC.md](MIGRATION_DMHICC.md)
- [MIGRATION_MYHARVESTHUB.md](MIGRATION_MYHARVESTHUB.md)
- [INTEGRATION_FUTURE_PLATFORMS.md](INTEGRATION_FUTURE_PLATFORMS.md)
