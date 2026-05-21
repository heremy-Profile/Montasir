# Installation

## Current dependency-free build

Requirements:

- Node.js 20+ for tests.
- Any static web server for the browser UI.

Commands:

```bash
npm test
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Laravel production implementation target

When PHP 8.2+ and Composer are available, convert this starter into a Laravel 11 application:

1. Create a Laravel app.
2. Add Sanctum for API tokens.
3. Convert `data/enterprise-schema.sql` into Laravel migrations grouped by module.
4. Convert `data/default-seed.json` into seeders.
5. Move business rules from `src/sis-services.js` into Laravel service classes:
   - `AdmissionService`
   - `StudentService`
   - `RegistrationService`
   - `AttendanceService`
   - `GradeService`
   - `GPAService`
   - `TranscriptService`
   - `FinanceService`
   - `NotificationService`
   - `WorkflowService`
   - `AuditService`
   - `FileUploadService`
   - `CMSService`
   - `ReportService`
6. Implement routes from `api/openapi.json`.
7. Enforce all permissions with middleware, policies, and gates.

## Environment variables

Prepare these for production:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY`
- `APP_URL`
- `DB_HOST`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `QUEUE_CONNECTION=database` or `redis`
- `FILESYSTEM_DISK=private`
