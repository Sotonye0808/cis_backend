# CIS Bootstrap Guide: How to Use This AI System

> **Overview:** This guide explains how to navigate and use the `.ai-system` documentation to develop the Canonical Identity Service. Start here before any coding.

---

## File Navigation Quick Reference

### For Project Understanding (Read First)

1. **[.ai-context.md](.ai-context.md)** — 2-min overview of entire project
2. **[.ai-system/agents/project-context-cis.md](.ai-system/agents/project-context-cis.md)** — Deep dive into CIS purpose, constraints, target users (10 min)
3. **[.ai-system/agents/system-architecture-cis.md](.ai-system/agents/system-architecture-cis.md)** — Technical architecture, schema, API contract (15 min)

### For Execution (Reference During Development)

4. **[.ai-system/planning/project-plan-cis.md](.ai-system/planning/project-plan-cis.md)** — Full 5-phase roadmap with success metrics (10 min)
5. **[.ai-system/planning/task-queue-cis-phase1.md](.ai-system/planning/task-queue-cis-phase1.md)** — Granular Phase 1 tasks (May 7–16) — THIS IS YOUR SPRINT BACKLOG (20 min)

### For Debugging & Learning

6. **[.ai-system/agents/repair-system.md](.ai-system/agents/repair-system.md)** — Known errors and fixes (search when you hit a problem)
7. **[.ai-system/memory/project-decisions.md](.ai-system/memory/project-decisions.md)** — Past decisions and their reasoning (check before proposing architecture changes)

### For Checkpoints & History

8. **[.ai-system/checkpoints/session-log.md](.ai-system/checkpoints/session-log.md)** — What was done in each session (update at end of sprint)
9. **[.ai-system/summaries/dev-history.md](.ai-system/summaries/dev-history.md)** — Full development history (for retrospectives)

---

## Workflow: How to Build CIS

### Step 1: Understand the System (30 minutes)

```
Read in this order:
1. .ai-system/agents/project-context-cis.md
2. .ai-system/agents/system-architecture-cis.md
```

**Questions to answer for yourself:**

- Why does CIS exist? (fragmented identity across 5 systems)
- What are the 3 key architectural principles? (config-driven, non-blocking, federated)
- What are the 8 core data models? (CanonicalUser, CanonicalRole, PlatformUserMapping, IdentityEvent, etc.)

### Step 2: See the Roadmap (15 minutes)

```
Read: .ai-system/planning/project-plan-cis.md
```

**Key questions:**

- What's the timeline? (May 7 → July 31, with 5 phases)
- What's my current phase? (Phase 1 for May 7–16)
- What's the hard deadline? (May 20 for Faith Hub mobile alignment)

### Step 3: Execute Your Sprint (1–2 weeks per phase)

```
Read: .ai-system/planning/task-queue-cis-phase1.md
```

**Your daily workflow:**

1. Pick the first incomplete [ ] task from the queue
2. Implement the task
3. Mark it [x] when done
4. If you hit an error, search `.ai-system/agents/repair-system.md`
5. If you need to make a design decision, record it in `.ai-system/memory/project-decisions.md`
6. At end of sprint, update `.ai-system/checkpoints/session-log.md`

### Step 4: Resolve Unknowns (When Stuck)

**If you hit an error:**

- Search `.ai-system/agents/repair-system.md` for similar errors
- If not found, fix it, then ADD an entry to repair-system.md so others learn

**If you need to make an architecture decision:**

- Record it in `.ai-system/memory/project-decisions.md` with:
  - What was decided
  - Why
  - What alternatives were considered
  - What this affects going forward

**If you're unsure about code patterns:**

- Look at `artifacts/schemas/report-sys-schema.prisma` (best Prisma patterns in the estate)
- Look at audit trail patterns (ReportEvent + ReportVersion)
- Look at config pattern (AdminConfigEntry)

### Step 5: Share Progress (End of Each Checkpoint)

After completing a checkpoint (e.g., Phase 1 on May 16):

1. Update `.ai-system/checkpoints/session-log.md` with:
   - What was completed
   - What blockers were hit
   - What still needs work

2. Update `.ai-system/summaries/dev-history.md` with:
   - Date range
   - Phase completed
   - Key decisions made
   - Notable technical wins or technical debt introduced

---

## Phase 1 Quick Start (May 7–16)

**Your job for the next 10 days:**

1. **Today (May 7):**
   - Read `.ai-system/agents/project-context-cis.md`
   - Read `.ai-system/agents/system-architecture-cis.md`
   - Confirm Supabase database access (Task T1.1)

2. **May 8–9:**
   - Set up CIS repository (Tasks T1.2–T1.9)
   - Create Prisma schema (Tasks T1.10–T1.14)
   - Run first migration

3. **May 10–12:**
   - Build repository layer (Tasks T1.15–T1.20)
   - Write unit tests

4. **May 13–14:**
   - Build service layer (Tasks T1.21–T1.25)
   - Implement validation

5. **May 15–16:**
   - Build API routes (Tasks T1.26–T1.32)
   - Write integration tests
   - Verify everything works (Tasks T1.33–T1.45)

**Success on May 16:** `npm test` passes, all 9 API endpoints work, database clean.

---

## Key Design Principles (Don't Forget These)

When implementing Phase 1, keep these principles in mind:

1. **Config-Driven:** Nothing about roles, permissions, or org hierarchy should be hardcoded. It all lives in ConfigEntry table.
   - ❌ Bad: `const PASTORAL_ROLES = ['SPO', 'CAMPUS_PASTOR', ...]`
   - ✅ Good: Load roles from ConfigEntry table by namespace

