# CIS Phase 1 Task Queue: Foundation & Schema

> **Overview:** Sprint-level execution tasks for Phase 1 (May 7–16). Agents execute tasks top to bottom, marking [x] when complete. This queue feeds directly into development sprints.

---

## Current Sprint: Phase 1 Foundation (May 7–16)

> **Section summary:** Establish CIS repository structure, PostgreSQL database, Prisma schema, and foundational API. Target completion: May 16.

### SETUP & INFRASTRUCTURE

- [ ] **T1.1** Confirm Supabase PostgreSQL database provisioned and team has access (test connection)
- [ ] **T1.2** Create CIS repository structure:
  ```
  cis/
  ├── prisma/
  │   ├── schema.prisma
  │   └── migrations/
  ├── src/
  │   ├── api/
  │   │   ├── routes/
  │   │   └── middleware/
  │   ├── services/
  │   │   ├── identity/
  │   │   ├── role/
  │   │   ├── permission/
  │   │   └── org/
  │   ├── repositories/
  │   ├── types/
  │   └── index.ts
  ├── tests/
  ├── package.json
  ├── tsconfig.json
  ├── .env.example
  └── README.md
  ```
- [ ] **T1.3** Initialize Node.js project: `npm init -y` → configure package.json (name: `@harvesters/cis`, version: 0.1.0)
- [ ] **T1.4** Install core dependencies:
  ```
  npm install express typescript zod pino dotenv cors helmet
  npm install -D @types/express @types/node jest ts-jest @types/jest ts-node
  npm install -D prisma @prisma/client
  ```
- [ ] **T1.5** Initialize Prisma: `npx prisma init` → configure `.env` with Supabase connection string
- [ ] **T1.6** Create `.env.example` with all required variables (DB_URL, NODE_ENV, JWT_SECRET_PLACEHOLDER, REDIS_URL_PLACEHOLDER)
- [ ] **T1.7** Set up TypeScript config (`tsconfig.json`) with strict mode enabled
- [ ] **T1.8** Set up Jest config for unit tests
- [ ] **T1.9** Create base Express application in `src/index.ts` with error handling middleware

### SCHEMA DESIGN & CREATION

- [ ] **T1.10** Design full Prisma schema based on architecture document. Core tables:
  - CanonicalUser
  - CanonicalRole
  - UserRole (join table)
  - RolePermission (join table)
  - PlatformUserMapping
  - IdentityEvent
  - IdentityEventOutbox
  - OrgGroup
  - Campus
  - ConfigEntry

  _Tip: Start with CanonicalUser and OrgGroup/Campus, then add identity tables_

- [ ] **T1.11** Implement Prisma schema in `prisma/schema.prisma` with:
  - All enums (UserStatus, RoleScope, MappingStatus, etc.)
  - All tables with proper relationships
  - All indexes and constraints
  - @@unique constraints where needed
  - Comments explaining each field

- [ ] **T1.12** Create initial migration: `npx prisma migrate dev --name init`
  - Verify migration file created in `prisma/migrations/`
  - Verify tables created in Supabase database

- [ ] **T1.13** Seed initial data:
  - Create `prisma/seed.ts` with TypeScript seed script
  - Seed 1 OrgGroup (Harvesters)
  - Seed 2 Campuses
  - Seed 5 test roles (corresponding to major platforms: reporting SPO, faith hub member, crm member, etc.)
  - Seed 5 test users
  - Create UserRole assignments for test users
  - Run: `npx prisma db seed`

- [ ] **T1.14** Add `prisma.seed.ts` configuration to `package.json`

### REPOSITORY LAYER (Data Access)

- [ ] **T1.15** Create repository pattern for CanonicalUser:
  - File: `src/repositories/userRepository.ts`
  - Methods: findById, findByEmail, create, update, delete (soft), list
  - Each returns Promise<CanonicalUser | null> or Promise<CanonicalUser[]>
  - No business logic — pure data access

- [ ] **T1.16** Create repository for OrgGroup and Campus:
  - File: `src/repositories/orgRepository.ts`
  - Methods: findOrgGroupById, findCampusById, listCampusesByOrgGroup, createCampus, etc.

