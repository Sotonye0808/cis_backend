# API Documentation

This document is a compact reference for the API surface under `app/api`. It focuses on route purpose, access rules, and the behavior callers need to know.

## Conventions

- All endpoints return JSON envelopes shaped like `successResponse(...)` or an error response.
- Authenticated routes rely on the app’s session/auth checks.
- Role checks are enforced server-side; common roles include `SUPERADMIN`, campus/group admins, exec users, and standard members.
- Several routes are idempotent, optimistic-locking aware, or command-style state transitions. When that matters, it is called out below.

## Admin Config

Admin configuration routes manage versioned settings stored by namespace. Public config is split from sensitive config.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/admin-config` | `SUPERADMIN` | List all admin-config namespaces and current snapshots. |
| `GET` | `/api/admin-config/public` | Authenticated user | Return safe client-facing config such as role labels, hierarchy levels, dashboard layout, and PWA copy. |
| `POST` | `/api/admin-config/reconcile` | `SUPERADMIN` | Reconcile legacy data into the new OrgUnit + Role substrate. Supports `?dry=true` for preview mode. |
| `GET` | `/api/admin-config/[ns]` | `SUPERADMIN` | Load one namespace snapshot. |
| `PUT` | `/api/admin-config/[ns]` | `SUPERADMIN` | Write a new version using optimistic locking via `baseVersion`. |
| `POST` | `/api/admin-config/[ns]/reset` | `SUPERADMIN` | Reset a namespace back to its baseline/default state. |
## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public | Authenticate a user and establish a session. |
| `POST` | `/api/auth/logout` | Authenticated user | End the current session. |
| `GET` | `/api/auth/me` | Authenticated user | Return the current authenticated identity. |
| `POST` | `/api/auth/refresh` | Authenticated user | Refresh session state or tokens. |
| `POST` | `/api/auth/register` | Public | Create a new account, typically as `MEMBER`. |
| `POST` | `/api/auth/activate` | Public or invite flow dependent | Activate an account. |
| `POST` | `/api/auth/forgot-password` | Public | Start a password reset flow. |
| `POST` | `/api/auth/reset-password` | Public | Complete a password reset flow. |
| `POST` | `/api/auth/change-password` | Authenticated user | Change the current user’s password. |
| `POST` | `/api/auth/email-verification/request` | Authenticated user | Request an email verification message. |
| `GET` | `/api/auth/email-verification/status` | Authenticated user | Check verification status. |
| `POST` | `/api/auth/email-verification/confirm` | Public or token-based | Confirm email verification. |
| `POST` | `/api/auth/email-change/request` | Authenticated user | Request a change to the primary email address. |
| `POST` | `/api/auth/email-change/confirm` | Public or token-based | Confirm the requested email change. |

## Bug Reports

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/bug-reports` | Authenticated user | Create a new bug report. |
| `GET` | `/api/bug-reports/[id]` | Authenticated user with access | Fetch an existing bug report. |

## Email

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/email/test` | Restricted / admin usage | Send or validate a test email configuration. |

## Form Assignments

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/form-assignment-rules` | Authorized configurators | Create a new form assignment rule. |
| `DELETE` | `/api/form-assignment-rules/[id]` | Owner or `SUPERADMIN` | Archive a rule. |
| `POST` | `/api/form-assignments` | Managers | Create a new form assignment. |
| `DELETE` | `/api/form-assignments/[id]` | Manager | Cancel an assignment. |
| `POST` | `/api/form-assignments/materialise` | Authorized users | Materialise assignments from rules. |
| `POST` | `/api/form-assignments/[id]/quick-fill` | Authorized users | Create a quick-fill action for an assignment. |

