# Canonical Identity Service (CIS)

Unified identity and authorization service for the Harvesters digital estate.

**Status:** 🚀 Ready for Phase 1 execution (May 7–16)

---

## What is CIS?

CIS is a single source of truth for user identity across all Harvesters platforms (Faith Hub, Reporting System, Church CRM, DMHicc, MyHarvestHub). It provides:

- **Unified User Profile** — One canonical record per person (email-based)
- **Config-Driven Authorization** — Zero hardcoding of roles/permissions
- **Async Event Broadcasting** — Identity changes propagate without blocking
- **Complete Audit Trail** — All changes logged immutably (compliance-ready)
- **Federated Integration** — Each platform syncs independently; no monolithic rewrite

---

## Quick Start

### 1. Read the Documentation (15 minutes)

```bash
# Project context (why CIS exists)
cat .ai-system/agents/project-context.md

# Technical design (how it's built)
cat .ai-system/agents/system-architecture.md

# Execution plan (what we're building)
cat .ai-system/planning/project-plan.md

# Current tasks (what to code)
cat .ai-system/planning/task-queue.md
```

### 2. Prepare Environment (5 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values:
# - DATABASE_URL (Supabase PostgreSQL connection string)
# - JWT_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - REDIS_URL (optional; can use in-memory caching for Phase 1)
```

### 3. Install Dependencies (2 minutes)

```bash
npm install
```

### 4. Initialize Database (5 minutes)

```bash
# Run migrations
npx prisma migrate dev

# Seed test data
npx prisma db seed
```

### 5. Start Development Server (1 minute)

```bash
npm run dev
# Server running on http://localhost:3000
```

### 6. Test Endpoints (5 minutes)

```bash
# Create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@harvesters.local","firstName":"Test"}'

# Get users
curl http://localhost:3000/api/v1/users

# Get user by email
curl http://localhost:3000/api/v1/users/by-email/test@harvesters.local
```

---

## Project Structure

```
cis_backend/
├── .env.example                          # Environment template (copy to .env)
├── .ai-context.md                        # First file to read (for AI agents)
├── .ai-system/                           # AI development framework
│   ├── agents/
│   │   ├── project-context.md            # Project overview
│   │   ├── system-architecture.md        # Technical design
│   │   ├── general-instructions.md       # AI agent guidelines
│   │   └── repair-system.md              # Known issues & solutions
│   └── planning/
│       ├── project-plan.md               # 4-phase roadmap
│       └── task-queue.md                 # Sprint tasks
├── docs/
│   ├── PLATFORM_INTEGRATION_GUIDE.md     # Generic integration pattern
│   ├── MIGRATION_REPORTING_SYSTEM.md     # Reporting System integration
│   ├── MIGRATION_FAITH_HUB.md            # Faith Hub integration
│   └── INTEGRATION_FUTURE_PLATFORMS.md   # Pattern for new platforms
├── prisma/
│   ├── schema.prisma                     # Database schema
│   ├── seed.ts                           # Seed script
│   └── migrations/                       # Migration files
├── src/
│   ├── index.ts                          # App entry point
│   ├── services/                         # Business logic
│   │   ├── identity/
│   │   ├── role/
│   │   ├── permission/
│   │   ├── org/
│   │   ├── auth/
│   │   ├── events/
│   │   └── config/
│   ├── repositories/                     # Data access layer
│   ├── api/
│   │   ├── routes/                       # REST endpoints
│   │   └── middleware/                   # Express middleware
│   ├── types/                            # TypeScript types & schemas
│   └── utils/                            # Utilities
├── tests/                                # Test files
├── package.json
├── tsconfig.json
└── README.md                             # This file
```

---

## Execution Timeline

| Phase              | Dates     | Focus                                    | Duration |
| ------------------ | --------- | ---------------------------------------- | -------- |
| **1: Foundation**  | May 7–10  | Schema, migrations, CRUD API             | 3 days   |
| **2: Core**        | May 11–12 | Auth, permissions, event system          | 2 days   |
| **3: Integration** | May 13–14 | Platform syncing (Reporting + Faith Hub) | 2 days   |
| **4: Launch**      | May 15–16 | Testing, documentation, deployment       | 2 days   |
| **🎉 Go-Live**     | May 16    | Production deployment                    | —        |

---

## Technology Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.x
- **Framework:** Express 4.18+
- **ORM:** Prisma 5.x
- **Database:** Supabase PostgreSQL 15+
- **Cache:** Upstash Redis (optional for Phase 1)
- **Auth:** JWT (jsonwebtoken 9.x)
- **Validation:** Zod 3.x
- **Logging:** Pino 8.x
- **Testing:** Jest 29.x

---

## Key Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Generate test coverage
npm test -- --coverage

# Create database migration (after schema changes)
npx prisma migrate dev --name describe_your_changes

# Open Prisma Studio (visual database explorer)
npx prisma studio

# Seed database with test data
npx prisma db seed

# Format code
npm run format

# Build for production
npm run build
```

