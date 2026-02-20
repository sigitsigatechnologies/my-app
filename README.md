# WMS Monorepo (Next.js + NestJS + Prisma + PostgreSQL)

Modern Warehouse Management System (WMS) with clean modular monorepo architecture.

Monorepo structure:
- apps/
  - web (Next.js App Router, TS, Tailwind, shadcn, TanStack Query, Zustand)
  - api (NestJS REST API, Prisma, JWT Auth, RBAC, Swagger)
- packages/
  - shared-types (DTOs & shared types)
- prisma/ (root schema, migrations, seeds)
- docker/ (compose and Dockerfiles)

Quick start (Development):
1. Prerequisites: Node >= 18, pnpm (or npm), Docker
2. Copy envs:
   - cp .env.example .env
   - cp apps/api/.env.example apps/api/.env
   - cp apps/web/.env.example apps/web/.env
3. Start services with Docker (Postgres + Redis):
   - docker compose -f docker/docker-compose.dev.yml up -d
4. Install deps at root and build shared types:
   - pnpm install
   - pnpm -w build
5. Generate Prisma client and run migrations + seed:
   - pnpm -w prisma:generate
   - pnpm -w prisma:migrate
   - pnpm -w prisma:seed
6. Start API and Web (two terminals):
   - pnpm -w dev:api
   - pnpm -w dev:web

Production (Docker):
- docker compose -f docker/docker-compose.prod.yml up -d --build

Scripts (root):
- dev:web, dev:api, build:web, build:api, prisma:* (generate, migrate, seed), lint, test

Docs:
- Swagger: http://localhost:4000/api/docs
- Web: http://localhost:3000

Notes:
- JWT with access + refresh rotation
- RBAC: Admin, Manager, Staff
- CORS configured
- Rate limiting via Throttler
- Logging via Pino

See each app for more details.
