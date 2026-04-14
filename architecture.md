# SYSTEM ARCHITECTURE & DATABASE SCHEMA CONTEXT
**Target Audience:** AI Code Agents, LLMs, and Human Developers.
**Project Domain:** Public Grievance, Ombudsman, and Political Cabinet Management System.

## ⚠️ CRITICAL INSTRUCTION FOR AI AGENTS
Every time you modify the system architecture, Prisma schema, database migrations, or core business logic, you **MUST** append an entry to the `CHANGELOG` section at the bottom of this file. Do not perform any structural modification without documenting: 
1. The Date.
2. What was changed.
3. The reasoning behind the change.

---

## 1. Domain Overview
The system allows citizens to report public demands (e.g., infrastructure issues, social requests) either via a global authenticated account or through an anonymous "Guest Flow". Political or administrative "Cabinets" (Gabinetes) are responsible for analyzing, processing, and resolving these demands.

**Tech Stack Assumptions:**
* **Backend:** Node.js with NestJS
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Storage:** Cloud Object Storage (AWS S3) for evidences and result images.

---

## 2. Enums Definition
* `UserRole`: `ADMIN` | `USER` | `CITIZEN` (Global system roles).
* `CabinetRole`: `OWNER` | `STAFF` (Contextual roles inside a specific cabinet).
* `DemandStatus`: `SUBMITTED` | `IN_ANALYSIS` | `IN_PROGRESS` | `RESOLVED` | `REJECTED` | `CANCELED`.
* `DemandPriority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`.
* `ResultType`: `INFRASTRUCTURE` | `SOCIAL` | `LEGISLATIVE` | `OTHER`.
* `ResultImageType`: `BEFORE` | `AFTER` | `GENERAL`.

---

## 3. Entity-Relationship Specifications

### 3.1. Authentication & Users
* **`User`**: The global citizen account. Fields: `id`, `name`, `email` (unique), `password?` (optional for OAuth), `avatarUrl?`, `role` (UserRole), `disabledAt`. Has relationships with `Account`, `CabinetMember`, `Demand`, and `DemandLike`.
* **`Account`**: OAuth provider integration (NextAuth/Auth.js standard). Fields: `id`, `userId`, `provider`, `providerAccountId`. Constraint: `@@unique([provider, providerAccountId])`.

### 3.2. Cabinet Management
* **`Cabinet`**: The organizational unit solving demands. Fields: `id`, `name`, `slug` (unique - used for UX-friendly routing), `description?`, `avatarUrl?`, `disabledAt?`.
* **`CabinetMember`**: Pivot table mapping N:M relationship. Fields: `id`, `userId`, `cabinetId`, `role` (CabinetRole). Constraint: `@@unique([userId, cabinetId])`.
* **`Category`**: Classification of demands. Fields: `id`, `name`, `slug`, `disabledAt?`.

### 3.3. Demand (Core Entity)
* **`Demand`**: The reported issue. 
    * **Standard Fields:** `id`, `title`, `description`, `status` (DemandStatus), `priority` (DemandPriority), `createdAt`, `updatedAt`, `disabledAt?`.
    * **Location Fields:** `address`, `zipcode`, `lat?`, `long?`, `neighborhood`, `city`, `state`.
    * **Authorship (Guest Flow):** `reporterId?` (FK to User), `guestEmail?` (String).
    * **Relations:** Belongs to `Cabinet?`, `Category?`, and optionally assigned to a `CabinetMember` (`assigneeMemberId?`).
* **`DemandEvidence`**: Files/Photos attached. Fields: `id`, `storageKey` (S3 object key), `url`, `mimeType`, `size?`, `demandId`.
* **`DemandLike`**: Citizen support for a demand. Fields: `id`, `userId`, `demandId`, `createdAt`. Constraint: `@@unique([userId, demandId])`.
* **`DemandComment`**: Interaction thread. Fields: `id`, `content`, `isCabinetResponse` (Boolean), `demandId`, `authorId`, `createdAt`.