---

## Development Workflow

1. **Read the task:** Open `.ai-system/planning/task-queue.md`
2. **Pick a task:** Choose first incomplete [ ] task
3. **Implement:** Follow file paths and method signatures in task description
4. **Test:** Write unit/integration tests as you go
5. **Verify:** `npm test` passes, coverage > 70%
6. **Mark done:** Change [ ] to [x] in task queue
7. **Commit:** Push to git with clear commit message
8. **Repeat:** Pick next task

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CIS API Layer                             │
│  (REST endpoints for user, role, permission operations)     │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Service Layer (Business Logic)                  │
│  ├─ IdentityService    ├─ RoleService      ├─ AuthService   │
│  ├─ PermissionService  ├─ OrgService       ├─ EventService  │
│  └─ ConfigService      └─ CacheService                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          Data Access Layer (Repositories)                    │
│  (Direct Prisma queries, no business logic)                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           Supabase PostgreSQL Database                       │
│  ├─ CanonicalUser        ├─ IdentityEvent                   │
│  ├─ CanonicalRole        ├─ IdentityEventOutbox             │
│  ├─ UserRole             ├─ OrgGroup / Campus               │
│  ├─ RolePermission       └─ ConfigEntry                     │
│  └─ PlatformUserMapping                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform Integration

Each platform (Reporting System, Faith Hub, CRM, DMHicc, MyHarvestHub) integrates via:

1. **User Migration:** Existing users linked to CIS via email
2. **SDK:** Platform-specific npm package (e.g., `@harvesters/cis-reporting-sdk`)
3. **Event Subscription:** Listen for identity changes via Redis pub/sub or webhooks
4. **Local Reconciliation:** Each platform updates its local user records when CIS broadcasts events

See [docs/PLATFORM_INTEGRATION_GUIDE.md](docs/PLATFORM_INTEGRATION_GUIDE.md) for details.

---

## Testing

### Unit Tests

```bash
npm test -- src/services
```

### Integration Tests

```bash
npm test -- tests/integration
```

### Coverage Report

```bash
npm test -- --coverage
```

**Target:** 70%+ coverage across all modules

---

## Troubleshooting

| Issue                         | Solution                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| **Supabase connection fails** | Check DATABASE_URL in .env; verify network access                                   |
| **Prisma migration error**    | Run `npx prisma migrate resolve --rolled-back` or delete migration and re-run       |
| **Tests failing**             | Run `npm test -- --verbose` to see details; check repair-system.md for known issues |
| **API returns 500**           | Check logs in console; search repair-system.md for similar errors                   |

For more help, see:

- [.ai-system/agents/repair-system.md](.ai-system/agents/repair-system.md) — Known errors
- [docs/](docs/) — Platform-specific guides

---

## Contributing

1. Read `.ai-system/agents/general-instructions.md` for AI agent guidelines
2. Follow code patterns in existing modules (consistency matters)
3. Write tests as you code (test-driven development preferred)
4. Keep commits focused and descriptive
5. Update `.ai-system/memory/project-decisions.md` if making architecture decisions
6. Log errors and learnings in `.ai-system/agents/repair-system.md`

---

## Support & Questions

- **Architecture questions?** → Read `.ai-system/agents/system-architecture.md`
- **How do I build this?** → Read `.ai-system/planning/task-queue.md`
- **Hit an error?** → Search `.ai-system/agents/repair-system.md`
- **Design decision?** → Check `.ai-system/memory/project-decisions.md`
- **Platform integration?** → See [docs/PLATFORM_INTEGRATION_GUIDE.md](docs/PLATFORM_INTEGRATION_GUIDE.md)

---

## Success Metrics (May 16)

When Phase 4 completes, CIS is successful if:

- ✅ `npm test` passes (70%+ coverage)
- ✅ All API endpoints working (9 CRUD endpoints)
- ✅ Authentication & permissions operational
- ✅ Async event system delivering to Redis
- ✅ Reporting System synced with CIS
- ✅ Faith Hub synced with CIS
- ✅ All documentation published
- ✅ Team trained and ready
- ✅ Production deployment tested

---

## License

Internal Harvesters project. Not for external distribution.

---

**Ready to start? Pick first task from `.ai-system/planning/task-queue.md` and code!** 🚀
