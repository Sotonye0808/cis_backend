# Project Decisions

> **Overview:** Log of significant architectural, technical, and product decisions made during development. Agents consult this before proposing changes to avoid contradicting prior reasoning. Each entry records what was decided, why, and what the alternatives were.

---

## Decision Format

```
## [Decision Title]

**Decision:** [What was decided]
**Date:** [YYYY-MM-DD]
**Made by:** [Developer / AI agent / team]

**Reason:**
[Why this choice was made]

**Alternatives Considered:**
[What else was evaluated and why it was rejected]

**Implications:**
[What this decision affects going forward]
```

---

## Decisions

## Cross-Platform Email Check Endpoint

**Decision:** Added `GET /api/v1/users/check-email/:email` to the CIS backend to let client apps check whether a given email already has a CanonicalUser with PlatformUserMappings on other platforms.
**Date:** 2026-05-26
**Made by:** AI implementation session

**Reason:**
Client apps (MyHarvestHub, Reporting System, DMHicc) had no way to detect during signup whether a user's email was already associated with accounts on other platforms. The platformIntegrationService already tracked this data but exposed no public endpoint for client apps to query it pre-signup.

**Alternatives Considered:**
- Reuse existing `GET /users/by-email/:email` and have clients infer platform presence from the user response (rejected: the existing endpoint doesn't include platform mapping data, and adding it would break the existing response contract)
- Add the check as part of the auth token endpoint (rejected: mixes auth concerns with platform discovery)

**Implications:**
- Client apps can now query `GET /api/v1/users/check-email/:email` to determine if an email has accounts on other platforms
- The endpoint returns `{ exists, canonicalUser, platforms[] }`
- The platform integration service is now wired into the users router
- When CIS is not configured, client apps silently skip the check
