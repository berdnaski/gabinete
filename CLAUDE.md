# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Public Grievance & Cabinet Management API. Citizens report demands (infrastructure, social, legislative issues) via authenticated or anonymous "Guest Flow". Political/administrative Cabinets analyze and resolve demands.

**Stack:** NestJS, PostgreSQL, Prisma ORM, AWS S3

## Commands

```bash
# Development
pnpm start:dev          # Dev server with watch
pnpm build              # Compile TypeScript

# Testing
pnpm test               # Unit tests (Jest)
pnpm test:watch         # Watch mode
pnpm test:cov           # With coverage
pnpm test:e2e           # End-to-end tests

# Code Quality
pnpm lint               # ESLint with auto-fix
pnpm format             # Prettier format

# Database
docker compose up -d    # Start PostgreSQL container
npx prisma migrate dev  # Run migrations
npx prisma generate     # Regenerate Prisma client
pnpm studio             # Prisma Studio GUI
```

Use `pnpm` as the package manager (not npm).

## Architecture

Strict **Clean Architecture** with the Repository Pattern and Use-Case Pattern. Each feature module is structured into four layers:

```
src/modules/<module>/
  application/      # Use cases — one class per operation, single execute() method (NO NestJS or Prisma dependencies)
  domain/           # Entities, Enums, Repository Interfaces (abstract contracts)
  dto/              # Request/Response shapes with class-validator + @ApiProperty()
  infrastructure/   # Prisma Repositories, NestJS Controllers, NestJS Module definition
```

**Critical rules:**
- `application/` contains **use-case classes only** — no monolithic service classes. Each use-case has a single public `execute()` method and is decorated with `@Injectable()`.
- Business logic in `application/` must never import from NestJS (`@nestjs/*`) or Prisma directly. The sole exceptions are `@Injectable()` (metadata only) and NestJS exception classes (e.g., `ConflictException`, `UnauthorizedException`) which carry no HTTP/transport coupling.
- Prisma Client is injected **only** inside Repository classes in `infrastructure/`.
- Repositories return plain domain entities/DTOs, never raw Prisma model objects.
- All queries must filter `disabledAt: { not: null }` — soft deletes are mandatory, physical deletes are forbidden.
- Catch Prisma `P2002` unique violations in the Repository layer and rethrow as domain exceptions (e.g., `ConflictException`) to return proper 409s.

## Modules

- `cabinets` — Cabinet CRUD, member management (`OWNER`/`STAFF` roles), slug-based routing
- `categories` — Demand classifications with slugs
- `demands` — Core demand entity; supports both authenticated (`reporterId`) and guest flow (`guestEmail`)
- `results` — Cabinet resolutions linked to demands; updates demand status in a Prisma transaction
- `users` — Auth, JWT, OAuth-ready (`Account` table for provider linking)
- `shared` — Guards, decorators (`@CurrentUser`), S3 StorageService, pagination utilities

## Key Domain Rules

**Guest Flow:** Demands can be created unauthenticated using `guestEmail`. On user registration, trigger a routine to find all demands with `guestEmail === newUser.email` and assign them to the new user (`reporterId = newUser.id`, `guestEmail = null`).

**File Storage:** Always persist both `storageKey` (S3 object key for programmatic deletion) and `url` alongside `mimeType`/`size`.

**Slugs:** Use `slug` fields (not UUIDs) for public-facing Cabinet and Category routes. Auto-generate unique slugs from `name` on creation (e.g., `gabinete-1` for conflicts).

**Swagger:** Every controller endpoint must have `@ApiTags`, `@ApiOperation`, and `@ApiResponse` decorators. Every DTO must use `@ApiProperty`.

## Architecture Change Log

Any modification to the Prisma schema, database migrations, or core business logic **must** be appended to the `CHANGELOG` section at the bottom of `architecture.md`, including: date, what changed, and why.

## Database

Docker Compose runs PostgreSQL 15 (`container: db_gabinete`, `port: 5432`).

`.env` requires:
```
DATABASE_URL="postgresql://admin:admin@localhost:5432/gabinete?schema=public"
```

> Note: The Docker Compose database name is `gabinete` (not `db_gabinete`). Verify your `.env` matches.

## Enums

- `UserRole`: `ADMIN | MEMBER`
- `CabinetRole`: `OWNER | STAFF`
- `DemandStatus`: `SUBMITTED | IN_ANALYSIS | IN_PROGRESS | RESOLVED | REJECTED | CANCELED`
- `DemandPriority`: `LOW | MEDIUM | HIGH | URGENT`
- `ResultType`: `INFRASTRUCTURE | SOCIAL | LEGISLATIVE | OTHER`
- `ResultImageType`: `BEFORE | AFTER | GENERAL`
