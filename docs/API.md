# API

The versioned OpenAPI contract is stored at `api/openapi.json`.

The runnable dependency-free API implementation is stored at `src/server.js`; see `RUNTIME_API.md` for local startup and endpoint examples.

## Response format

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

## Route groups

- `/api/v1/auth`
- `/api/v1/students`
- `/api/v1/applicants`
- `/api/v1/applications`
- `/api/v1/programs`
- `/api/v1/courses`
- `/api/v1/registrations`
- `/api/v1/attendance`
- `/api/v1/grades`
- `/api/v1/transcripts`
- `/api/v1/finance`
- `/api/v1/requests`
- `/api/v1/workflows`
- `/api/v1/reports`
- `/api/v1/cms`
- `/api/v1/notifications`
- `/api/v1/scheduler`
- `/api/v1/audit-logs`

## Requirements

- Authentication required except public admissions, public CMS, and login endpoints.
- Permission middleware on every protected endpoint.
- Form Request validation in Laravel.
- Pagination, search, sort, and filters on list endpoints.
- Standard response wrapper.
- No sensitive data leakage.
- Audit log for sensitive operations and exports.
- Queued jobs for email, SMS, PDF generation, imports, exports, and large reports.