### 3.4. Resolution & Results
* **`Result`**: The official response/action taken by the cabinet. Fields: `id`, `title`, `description`, `type` (ResultType), `isPublic` (Boolean), `cabinetId`, `demandId?`, `createdAt`, `disabledAt?`.
* **`ResultImage`**: Proof of resolution. Fields: `id`, `url`, `storageKey`, `type` (ResultImageType), `resultId`.

---

## 4. Architectural Rules & Constraints

1.  **Decoupling & Clean Architecture (CRITICAL):** Business logic MUST NOT be coupled to the framework (NestJS) or the ORM (Prisma).
    * **Use-Case Pattern:** Every operation in the `application/` layer MUST be implemented as a dedicated use-case class (one class per operation) with a single public `execute()` method. Monolithic service classes are not permitted. Each use-case is decorated with `@Injectable()` and registered as a NestJS provider.
    * Implement the **Repository Pattern** to abstract all database operations.
    * Prisma Client must only be injected and utilized inside Repository implementation classes. Core domain use-cases should rely on abstract Repository Interfaces, never directly on Prisma models or methods.
    * Return plain Domain Entities/DTOs from Repositories, not Prisma-specific objects.
2.  **API Documentation (Swagger/OpenAPI):** Every REST endpoint in the infrastructure controllers MUST be fully mapped and documented using NestJS Swagger decorators (e.g., `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`). 
    * All Data Transfer Objects (DTOs) must strictly use `@ApiProperty()` to document request/response payloads, examples, and validation rules. Undocumented endpoints are not allowed.
3.  **Soft Deletes Strategy:** Never physically delete core records (`disabledAt?`). Read queries must automatically filter out `disabledAt: { not: null }` at the Repository layer.
4.  **File Storage Management:** `DemandEvidence` and `ResultImage` must store the cloud provider's `storageKey` alongside the `url`, along with `mimeType` and `size?`, to ensure secure programmatic deletion from the S3 bucket and bandwidth management.
5.  **Guest Flow & Claiming Process:** * Demands can be created without authentication by populating the `guestEmail` field and leaving `reporterId` null.
    * **AI Agent Directive:** Implement a routine (NestJS Event or inter-service call) during user registration: if a new user signs up with an email that matches existing `guestEmail` records, automatically map those demands to the new `User.id` and nullify the `guestEmail` field.
6.  **Concurrency Management:** Handling inserts into `DemandLike` and `CabinetMember` must catch Prisma unique constraint violations (`P2002`) inside the Repository layer and throw domain-specific exceptions (e.g., `ConflictException`). These should be caught by NestJS Exception Filters to return proper 409 HTTP status codes, avoiding 500 Internal Server Error crashes.
7.  **Routing UX:** Use the `slug` field for `Cabinet` and `Category` lookups in public-facing frontend routes instead of UUIDs. Controllers should handle slug resolution gracefully.

---

## 5. Project Structure & Layer Definitions

The project strictly follows a modularized Clean Architecture approach. Code AI Agents must place new files in their respective layers:

