# DMHicc API Documentation

This document describes the API surface exposed under `/app/api/*` in the DMHicc campaign management system.

The API is built with Next.js route handlers, TypeScript, Zod validation, and a shared response helper layer. It is organized by domain rather than by technical layer, so each route folder maps directly to a functional area of the product.

## 1. API Design Principles

- REST-inspired route structure with resource-oriented paths.
- JSON request and response bodies for standard CRUD and analytics operations.
- Zod validation at the route boundary for incoming payloads.
- Auth handled with JWT cookies and role-aware middleware.
- Consistent service-layer separation: route handlers orchestrate, services perform the business logic.
- Pagination is available on list endpoints that return collections.

## 2. Authentication And Access Control

The API uses three broad access levels:

- Public: no auth required.
- Authenticated: requires a valid session or JWT cookie.
- Role-gated: requires one or more elevated roles such as `ADMIN`, `SUPER_ADMIN`, or `TEAM_LEAD`.

### Common auth helpers

- `requireAuth()` for any signed-in user.
- `requireRole([...])` for elevated endpoints.
- `getAuthenticatedUser()` for best-effort access when the handler can fall back to anonymous behavior.

### Auth endpoints

| Method | Path                 | Access               | Purpose                                                        |
| ------ | -------------------- | -------------------- | -------------------------------------------------------------- |
| POST   | `/api/auth/register` | Public               | Create a new account and issue auth cookies.                   |
| POST   | `/api/auth/login`    | Public               | Authenticate with email and password, then issue auth cookies. |
| POST   | `/api/auth/refresh`  | Public, cookie-based | Rotate access and refresh tokens.                              |
| POST   | `/api/auth/logout`   | Public               | Clear auth cookies.                                            |
| GET    | `/api/auth/me`       | Authenticated        | Return the current authenticated user.                         |

### Auth response notes

- Login and registration return an `AuthUser` object inside the shared API envelope.
- `/api/auth/me` returns the current user or `401 Unauthorized`.
- Refresh and logout are cookie-driven and do not rely on request bodies.

## 3. Response Format

Most endpoints use the shared response shape defined in `types/api.ts`.

### Standard success response

```json
{
  "success": true,
  "data": { ... }
}
```

### Standard error response

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Paginated responses

List endpoints commonly return:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Common status codes

- `200 OK` for successful reads and updates.
- `201 Created` for new resources.
- `400 Bad Request` for invalid input.
- `401 Unauthorized` when auth is missing or invalid.
- `403 Forbidden` when the caller lacks the required role or ownership.
- `404 Not Found` when a resource does not exist.
- `500 Internal Server Error` for unexpected server failures.

### Important exception

Not every endpoint uses the standard envelope. The clearest exception is `/api/smart-links/track`, which returns lightweight tracking objects such as `{ ok: true }` or `{ ok: false }` because it is optimized for client-side event logging.

## 4. Query And Filtering Conventions

Common query parameters across list endpoints:

- `page`: 1-based page number.
- `pageSize`: requested page size, usually capped server-side.
- `search`: free-text search.
- `status`: resource lifecycle filter.
- `goalType`: campaign goal filter.
- `groupId`: group-scoped filtering where applicable.

Pagination is typically normalized in the handler so invalid values fall back to safe defaults.

## 5. Domain Endpoint Reference

## 5.1 Campaigns

| Method | Path                               | Access                 | Purpose                                                 |
| ------ | ---------------------------------- | ---------------------- | ------------------------------------------------------- |
| GET    | `/api/campaigns`                   | Authenticated          | List campaigns with filters and pagination.             |
| POST   | `/api/campaigns`                   | `ADMIN`, `SUPER_ADMIN` | Create a new campaign.                                  |
| GET    | `/api/campaigns/me`                | Authenticated          | Return campaigns joined or created by the current user. |
| GET    | `/api/campaigns/joined`            | Authenticated          | Return the current user's joined campaign IDs.          |
| GET    | `/api/campaigns/[id]`              | Authenticated          | Fetch a single campaign.                                |
| PUT    | `/api/campaigns/[id]`              | `ADMIN`, `SUPER_ADMIN` | Update campaign metadata or lifecycle fields.           |
| DELETE | `/api/campaigns/[id]`              | `ADMIN`, `SUPER_ADMIN` | Archive a campaign via soft delete.                     |
| GET    | `/api/campaigns/[id]/audit`        | `ADMIN`, `SUPER_ADMIN` | Retrieve campaign audit history.                        |
| GET    | `/api/campaigns/[id]/participants` | Authenticated          | List campaign participants.                             |
| POST   | `/api/campaigns/[id]/participants` | Authenticated          | Join a campaign.                                        |
| POST   | `/api/campaigns/[id]/track-view`   | Public                 | Increment campaign view count with deduplication.       |

