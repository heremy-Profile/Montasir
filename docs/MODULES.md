# Modules

## Foundation

- Authentication and account security.
- Role-based access control.
- Audit logging.
- System settings.
- English/Arabic UI and content fields.
- Secure file metadata model.

## Academic core

- Academic years and semesters.
- Colleges, departments, programs.
- Courses and prerequisites.
- Campuses, buildings, classrooms.
- Course sections and meetings.
- Timetable conflict checks in the service layer.

## Admissions and students

- Public applicant form.
- Application statuses.
- Admissions approve/reject/offer workflow.
- Applicant to student conversion.
- Student ID generation.
- Initial finance charge generation.
- Student holds.

## Registration

- Student active status rule.
- Registration period rule.
- Financial/academic hold rule.
- Capacity rule.
- Duplicate registration rule.
- Prerequisite rule.
- Timetable conflict rule.
- Registrar override flag.

## Attendance, grades, transcripts

- Faculty section attendance submission.
- Attendance records and statuses.
- Grade submission.
- Grade approval.
- GPA calculation.
- Transcript issue with verification numbering.

## Finance

- Invoices.
- Payments.
- Receipts.
- Outstanding balance reporting.
- Financial holds.
- Payment gateway-ready service boundary.

## Requests and workflow

- Student request submission.
- Approval/rejection/completion statuses.
- Approval history.
- Extension point for multi-step workflow instances.

## CMS and public website

- CMS pages with English and Arabic content.
- Public program display.
- Admin CMS update flow.
- Bilingual language switch and RTL layout.

## Notifications, chat, reports

- In-app/email-ready notification queue records.
- Live chat conversation records.
- Dashboard reports and JSON export.
- Audit trail export readiness.

## Enterprise extension modules

The schema and docs reserve module coverage for library, HR/staff, accreditation, LMS integration, campus visit/AR, imports, exports, backup, maintenance, and analytics. In Laravel, split these out of `enterprise_records` into strict module tables as workflows mature.
