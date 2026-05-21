# Database

The baseline MySQL schema is in `data/enterprise-schema.sql`.

## Design principles

- InnoDB tables with `utf8mb4_unicode_ci`.
- Big integer primary keys.
- Unique constraints for emails, usernames, numbers, codes, invoices, receipts, and transcript verification codes.
- Indexes for searchable and high-volume fields.
- Foreign keys on core relationships.
- Soft deletion where production records should be retained.
- JSON payload columns only where workflow variability is expected.

## Core modules covered

- Users, roles, permissions, role assignments, permission assignments.
- Login history, audit logs, system settings.
- Academic years, semesters, colleges, departments, programs, courses, prerequisites, campuses, buildings, classrooms, sections, section meetings.
- Applicants, applications, documents, status history, offers.
- Students, holds, registrations.
- Class sessions, attendance records.
- Grade scales, student grades, transcript issues.
- Invoices, payments.
- Student requests and workflow payloads.
- Notifications, CMS pages, media files, live chat.
- Numbering sequences.
- Flexible `enterprise_records` table for remaining modules before they are split into strict Laravel migrations.

## Laravel migration split

Convert the SQL into migration batches in this order:

1. Security and settings.
2. Academic structure.
3. Admissions.
4. Student records.
5. Registration and timetable.
6. Attendance.
7. Exams, grades, GPA, transcripts.
8. Finance.
9. Requests and workflows.
10. Notifications and CMS.
11. Chat, campus visits, AR, library, HR, quality, LMS, backup.
12. Reports/import/export logs.

Critical workflows must use database transactions:

- Applicant to student conversion.
- Registration.
- Payment recording.
- Grade approval.
- Transcript issue.
- Bulk import.
