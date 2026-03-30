# AGENT_TASKS.md
**Project:** Public Grievance & Cabinet Management API
**Stack:** Node.js, Nest.js, Prisma, PostgreSQL, AWS S3

## 🤖 INSTRUCTIONS FOR AI AGENTS
This file serves as your roadmap and execution log. 
1. Work on one task at a time sequentially, unless instructed otherwise.
2. When starting a task, change its status to `🟡 IN PROGRESS`.
3. Upon completion, change the status to `🟢 DONE`, check off the Acceptance Criteria and Tests `[x]`, and **crucially**, fill out the `Agent Remarks` section detailing what was implemented, any edge cases handled, or architectural decisions made.

---

## Task 1: Initialize Database Schema and Prisma Setup
**Status:** 🟢 DONE
**Description:** Translate the architectural ERD into the `schema.prisma` file. Set up the PostgreSQL connection, generate the Prisma Client, and configure the PrismaService in Nest.js.
**Acceptance Criteria:**
- [x] `schema.prisma` completely maps the entities: User, Account, Cabinet, CabinetMember, Category, Demand, DemandEvidence, DemandLike, DemandComment, Result, ResultImage.
- [x] All Enums and Soft delete fields (`disabledAt`), audit fields (`createdAt`, `updatedAt`), and constraints (`@@unique`) are properly configured.
- [x] Create a global `PrismaModule` and `PrismaService` for database dependency injection in Nest.js.
**Tests:**
- [x] Run `npx prisma format` without errors.
- [x] Successfully run `npx prisma migrate dev --name init` against a local PostgreSQL instance.
**Agent Remarks (Fill upon completion):**
> Prisma v7 changes required adjustments from the original plan: (1) `datasource` block no longer accepts `url` in `schema.prisma` — the connection URL is managed exclusively via `prisma.config.ts` for migrations; (2) `driverAdapters` is no longer a preview feature; (3) `PrismaClient` at runtime requires an explicit adapter — `PrismaPg` from `@prisma/adapter-pg` is instantiated in `PrismaService` constructor using `process.env.DATABASE_URL`. Added `prisma` and `dotenv` as dev dependencies since they were missing from `node_modules`. `DatabaseModule` marked `@Global()` with `PrismaService` exported. Migration `20260329021512_init` applied successfully. Build and unit tests pass.

---

## Task 2: Global Authentication System (OAuth Ready)
**Status:** 🟢 DONE
**Description:** Implement the authentication core using Nest.js concepts, preparing the integration for OAuth.
**Acceptance Criteria:**
- [x] Create an `AuthModule` and `UsersModule`.
- [x] Implement user registration and login endpoints via Controllers.
- [x] Set up JWT authentication using `@nestjs/jwt` and `@nestjs/passport`.
- [x] Create custom Auth Guards (`@UseGuards()`) to protect private routes.
- [x] Ensure `Account` table is ready to handle OAuth linking via `provider` and `providerAccountId`.
**Tests:**
- [x] Unit test: Successfully generate and decode a JWT for a given User ID.
- [x] Integration test: Access a protected mock route using the implemented Auth Guard.
**Agent Remarks (Fill upon completion):**
> Used `bcryptjs` (pure JS) instead of `bcrypt` to avoid native bindings. `IUsersRepository` declared as abstract class (not interface) so it survives compilation and works as a NestJS injection token (`provide: IUsersRepository, useClass: UsersRepository`). Guest claiming routine runs synchronously inside `UsersService.createUser()` via `prisma.demand.updateMany`. `JwtModule.register()` `signOptions.expiresIn` requires a `number`, not a string — parsed via `parseInt`. E2e tests required a `setupFiles: ["./jest-setup.ts"]` entry in `jest-e2e.json` to load `.env` via `dotenv/config`, since the test runner doesn't inherit the shell environment. Replaced stale `app.e2e-spec.ts` (tested non-existent `GET /` route). Swagger setup was incomplete in `main.ts` — added `SwaggerModule.createDocument` + `SwaggerModule.setup('api', ...)`. Endpoints: `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (protected).

---

## Task 3: Cabinet and Category Core CRUD
**Status:** 🟢 DONE
**Description:** Build the `CabinetsModule` and `CategoriesModule`, including DTO validation, slug generation, and member roles.
**Acceptance Criteria:**
- [x] Implement CRUD endpoints in their respective Controllers.
- [x] Automatically generate unique `slug` fields from the `name` during creation within the Service layer.
- [x] Implement CabinetMember assignment logic (assigning `OWNER` or `STAFF` roles).
**Tests:**
- [x] Verify that creating a Cabinet with the same name generates a unique slug (e.g., `gabinete-1`).
- [x] Verify that a user cannot be added twice to the same cabinet (expecting graceful handling of Prisma `P2002` error).
**Agent Remarks (Fill upon completion):**
> Slug logic extracted to `src/shared/utils/slug.util.ts` (two pure functions: `toBaseSlug` + `resolveUniqueSlug`) so both modules share the algorithm without coupling. `findSlugsByBaseName` uses Prisma `startsWith` filter to fetch all slug candidates in one query. `CabinetMemberEntity` uses the Prisma compound unique key `userId_cabinetId` for `findUnique`. P2002 is caught in `CabinetMembersRepository.add()` and rethrown as `ConflictException` (409); application layer stays clean. `CreateCabinetUseCase.execute()` auto-assigns the creating user as `OWNER` via two sequential writes (not a transaction — ownerless cabinet edge case noted). `UpdateCabinetDto` extends `PartialType` from `@nestjs/swagger` (not mapped-types) to preserve `@ApiProperty` metadata. Controllers resolve slug → UUID via `FindCabinetBySlugUseCase` before mutation calls. 18 unit tests across 4 spec files all pass; `tsc --noEmit` clean.