- [ ] **T1.17** Create repository for CanonicalRole and UserRole:
  - File: `src/repositories/roleRepository.ts`
  - Methods: findRoleById, findRolesByUser, assignRoleToUser, revokeRoleFromUser, etc.

- [ ] **T1.18** Create repository for RolePermission:
  - File: `src/repositories/permissionRepository.ts`
  - Methods: findPermissionsByRole, addPermissionToRole, removePermissionFromRole

- [ ] **T1.19** Create repository for PlatformUserMapping:
  - File: `src/repositories/platformRepository.ts`
  - Methods: findMappingByExternalId, createMapping, findCanonicalUserByPlatform

- [ ] **T1.20** Write unit tests for repositories (minimum 70% coverage):
  - File: `tests/repositories/userRepository.test.ts`, etc.
  - Test each method: success case, not found case, error case

### SERVICE LAYER (Business Logic)

- [ ] **T1.21** Create IdentityService (user CRUD + validation):
  - File: `src/services/identity/identityService.ts`
  - Methods: createUser, getUserById, getUserByEmail, updateUser, deactivateUser, listUsers
  - Input validation using Zod schemas
  - Error handling: return typed errors (e.g., UserNotFoundError, EmailAlreadyExistsError)
  - No direct Prisma calls — use repositories

- [ ] **T1.22** Create RoleService (role management):
  - File: `src/services/role/roleService.ts`
  - Methods: createRole, getRoleById, assignRoleToUser, revokeRoleFromUser, getRolesForUser
  - Validate role scope (ORG, CAMPUS, etc.)

- [ ] **T1.23** Create OrgService (org hierarchy):
  - File: `src/services/org/orgService.ts`
  - Methods: getOrgGroup, getCampus, listCampuses, createCampus
  - Build org hierarchy tree structures

- [ ] **T1.24** Create Zod input validation schemas:
  - File: `src/types/schemas.ts`
  - CreateUserSchema, UpdateUserSchema, CreateRoleSchema, AssignRoleSchema, etc.
  - Validate all API inputs before they reach services

- [ ] **T1.25** Create custom error types:
  - File: `src/types/errors.ts`
  - UserNotFoundError, EmailAlreadyExistsError, InvalidRoleScopeError, etc.
  - Each extends AppError with statusCode, message, code properties

### API LAYER (HTTP Endpoints)

- [ ] **T1.26** Create user routes in `src/api/routes/users.ts`:
  - `GET /api/v1/users/:id` — Get user by ID
  - `GET /api/v1/users/by-email/:email` — Get user by email
  - `POST /api/v1/users` — Create user
  - `PATCH /api/v1/users/:id` — Update user
  - `POST /api/v1/users/:id/deactivate` — Deactivate user
  - `GET /api/v1/users` — List users (with pagination)

- [ ] **T1.27** Create role routes in `src/api/routes/roles.ts`:
  - `GET /api/v1/roles/:id` — Get role
  - `GET /api/v1/roles` — List roles
  - `POST /api/v1/users/:userId/roles/:roleId` — Assign role
  - `DELETE /api/v1/users/:userId/roles/:roleId` — Revoke role
  - `GET /api/v1/users/:userId/roles` — Get user's roles

- [ ] **T1.28** Create org routes in `src/api/routes/org.ts`:
  - `GET /api/v1/org/campuses` — List campuses
  - `GET /api/v1/org/campuses/:id` — Get campus details
  - `POST /api/v1/org/campuses` — Create campus (admin only)

- [ ] **T1.29** Create error handling middleware in `src/api/middleware/errorHandler.ts`:
  - Catch all errors
  - Convert typed errors to HTTP responses
  - Log errors with Pino
  - Return consistent error JSON: `{ error: { code, message, details } }`

- [ ] **T1.30** Create request validation middleware:
  - File: `src/api/middleware/validateRequest.ts`
  - Validates JSON body against Zod schema
  - Returns 400 Bad Request if validation fails

- [ ] **T1.31** Create logging middleware in `src/api/middleware/logging.ts`:
  - Log all requests: method, path, status, duration
  - Use Pino logger