## Goals

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/goals/automation` | Authenticated user | Return goal automation state or rules. |
| `GET` | `/api/goals/for-report` | Authenticated user | Resolve goals for a report context using `campusId`, `year`, and `month`. |
| `GET` | `/api/goals/edit-requests` | Privileged users | List pending goal unlock requests. |
| `POST` | `/api/goals/edit-requests` | Authorized users | Create a goal unlock request. |
| `POST` | `/api/goals/edit-requests/[id]/approve` | Approver role | Approve a goal edit request. |
| `POST` | `/api/goals/edit-requests/[id]/reject` | Approver role | Reject a goal edit request. |
| `POST` | `/api/goals/[id]/unlock-request` | Authenticated user | Request permission to edit a locked goal. |
| `POST` | `/api/goals` | Group admin or higher | Create or upsert a goal. |
| `POST` | `/api/goals/bulk` | Privileged users | Bulk create or update goals atomically. |
| `GET` | `/api/goals/[id]` | Authenticated user with access | Fetch a goal. |
| `DELETE` | `/api/goals/[id]` | `SUPERADMIN` | Soft-delete or archive a goal. |

## Imports

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/imports` | Authenticated user | Create a draft import job. |
| `GET` | `/api/imports/profiles` | Authenticated user | List saved mapping profiles for the current user. |
| `GET` | `/api/imports/[id]` | Owner / authorized viewer | Fetch an import job. |
| `DELETE` | `/api/imports/[id]` | Owner | Cancel or delete an import job. |
| `PUT` | `/api/imports/[id]/file` | Owner | Attach or replace the source file for an import. |
| `POST` | `/api/imports/[id]/validate` | Owner | Validate the import payload and mappings. |
| `POST` | `/api/imports/[id]/commit` | Owner | Commit the import job. |
| `PUT` | `/api/imports/[id]/mapping` | Owner | Update mapping configuration. |

## Impersonation

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/impersonation/start` | Privileged user | Begin impersonating another user. |
| `POST` | `/api/impersonation/stop` | Active impersonator | End impersonation. |
| `GET` | `/api/impersonation/me` | Authenticated user | Inspect current impersonation state. |
| `GET` | `/api/impersonation/sessions` | Privileged user | List impersonation sessions. |
| `POST` | `/api/impersonation/mode` | Privileged user | Change impersonation mode or policy. |

## Invite Links

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/invite-links` | `SUPERADMIN` and leaders | Create an invite link. |
| `POST` | `/api/invite-links/bulk` | Privileged users | Create multiple invite links. |
| `GET` | `/api/invite-links/validate/[token]` | Public | Validate an invite token before use. |
| `DELETE` | `/api/invite-links/[id]` | Owner or admin | Revoke an invite link. |

## Labels

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/labels/resolve` | Authenticated user | Resolve labels for the current context. |

## Notifications

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | Authenticated user | List notifications. |
| `POST` | `/api/notifications/read-all` | Authenticated user | Mark all notifications as read. |
| `POST` | `/api/notifications/[id]/read` | Authenticated user | Mark a single notification as read. |
| `POST` | `/api/notifications/preferences` | Authenticated user | Update notification preferences. |
| `POST` | `/api/notifications/pwa-dismissal` | Authenticated user | Persist PWA dismissal state. |
| `POST` | `/api/notifications/push-subscriptions` | Authenticated user | Register or update push subscriptions. |

## Organization

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/org/hierarchy` | Authenticated user | Return the organization tree with groups and campuses. |
| `POST` | `/api/org/hierarchy/bulk` | `SUPERADMIN` or privileged admin | Bulk update hierarchy data. |
| `GET` | `/api/org/groups/[id]` | Authenticated user with access | Fetch a group by ID. |
| `PUT` | `/api/org/groups/[id]` | `SUPERADMIN` | Update a group. |
| `POST` | `/api/org/groups` | `SUPERADMIN` | Create a group. |
| `GET` | `/api/org/campuses/[id]` | Authenticated user with access | Fetch a campus by ID. |
| `PUT` | `/api/org/campuses/[id]` | `SUPERADMIN` | Update a campus. |
| `POST` | `/api/org/campuses` | `SUPERADMIN` | Create a campus. |
| `POST` | `/api/org/units` | Users with org management access | Create an org unit. |
| `DELETE` | `/api/org/units/[id]` | Users with org management access | Soft-delete or archive a unit and its descendants. |
| `POST` | `/api/org/units/[id]/promote` | Users with org management access | Promote a unit in the hierarchy. |

## Public Copy

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/public-copy/[ns]` | Public or authenticated, depending on namespace | Return merged and sanitised public copy content. |

## Report Templates

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/report-templates` | Authenticated user | List templates. |
| `POST` | `/api/report-templates` | Authorized template managers | Create a template with sections and metrics. |
| `GET` | `/api/report-templates/[id]` | Authenticated user with access | Fetch a single template with sections and metrics. |
| `PUT` | `/api/report-templates/[id]` | Authorized template managers | Update a template, replacing sections and metrics. |
| `GET` | `/api/report-templates/[id]/versions` | Authenticated user with access | List historical template versions. |
| `GET` | `/api/report-templates/[id]/versions/[versionId]` | Authenticated user with access | Fetch a specific template version snapshot. |

