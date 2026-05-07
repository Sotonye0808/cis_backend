# Migration Guide: Faith Hub (Web + Mobile) → CIS

> **Platform:** Faith Hub (web + mobile Next.js app)  
> **Current State:** PostgreSQL (Prisma), user auth with email-based identity  
> **Target:** Federated with CIS, mobile-optimized API  
> **Timeline:** Phase 3 (May 13–14)  
> **Effort:** 1 day (simpler than Reporting System — no complex roles)  
> **Note:** Mobile app has May 20 deadline; CIS integration is optional until Phase 4

---

## Current State

- **Users:** Simple `User` table (email, password, profile)
- **Roles:** None (or basic member/admin distinction)
- **Auth:** Custom JWT implementation
- **Org Context:** Single church (no multi-org logic)

---

## What Changes

| Aspect               | Before                  | After                                      |
| -------------------- | ----------------------- | ------------------------------------------ |
| **User Source**      | Local DB only           | Local DB + CIS (linked)                    |
| **Password Storage** | Local password hash     | CIS handles auth; local app trusts CIS JWT |
| **Auth Flow**        | username/password → JWT | Use CIS auth endpoint or pre-issued JWT    |
| **Permissions**      | Not implemented         | CIS permission layer                       |
| **Org Hierarchy**    | N/A (single church)     | CIS OrgGroup/Campus (for future scaling)   |

---

## Integration Steps

### Step 1: Add CIS Linking (1 hour)

```prisma
// prisma/schema.prisma

model CISUserLink {
  id                String    @id @default(cuid())
  canonicalUserId   String
  faithHubUserId    String

  syncStatus        String    // "ACTIVE", "INACTIVE"
  syncedAt          DateTime  @default(now())

  @@unique([faithHubUserId])
  @@index([canonicalUserId])
}
```

### Step 2: Migrate Existing Users (2 hours)

```typescript
// scripts/migrate-faith-hub-users-to-cis.ts

async function migrateUsers() {
  const users = await prisma.user.findMany({ where: { active: true } });

  for (const user of users) {
    const canonicalUser = await cis.users.findOrCreateByEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await prisma.cISUserLink.create({
      data: {
        canonicalUserId: canonicalUser.id,
        faithHubUserId: user.id,
        syncStatus: "ACTIVE",
      },
    });
  }
}
```

### Step 3: Update Auth Endpoint (2 hours)

```typescript
// app/api/auth/login/route.ts (Next.js App Router)

import CIS from "@harvesters/cis-faith-hub-sdk";

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    // 1. Authenticate with CIS
    const response = await cis.auth.login(email, password);
    const { token, user } = response;

    // 2. Find or create local user link
    let link = await prisma.cISUserLink.findFirst({
      where: { canonicalUserId: user.id },
    });

    if (!link) {
      // New user (registered in CIS, not yet in Faith Hub)
      const localUser = await prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      link = await prisma.cISUserLink.create({
        data: {
          canonicalUserId: user.id,
          faithHubUserId: localUser.id,
          syncStatus: "ACTIVE",
        },
      });
    }

    // 3. Return token (CIS JWT, not local)
    return Response.json({ token, user });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}
```

### Step 4: Update Auth Middleware (1 hour)

```typescript
// middleware.ts

import CIS from "@harvesters/cis-faith-hub-sdk";

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

export async function middleware(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Validate with CIS
    const user = await cis.auth.validateToken(token);

    // Add to request headers for downstream
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

### Step 5: Subscribe to Identity Events (1 hour)

```typescript
// lib/cis-sync.ts

const cis = new CIS({ endpoint: process.env.CIS_API_URL });

export function startCISSyncListener() {
  cis.events.subscribe("identity:*", async (event) => {
    const { eventType, data } = event;

    switch (eventType) {
      case "USER_UPDATED":
        // Update local user profile
        await prisma.user.updateMany({
          where: {
            cISUserLink: { canonicalUserId: data.userId },
          },
          data: {
            firstName: data.changes.firstName,
            lastName: data.changes.lastName,
          },
        });
        break;

      case "USER_DEACTIVATED":
        // Deactivate local account
        const link = await prisma.cISUserLink.findUnique({
          where: { canonicalUserId: data.userId },
        });
        if (link) {
          await prisma.user.update({
            where: { id: link.faithHubUserId },
            data: { active: false },
          });
        }
        break;
    }
  });
}
```

Call in app initialization:

```typescript
// app/layout.tsx

import { startCISSyncListener } from '@/lib/cis-sync';

// Initialize in server component
export default async function RootLayout() {
  if (process.env.NODE_ENV === 'production') {
    startCISSyncListener();
  }

  return (/* ... */);
}
```

### Step 6: Mobile API Optimization (optional for Phase 3)

If integrating mobile app immediately:

```typescript
// app/api/auth/validate-token/route.ts
// Fast endpoint for mobile clients to validate token without full user data

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const decoded = await cis.auth.validateToken(token);

    // Return minimal data (mobile doesn't need full user record)
    return Response.json({
      valid: true,
      userId: decoded.id,
      email: decoded.email,
    });
  } catch {
    return Response.json({ valid: false }, { status: 401 });
  }
}

// For offline mobile support:
// Include user permissions in JWT claims (read-only)
```

---

## Testing

```typescript
// tests/cis-integration.test.ts

describe("Faith Hub ↔ CIS", () => {
  it("should migrate users", async () => {
    const count = await prisma.cISUserLink.count();
    expect(count).toBeGreaterThan(0);
  });

  it("should login via CIS", async () => {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@faith.local", password: "test" }),
    });

    expect(response.status).toBe(200);
    const { token } = await response.json();
    expect(token).toBeDefined();
  });

  it("should validate token", async () => {
    const response = await fetch(
      "http://localhost:3000/api/auth/validate-token",
      {
        method: "POST",
        body: JSON.stringify({ token: "valid-jwt-token" }),
      },
    );

    expect(response.status).toBe(200);
    const { valid } = await response.json();
    expect(valid).toBe(true);
  });
});
```

---

## Checklist

- [ ] CISUserLink table added
- [ ] Users migrated
- [ ] Auth login endpoint updated
- [ ] Auth middleware updated
- [ ] Event listener implemented
- [ ] Tests passing
- [ ] Mobile auth working (if needed for May 20)

---

## Mobile App Notes

The mobile app (due May 20) can work in two modes:

1. **Without CIS** (May 7–20): Local auth continues; CIS is not required
2. **With CIS** (after May 20): Switch to CIS JWT for cross-platform auth

To support both:

```typescript
// Mobile auth logic
async function login(email: string, password: string) {
  try {
    // Try CIS first (if available)
    const cisToken = await loginWithCIS(email, password);
    if (cisToken) return cisToken;
  } catch {
    // Fallback to local auth if CIS unavailable
    return loginLocally(email, password);
  }
}
```

This way, mobile can launch May 20 without CIS, then integrate seamlessly later.
