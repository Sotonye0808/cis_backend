# CIS Development — Master Index

> **Status:** ✅ Bootstrap complete, ready for Phase 1 execution  
> **Date:** May 7, 2026  
> **Team:** Canonical Identity Service Development

This index connects all CIS documentation and planning files created during the bootstrap session.

---

## 🚀 START HERE (5 minutes)

**New to the project?** Start with these in order:

1. **[BOOTSTRAP_GUIDE.md](BOOTSTRAP_GUIDE.md)** — How to use this AI system and execute Phase 1
2. **[CIS_BOOTSTRAP_COMPLETE.md](CIS_BOOTSTRAP_COMPLETE.md)** — What has been created and completion checklist

Then move to the sections below based on your role.

---

## 📋 FOR PROJECT MANAGERS / TECH LEADS

**Understand the big picture:**

1. **[.ai-system/planning/project-plan-cis.md](.ai-system/planning/project-plan-cis.md)** (10 min)
   - 5-phase roadmap: May 7 → July 31
   - Phase deliverables and success metrics
   - Risk management and contingencies
   - Checkpoint milestones with approval gates

2. **[.ai-system/agents/project-context-cis.md](.ai-system/agents/project-context-cis.md)** (10 min)
   - Project purpose: Why CIS exists
   - Target users and their needs
   - Business constraints (config-driven, non-blocking, multi-org capable)
   - Current phase and active focus

3. **[CIS_BOOTSTRAP_COMPLETE.md](CIS_BOOTSTRAP_COMPLETE.md)** (5 min)
   - What was created in bootstrap
   - Phase 1 timeline (May 8–16)
   - Final checklist before kickoff

**Track daily progress:**

- **[.ai-system/planning/task-queue-cis-phase1.md](.ai-system/planning/task-queue-cis-phase1.md)** — Update daily as tasks complete
- **[.ai-system/checkpoints/session-log.md](.ai-system/checkpoints/session-log.md)** — Update at end of each session
- **[.ai-system/summaries/dev-history.md](.ai-system/summaries/dev-history.md)** — Archive completed sprints here

---

## 💻 FOR DEVELOPERS (CODING)

**Execute Phase 1 (May 8–16):**

1. **[BOOTSTRAP_GUIDE.md](BOOTSTRAP_GUIDE.md)** → Section "Phase 1 Quick Start" (daily workflow)
2. **[.ai-system/agents/system-architecture-cis.md](.ai-system/agents/system-architecture-cis.md)** → Reference data models and API design while coding
3. **[.ai-system/planning/task-queue-cis-phase1.md](.ai-system/planning/task-queue-cis-phase1.md)** → Pick first [ ] incomplete task and implement

**When stuck:**

- Search **[.ai-system/agents/repair-system.md](.ai-system/agents/repair-system.md)** for known errors
- Check **[.ai-system/memory/project-decisions.md](.ai-system/memory/project-decisions.md)** for past decisions
- Reference **[artifacts/01_backend_architecture_abstraction_v2.md](artifacts/01_backend_architecture_abstraction_v2.md)** for pattern examples (audit trails, config, schemas)

**Testing & Verification:**

- Unit tests: See task T1.20 in task queue
- Integration tests: See task T1.35–T1.36
- Manual verification: See task T1.41 (curl endpoint checks)
- Coverage requirement: 70%+ (task T1.39)

---

## 🏗️ FOR ARCHITECTS / SENIOR ENGINEERS

**Understand the technical design:**

1. **[.ai-system/agents/system-architecture-cis.md](.ai-system/agents/system-architecture-cis.md)** (20 min)
   - Architecture diagram
   - Module breakdown (8 core modules)
   - Data flow (identity lookup, updates, permission checks, config reads)
   - Configuration system (ConfigEntry pattern)
   - Event system & async outbox pattern
   - Full Prisma schema with explanations
   - API contract (20 endpoints)
   - Tech stack and constraints

2. **[artifacts/01_backend_architecture_abstraction_v2.md](artifacts/01_backend_architecture_abstraction_v2.md)** (reference)
   - Study patterns from existing systems (report-sys, MyHarvestHub, DMHicc)
   - Audit trail patterns (ReportEvent + ReportVersion)
   - Config patterns (AdminConfigEntry)
   - Role complexity insights

3. **[.ai-system/planning/project-plan-cis.md](.ai-system/planning/project-plan-cis.md)** → Phases 2–5 (what comes after Phase 1)

**Review Phase 1 code before Phase 2:**

- Ensure Phase 1 follows patterns in system-architecture-cis.md
- Check error handling uses typed errors (not generic Error)
- Verify config-driven approach (no hardcoded roles/permissions)
- Validate async patterns are ready for event system (Phase 2)

---

## 📚 DOCUMENTATION MAP

### Project Understanding (Read First)