## Report Update Requests

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/report-update-requests` | Superadmin / exec | List update requests. |
| `POST` | `/api/report-update-requests` | Campus admin | Create a report update request. |
| `POST` | `/api/report-update-requests/[id]/approve` | Reviewer / approver | Approve a pending update request. |
| `POST` | `/api/report-update-requests/[id]/reject` | Reviewer / approver | Reject a pending update request. |

## Reports

Report routes cover creation, lifecycle transitions, edits, approvals, and history.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/reports` | Authenticated user | List reports in the caller’s scope. |
| `POST` | `/api/reports` | Authenticated user | Create a new draft report. |
| `GET` | `/api/reports/[id]` | Authenticated user with access | Fetch one report. |
| `PUT` | `/api/reports/[id]` | Draft owner or editor | Update report fields while the report is still in `DRAFT`. |
| `POST` | `/api/reports/[id]/submit` | Draft owner or editor | Move a report from `DRAFT` to `SUBMITTED`. |
| `POST` | `/api/reports/[id]/approve` | Reviewer / approver | Move `SUBMITTED` to `APPROVED`. |
| `POST` | `/api/reports/[id]/request-edit` | Reviewer / approver | Move `SUBMITTED` to `REQUIRES_EDITS`. |
| `POST` | `/api/reports/[id]/review` | Approver role | Move `APPROVED` to `REVIEWED`. |
| `POST` | `/api/reports/[id]/lock` | `SUPERADMIN` | Move `REVIEWED` to `LOCKED`. |
| `POST` | `/api/reports/[id]/unlock` | `SUPERADMIN` | Move `LOCKED` back to `DRAFT`. |
| `GET` | `/api/reports/[id]/history` | Authenticated user with access | Fetch the report event history. |
| `GET` | `/api/reports/[id]/edits` | Authenticated user with access | List edits attached to a report. |
| `POST` | `/api/reports/[id]/edits` | Authorized editor | Create an edit draft. |
| `POST` | `/api/reports/[id]/edits/submit` | Authorized editor | Submit an existing report edit request. |
| `POST` | `/api/reports/[id]/edits/[editId]/approve` | Approver | Approve a report edit request. |
| `POST` | `/api/reports/[id]/edits/[editId]/reject` | Approver | Reject a report edit request. |
| `GET` | `/api/reports/[id]/quick-views` | Authenticated user with access | Fetch lightweight view data for cards or previews. |
| `POST` | `/api/reports/aggregate` | Authenticated user | Preview or generate an aggregated report. |

Important lifecycle note:
- State-transition routes are intentionally narrow; callers should use the dedicated transition endpoint instead of trying to set status directly.

## Roles

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/roles` | Authenticated user with access | List roles. |
| `POST` | `/api/roles` | Users with admin-config management access | Create a custom role. |
| `GET` | `/api/roles/[id]` | Authenticated user with access | Fetch a role by ID. |
| `DELETE` | `/api/roles/[id]` | `SUPERADMIN` | Soft-delete or archive a non-system role. |

## Users

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/users` | Privileged user | List users. |
| `POST` | `/api/users` | `SUPERADMIN` | Create a user directly without an invite flow. |
| `GET` | `/api/users/[id]` | Authenticated user with access | Fetch a user by ID. |
| `PUT` | `/api/users/[id]` | Authenticated user with access | Update a user by ID. |
| `GET` | `/api/users/profile` | Authenticated user | Return the current user’s profile. |
| `PUT` | `/api/users/profile` | Authenticated user | Update own profile fields such as name and phone. |
| `POST` | `/api/users/preregister` | Public or invite flow dependent | Pre-register a user account. |

## Cross-cutting Notes

- `GET /api/admin-config/public` and `GET /api/public-copy/[ns]` are the main endpoints intended for client-side rendering without exposing sensitive config.
- The API makes heavy use of lifecycle and moderation-style transitions. Expect endpoints like `approve`, `reject`, `review`, `lock`, `unlock`, and `request-edit` rather than generic status mutation.
- Several routes are cache-backed or cache-aware. After write operations, the server may invalidate related cache entries automatically.
- Some modules are intentionally superadmin-only even if the surrounding UI exposes them more broadly.

## Practical Usage Tips

1. Use the module-specific route rather than guessing request shape from the UI.
2. Treat transition endpoints as command operations, not generic updates.
3. For namespace/versioned data, always send the latest known version and be ready to handle conflicts.
4. For large or repeated writes, prefer dedicated bulk endpoints when they exist.

## Source of Truth

This document is derived from the current route structure under `app/api` and should be updated when routes are added, renamed, or removed. For exact payload validation, see the corresponding route file in the codebase.