2. **Non-Blocking:** No synchronous writes to external systems. Events are async.
   - ❌ Bad: await reportingSystemAPI.updateUser(...)
   - ✅ Good: Insert into IdentityEventOutbox, return immediately, process async

3. **Typed Errors:** All errors are typed, with statusCode and code properties.
   - ❌ Bad: throw new Error('User not found')
   - ✅ Good: throw new UserNotFoundError('User with id X not found')

4. **Immutable Audit Trail:** Every change is logged with actor, timestamp, old/new value.
   - ✅ Record: IdentityEvent { userId, eventType, changes, actor, timestamp }

5. **Minimal Dependencies:** Don't add packages you don't need. Required:
   - ✅ express, typescript, zod, pino, dotenv, cors, helmet
   - ✅ @prisma/client (already listed)
   - ❓ Ask before adding anything else

6. **Explicit Error Handling:** Every async function has try/catch. Every promise has .catch().
   - ❌ Bad: await userRepository.findById(id) // might throw!
   - ✅ Good: try { const user = await ... } catch (error) { ... }

---

## Pattern Examples from Existing Systems

CIS should learn from the best patterns in the estate:

### Audit Trail (from report-sys)

**Pattern: ReportEvent + ReportVersion**

```prisma
model ReportEvent {
  id          String
  eventType   String  // e.g., "CREATED", "SUBMITTED", "APPROVED"
  previousStatus String?
  newStatus   String?
  snapshotId  String?
  // + metadata about who/when/why
}

model ReportVersion {
  id          String
  reportId    String
  versionNumber Int
  snapshot    Json  // full state at this moment
  reason      String?
}
```

**CIS will use:** IdentityEvent + full snapshot in event data

### Config Pattern (from report-sys)

**Pattern: AdminConfigEntry**

```prisma
model AdminConfigEntry {
  namespace   String  // e.g., "role:SPO:v1"
  version     Int     // incremental; highest wins
  payload     Json
  // Don't query by key; always read latest version
}

// Query: ORDER BY version DESC LIMIT 1
```

**CIS will use:** ConfigEntry with namespace + key + version

### Permission Checking (pattern you should invent)

Look at how report-sys checks if a user can approve a report. Adopt a similar pattern for CIS permission checks:

```typescript
// Service layer method
async canUserPerformAction(userId, actionCode, scopeId): Promise<boolean> {
  // 1. Resolve user's roles (cached)
  // 2. For each role, get its permissions (config-driven)
  // 3. Check if action is in permissions
  // 4. Verify scope applicability
  // 5. Return boolean
}
```

---

## Testing Your Work

### Phase 1 Test Checklist

Before marking Phase 1 complete (May 16), run:

```bash
# Unit tests (repositories)
npm test -- tests/repositories

# Integration tests (API)
npm test -- tests/api

# Coverage report
npm test -- --coverage

# Build check
npm run build

# Dev server
npm run dev
# Visit http://localhost:3000/api/v1/users
# Should get empty array []
```

### Manual Testing (5 endpoints)

1. **Create user:**

   ```bash
   curl -X POST http://localhost:3000/api/v1/users \
     -H "Content-Type: application/json" \
     -d '{"email":"john@harvesters.org","firstName":"John"}'
   ```

2. **Get user:**

   ```bash
   curl http://localhost:3000/api/v1/users/by-email/john@harvesters.org
   ```

3. **Update user:**

   ```bash
   curl -X PATCH http://localhost:3000/api/v1/users/{id} \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Jonathan"}'
   ```

4. **Assign role:**

   ```bash
   curl -X POST http://localhost:3000/api/v1/users/{userId}/roles/{roleId}
   ```

5. **Get user roles:**
   ```bash
   curl http://localhost:3000/api/v1/users/{userId}/roles
   ```

All should return 200 OK with valid JSON.

---

## Common Questions (FAQ)

**Q: Should I hardcode role names?**
A: No. Read from ConfigEntry table. See pattern in system-architecture-cis.md.

**Q: What if Supabase connection is slow?**
A: Add connection pooling and caching. Phase 2 covers caching.

**Q: Can I use different validation library instead of Zod?**
A: No. Zod is standard across the estate. Use it.

**Q: How do I handle errors?**
A: Create typed error classes. Return statusCode + code + message. Log with Pino.

**Q: When do I start working on Phase 2?**
A: Only after Phase 1 is 100% complete and passes all tests. Target May 17.

**Q: Can I skip tests?**
A: No. 70%+ coverage is required before Phase 2. Tests catch bugs early.

---

## Getting Help

1. **Ambiguous task:** Check system-architecture-cis.md or project-context-cis.md
2. **Hit an error:** Search repair-system.md, or add new entry
3. **Need pattern example:** Look at report-sys in artifacts/schemas/
4. **Unsure about design:** Check project-decisions.md or add new decision
5. **Completely stuck:** Document the blocker in session notes and notify tech lead

---

## Celebration Points

These are milestones worth celebrating:

- ✅ **May 9:** First Prisma migration runs successfully
- ✅ **May 12:** All repository unit tests pass
- ✅ **May 14:** All API integration tests pass
- ✅ **May 16:** Phase 1 complete, npm test passes, Supabase synced

---

## Next Steps After Phase 1

Once Phase 1 is complete (May 16):

1. Update `.ai-system/checkpoints/session-log.md`
2. Update `.ai-system/summaries/dev-history.md`
3. Start Phase 2 tasks in new task-queue-cis-phase2.md
4. Focus: JWT auth, permission caching, event system

See `.ai-system/planning/project-plan-cis.md` for Phase 2 details.
