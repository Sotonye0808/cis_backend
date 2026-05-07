# Generic Platform Integration — Future Additions

> **For:** Any new platform/system built at Harvesters that needs identity integration  
> **Pattern:** Follows federated architecture; non-destructive linking  
> **Effort:** 2–3 days depending on platform complexity

---

## Quick Start Template

### 1. Add to CIS Config

Register new platform in ConfigEntry:

```sql
INSERT INTO config_entries (namespace, key, value, version, created_by)
VALUES (
  'platform:integrations',
  'MY_NEW_PLATFORM',
  '{
    "displayName": "My New Platform",
    "webhookUrl": "https://my-platform.local/webhooks/cis",
    "capabilities": ["USER_SYNC", "ROLE_SYNC"],
    "isActive": true
  }',
  1,
  'admin'
);
```

### 2. Add Linking Table to New Platform

```prisma
model CISUserLink {
  id                String    @id @default(cuid())
  canonicalUserId   String    // CIS user ID
  platformUserId    String    // Your user ID
  platformId        String    // "my-new-platform"

  syncStatus        String    @default("ACTIVE")
  syncedAt          DateTime  @default(now())

  @@unique([platformId, platformUserId])
  @@index([canonicalUserId])
}
```

### 3. Create SDK

```typescript
// packages/cis-my-platform-sdk/index.ts

import axios from "axios";

export class CISIntegration {
  private endpoint: string;
  private platformId: string;
  private apiKey: string;

  constructor(config: {
    endpoint: string;
    platformId: string;
    apiKey: string;
  }) {
    this.endpoint = config.endpoint;
    this.platformId = config.platformId;
    this.apiKey = config.apiKey;
  }

  // Get current user
  async getCurrentUser(token: string) {
    const response = await axios.post(
      `${this.endpoint}/api/v1/users/me`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  }

  // Check permission
  async hasPermission(userId: string, permission: string, scope?: string) {
    const response = await axios.post(
      `${this.endpoint}/api/v1/permissions/check`,
      { userId, permission, scope },
      { headers: { "X-API-Key": this.apiKey } },
    );
    return response.data.allowed;
  }

  // Subscribe to events
  subscribe(topic: string, handler: (event: any) => Promise<void>) {
    // Via Redis pub/sub or webhook polling
    // Implementation depends on your infrastructure
  }

  // Create link
  async linkUser(canonicalUserId: string, platformUserId: string) {
    return await axios.post(
      `${this.endpoint}/api/v1/platform-mappings`,
      {
        canonicalUserId,
        platformId: this.platformId,
        externalUserId: platformUserId,
      },
      { headers: { "X-API-Key": this.apiKey } },
    );
  }
}
```

Publish to npm:

```bash
cd packages/cis-my-platform-sdk
npm publish --access public
```

### 4. Integrate into Your App

```typescript
// Your app initialization

import { CISIntegration } from "@harvesters/cis-my-platform-sdk";

const cis = new CISIntegration({
  endpoint: process.env.CIS_API_URL,
  platformId: "my-new-platform",
  apiKey: process.env.CIS_API_KEY,
});

// In your auth middleware:
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const user = await cis.getCurrentUser(token);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// In your permission checks:
app.post("/resource", async (req, res) => {
  const canCreate = await cis.hasPermission(req.user.id, "RESOURCE_CREATE");

  if (!canCreate) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // ... handle request
});

// Start listening for identity events:
cis.subscribe("identity:*", async (event) => {
  console.log("Identity event:", event);
  // Reconcile local state based on event type
});
```

### 5. Migrate Existing Users (if any)

```typescript
// Script to link existing users to CIS

async function linkExistingUsers() {
  const users = await getMyPlatformUsers();

  for (const user of users) {
    try {
      // Get or create canonical user
      const canonicalUser = await cis.createOrGetUser({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      // Link them
      await cis.linkUser(canonicalUser.id, user.id);

      console.log(`✓ Linked ${user.email}`);
    } catch (error) {
      console.error(`✗ Failed to link ${user.email}:`, error);
    }
  }
}
```

### 6. Test

```typescript
describe("CIS Integration", () => {
  it("should link user", async () => {
    const link = await cis.linkUser("canonical-123", "platform-456");
    expect(link.canonicalUserId).toBe("canonical-123");
  });

  it("should check permission", async () => {
    const can = await cis.hasPermission("user-id", "READ");
    expect(typeof can).toBe("boolean");
  });

  it("should receive identity events", async () => {
    // Subscribe and verify events come through
  });
});
```