| Document                                                                                     | Length | Purpose                                     | Audience               |
| -------------------------------------------------------------------------------------------- | ------ | ------------------------------------------- | ---------------------- |
| [BOOTSTRAP_GUIDE.md](BOOTSTRAP_GUIDE.md)                                                     | 10 min | How to use this AI system, Phase 1 workflow | Everyone               |
| [CIS_BOOTSTRAP_COMPLETE.md](CIS_BOOTSTRAP_COMPLETE.md)                                       | 10 min | What was created, readiness checklist       | PMs, Tech Leads        |
| [.ai-system/agents/project-context-cis.md](.ai-system/agents/project-context-cis.md)         | 10 min | CIS purpose, constraints, users             | Everyone               |
| [.ai-system/agents/system-architecture-cis.md](.ai-system/agents/system-architecture-cis.md) | 20 min | Technical design, schema, API               | Architects, Developers |

### Execution Plans

| Document                                                                                     | Length | Purpose                     | Audience                     |
| -------------------------------------------------------------------------------------------- | ------ | --------------------------- | ---------------------------- |
| [.ai-system/planning/project-plan-cis.md](.ai-system/planning/project-plan-cis.md)           | 15 min | Full 5-phase roadmap        | PMs, Tech Leads, Architects  |
| [.ai-system/planning/task-queue-cis-phase1.md](.ai-system/planning/task-queue-cis-phase1.md) | 30 min | 45 Phase 1 tasks (May 8–16) | Developers (daily reference) |

### Reference & Learning

| Document                                                                                                   | Purpose                      | When to Read                 |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------- |
| [.ai-system/agents/repair-system.md](.ai-system/agents/repair-system.md)                                   | Known errors and fixes       | When debugging               |
| [.ai-system/memory/project-decisions.md](.ai-system/memory/project-decisions.md)                           | Past architectural decisions | Before proposing changes     |
| [artifacts/01_backend_architecture_abstraction_v2.md](artifacts/01_backend_architecture_abstraction_v2.md) | Existing system patterns     | When designing code patterns |

### Progress Tracking

| Document                                                                       | Purpose                       | Update Frequency    |
| ------------------------------------------------------------------------------ | ----------------------------- | ------------------- |
| [.ai-system/checkpoints/session-log.md](.ai-system/checkpoints/session-log.md) | What was done in each session | End of each session |
| [.ai-system/summaries/dev-history.md](.ai-system/summaries/dev-history.md)     | Full development history      | End of each phase   |

---

## 🎯 QUICK REFERENCE

### Key Dates

| Date        | Milestone                                            | Status   |
| ----------- | ---------------------------------------------------- | -------- |
| **May 7**   | ✅ Bootstrap complete                                | **DONE** |
| **May 16**  | Phase 1 complete (schema + CRUD)                     | Upcoming |
| **May 20**  | Faith Hub mobile deadline (parallel)                 | Upcoming |
| **May 30**  | Phase 2 complete (auth + events)                     | Upcoming |
| **June 13** | Phase 3 complete (Reporting + Faith Hub integration) | Upcoming |
| **July 10** | Phase 4 complete (all 5 platforms + admin UI)        | Upcoming |
| **July 31** | Phase 5 complete (production-ready)                  | Upcoming |
| **Aug 7**   | 🎉 Go-live                                           | Upcoming |

### Success Criteria by Phase

**Phase 1 (May 16):**

- npm test passes (70%+ coverage)
- 9 API endpoints working
- Database migrated cleanly
- Zero hardcoded config

**Phase 2 (May 30):**

- JWT auth working
- Permission caching < 5ms
- Event system delivering to Redis
- Role inheritance validated

**Phase 3 (June 13):**

- Reporting System users migrated
- Faith Hub users migrated
- Bidirectional sync working
- E2E test passes

**Phase 5 (July 31):**

- All 5 platforms synced
- < 100ms p99 latency
- 99.9% event delivery
- Security audit passed
- Team trained

---

## 🔑 Core Design Principles

When building CIS, keep these principles in mind:

1. **Config-Driven:** Everything about roles, permissions, org hierarchy lives in ConfigEntry table. Nothing hardcoded.

2. **Non-Blocking:** Identity changes broadcast asynchronously via outbox pattern. No synchronous writes to multiple databases on a single request.

3. **Federated:** Each platform (Faith Hub, Reporting, CRM, DMHicc, MyHarvestHub) integrates independently with CIS. No monolithic rewrite.

4. **Typed Errors:** All errors are typed with statusCode, code, message. No generic `throw new Error(...)`.

5. **Immutable Audit Trail:** Every identity change logged to IdentityEvent with actor, timestamp, old/new value. Supports compliance.

6. **Minimal Dependencies:** Only add packages you absolutely need. Required: express, zod, pino, prisma, typescript, dotenv.

---

## 📞 Getting Help