## Task 4: Rename all columns tables using snake_case
**Status:** 🟢 DONE
**Description:** Change all columns tables switching the names in postgresql to use snake_case instead pascalCase
**Agent Remarks (Fill upon completion):**
> *[Agent: Leave your technical notes here...]*
---

## Task 5: Demand Creation with Guest Flow & Geolocation
**Status:** 🔴 TODO
**Description:** Implement the `DemandsModule` and the `POST /demands` route handling both authenticated users and the Guest Flow.
**Acceptance Criteria:**
- [ ] Use `ValidationPipe` with DTOs (`class-validator` / `class-transformer` or Zod pipes) to validate incoming payload.
- [ ] If authenticated (via request object from Guard), assign `reporterId`.
- [ ] If unauthenticated, require and validate `guestEmail` strictly.
- [ ] Validate geographic data (`lat`, `long`, `zipcode`).
**Tests:**
- [ ] Successfully create a demand as a logged-in user (verifying `reporterId`).
- [ ] Successfully create a demand as a guest (verifying `guestEmail` is saved and `reporterId` is null).
**Agent Remarks (Fill upon completion):**
> *[Agent: Leave your technical notes here...]*

---

## Task 6: AWS S3 Storage Integration for Evidences
**Status:** 🔴 TODO
**Description:** Integrate Nest.js with AWS S3 to handle file uploads for `DemandEvidence` and `ResultImage`.
**Acceptance Criteria:**
- [ ] Create a `StorageModule` to encapsulate the S3 SDK logic.
- [ ] Implement an upload route using Multer interceptors (`@UseInterceptors(FileInterceptor('file'))`).
- [ ] Save the file to S3 and store the `storageKey`, `url`, `mimeType`, and `size` in the database.
- [ ] Create a Service method to programmatically delete files from S3 using the `storageKey`.
**Tests:**
- [ ] Mock S3 upload and verify the database record contains the correct payload.
- [ ] Reject files exceeding the maximum allowed size using Nest.js ParseFilePipe.
**Agent Remarks (Fill upon completion):**
> *[Agent: Leave your technical notes here...]*

---

## Task 7: Demand Interactions (Likes & Comments)
**Status:** 🔴 TODO
**Description:** Implement the social features of the demands, utilizing Nest.js Exception Filters for robust error handling.
**Acceptance Criteria:**
- [ ] Implement `POST /demands/:id/likes`. 
- [ ] Create a custom `ExceptionFilter` to catch Prisma `P2002` (Unique Constraint) errors globally or specific to this route, returning a `200 OK` (idempotent response) for duplicate likes.
- [ ] Implement `POST /demands/:id/comments`. 
- [ ] Set `isCabinetResponse: true` automatically if the commenting `authorId` is a valid `CabinetMember`.
**Tests:**
- [ ] Simulate a race condition on the Like route and assert the server catches the Prisma error elegantly.
- [ ] Verify ordinary users cannot spoof `isCabinetResponse: true`.
**Agent Remarks (Fill upon completion):**
> *[Agent: Leave your technical notes here...]*

---

## Task 8: Results and Demand Resolution
**Status:** 🔴 TODO
**Description:** Build the `ResultsModule` allowing Cabinets to post results and update the Demand status.
**Acceptance Criteria:**
- [ ] Implement `POST /results` Controller. Must link to a `cabinetId` and optionally a `demandId`.
- [ ] Process `ResultImage` records via Multer interceptors (`BEFORE`, `AFTER`, `GENERAL`).
- [ ] Update the associated Demand `status` to `RESOLVED` in a Prisma Transaction within the Service.
**Tests:**
- [ ] Verify that only authenticated users with a valid `CabinetRole` can post a result for their Cabinet.
- [ ] Assert that the related Demand status automatically changes when a Result is published.
**Agent Remarks (Fill upon completion):**
> *[Agent: Leave your technical notes here...]*

---

## Task 9: Account Claiming Routine (Guest to User)
**Status:** 🔴 TODO
**Description:** Automate the process of merging guest demands into a newly created user account to maximize user retention.
**Acceptance Criteria:**
- [ ] Hook into the `UsersService` registration method.
- [ ] Upon successful user creation, trigger an internal method to find all Demands where `guestEmail === newUser.email` and `reporterId === null`.
- [ ] Update those demands: set `reporterId = newUser.id` and `guestEmail = null`.
**Tests:**
- [ ] Create 3 demands with `guestEmail: "test@example.com"`. Register a user with "test@example.com". Assert all 3 demands now belong to the user's `id`.
**Agent Remarks (Fill upon completion):**
> *[Agent: Leave your technical notes here...]*