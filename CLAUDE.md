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
- `demands` — Core demand entity; supports both authenticated (`reporterId`) and guest flow (`guestEmail`); includes `GetNeighborhoodDashboardUseCase` (public endpoint `GET /demands/neighborhood`)
- `results` — Cabinet resolutions linked to demands; `DeleteResultUseCase` emits `result.deleted` event so the demand module can revert RESOLVED → IN_PROGRESS when the last result is removed
- `users` — Auth, JWT, OAuth-ready (`Account` table for provider linking); includes `UserNeighborhood` entity (up to 3 neighborhoods per user, one marked `isPrimary`); endpoints: `GET/POST /users/me/neighborhoods`, `DELETE /users/me/neighborhoods/:id`, `PATCH /users/me/neighborhoods/:id/primary`
- `shared` — Guards, decorators (`@CurrentUser`), S3 StorageService, pagination utilities
- `auth` — JWT auth, Google OAuth, email verification, password reset/change flows
- `cabinets` — Cabinet CRUD, member management (`OWNER`/`STAFF` roles), slug-based routing, email invitations
- `categories` — Demand classifications with slugs; admin-only management
- `demands` — Core demand entity; authenticated + guest flow; evidence, comments, likes, reports, surveys, analytics
- `results` — Cabinet resolutions linked to demands; protocol docs + image gallery; updates demand status in transaction
- `users` — User profile, avatar upload to S3, soft-delete account
- `notifications` — Per-user notification system with read/unread state
- `admin` — Platform-wide admin: cabinet creation, user enable/disable, demand report moderation
- `og` — Open Graph meta tag generation for social sharing of demands
- `shared` — Guards, decorators (`@CurrentUser`), S3 StorageService, MailService, DiscordService, QueueService, pagination

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new citizen |
| POST | `/api/auth/login` | Email/password login, returns JWT pair |
| POST | `/api/auth/refresh` | Refresh access token using refresh token |
| POST | `/api/auth/verify-email` | Verify email address via token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Complete password reset with token |
| POST | `/api/auth/request-password-change` | Request authenticated password change |
| POST | `/api/auth/confirm-password-change` | Confirm password change with token |
| GET | `/api/auth/google` | Google OAuth callback |

### Users (`/api/users`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users` | ADMIN | List all users |
| GET | `/api/users/:id` | Auth | Get user profile |
| PATCH | `/api/users/:id` | Owner | Update profile (with avatar upload) |
| DELETE | `/api/users/:id` | Owner | Soft-delete account |

### Cabinets (`/api/cabinets`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/cabinets` | ADMIN/MEMBER | Create cabinet |
| GET | `/api/cabinets` | Public | List cabinets with pagination |
| GET | `/api/cabinets/me` | Auth | Get current user's cabinets |
| GET | `/api/cabinets/:slug` | Public | Get cabinet details |
| PATCH | `/api/cabinets/:slug` | OWNER | Update cabinet |
| DELETE | `/api/cabinets/:slug` | OWNER | Soft-delete cabinet |
| GET | `/api/cabinets/:slug/members` | Auth | List cabinet members |
| POST | `/api/cabinets/:slug/members` | OWNER | Invite member by email |
| DELETE | `/api/cabinets/:slug/members/:userId` | OWNER | Remove member |
| PATCH | `/api/cabinets/:slug/members/:userId/role` | OWNER | Update member role |
| POST | `/api/cabinets/invitations/:token` | Auth | Accept cabinet invitation |

### Demands (`/api/demands`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/demands` | Auth/Guest | Create demand |
| GET | `/api/demands` | Auth | List demands with filters |
| GET | `/api/demands/:id` | Auth | Get demand details |
| PATCH | `/api/demands/:id` | Owner/STAFF | Update demand |
| DELETE | `/api/demands/:id` | Owner/STAFF | Soft-delete demand |
| POST | `/api/demands/:id/claim` | STAFF | Claim demand for cabinet |
| POST | `/api/demands/:id/assign` | STAFF | Assign demand to member |
| POST | `/api/demands/:id/comments` | Auth | Add comment |
| GET | `/api/demands/:id/comments` | Auth | List comments |
| POST | `/api/demands/:id/likes` | Auth | Toggle like |
| POST | `/api/demands/:id/report` | Auth | Report/flag demand |
| POST | `/api/demands/:id/evidence` | Auth | Get presigned URL for evidence upload |
| POST | `/api/demands/:id/evidence/confirm` | Auth | Confirm evidence upload |
| PATCH | `/api/demands/:id/progress` | STAFF | Update demand status |
| GET | `/api/demands/cabinets/:slug/dashboard` | STAFF | Cabinet dashboard summary |
| GET | `/api/demands/cabinets/:slug/metrics` | STAFF | Demand metrics |
| GET | `/api/demands/cabinets/:slug/heatmap` | STAFF | Geographic heatmap data |
| GET | `/api/demands/cabinets/:slug/trend` | STAFF | Trend analysis |
| GET | `/api/demands/cabinets/:slug/report` | STAFF | Detailed report |
| GET | `/api/demands/:id/survey` | Token | Get survey form |
| POST | `/api/demands/:id/survey` | Token | Submit survey response |
| GET | `/api/demands/reporter/:userId/summary` | Auth | Reporter demand statistics |

