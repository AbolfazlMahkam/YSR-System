# یاران سلامت روان — YSR System

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)

A full-stack membership and registration platform for **موسسه یاوران سلامت روان** (the Institute of Mental-Health Companions), built as a TypeScript monorepo with a NestJS API and a React SPA.

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Repository Layout](#-repository-layout)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Available Scripts](#-available-scripts)
- [Database & Migrations](#-database--migrations)
- [Docker Deployment](#-docker-deployment)
- [API Overview](#-api-overview)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

YSR System manages the full registration lifecycle of the institute's members and consultants:

1. Members register (phone OTP, password, or Google), complete a **self-declaration** (اظهارنامه) and one or more **dynamic forms** defined by admins.
2. Admins review self-declarations, correct or return them, track each member's **interview status**, and manage the **Arbaeen processions** (مواکب اربعین) each member is assigned to as a consultant.

The UI is **Persian (Farsi) and right-to-left** (`<html lang="fa" dir="rtl">`).

### Monorepo

- **Turborepo** orchestration with **npm workspaces**
- `apps/backend` — NestJS REST API
- `apps/frontend` — React single-page application
- `packages/*` — shared internal packages (`@repo/ui`, `@repo/eslint-config`, `@repo/typescript-config`)

---

## ✨ Features

### 🔐 Authentication & Authorization

- **Email/Password login** and **user registration** with bcrypt hashing
- **Phone OTP login** — 4-digit, one-time-use codes (returned directly in development)
- **Google OAuth 2.0** sign-in (frontend credential → backend verification via `google-auth-library`)
- **JWT-based sessions** (`sub` + `role` claims)
- **Global guards** — `JwtAuthGuard` + `RolesGuard` applied to every route
- **Custom decorators** — `@Public()`, `@Roles()`, `@GetUser()`
- **Role hierarchy** — `user` → `admin` → `super_admin`
- **Login-as** — `super_admin` can obtain a token for any user

### 👥 Member (User) Management

- Profile fields: national code (کد ملی), birth date, gender, education, address
- Admin CRUD and user listing; users can update their own profile
- **Interview workflow** tracked per member:
  `not_started` → `form_completed` → `awaiting_interview` → `accepted` / `not_meeting_requirements`
- Admin interview notes via `PATCH /users/:id/interview`

### 📋 Self-Declaration (اظهارنامه)

- One declaration per user, stored as JSON with a review workflow:
  `pending` → `approved` | `returned`
- Admins attach **notes** and mark specific **correction fields** that the member must fix
- Members see the status and a "requires correction" notice on their dashboard

### 🧩 Dynamic Forms

- **Schema-driven forms** — fields defined as JSON (`text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`, `file`, `province_city`, `continent_country`)
- **Form Builder UI** — admins create/edit form definitions (title, slug, fields, validation rules, file config, notifications) without code
- Per-form settings: `is_multi_submit`, `show_notification` + notification title/text
- **Submissions** — members fill forms, admins review all submissions, optionally re-fill
- **Statistics** — per-form submission analytics (charts + XLSX export)
- File answers are uploaded through the backend and served under `/uploads`

### 🌍 Arbaeen Processions (مواکب اربعین)

- Manage **years** and year-scoped **processions** (name, location, address, responsible person/phone)
- Locations: `Najaf Ashraf`, `Karbala Mu'alla`, `Tariq Al-Hussein (AS)`
- **Gender requirements** (`male` / `female` / `both`) enforced when assigning consultants
- **Consultant assignment** — single or batch; gender mismatches are rejected/skipped
- **Responsible consultant** per procession (must be an assigned consultant)
- **Show on dashboard** — toggle per year so assigned members see their procession on the dashboard

### 📊 Dashboards

- **Member dashboard** — registration status, active/completed forms, notifications, assigned processions (split by gender), welcome banner
- **Admin dashboard** — user stats by status, self-declaration stats by status, summary widgets

### ☁️ DevOps

- Multi-stage **Dockerfiles** built from the repo root (single hoisted lockfile)
- **docker-compose** for both development and production (Postgres + backend + nginx frontend, healthchecks, named volumes)
- Migrations applied **automatically at boot** (`migrationsRun: true`, `synchronize: false`)
- Backend runs as **non-root** with `dumb-init` for clean shutdown

---

## 🛠️ Tech Stack

### Frontend (`apps/frontend`)

| Area | Choice |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 3 + shadcn/ui + Radix UI |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts / export | Recharts, xlsx, jsPDF (+ autotable), html2canvas |
| Notifications | Sonner |
| OAuth | @react-oauth/google |
| Theme | next-themes (dark/light) |

### Backend (`apps/backend`)

| Area | Choice |
| --- | --- |
| Framework | NestJS 11 |
| ORM | TypeORM 0.3 + PostgreSQL (`pg`) |
| Auth | @nestjs/jwt, Passport JWT, bcryptjs, express-session |
| Google | google-auth-library |
| Validation | class-validator + class-transformer |
| Testing | Jest (+ Supertest for e2e) |

### Monorepo & Tooling

- Turborepo 2 + npm workspaces, TypeScript 5.9, Prettier, ESLint 9

---

## 📁 Repository Layout

```
ysr-system/
├── apps/
│   ├── backend/            # NestJS REST API
│   │   ├── src/
│   │   │   ├── auth/       # register / login / OTP / Google / login-as
│   │   │   ├── users/      # member management + interview status
│   │   │   ├── forms/      # dynamic forms, self-declaration, admin review/stats
│   │   │   ├── arbaeen/    # years, processions, consultants
│   │   │   ├── uploads/    # file upload module
│   │   │   ├── common/     # global guards, decorators, validation pipes
│   │   │   ├── entities/   # TypeORM entities
│   │   │   ├── migrations/ # versioned schema migrations
│   │   │   ├── logger/     # request logging middleware
│   │   │   ├── data-source.ts
│   │   │   └── main.ts
│   │   └── Dockerfile
│   └── frontend/           # React SPA
│       ├── src/
│       │   ├── pages/      # Login, Register, Profile, Forms, Admin pages
│       │   ├── components/ # layout, dynamic forms, shadcn/ui components
│       │   ├── api/        # typed API clients (auth, users, forms, arbaeen)
│       │   ├── context/    # AuthContext
│       │   ├── hooks/      # useAuth, useActiveForms, …
│       │   ├── data/       # provinces/cities, continents/countries
│       │   └── lib/        # helpers (toPersianDigits, cn, …)
│       ├── nginx.conf      # SPA fallback, /uploads proxy, asset caching
│       └── Dockerfile
├── packages/
│   ├── ui/                 # @repo/ui shared components
│   ├── eslint-config/      # @repo/eslint-config
│   └── typescript-config/  # @repo/typescript-config
├── docker-compose.yml      # dev stack
├── docker-compose.prod.yml # production stack
├── turbo.json              # Turborepo pipeline
└── package.json            # root workspace manifest
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (Node 22 recommended)
- **npm** ≥ 10.9.2
- **PostgreSQL** ≥ 14 (or any DB supported by TypeORM)

### Option A — Local development

**1. Install dependencies (from repo root)**

```bash
npm install
```

**2. Configure the backend** — `apps/backend/.env` (see `apps/backend/.env.example`)

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4000

DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ysr

JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
SESSION_SECRET=change-me-too
GOOGLE_CLIENT_ID=
```

**3. Configure the frontend** — `apps/frontend/.env` (see `apps/frontend/.env.example`)

```env
VITE_NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=
```

**4. Create the database and apply migrations**

```bash
createdb ysr
cd apps/backend && npm run migration:run
```

**5. Start everything**

```bash
npm run dev
```

- Frontend → http://localhost:4000 (uploaded files proxied to the backend)
- Backend → http://localhost:3000

### Option B — Docker Compose

**Development stack:**

```bash
docker compose up --build
```

**Production stack:**

```bash
cp .env.prod.example .env.prod
# edit .env.prod — replace ALL secrets, set FRONTEND_URL / VITE_API_BASE_URL
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

| Service | Host port (default) | Notes |
| --- | --- | --- |
| `frontend` | `8080` (nginx :80) | SPA + `/uploads` proxy |
| `backend` | `3000` | NestJS API |
| `postgres` | not published | internal only |

---

## 🔧 Configuration

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `FRONTEND_URL` | backend / compose | CORS origin for credentialed requests |
| `PORT` | backend | API port (default 3000) |
| `DB_*` | backend / compose | Postgres connection (`DB_SYNCHRONIZE` stays `false`) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | backend / compose | Access-token signing |
| `SESSION_SECRET` | backend / compose | express-session secret |
| `GOOGLE_CLIENT_ID` | backend | Google token verification audience |
| `VITE_API_BASE_URL` | frontend | Public backend URL baked in at **build time** |
| `VITE_GOOGLE_CLIENT_ID` | frontend | Google OAuth client id |
| `FRONTEND_PORT`, `BACKEND_PORT` | compose | Host port mappings |

> ⚠️ `VITE_*` variables are inlined into the JS bundle by `vite build` — changing them requires rebuilding the frontend image/container.

### Vite dev proxy

During development the frontend proxies `/uploads` to `http://localhost:3000`, so uploaded files resolve against the frontend origin.

---

## 📜 Available Scripts

### Root (monorepo)

```bash
npm run dev           # run all apps in dev mode (turbo)
npm run build         # build all apps/packages
npm run lint          # lint everything
npm run format        # format with Prettier
npm run check-types   # type-check everything
```

### Backend (`apps/backend`)

```bash
npm run dev                    # watch mode
npm run build                  # compile to dist/
npm run start:prod             # run compiled output
npm run test                   # unit tests
npm run test:e2e               # end-to-end tests
npm run migration:generate     # generate migration from entity changes
npm run migration:create       # create an empty migration
npm run migration:run          # apply pending migrations
npm run migration:revert       # revert the last migration
npm run migration:show         # list migration status
```

### Frontend (`apps/frontend`)

```bash
npm run dev           # Vite dev server (port 4000)
npm run build         # production build to dist/
npm run preview       # preview the production build
npm run lint          # ESLint
npm run type-check    # tsc -b
```

---

## 🗄️ Database & Migrations

- TypeORM is configured with `synchronize: false` and `migrationsRun: true` — schema is version-controlled and migrations are applied automatically at boot.
- The `typeorm` scripts use `src/data-source.ts` as the DataSource.

**Workflow**

```bash
# 1. change an entity in apps/backend/src/entities/
# 2. generate a migration
cd apps/backend && npm run migration:generate -- src/migrations/YourName
# 3. review the generated SQL, then run it
npm run migration:run
# 4. commit the migration file
```

### Data model

- `users` — phone, role, profile fields, `self_declaration_data`, interview status/notes
- `codes` — phone OTP codes (`is_used` flag)
- `form_schemas` — dynamic form definitions (slug, title, JSON `fields`)
- `form_submissions` — user answers per form (JSON `answers`)
- `self_declarations` — one per user, `pending`/`approved`/`returned`, notes + correction fields
- `arbaeen_years` — unique year labels
- `arbaeen_processions` — year-scoped processions, gender requirement, responsible consultant
- `arbaeen_procession_consultants` — many-to-many assignment of users to processions

---

## 🐳 Docker Deployment

### Images

- **Backend** — multi-stage `node:22-alpine`; deps → build → `npm ci --omit=dev` → non-root `node` runtime with `dumb-init`. Migrations run on boot, so no separate migration step.
- **Frontend** — build-time `VITE_*` args baked in, then served by `nginx:1.27-alpine` with gzip, immutable asset caching, an SPA fallback, a `/healthz` endpoint, and a `/uploads` proxy to the backend.
- **Postgres** — `postgres:16-alpine` with a healthcheck; no host port published in production.

Named volumes: `pgdata` (database) and `uploads` (uploaded files, mounted at `/app/apps/backend/uploads`).

### Production notes

- Set `VITE_API_BASE_URL` to the public backend URL (browser-reachable, not the compose-internal `backend` host).
- `FRONTEND_URL` must match the browser-facing frontend origin exactly, or the backend CORS (`credentials: true`) will block auth cookies.
- Regenerate every secret in `.env.prod` before a real deploy.

---

## 📡 API Overview

Base URL: `http://localhost:3000` — all routes are protected unless marked `@Public()`.

### Auth (`/auth`)

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register with phone + password |
| POST | `/auth/login` | Public | Login with phone + password |
| POST | `/auth/login_otp` | Public | Request (phone only) or verify (phone + code) OTP |
| POST | `/auth/google` | Public | Login with a Google credential token |
| GET | `/auth/me` | Authenticated | Current user profile |
| POST | `/auth/login-as/:userId` | `super_admin` | Obtain a token for any user |

### Users (`/users`)

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | `admin`, `super_admin` | List members |
| POST | `/users` | `admin`, `super_admin` | Create member |
| GET | `/users/:id` | Authenticated (own) | Get member |
| PATCH | `/users/:id` | Authenticated (own) or admin | Update member |
| PATCH | `/users/:id/interview` | `admin`, `super_admin` | Set interview status/notes |
| DELETE | `/users/:id` | `admin`, `super_admin` | Delete member |
| GET | `/users/admins/list` | `super_admin` | List admin users |

### Forms (`/forms`)

- `GET /forms` — active forms
- `GET /forms/my-submissions`, `GET /forms/:slug` / `POST /forms/:slug/submit` — fill forms
- `GET /forms/self-declaration` / `POST` — the member's self-declaration
- Admin: form-definition CRUD, submissions review, dashboard stats, per-form statistics

### Arbaeen (`/arbaeen`) — `admin`/`super_admin`

- Years: `POST|GET|DELETE /arbaeen/years`
- Processions: `POST|GET|PUT|DELETE /arbaeen/processions`, `GET /arbaeen/years/:yearId/processions`
- Consultants: `GET|POST /arbaeen/processions/:id/consultants`, batch assignment, removal, available-consultants lookup
- Responsible consultant: `PUT /arbaeen/processions/:id/responsible-consultant`
- Dashboard visibility: `PUT /arbaeen/years/:yearId/toggle-show-on-dashboard`
- Members: `GET /arbaeen/my-processions` (any authenticated user)

### Uploads (`/uploads`)

- POST file upload; files served statically under `/uploads/...`

---

## 🤝 Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes with a meaningful message
3. Push and open a Pull Request

Please keep code formatted with Prettier, run `npm run lint` and `npm run check-types`, and add tests for new backend features.

---

## 📄 License

UNLICENSED — private project.

---

<div align="center">

**Built with ❤️ using React, NestJS, TypeScript, and PostgreSQL**

</div>
