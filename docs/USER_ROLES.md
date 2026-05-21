# User Roles and Permissions

## Default roles

- Super Admin
- University President
- Chancellor
- Vice Chancellor
- Registrar
- Admissions Officer
- Admissions Manager
- Student Affairs Officer
- Faculty Member
- Faculty Dean
- Department Head
- Academic Advisor
- Exam Officer
- Finance Officer
- Finance Manager
- HR Officer
- Librarian
- IT Administrator
- Quality / Accreditation Officer
- Student
- Applicant
- Parent / Guardian
- Auditor / Read-only Reviewer

## Permission examples

- `view_dashboard`
- `manage_users`
- `manage_roles`
- `manage_permissions`
- `manage_students`
- `view_students`
- `create_students`
- `edit_students`
- `delete_students`
- `approve_admissions`
- `reject_admissions`
- `manage_programs`
- `manage_courses`
- `manage_sections`
- `manage_timetable`
- `manage_attendance`
- `submit_grades`
- `approve_grades`
- `view_transcripts`
- `issue_transcripts`
- `manage_fees`
- `manage_payments`
- `manage_invoices`
- `manage_refunds`
- `view_financial_reports`
- `manage_cms`
- `manage_notifications`
- `view_audit_logs`
- `export_reports`
- `manage_settings`

## Rules

- Use permission checks, not only role names.
- Users may have multiple roles.
- Super Admin is protected from deletion.
- Role and permission changes must be audited.
- UI menu hiding is not sufficient; enforce permission middleware server-side.
- Prevent users from assigning permissions they do not already have.
