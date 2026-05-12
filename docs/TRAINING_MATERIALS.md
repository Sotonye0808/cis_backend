# Team Training Materials

## What the CIS Team Should Know

- CIS is the canonical source for identity, auth, permissions, and platform role translation.
- External platforms keep their own domain data; CIS links identities and broadcasts changes asynchronously.
- Use `/api/docs/openapi.json` for route discovery and request/response shapes.
- Use `npm run benchmark:phase4` and `npm run loadtest:phase4` to sanity-check auth and permission latency.

## Operational Flow

1. Issue tokens with `/api/v1/auth/token`
2. Validate permissions with `/api/v1/permissions/check`
3. Sync platform users through `/api/v1/integrations/:platform/sync`
4. Backfill role mappings with `/api/v1/integrations/role-mappings/backfill`
5. Verify the 3-platform scenario with `/api/v1/integrations/validation/three-platform-sync`
