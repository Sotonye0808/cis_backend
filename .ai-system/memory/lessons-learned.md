# Lessons Learned

> **Overview:** Practical knowledge accumulated during development — things that worked well, things that didn't, and patterns worth repeating. Different from repair-system.md (which tracks errors); this file tracks development process insights and architectural wisdom.

---

## Prisma Major Version Upgrades Require Configuration Changes

**Context:**
During Phase 1 completion, code used Prisma 5.x conventions (datasource with url in schema.prisma). When asked to "ensure latest conventions," discovered Prisma 7.x moved connection URLs out of schema.prisma entirely, requiring a new prisma.config.ts file and PrismaPg adapter in PrismaClient constructor.

**What We Learned:**

1. **Prisma 7.x Breaking Change:** Datasource `url` property no longer supported in schema.prisma. Connection URL must be in prisma.config.ts and passed via adapter or accelerateUrl to PrismaClient().
2. **Adapter Pattern Required:** Prisma 7.x requires either `new PrismaPg({ connectionString })` adapter (direct PostgreSQL) or `accelerateUrl` (for Accelerate proxy).
3. **Configuration Files Matter:** "Latest conventions" means not just latest version, but latest patterns. Always verify documentation for major version boundaries.
4. **Test Coverage Validates Upgrades:** Full test suite ensured upgrade worked; all 23 tests passed with Prisma 7.x.

**Apply When:**

- Updating major dependencies (Prisma, Express, TypeScript) — always check migration guides
- Claiming "latest conventions" — verify against official docs, not just version number
- Upgrading ORM versions — configuration changes often precede or follow major releases
- Setting up Prisma in any new project — use prisma.config.ts pattern (7.x+), not datasource url

**Prevention:**

- Pin major version upgrade timing before claiming "current conventions"
- Use official Prisma docs (pris.ly/d/) as source of truth for configuration
- Test with full suite after any ORM upgrade

**Entries added here as lessons are discovered**