### Campaign behavior notes

- Listing is role-aware; the same endpoint can return different visibility scopes depending on the caller.
- Campaign creation and edits are strictly role-gated.
- Joining a campaign is authenticated and typically creates participation records plus related tracking side effects.
- View tracking is intentionally public so campaign landing pages can record visits before authentication.

## 5.2 Smart Links

| Method | Path                        | Access        | Purpose                                                      |
| ------ | --------------------------- | ------------- | ------------------------------------------------------------ |
| GET    | `/api/smart-links`          | Authenticated | List smart links for the current user or by campaign filter. |
| POST   | `/api/smart-links`          | Authenticated | Generate or return a smart link for a campaign.              |
| POST   | `/api/smart-links/generate` | Authenticated | Force smart-link generation.                                 |
| GET    | `/api/smart-links/[id]`     | Authenticated | Fetch one smart link.                                        |
| DELETE | `/api/smart-links/[id]`     | Authenticated | Deactivate a smart link, usually owner-or-admin scoped.      |
| POST   | `/api/smart-links/track`    | Public        | Track click and share events with deduplication.             |

### Smart-link behavior notes

- Tracking uses a slug-based event model.
- The track endpoint supports `CLICK` and `SHARE` event types.
- Click tracking can stamp a cookie for deduplication and uses request metadata such as IP address and user-agent.
- The endpoint may also consult the authenticated user when available, but it does not require auth.

## 5.3 Donations

| Method | Path                            | Access                              | Purpose                                     |
| ------ | ------------------------------- | ----------------------------------- | ------------------------------------------- |
| POST   | `/api/donations`                | Authenticated                       | Record a new donation for the current user. |
| GET    | `/api/donations/me`             | Authenticated                       | List the current user's donations.          |
| GET    | `/api/donations/analytics`      | `ADMIN`, `SUPER_ADMIN`              | View donation analytics.                    |
| GET    | `/api/donations/admin`          | `ADMIN`, `SUPER_ADMIN`              | View donation records with admin filters.   |
| PATCH  | `/api/donations/batch-verify`   | `ADMIN`, `SUPER_ADMIN`              | Batch verify or reject donations.           |
| GET    | `/api/donations/campaigns/[id]` | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | View campaign fundraising stats.            |
| PATCH  | `/api/donations/[id]/proof`     | Authenticated                       | Attach or update donation proof.            |
| PATCH  | `/api/donations/[id]/verify`    | `ADMIN`, `SUPER_ADMIN`              | Verify or reject a single donation.         |

### Donation behavior notes

- User-facing donation submission is authenticated.
- Admin flows typically update verification state and campaign totals.
- Proof uploads are separated from donation creation so evidence can be attached later.

## 5.4 Engagement

| Method | Path                                  | Access                              | Purpose                                             |
| ------ | ------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| GET    | `/api/engagement/timeline`            | Authenticated                       | Return the current user's engagement timeline.      |
| GET    | `/api/engagement/me`                  | Authenticated                       | Return the current user's engagement summary.       |
| GET    | `/api/engagement/campaigns/[id]`      | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | Return campaign engagement stats.                   |
| GET    | `/api/engagement/proofs`              | Authenticated                       | List view proofs with role-scoped visibility.       |
| POST   | `/api/engagement/proofs`              | Authenticated                       | Submit a new proof.                                 |
| PATCH  | `/api/engagement/proofs/batch-review` | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | Batch approve or reject proofs.                     |
| PATCH  | `/api/engagement/proofs/[id]/review`  | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | Review a single proof and award points on approval. |

### Engagement behavior notes

- Proof review is tightly tied to points awarding.
- Role-based proof visibility allows self-service for users while enabling leader review flows.

## 5.5 Analytics

| Method | Path                            | Access                              | Purpose                         |
| ------ | ------------------------------- | ----------------------------------- | ------------------------------- |
| GET    | `/api/analytics/overview`       | `ADMIN`, `SUPER_ADMIN`              | Return platform-wide analytics. |
| GET    | `/api/analytics/me`             | Authenticated                       | Return current-user analytics.  |
| GET    | `/api/analytics/teams`          | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | Return team analytics.          |
| GET    | `/api/analytics/campaigns/[id]` | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | Return campaign analytics.      |

### Analytics behavior notes

- Overview endpoints are admin-only.
- User-specific analytics are exposed separately so personal metrics do not require elevated access.

