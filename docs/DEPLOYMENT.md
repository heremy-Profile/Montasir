# Deployment

## Static starter deployment

Deploy these files behind HTTPS on any static host:

- `index.html`
- `assets/`
- `src/`
- `api/openapi.json`
- `data/`
- `docs/`
- `montasir.html`
- `Picture1.png`

Set caching conservatively for HTML and longer cache headers for CSS/JS.

## Laravel production deployment checklist

```bash
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:work --tries=3
php artisan schedule:run
```

Required production controls:

- HTTPS only.
- `APP_ENV=production`.
- `APP_DEBUG=false`.
- Strong `APP_KEY`.
- Database backups enabled.
- Queue worker supervised.
- Scheduler cron configured every minute.
- Log rotation enabled.
- Admin account created and password changed.
- Private file storage protected by authorization controller.
- SMTP tested.
- SMS provider tested.
- Payment provider tested before enabling online payments.

## Web server headers

Recommended headers:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'
```

Adjust CSP if third-party analytics, map, chat, or payment providers are approved.
