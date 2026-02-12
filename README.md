# Gola Application

This repository currently contains a Node.js + Express + MongoDB web app that is running in Docker and serving a personal portfolio-style homepage, while also containing partially built modules for a larger learning/ecommerce platform.

The codebase is a mix of:
- Active portfolio functionality (homepage, contact form, Medium RSS feed).
- Inactive or unfinished platform features (users, courses, cart/order, permissions, wallet/payment helpers, i18n, auth scaffolding).

## Product Direction (Confirmed)

- Delivery mode: Hybrid
  - Public portfolio landing pages.
  - Full platform behind authentication.
- Payments: Keep Paystack.
- Authentication: Local auth + social auth.
- Social auth rollout: Google first.
- Access rule: signup requires verified email before platform access (local via email token; Google via Google-verified email).

## What Is Meant To Be Built

Based on routes, models, views, and middleware, the intended final application appears to be:
- A personal brand site and portfolio.
- A course/mentorship platform with user accounts and enrollments.
- A payment-enabled commerce flow (cart/orders/wallet/transaction verification).
- Role-based access control (owner/admin/student/subscriber).
- Optional multilingual support.

The platform foundation is now partially wired, but major product features are still pending.

## Current Status (What Works Now)

- App boots and serves on port `3000`.
- MongoDB connects in Docker.
- Home page is rendered from `views/pages/index.ejs`.
- Contact form submits to `POST /send-message` and stores a `Message`.
- Blog section calls `GET /api/blogs` and reads Medium RSS feed.
- Local auth routes are available (`/user/register`, `/user/login`, `/user/logout`).
- Email verification is enforced before platform access.
- Platform pages are protected (`/learn`, `/courses`, `/user/dashboard`).
- Google auth route is scaffolded and enabled when Google credentials are configured.

## Runtime Architecture

- Entry point: `app.js`
- Web framework: Express + EJS templating
- Database: MongoDB via Mongoose
- Containers: `app` + `mongo` via Docker Compose
- Static assets: `public/`

There is now a `controllers/` layer for public/auth/platform flows, while some legacy modules still need migration.

## Folder Overview

- `app.js`: Express bootstrap, middleware, route mounting, DB connection.
- `routes/`: HTTP endpoints.
- `models/`: Mongoose schemas.
- `middleware/`: helper modules for auth, validation, email, market, wallet, etc.
- `worker/`: async email worker wrappers.
- `views/`: EJS templates (pages + partials).
- `public/`: CSS/JS/fonts/images.
- `config/`: db + passport config.
- `locales/`: translation JSON files (many currently empty).
- `Dockerfile`, `docker-compose.yml`, `docker-compose copy.yml`: container setup.

## Route Map (Current)

### Mounted in `app.js`

- `/` -> `routes/index.js`
- `/user` -> `routes/user.js`
- `/` and `/pages` -> `routes/pages.js`
- `/admin` -> `routes/admin.js`
- `/blog` -> `routes/blog.js`
- `/payment` -> `routes/payment.js`

### Endpoints implemented

- `GET /`
  - Renders `views/pages/index.ejs`.
- `GET /about`
- `GET /ask`
- `POST /send-message`
  - Saves contact form payload to MongoDB `Message`.
  - Triggers background contact email sender.
- `GET /api/blogs`
  - Fetches latest Medium RSS entries.
- `GET /learn`
- `GET /courses`
  - Authenticated + email-verified platform routes.
- `GET /user/register` / `POST /user/register`
- `GET /user/login` / `POST /user/login`
- `GET /user/verify-email/:token`
- `GET /user/dashboard`
- `GET /user/logout`
- `GET /user/auth/google`
  - Returns 503 unless Google credentials are provided.
- `GET /payment/enroll/:product`
  - Placeholder enrollment route behind auth + verification.

- `GET /admin/`
  - Restricted to `admin/owner` roles, currently placeholder.
- `GET /blog/`
  - Redirects to homepage blog section anchor.

## Models Present

- `User`: account profile, role, auth tokens, enrolled courses.
- `Course`: course metadata and instructor relation.
- `Category`: course grouping.
- `Cart`: cart-like data model (room/hotel-style fields; needs cleanup).
- `Order`: purchase record (schema differs from market middleware expectations).
- `Permission`: role-to-route permission map.
- `Review`: review model for blog/course.
- `Blog`: internal blog schema.
- `Message`: contact form submissions.
- `Item`: simple name model.

## Middleware / Utilities Present

- `email.js`, `worker/workers.js`: email sending wrappers.
- `confirm.js`, `permissionCache.js`, `apiAuth.js`: auth/permission helpers.
- `validator.js`: signup/signin/contact validation helpers.
- `storage.js`: multer upload helper.
- `verifyPayment.js`: Paystack verify helper.
- `market.js`: cart/order helpers.
- `walletCreate.js`, `walletBalance.js`: wallet helpers.
- `language.js`: user language application.
- `gravatar.js`, `ipwhiteList.js`, `qrCode.js`: extra utility middleware.

## Key Gaps and Inconsistencies

- Missing models referenced by wallet code:
  - `models/wallet`, `models/balance`.
- Missing email templates referenced by `middleware/email.js`:
  - `views/emails/emailActivate.ejs` is present.
  - Other templates (`emailWelcome`, `emailBirthday`, `emailPasswordReset`, `emailCompletedOrder`) are still missing.
- Route/functionality mismatch:
  - Paystack enrollment route is only a placeholder right now.
  - Several frontend links still point to not-yet-built product pages.
- Data/model consistency issues:
  - Mixed Mongoose connection usage (`conn.model(...)` vs `mongoose.model(...)`).
  - `middleware/market.js` order payload shape does not match `models/order.js`.
- i18n quality issues:
  - many locale JSON files are empty/invalid.
  - namespace typo mismatch (`settiings.json` file vs `settings` namespace in `i18n.js`).
- View/template quality issues:
  - `views/pages/courses.ejs` now has starter content, but needs full product content.
  - duplicated sidebar markup in `views/pages/index.ejs`.
  - legacy contact form snippets still exist in partials.
- Docker config duplication:
  - `docker-compose.yml` expects env-provided `MONGO_URI`.
  - `docker-compose copy.yml` hardcodes `MONGO_URI` and is currently the reliable local file.

## Docker (Current Recommended Run)

```bash
docker compose -f "docker-compose copy.yml" up --build -d
```

Check:

```bash
docker compose -f "docker-compose copy.yml" ps
docker compose -f "docker-compose copy.yml" logs -f app
docker compose -f "docker-compose copy.yml" logs -f mongo
```

Stop:

```bash
docker compose -f "docker-compose copy.yml" down
```

## Required Environment Variables (Target)

At minimum for a full build:
- `PORT`
- `MONGO_URI`
- `SESSION_SECRET`
- `APP_BASE_URL`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SERVER`
- `MAIL_PORT`
- `DEFAULT_SENDER`
- `ADMIN_EMAIL`
- `FEEDBACK_EMAIL`
- `PAYSTACK_KEY` (or align with current Paystack key naming)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

## Next Step

Use `TODO_APP.md` as the execution plan to complete this application safely and in phases.
