# Runtime API

The next-level starter includes a dependency-free Node.js HTTP API in `src/server.js`.

## Start

```bash
npm start
```

Default URL:

```text
http://localhost:3000
```

Use a custom state file:

```bash
SIS_STATE_PATH=/secure/path/state.json npm start
```

The server persists state atomically through `src/sis-store.js`. The default runtime state file is ignored by Git.

## Authentication

Login:

```bash
curl -s http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin"}'
```

Use the returned token:

```bash
curl -s http://localhost:3000/api/v1/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

This runtime uses demo token sessions suitable for local validation. Production Laravel should use Sanctum or equivalent token/session authentication with password verification, lockout, MFA, and token revocation.

## Implemented endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/dashboard`
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `POST /api/v1/applications/{id}/approve`
- `POST /api/v1/applications/{id}/reject`
- `POST /api/v1/applications/{id}/issue-offer`
- `POST /api/v1/applications/{id}/accept-offer`
- `POST /api/v1/applications/{id}/convert-to-student`
- `GET /api/v1/students`
- `POST /api/v1/students/{id}/holds`
- `POST /api/v1/registrations`
- `POST /api/v1/attendance/sections/{id}/sessions`
- `POST /api/v1/grades`
- `POST /api/v1/grades/{id}/approve`
- `POST /api/v1/transcripts/{id}/issue`
- `GET /api/v1/finance/invoices`
- `POST /api/v1/finance/payments`
- `POST /api/v1/requests`
- `GET /api/v1/cms/pages`
- `PATCH /api/v1/cms/pages/{id}`
- `POST /api/v1/chat/conversations`
- `POST /api/v1/reports/{name}/export`
- `GET /api/v1/audit-logs`
- `POST /api/v1/admin/reset`

## Security headers

The server emits:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cache-Control: no-store`

Production deployments should add HTTPS/HSTS and a stricter host-specific CSP.
