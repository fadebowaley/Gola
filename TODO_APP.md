# TODO APP Plan

This is a practical completion plan for the current codebase.

## Confirmed Product Decisions (Phase 0)

- Product direction: `Hybrid` (portfolio landing + full platform behind auth).
- Payments: `Keep Paystack`.
- Authentication: `Local auth + Social auth`.
- Social provider order: `Google first`.
- Platform access policy: `Email verification required before access`.

## Phase 0 - Decide Product Scope (Required First)

- [x] Confirm final product direction:
  - Option A: Portfolio + contact + blog only.
  - Option B: Full learning platform (auth, courses, enrollment, payments, admin).
  - Option C: Hybrid (portfolio landing + full platform behind auth).
- [x] Confirm primary payment strategy:
  - Keep Paystack, replace Paystack, or remove payments for now.
- [x] Confirm auth strategy:
  - Local auth only, social auth, or no auth in MVP.

## Phase 1 - Stabilize Foundation (P0)

- [x] Unify DB connection strategy.
  - Use one Mongoose connection pattern only.
  - Make all models use the same connection.
- [x] Fix startup config loading order.
  - Load env before requiring modules that depend on env.
- [ ] Normalize environment variable names.
  - Align Paystack key names across code and env.
- [x] Add missing dependencies to `package.json`.
- [x] Add strict startup checks for required env vars with clear errors.
- [ ] Standardize Docker compose to one file (or one base + overrides).

Acceptance:
- App boots cleanly with no undefined DB URI warnings.
- `docker compose up --build` works with one documented command.

## Phase 2 - Route and Controller Refactor (P0)

- [x] Introduce `controllers/` layer and move route logic out of route files.
- [x] Keep routes thin (input parsing + middleware + controller call).
- [x] Add centralized error handler and 404 handler.
- [x] Remove duplicate route behavior (`/user`, `/pages`, `/admin`, `/blog` all rendering same page).
- [x] Add real routes for existing pages:
  - `/about`
  - `/ask`
  - `/learn`
  - `/courses`

Acceptance:
- Route map is clean, non-duplicated, and documented.
- Each user-visible page has an intentional route.

## Phase 3 - Data Model Repair (P0)

- [ ] Align `Order` schema with `market.js` payload shape.
- [ ] Clean `Cart` model fields to match actual business domain.
- [ ] Add missing `Wallet` and `Balance` models or remove wallet middleware.
- [ ] Add indexes where needed (`email`, `slug`, `createdAt`, etc.).
- [ ] Add schema validation and consistent timestamps.

Acceptance:
- No model references to missing files.
- Core domain models match controller logic.

## Phase 4 - Auth and Permissions (P1)

- [x] Install and wire:
  - `express-session`
  - `passport`
  - `passport-local`
  - flash messaging (if kept)
- [ ] Implement auth routes:
  - register
  - login
  - logout
  - email verify
  - password reset
- [x] Fix `confirm.js` issues (`User` undefined, role naming consistency).
- [ ] Make permission checks deterministic and tested.

Acceptance:
- Users can register/login/logout.
- Protected routes enforce roles correctly.

## Phase 5 - Email + Background Jobs (P1)

- [ ] Create missing email templates under `views/emails/`.
  - `emailActivate.ejs` is now added; other templates are still pending.
- [ ] Add fallback text templates and better error logging.
- [ ] Decide whether to keep in-process worker wrappers or move to queue.
- [ ] Add retry/backoff strategy for transient email failures.

Acceptance:
- Contact, verification, and reset emails all send successfully in non-dev.

## Phase 6 - Frontend Cleanup (P1)

- [ ] Remove duplicated layout blocks in `views/pages/index.ejs`.
- [ ] Replace old/unused contact form snippets in partials.
- [x] Create content for empty `views/pages/courses.ejs`.
- [ ] Ensure all UI links target valid backend routes.
- [ ] Validate missing assets (e.g. referenced videos).

Acceptance:
- No broken links or dead UI actions from rendered pages.

## Phase 7 - i18n Completion (P2)

- [ ] Fix locale namespace typo (`settiings` -> `settings`).
- [ ] Replace empty locale files with valid JSON documents.
- [ ] Wire i18n middleware into app lifecycle if multilingual support is in scope.
- [ ] Add translation usage in templates/controllers.

Acceptance:
- Locale loading is valid and error-free.
- Language switching works end-to-end (if enabled).

## Phase 8 - Payments and Enrollment (P2)

- [ ] Implement payment/enrollment routes referenced by frontend:
  - `/payment/enroll/*`
- [ ] Validate transaction callback flow.
- [ ] Persist successful enrollment to user courses.
- [ ] Implement failed/success result pages.

Acceptance:
- A user can complete purchase/enrollment flow successfully.

## Phase 9 - Testing and Quality (P1)

- [ ] Add linting and formatting.
- [ ] Add unit tests for controllers and model logic.
- [ ] Add integration tests for core flows:
  - contact submit
  - auth
  - enroll/payment (if in scope)
- [ ] Add CI job to run tests and block broken merges.

Acceptance:
- Core regressions are caught automatically before deploy.

## Phase 10 - Deployment Hardening (P1)

- [x] Add health check endpoint (e.g. `/healthz`).
- [ ] Add Docker healthchecks for app and mongo.
- [ ] Add production logging strategy.
- [ ] Add backup/recovery plan for Mongo data.
- [ ] Document release workflow clearly.

Acceptance:
- Production startup and rollback are predictable.

---

## Open Questions For You

1. After Google, which provider should be next: GitHub or LinkedIn?