```text
├── prisma
│   └── migrations
├── src
│   ├── modules
│   │   ├── cabinets
│   │   │   ├── application      # Use cases — one class per operation, single execute() method (No NestJS/Prisma dependencies)
│   │   │   ├── domain           # Core entities, Enums, Repository Interfaces
│   │   │   ├── dto              # Data Transfer Objects (Request/Response shapes, Zod/Class-validator)
│   │   │   └── infrastructure   # Prisma Repositories, NestJS Controllers, NestJS Modules
│   │   ├── categories
│   │   │   ├── application
│   │   │   ├── domain
│   │   │   ├── dto
│   │   │   └── infrastructure
│   │   ├── demands
│   │   │   ├── application
│   │   │   ├── domain
│   │   │   ├── dto
│   │   │   └── infrastructure
│   │   ├── results
│   │   │   ├── application
│   │   │   ├── domain
│   │   │   ├── dto
│   │   │   └── infrastructure
│   │   └── users
│   │       ├── application
│   │       ├── domain
│   │       ├── dto
│   │       └── infrastructure
│   └── shared
│       ├── decorators           # Custom NestJS decorators (e.g., @CurrentUser)
│       ├── domain               # Shared domain logic, base entities
│       │   └── services
│       ├── guards               # Auth/Role Guards
│       ├── infrastructure       # Shared external services (e.g., S3 Upload Service, Email Service)
│       │   └── services
│       ├── pagination           # Pagination utilities and DTOs
│       └── utils                # Helper functions
└── test                         # E2E and Integration Tests

---

## CHANGELOG

### 2026-03-30 — Refactor: Renamed All DB Tables and Columns to snake_case (Task 4)
**What:** Added `@@map()` directives to all 11 models (`users`, `accounts`, `cabinets`, `cabinet_members`, `categories`, `demands`, `demand_evidences`, `demand_likes`, `demand_comments`, `results`, `result_images`) and `@map()` directives to all 36 compound camelCase columns (`avatar_url`, `disabled_at`, `user_id`, `provider_account_id`, `cabinet_id`, `reporter_id`, `guest_email`, `category_id`, `assignee_member_id`, `created_at`, `updated_at`, `storage_key`, `mime_type`, `demand_id`, `is_cabinet_response`, `author_id`, `is_public`, `result_id`). Created migration `rename_tables_columns_to_snake_case`. No repository or application-layer code was modified — Prisma's `@map`/`@@map` directives keep the TypeScript client API unchanged.
**Why:** PostgreSQL convention is snake_case for identifiers. The initial migration used Prisma's default behavior (PascalCase table names, camelCase column names). This normalizes the physical schema to idiomatic SQL naming without breaking the application layer.

### 2026-03-29 — Refactor: Services Decomposed into Use-Cases
**What:** Replaced `UsersService` and `AuthService` monolithic classes with individual use-case classes each having a single `execute()` method. New files in `users/application/`: `FindUserByEmailUseCase`, `FindUserByIdUseCase`, `CreateUserUseCase`, `ValidatePasswordUseCase`. New files in `auth/application/`: `JwtTokenService`, `RegisterUseCase`, `LoginUseCase`. Updated `AuthController`, `JwtStrategy`, `UsersModule`, and `AuthModule`. Deleted old service files. Updated Rule #1 in Section 4 and `application/` layer descriptions in Section 5.
**Why:** Enforces single-responsibility at the use-case level. Each operation is independently testable and discoverable. `JwtTokenService` extracted as a shared injectable to avoid duplicating `signToken` logic across `RegisterUseCase` and `LoginUseCase`.

### 2026-03-29 — Global Authentication System (Task 2)
**What:** Created `UsersModule` (domain entity, abstract repository interface, `UsersService`, `UsersRepository`) and `AuthModule` (`AuthService`, `JwtStrategy`, `AuthController` with `POST /auth/register`, `POST /auth/login`, `GET /auth/me`). Added `JwtAuthGuard` and `@CurrentUser()` decorator to `shared/`. Completed Swagger setup in `main.ts`. Added `setupFiles` to `jest-e2e.json` for dotenv loading in e2e tests. Packages added: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcryptjs`.
**Why:** `bcryptjs` used over `bcrypt` to avoid native N-API bindings. `IUsersRepository` is an abstract class (not a TS interface) so it can serve as a NestJS injection token. `JwtModule.register()` `expiresIn` must be a `number` — string values are rejected by the type system in NestJS 11. E2e test runner requires explicit dotenv loading via `setupFiles`.

