# Security

## Implemented in this starter

- Permission constants and role permission mapping.
- Permission-filtered portal menus.
- Service-layer permission checks for admissions approval, student creation, holds, attendance, grades, transcripts, payments, CMS, and reports.
- Audit events for sensitive workflows.
- Bilingual content stored as separate English/Arabic fields.
- File metadata schema with private disk, MIME type, extension, checksum, size, and uploader.
- Runtime API password verification with PBKDF2-SHA512 for seeded users.
- Runtime API failed-login counters, temporary lockout, session expiry, and password-hash redaction.
- Secure media-file registration checks for extension allowlist, executable denial, file size limits, and SHA-256 checksum shape.

## Required backend controls

- Hash passwords with Argon2id or bcrypt.
- Enforce email verification and password reset tokens.
- Rate-limit login and password reset routes.
- Lock accounts after repeated failures.
- Store login history.
- Support forced logout from all devices.
- Enforce session timeout.
- Use CSRF protection for web routes.
- Use Sanctum or equivalent token auth for APIs.
- Enforce route middleware and policies server-side.
- Prevent Super Admin deletion.
- Prevent privilege escalation by checking assigner permissions.
- Escape output and sanitize rich text CMS input.
- Validate uploads by MIME, extension, size, and magic bytes.
- Store sensitive documents outside the public web root.
- Serve sensitive documents through an authorization controller.
- Never delete posted payments; use refunds/reversals.
- Mask sensitive data in logs and exports.

## Security headers

Use the headers listed in `DEPLOYMENT.md` and test them before release.

## Audit events

Audit at minimum:

- Login success/failure/logout.
- Password reset request and password change.
- Role/permission changes.
- Student create/edit/delete/status changes.
- Hold add/release.
- Sensitive document view/download.
- Admission decision.
- Applicant conversion.
- Registration/drop/override.
- Attendance submission.
- Grade submit/approve/change.
- Transcript issue.
- Invoice/payment/refund.
- CMS publish.
- Settings update.
- Report export.