### Results (`/api/results`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/results` | STAFF | Create result linked to demand |
| GET | `/api/results` | Auth | List results with pagination |
| GET | `/api/results/:id` | Auth | Get result details |
| PATCH | `/api/results/:id` | STAFF | Update result |
| DELETE | `/api/results/:id` | STAFF | Soft-delete result |
| POST | `/api/results/:id/images` | STAFF | Add images to result |
| POST | `/api/results/:id/protocol` | STAFF | Upload protocol document |

### Categories (`/api/categories`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/categories` | ADMIN | Create category |
| GET | `/api/categories` | Public | List categories |
| GET | `/api/categories/:slug` | Public | Get category by slug |
| PATCH | `/api/categories/:slug` | ADMIN | Update category |
| DELETE | `/api/categories/:slug` | ADMIN | Soft-delete category |

### Notifications (`/api/notifications`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/notifications` | Auth | List user notifications |
| PATCH | `/api/notifications/:id/read` | Auth | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Auth | Mark all notifications as read |

### Admin (`/api/admin`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/admin/cabinets` | ADMIN | Create cabinet with owner |
| POST | `/api/admin/users` | ADMIN | Create admin user |
| PATCH | `/api/admin/users/:id` | ADMIN | Update admin user |
| PATCH | `/api/admin/cabinets/:id` | ADMIN | Update any cabinet |
| GET | `/api/admin/reports` | ADMIN | List reported demands |
| PATCH | `/api/admin/reports/:id/dismiss` | ADMIN | Dismiss demand reports |
| DELETE | `/api/admin/demands/:id` | ADMIN | Hard-delete demand |
| PATCH | `/api/admin/users/:id/disable` | ADMIN | Disable user account |
| PATCH | `/api/admin/users/:id/enable` | ADMIN | Enable user account |

### Open Graph (`/og`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/og/demands/:id` | Generate OG meta tags for social sharing |

## Guards & Middleware

- `JwtAuthGuard` — verifies JWT access token (required auth)
- `OptionalJwtAuthGuard` — populates user if token present, but does not block
- `GoogleAuthGuard` — Google OAuth flow
- `RolesGuard` — enforces `UserRole` (ADMIN, MEMBER, CITIZEN) via `@Roles()` decorator
- `CabinetRolesGuard` — enforces `CabinetRole` (OWNER, STAFF) within a cabinet context via `@CabinetRoles()`
- `UserAccessGuard` — verifies resource ownership for user-scoped endpoints
- `DemandAccessGuard` — verifies demand access (owner or cabinet staff)
- `ResultAccessGuard` — verifies result access

## Shared Services

- `StorageService` — AWS S3 integration; generates presigned upload/download URLs; persists `storageKey` + `url`
- `MailService` — Resend email service; used for verification, password reset, invitations
- `DiscordService` — Webhook notifications for errors and incidents
- `QueueService` — BullMQ + Redis job queue for async operations (e.g., linking guest demands on registration)

## Key Domain Rules

**Guest Flow:** Demands can be created unauthenticated using `guestEmail`. On user registration, trigger a routine to find all demands with `guestEmail === newUser.email` and assign them to the new user (`reporterId = newUser.id`, `guestEmail = null`).

**Result deletion cascade:** When a result is soft-deleted, `DeleteResultUseCase` emits `result.deleted` via `EventEmitter2`. `ResultDeletedListener` (in demands module) listens and reverts the linked demand from `RESOLVED` → `IN_PROGRESS` if no active results remain.

**Neighborhood dashboard:** `GET /demands/neighborhood?neighborhood=X&city=Y&state=Z` is a public endpoint returning stats, top categories, serving cabinets, and recent demands for a given neighborhood. Uses `contains` (case-insensitive) for neighborhood matching and `equals` for city/state.

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