### 2026-03-28 — Initial Database Schema & Prisma Setup (Task 1)
**What:** Defined all domain models and enums in `prisma/schema.prisma`: `User`, `Account`, `Cabinet`, `CabinetMember`, `Category`, `Demand`, `DemandEvidence`, `DemandLike`, `DemandComment`, `Result`, `ResultImage`. All enums, soft delete fields (`disabledAt`), audit fields (`createdAt`, `updatedAt`), and unique constraints (`@@unique`) applied per the ERD spec. Wired `PrismaService` (extends `PrismaClient` with `@prisma/adapter-pg`) and marked `DatabaseModule` as `@Global()` with `exports: [PrismaService]`.
**Why:** Prisma v7 removes `url` from the `datasource` block in `schema.prisma` — connection URL is managed via `prisma.config.ts` for migrations and via `PrismaPg` adapter in the client constructor at runtime. Task 1 baseline migration.

### 2026-04-08 — Feature: Cabinet Demand Metrics Endpoint
**What:** Added `GET /demands/cabinet/:cabinetId/metrics` backed by `GetCabinetDemandMetricsUseCase` and a repository method to compute and return raw counts: `new` (last 24h), `urgent` (URGENT not RESOLVED/REJECTED/CANCELED), `total` (created this month), `resolved` (created this month + RESOLVED). Added cabinet existence check and soft-delete filtering.
**Why:** Enables dashboards to retrieve consistent, server-side computed demand KPIs per cabinet, keeping date windows and query logic centralized in the backend.

### 2026-04-08 — Change: Metrics Derived From Logged-in User Cabinet
**What:** Replaced `GET /demands/cabinet/:cabinetId/metrics` with `GET /demands/metrics`, resolving `cabinetId` from the logged-in user's cabinet membership.
**Why:** Prevents clients from manually passing cabinet identifiers and keeps cabinet scoping consistent with authentication context.

### 2026-04-08 — Change: Metrics Endpoint Uses Cabinet Slug
**What:** Replaced `GET /demands/metrics` with `GET /demands/cabinet/:slug/metrics` and resolved the cabinet by `slug` before running metrics queries.
**Why:** Keeps cabinet scoping explicit for clients while avoiding UUID exposure and aligning with slug-based routing UX.
### 2026-04-14 — Feature: Results Module
**What:** Implemented the full `results` module (domain, application, DTOs, infrastructure). Removed the `ResultImageType` enum (BEFORE/AFTER/GENERAL) and the `type` field from `ResultImage` — images are now a plain array without classification. Added 5 protocol-file fields to `Result` (`protocol_file_key`, `protocol_file_url`, `protocol_file_name`, `protocol_file_mime_type`, `protocol_file_size`) to store an official document (PDF, JPEG, PNG) that proves the action was performed. Added `@@index([resultId])` to `ResultImage`. Created 7 use cases: `CreateResultUseCase`, `ListResultsUseCase`, `FindResultUseCase`, `UpdateResultUseCase`, `DeleteResultUseCase`, `AddResultImagesUseCase`, `UploadResultProtocolUseCase`. Created `ResultAccessGuard` in `shared/guards/`. Registered `ResultsModule` in `AppModule`. Controller exposes 7 endpoints: `POST /results` accepts images + protocol in a single multipart request so the frontend receives the complete entity in one response; `POST /results/:id/images` and `POST /results/:id/protocol` allow adding files to existing results. Only `CabinetMember`s can write; visibility for reads is controlled by the `isPublic` flag.
**Why:** Cabinets needed a way to publish the outcomes of resolved demands with photographic evidence and an official protocol document (order of service, government filing, etc.) that citizens can inspect to verify the work was genuinely done. The single-request creation design eliminates the need for the frontend to perform a second API call before displaying the result, avoiding stale UI states.

### 2026-04-10 — Refactor: User Roles and Senior Type Cleanup
**What:** Renamed global `UserRole.MEMBER` to `UserRole.USER` and verified `UserRole.CITIZEN` as default. Refactored `UsersRepository` to define explicit Prisma payload types, removing `any` casts and fixing TypeScript errors in `toEntity`. Updated `DemandAccessGuard` to use `DemandEntity` instead of `any`.
**Why:** Improves semantic clarity between global platform identity and contextual cabinet membership. Fixes a brittle repository implementation that was causing build errors and relied on unsafe type casting.