---

## Common Patterns

### Pattern 1: Shared User Registration

When a new user registers on your platform:

```typescript
async function register(email, password, firstName, lastName) {
  // 1. Create canonical user in CIS
  const canonicalUser = await cis.createUser({
    email,
    firstName,
    lastName,
  });

  // 2. Create local user (if needed)
  const localUser = await db.users.create({
    email,
    firstName,
    lastName,
    localPassword: hash(password),
  });

  // 3. Link them
  await cis.linkUser(canonicalUser.id, localUser.id);

  // 4. Return CIS JWT
  const token = await cis.createToken(canonicalUser.id);
  return { user: canonicalUser, token };
}
```

### Pattern 2: Distributed Authorization

Check permissions across orgs/campuses:

```typescript
// User in multiple scopes
const permissions = await Promise.all([
  cis.hasPermission(userId, "REPORT_VIEW", { campusId: "campus-1" }),
  cis.hasPermission(userId, "REPORT_APPROVE", { campusId: "campus-2" }),
]);

if (permissions.some((p) => p)) {
  // User has permission in at least one scope
}
```

### Pattern 3: Offline Support (Mobile)

Cache user data and permissions locally:

```typescript
// Mobile app caches CIS token + claims
const token = await cis.login(email, password);
const decoded = jwt.decode(token); // Contains user + permission claims

// Store locally
localStorage.setItem("cis_token", token);
localStorage.setItem("user", JSON.stringify(decoded.user));

// Later, use cached data:
const hasPermission = decoded.permissions.includes("RESOURCE_READ");

// On next connection, re-sync with CIS
```

### Pattern 4: Role Translation

If your platform has different role names than other platforms:

```prisma
// Store in ConfigEntry
model RoleMapping {
  namespace = "role:translation:platform-id"
  key       = "SPO"  // CIS role
  value = {
    "localRole": "SENIOR_PASTOR",
    "permissions": ["REPORT_APPROVE", "USER_MANAGE"],
    "scope": "ORGANIZATION"
  }
}
```

Query it:

```typescript
async function getLocalRole(cisRoleId) {
  const mapping = await cis.config.get(
    `role:translation:${platformId}`,
    cisRoleId,
  );
  return mapping.localRole;
}
```

---

## Architecture Decision Template

When integrating a new platform, document:

```markdown
## Platform: [Name]

**Decision Date:** [Date]
**Made By:** [Team/Person]

**Platform Characteristics:**

- [ ] Has existing user table
- [ ] Has existing role/permission system
- [ ] Has existing org hierarchy
- [ ] Mobile client expected
- [ ] High-frequency API calls
- [ ] Requires offline support

**Integration Strategy:**

- [ ] Federated (recommended)
- [ ] Sync via webhooks
- [ ] Sync via event listener
- [ ] Sync via polling

**Role Mapping:**

- [ ] No translation needed (roles map 1:1)
- [ ] Translation required (custom mapping table)
- [ ] New roles created in CIS

**Timeline:**

- [ ] Week 1: Add linking + migrate users
- [ ] Week 2: Update auth + permission checks
- [ ] Week 3: Event listener + testing

**Risks:**

- [ ] [List any known risks]

**Mitigation:**

- [ ] [Mitigation plans]
```

---

## File Template Checklist

For a new platform, create:

- [ ] `docs/MIGRATION_[PLATFORM_NAME].md` — Platform-specific guide
- [ ] `packages/cis-[platform-id]-sdk/` — NPM package for integration
- [ ] `tests/integration/[platform-name].test.ts` — Integration tests
- [ ] `.env.example` updated with platform-specific vars
- [ ] `ROLE_MAPPING_[PLATFORM_NAME].md` — If needed for role translation

---

## Support & Escalation

- **Questions:** Open an issue in `cis_backend` repo
- **Performance concerns:** Check `docs/PERFORMANCE.md`
- **Event system issues:** See `docs/EVENT_SYSTEM.md`
- **Role/permission questions:** See `docs/ROLE_MAPPING.md`

---

## Design Pattern: Your Integration Story

When you integrate a new platform, your story is:

1. **Today:** Platform operates independently
2. **Week 1:** Add CIS linking; migrate existing users
3. **Week 2:** Switch auth to CIS; update permissions
4. **Week 3:** Subscribe to identity events; test sync
5. **Week 4:** Go live; celebrate unified identity across Harvesters

Your users get: Seamless cross-platform experience, single login, consistent permissions.

Let's build it together. 🚀
