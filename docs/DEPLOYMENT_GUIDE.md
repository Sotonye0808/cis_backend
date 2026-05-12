# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL connection string in `DATABASE_URL`
- JWT secret in `JWT_SECRET`

## Build and Run

```bash
npm install
npm run build
npm start
```

## Prisma

```bash
npx prisma generate
npx prisma migrate deploy
```

## Operational Checks

- `/health` returns `200`
- `/api/docs/openapi.json` returns the OpenAPI document when enabled
- `/api/v1/auth/token` issues JWTs
- `/api/v1/permissions/check` resolves permissions
