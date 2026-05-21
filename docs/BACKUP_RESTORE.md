# Backup and Restore

## Database backup

For MySQL:

```bash
mysqldump --single-transaction --routines --triggers --events \
  --default-character-set=utf8mb4 \
  "$DB_DATABASE" > "backup-$(date +%F-%H%M%S).sql"
```

Store backups encrypted in off-server storage.

## File backup

Back up:

- Private student/applicant documents.
- CMS media.
- AR assets.
- Transcript templates.
- Invoice and receipt templates.
- Generated reports that must be retained.

## Restore

1. Put the application into maintenance mode.
2. Restore the database to a clean database.
3. Restore private file storage.
4. Run migrations if needed.
5. Clear caches.
6. Validate admin login, public website, student profile, finance ledger, and sample document download.
7. Record the restore in `maintenance_logs`.

## Scheduler

Recommended scheduled jobs:

- Daily database backup.
- Daily private file backup.
- Old temporary file cleanup.
- Failed job report.
- Payment reminder dispatch.
- Attendance warning dispatch.
- Daily admin summary.

## Retention

Define retention by policy:

- Daily backups retained for short operational recovery.
- Weekly/monthly backups retained for compliance.
- Audit logs retained according to university policy.
- Sensitive document deletion should use approved secure deletion or soft-delete retention.
