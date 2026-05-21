# Ain Al Khaleej University Enterprise SIS

This repository now contains a dependency-free enterprise SIS starter for Ain Al Khaleej University. It preserves the previous static CV page at `montasir.html` and uses `index.html` as the new bilingual public website and portal shell.

## Included

- Public admissions website with English/Arabic language switch and RTL support.
- Role-aware portal shell for admin, registrar, admissions, faculty, finance, students, requests, CMS, reports, security, and audit.
- Shared service layer in `src/sis-services.js` for admissions, applicant conversion, registration validation, attendance, grades, GPA, transcripts, invoices, payments, student requests, CMS, notifications, reports, numbering, and audit logs.
- MySQL 8 schema baseline in `data/enterprise-schema.sql`.
- Seed data in `data/default-seed.json`.
- Versioned API contract in `api/openapi.json`.
- Dependency-free local API runtime in `src/server.js` with auth sessions, persistent state, security headers, validation, and standard JSON responses.
- Automated service tests in `tests/sis-services.test.mjs`.
- Operations documentation under `docs/`.

## Run locally

```bash
npm test
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Run the API

```bash
npm start
```

The API listens on `http://localhost:3000` by default and persists state to `data/runtime-state.json` unless `SIS_STATE_PATH` is set. See `docs/RUNTIME_API.md`.

Seeded runtime login:

- Username: `superadmin`
- Password: `ChangeMe!2026`

## Production path

The uploaded plan recommends Laravel 11, PHP 8.2+, MySQL 8, Sanctum, queues, scheduler, Form Requests, Policies, Events, and service classes. PHP and Composer are not installed in this cloud machine, so this commit delivers the verifiable static/service/database/API foundation and documents how to convert the same modules into Laravel migrations, controllers, policies, and queues.
