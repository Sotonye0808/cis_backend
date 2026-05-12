# CIS API Reference

OpenAPI is available at `/api/docs/openapi.json` when `SWAGGER_ENABLED=true`.

Core route groups:

- `/health`
- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/roles/*`
- `/api/v1/org/*`
- `/api/v1/permissions/*`
- `/api/v1/events/*`
- `/api/v1/integrations/*`

Most responses are wrapped as `{ data: ... }`; validation and auth errors use `{ error: { code, message, details? } }`.