## 5.6 Leaderboard

| Method | Path                              | Access                 | Purpose                                    |
| ------ | --------------------------------- | ---------------------- | ------------------------------------------ |
| GET    | `/api/leaderboard/global`         | Authenticated          | Return the global leaderboard.             |
| GET    | `/api/leaderboard/me`             | Authenticated          | Return the current user's ranking.         |
| GET    | `/api/leaderboard/group`          | Authenticated          | Return the group leaderboard.              |
| GET    | `/api/leaderboard/team`           | Authenticated          | Return the team leaderboard.               |
| POST   | `/api/leaderboard/snapshot`       | `ADMIN`, `SUPER_ADMIN` | Refresh leaderboard snapshot data.         |
| GET    | `/api/leaderboard/campaigns/[id]` | Authenticated          | Return campaign-specific leaderboard data. |

### Leaderboard behavior notes

- Snapshot generation is administrative because it updates cached ranking state.
- Read endpoints are broadly available to authenticated users.

## 5.7 Teams

| Method | Path                      | Access                              | Purpose                                                     |
| ------ | ------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/teams`              | Authenticated                       | List teams, optionally filtered by group.                   |
| POST   | `/api/teams`              | `ADMIN`, `SUPER_ADMIN`              | Create a team.                                              |
| GET    | `/api/teams/[id]`         | Authenticated                       | Fetch a team and its members.                               |
| GET    | `/api/teams/[id]/stats`   | Authenticated                       | Fetch team stats.                                           |
| POST   | `/api/teams/[id]/members` | `ADMIN`, `SUPER_ADMIN`, `TEAM_LEAD` | Add a team member.                                          |
| DELETE | `/api/teams/[id]/members` | Authenticated                       | Remove a team member, including limited self-removal cases. |
| POST   | `/api/teams/[id]/lead`    | `ADMIN`, `SUPER_ADMIN`              | Assign a team lead.                                         |
| POST   | `/api/teams/[id]/invite`  | Authenticated                       | Create a team invite with role-based restrictions.          |

### Team behavior notes

- Team membership mutations are role-sensitive and often have extra in-handler checks beyond the middleware gate.
- Invite creation is available to multiple roles, but the final behavior depends on the caller's permissions.

## 5.8 Groups

| Method | Path          | Access                 | Purpose         |
| ------ | ------------- | ---------------------- | --------------- |
| GET    | `/api/groups` | Authenticated          | List groups.    |
| POST   | `/api/groups` | `ADMIN`, `SUPER_ADMIN` | Create a group. |

## 5.9 Users

| Method | Path                      | Access                 | Purpose                                                      |
| ------ | ------------------------- | ---------------------- | ------------------------------------------------------------ |
| GET    | `/api/users`              | `ADMIN`, `SUPER_ADMIN` | List users with search and role filters.                     |
| GET    | `/api/users/me`           | Authenticated          | Return the current profile.                                  |
| PATCH  | `/api/users/me`           | Authenticated          | Update the current profile.                                  |
| GET    | `/api/users/weapons`      | Authenticated          | Return the current user's selected platforms or preferences. |
| PUT    | `/api/users/weapons`      | Authenticated          | Update the current user's selected platforms or preferences. |
| GET    | `/api/users/[id]/profile` | Authenticated          | Return a role-scoped user profile.                           |
| PUT    | `/api/users/[id]/role`    | `ADMIN`, `SUPER_ADMIN` | Change a user's role.                                        |

### User behavior notes

- Self-service profile reads and updates are separated from administrative role management.
- Role-scoped profile reads allow authenticated users to access permitted user information without broad admin access.

## 5.10 Trust And Fraud Review

| Method | Path                           | Access                 | Purpose                                      |
| ------ | ------------------------------ | ---------------------- | -------------------------------------------- |
| GET    | `/api/trust/me`                | Authenticated          | Return the current user's trust score.       |
| GET    | `/api/trust/users`             | `ADMIN`, `SUPER_ADMIN` | List flagged users.                          |
| POST   | `/api/trust/users/[id]/review` | `ADMIN`, `SUPER_ADMIN` | Review a trust flag and record a resolution. |

## 5.11 Referrals

| Method | Path                            | Access                              | Purpose                                             |
| ------ | ------------------------------- | ----------------------------------- | --------------------------------------------------- |
| GET    | `/api/referrals/me`             | Authenticated                       | Return the current user's referral stats.           |
| GET    | `/api/referrals/campaigns/[id]` | `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN` | Return campaign referral summary and top referrers. |

## 5.12 Notifications

| Method | Path                          | Access        | Purpose                                      |
| ------ | ----------------------------- | ------------- | -------------------------------------------- |
| GET    | `/api/notifications`          | Authenticated | List the current user's notifications.       |
| POST   | `/api/notifications/read-all` | Authenticated | Mark all current-user notifications as read. |
| PATCH  | `/api/notifications/[id]`     | Authenticated | Mark one notification as read.               |

## 5.13 Points

| Method | Path                 | Access        | Purpose                                                     |
| ------ | -------------------- | ------------- | ----------------------------------------------------------- |
| GET    | `/api/points/me`     | Authenticated | Return the current user's points summary and rank progress. |
| GET    | `/api/points/ledger` | Authenticated | Return the current user's points ledger.                    |

## 5.14 Public

| Method | Path                | Access | Purpose                                   |
| ------ | ------------------- | ------ | ----------------------------------------- |
| GET    | `/api/public/stats` | Public | Return cached public platform statistics. |

## 5.15 Invite

| Method | Path                       | Access        | Purpose                            |
| ------ | -------------------------- | ------------- | ---------------------------------- |
| GET    | `/api/invite/[token]`      | Public        | Preview invite metadata.           |
| POST   | `/api/invite/[token]/join` | Authenticated | Consume an invite and join a team. |

## 5.16 Upload

| Method | Path          | Access        | Purpose                     |
| ------ | ------------- | ------------- | --------------------------- |
| POST   | `/api/upload` | Authenticated | Upload media to Cloudinary. |
| DELETE | `/api/upload` | Authenticated | Delete a Cloudinary asset.  |

## 5.17 Bug Reports

| Method | Path                    | Access        | Purpose                                                       |
| ------ | ----------------------- | ------------- | ------------------------------------------------------------- |
| POST   | `/api/bug-reports`      | Public        | Submit a bug report, optionally linked to the signed-in user. |
| GET    | `/api/bug-reports`      | `SUPER_ADMIN` | List bug reports with filters.                                |
| GET    | `/api/bug-reports/[id]` | `SUPER_ADMIN` | Fetch a single bug report.                                    |
| PATCH  | `/api/bug-reports/[id]` | `SUPER_ADMIN` | Update bug status or admin notes.                             |

## 6. Request Validation Patterns

Many handlers follow the same pattern:

1. Read the request body with `await request.json()`.
2. Validate with a Zod schema such as `loginSchema`, `createCampaignSchema`, or `createDonationSchema`.
3. Return `400 Bad Request` when validation fails.
4. Pass the validated data to a service function.
5. Convert unexpected errors to a uniform API error response.

This keeps business logic out of the route file and makes handlers easy to scan.

## 7. Implementation Notes

- Route handlers live in `app/api/**/route.ts`.
- Shared response helpers live in `lib/utils/api.ts`.
- Shared response types live in `types/api.ts`.
- Auth helpers live in `lib/middleware/auth.ts`.
- Most business logic is delegated to `modules/<domain>/services/*`.

## 8. Practical Usage Guidance

- Use the authenticated list endpoints for user dashboards and self-service views.
- Use admin and super-admin endpoints only when the operation changes shared state or exposes sensitive aggregates.
- Prefer the dedicated summary endpoints over raw list endpoints when building UI cards and charts.
- Treat `/api/smart-links/track` as fire-and-forget telemetry, not as a normal data-fetching endpoint.

## 9. Quick Reference Summary

### Public endpoints

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/refresh`
- `/api/auth/logout`
- `/api/campaigns/[id]/track-view`
- `/api/smart-links/track`
- `/api/public/stats`
- `/api/invite/[token]`
- `/api/bug-reports`

### Admin and leadership endpoints

- `/api/analytics/overview`
- `/api/analytics/teams`
- `/api/analytics/campaigns/[id]`
- `/api/campaigns` `POST`
- `/api/campaigns/[id]` `PUT` and `DELETE`
- `/api/campaigns/[id]/audit`
- `/api/donations/analytics`
- `/api/donations/admin`
- `/api/donations/batch-verify`
- `/api/donations/[id]/verify`
- `/api/engagement/proofs/batch-review`
- `/api/engagement/proofs/[id]/review`
- `/api/leaderboard/snapshot`
- `/api/trust/users`
- `/api/trust/users/[id]/review`
- `/api/users`
- `/api/users/[id]/role`

## 10. Maintenance Notes

- When a new route is added under `app/api`, update this file in the same change.
- If a route intentionally returns a non-standard payload, document that exception here.
- If the access control changes, update both the route and the corresponding table above.
