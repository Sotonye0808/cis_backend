# Development History

> **Overview:** Chronological log of completed development work. Each sprint ends with a summary entry. Agents add entries after completing tasks. Useful for understanding what has been built and when decisions were made.

---

## Entry Format

```
## [Date] — [Sprint or Session Title]

**Summary:**
[2–4 sentence overview of what was accomplished]

**Completed:**
- [task 1]
- [task 2]

**Key Changes:**
- [important architectural or behavioural change]

**Next Sprint Focus:**
[What comes next]
```

---

## History

---

## May 7–10 — Phase 1: Foundation & Schema + Prisma 7.x Upgrade

**Summary:**
Phase 1 accelerated to completion in 4 days (vs planned 1.5 weeks). Implemented full Prisma schema with 9 tables, 6 enums, and comprehensive CRUD API with 84.39% test coverage. Upgraded Prisma from 5.x to 7.x with latest conventions (config-driven architecture, PrismaPg adapter, no datasource url in schema).

**Completed:**

- ✅ Schema design: 9 tables (CanonicalUser, CanonicalRole, UserRole, RolePermission, PlatformUserMapping, OrgGroup, Campus, IdentityEvent, IdentityEventOutbox, ConfigEntry)
- ✅ 6 repositories with full CRUD support
- ✅ 4 service layers (IdentityService, RoleService, OrgService, PermissionService)
- ✅ 9 HTTP endpoints (user, role, org routes)
- ✅ Comprehensive middleware (logging, validation, error handling)
- ✅ 23 unit + integration tests (84.39% coverage)
- ✅ Prisma 7.x upgrade with PrismaPg adapter
- ✅ TypeScript strict mode enabled

**Key Changes:**

- **Prisma Configuration:** Moved DATABASE_URL from schema.prisma to prisma/prisma.config.ts (Prisma 7.x standard)
- **Client Initialization:** PrismaClient now uses PrismaPg adapter for direct PostgreSQL connection
- **Error Handling:** Updated to use official Prisma error classes (Prisma.PrismaRequestError)
- **Type Safety:** All repositories, services, and routes fully typed with strict mode

**Next Sprint Focus:**
Phase 2 (Auth, Permissions & Events) — JWT implementation, permission service with caching, async event infrastructure via Redis pub/sub