| Problem          | Solution                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Task unclear     | Read task description in task-queue-cis-phase1.md carefully; check links to system-architecture-cis.md |
| Hit an error     | Search repair-system.md for similar errors; add new entry if not found                                 |
| Design question  | Check project-decisions.md for past decisions; add new decision if proposing change                    |
| Pattern example  | Look at artifacts/schemas/ (report-sys best practices) or system-architecture-cis.md                   |
| Completely stuck | Document blocker in session notes; ping tech lead                                                      |

---

## 🚦 Daily Standup Template

Use this to update team on progress:

```
**Date:** [Date]
**Phase:** [1–5]
**Yesterday:** [Task #s completed]
**Today:** [Task #s planned]
**Blockers:** [None / description]
**Test Status:** [passing / X failures]
**Coverage:** [%]
**Notes:** [Any insights/risks]
```

---

## 📊 Execution Checklist

### Before Phase 1 Kickoff (May 8)

- [ ] Supabase database access confirmed (all team members)
- [ ] All developers read BOOTSTRAP_GUIDE.md
- [ ] All developers read project-context-cis.md
- [ ] Repository created and git configured
- [ ] Node.js 18+ installed on all machines
- [ ] Slack/Teams channel set up

### Daily During Phase 1 (May 8–16)

- [ ] Pick first incomplete [ ] task
- [ ] Implement following file paths and signatures exactly
- [ ] Write tests (unit for repos, integration for APIs)
- [ ] Mark [x] when complete
- [ ] If stuck, search repair-system.md or escalate

### End of Phase 1 (May 16)

- [ ] npm test passes (70%+ coverage)
- [ ] npm run build (no TS errors)
- [ ] All 9 API endpoints tested manually
- [ ] Database synced and clean
- [ ] All code reviewed and merged to main
- [ ] Session log and dev history updated

### Before Phase 2 Kickoff (May 17)

- [ ] Phase 1 completion sign-off from tech lead
- [ ] Task queue updated with Phase 2 tasks
- [ ] Team briefing on Phase 2 (auth + events)

---

## 🏆 Success Definition (End of CIS)

When Phase 5 completes on July 31, CIS is successful if:

1. ✅ **100% of Harvesters users** have a canonical CIS record
2. ✅ **Zero cross-platform identity conflicts** (email uniqueness enforced)
3. ✅ **< 100ms p99 latency** for all identity operations
4. ✅ **99.9% event delivery** to all platforms (async outbox)
5. ✅ **Zero hardcoded roles/permissions/org-hierarchy** (100% config-driven)
6. ✅ **Complete audit trail** (all changes logged with actor, timestamp, reason)
7. ✅ **All platform teams trained** (self-sufficient with CIS SDKs)
8. ✅ **Mobile-first API** (Faith Hub mobile integrated with < 1 week effort)

---

## 📞 Questions?

- **What is CIS?** → Read project-context-cis.md
- **How is it built?** → Read system-architecture-cis.md
- **What's the plan?** → Read project-plan-cis.md
- **What do I code?** → Read task-queue-cis-phase1.md
- **How do I work?** → Read BOOTSTRAP_GUIDE.md

---

## 📂 File Structure

```
cis_backend/
├── BOOTSTRAP_GUIDE.md                        ← Start here
├── CIS_BOOTSTRAP_COMPLETE.md                 ← Summary & checklist
├── CIS_MASTER_INDEX.md                       ← This file
├── artifacts/
│   ├── 01_backend_architecture_abstraction_v2.md
│   ├── harvesters_tech_initiative_prd.md
│   ├── api_documentations/
│   ├── schemas/
│   └── types/
├── .ai-system/
│   ├── agents/
│   │   ├── project-context-cis.md            ← Project overview
│   │   ├── system-architecture-cis.md        ← Technical design
│   │   ├── general-instructions.md
│   │   ├── repair-system.md
│   │   └── (others)
│   ├── planning/
│   │   ├── project-plan-cis.md               ← 5-phase roadmap
│   │   └── task-queue-cis-phase1.md          ← 45 Phase 1 tasks
│   ├── checkpoints/
│   │   └── session-log.md
│   ├── memory/
│   │   ├── project-decisions.md
│   │   └── lessons-learned.md
│   └── summaries/
│       └── dev-history.md
└── cis/ ← To be created May 8 (Phase 1)
    ├── src/
    ├── prisma/
    ├── tests/
    └── (code structure per task T1.2)
```

---

## 🎯 Your Next Actions

1. **Today (May 7):**
   - [ ] Read BOOTSTRAP_GUIDE.md
   - [ ] Read project-context-cis.md
   - [ ] Confirm Supabase access

2. **Tomorrow (May 8):**
   - [ ] Start task T1.1 (confirm Supabase)
   - [ ] Start task T1.2–T1.9 (setup)
   - [ ] Begin daily standups

3. **May 16:**
   - [ ] Phase 1 complete ✅
   - [ ] Phase 2 planning begins

---

**Built with:** `.ai-system` guided development framework  
**Status:** Ready for Phase 1 execution  
**Go Date:** May 8, 2026

**Questions? Read one of the files above. Everything you need is documented. Let's go! 🚀**