- [ ] **T1.32** Wire all routes into Express app in `src/index.ts`:
  - Mount user routes → `/api/v1`
  - Mount role routes → `/api/v1`
  - Mount org routes → `/api/v1`
  - Attach middleware in correct order: logging → validation → routes → error handler

### DOCUMENTATION & TESTING

- [ ] **T1.33** Create Swagger/OpenAPI documentation:
  - File: `src/api/docs/openapi.ts` or use `swagger-jsdoc` package
  - Document all 9 endpoints with request/response examples
  - Include error response codes (400, 404, 500)

- [ ] **T1.34** Create API documentation in Markdown:
  - File: `docs/API.md`
  - List all endpoints, methods, parameters, responses
  - Include curl examples

- [ ] **T1.35** Write integration tests for API endpoints:
  - File: `tests/api/users.test.ts`
  - Test successful create/read/update flows
  - Test error cases (not found, invalid input)
  - Use Jest + Supertest

- [ ] **T1.36** Write integration tests for role assignment:
  - File: `tests/api/roles.test.ts`
  - Test assigning role to user
  - Test revoking role
  - Test retrieving user's roles

- [ ] **T1.37** Create comprehensive README:
  - File: `README.md`
  - Overview of CIS
  - Setup instructions (clone, npm install, .env config, npx prisma migrate dev)
  - Running tests: `npm test`
  - Starting dev server: `npm run dev`
  - API documentation link

- [ ] **T1.38** Create CONTRIBUTING.md:
  - Code style guidelines (TypeScript, error handling, logging)
  - Testing expectations (70%+ coverage)
  - PR review process

### VERIFICATION & COMPLETION

- [ ] **T1.39** Run all tests: `npm test` → verify coverage > 70%
- [ ] **T1.40** Start dev server: `npm run dev` → verify on http://localhost:3000
- [ ] **T1.41** Test all 9 endpoints manually using curl/Postman:
  - Create user → verify in database
  - Get user → verify response matches database
  - Update user → verify changes persisted
  - Assign role → verify UserRole table updated
  - Get user roles → verify correct roles returned
- [ ] **T1.42** Verify database state:
  - Check all tables exist in Supabase
  - Verify indexes created
  - Verify seed data present (2 campuses, 5 users, 5 roles)
- [ ] **T1.43** Document any gotchas in `.ai-system/agents/repair-system.md` (schema issues, Prisma quirks, etc.)
- [ ] **T1.44** Update `.ai-system/checkpoints/session-log.md` with completion status
- [ ] **T1.45** Create Phase 1 completion summary in `.ai-system/summaries/dev-history.md`

---

## Up Next: Phase 2 (May 17–30)

> **Section summary:** Auth, permissions, event system. Queued for next sprint after Phase 1 completion.

- [ ] Implement JWT token generation/validation
- [ ] Build permission caching with Redis
- [ ] Implement config-driven role/permission resolution
- [ ] Build IdentityEvent publishing system
- [ ] Implement IdentityEventOutbox processor
- [ ] Set up Upstash Redis

---

## Completed This Sprint

> **Section summary:** Tasks completed during May 7–16. Cleared at sprint end.

(None yet — this is the starting point)

---

## Notes

**Blockers:** Supabase DB access must be confirmed by May 8 to stay on schedule.

**Dependencies:** Phase 1 must complete before Phase 2 can start (auth layer needs working user/role foundation).

**Parallel Work:** Faith Hub mobile team can work independently on May 7–16; no CIS dependency yet.

**Code Quality Gate:** All Phase 1 code must have:

- ✅ TypeScript strict mode enabled
- ✅ Zod input validation
- ✅ Proper error handling (typed errors)
- ✅ Logging at key points
- ✅ 70%+ test coverage
- ✅ TSDoc comments on public methods

Before marking Phase 1 complete, verify:

- [ ] `npm test` passes with coverage > 70%
- [ ] `npm run build` produces no TS errors
- [ ] All 9 API endpoints respond correctly
- [ ] Database migrations are clean
- [ ] No hardcoded values (all in config/env)
- [ ] All code merged to main and deployed to Supabase
