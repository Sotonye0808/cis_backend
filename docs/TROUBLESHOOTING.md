# Troubleshooting Guide

## Missing Bearer Token

Cause: Protected route called without `Authorization: Bearer <token>`.

Fix: Add a valid CIS JWT.

## Invalid Payload

Cause: Request body failed Zod validation.

Fix: Check the route schema in `src/types/schemas.ts`.

## Forbidden

Cause: Authenticated user lacks required access.

Fix: Review role assignments and permission mappings.

## Documentation Disabled

Cause: `SWAGGER_ENABLED=false`.

Fix: Enable the variable or access the API directly.
