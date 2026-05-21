# Testing

## Automated tests

Run:

```bash
npm test
```

Current tests cover:

- Applicant creation.
- Admission approval, offer, and applicant-to-student conversion.
- Student ID generation.
- Initial invoice generation.
- Registration success.
- Duplicate registration rejection.
- Hold-blocked registration.
- Hold release.
- Grade submission, approval, and GPA recalculation.
- Payment recording and receipt generation.
- Student request workflow.
- Report export and audit logging.

## Manual scenarios

Admissions:

1. Submit public application.
2. Approve application.
3. Issue offer.
4. Accept offer.
5. Convert applicant to student.
6. Confirm student ID, invoice, notification, and audit log.

Registration:

1. Register a converted student into ANAT101-A.
2. Try duplicate registration.
3. Add a financial hold.
4. Confirm registration is blocked.
5. Release hold.
6. Register again.

Grades:

1. Submit grade.
2. Approve grade.
3. Confirm GPA and earned credits update.
4. Issue transcript.

Finance:

1. View generated invoice.
2. Record payment.
3. Confirm receipt and paid invoice status.

Security:

1. Switch users.
2. Confirm menu visibility changes by permission.
3. Attempt protected actions without required permission in service tests when adding negative cases.

## Backend test expansion

When converted to Laravel, add feature and policy tests for:

- Authentication and lockout.
- Password reset.
- Role/permission assignment.
- File upload validation and authorization.
- Convert applicant transaction rollback.
- Registration prerequisite, capacity, conflict, and hold failures.
- Attendance ownership.
- Grade approval visibility.
- Transcript hold blocking.
- Payment reversal/refund.
- CMS publish and preview.
- API pagination, filtering, and exports.
