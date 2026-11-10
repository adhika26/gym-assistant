# Deploy the API to Back4App Containers

Back4App Containers is the free fallback when Render asks for a credit card. It builds the existing `backend/Dockerfile`, so the Laravel code and the Neon database stay the same.

The free plan provides 0.25 CPU, 256 MB RAM, and 100 GB of transfer. It sleeps after inactivity, so the first request can take up to a minute. This is a demo host, not a production platform.

## Requirements

- A GitHub account with the `gym-assistant` repository.
- A Neon PostgreSQL database.
- A Gemini API key.
- An `APP_KEY` generated locally:

```bash
cd backend
php artisan key:generate --show
```

## 1. Create the account

1. Open https://www.back4app.com and sign up with GitHub.
2. Choose the free plan. No card is required.
3. Open **Containers** from the dashboard.

## 2. Connect the repository

1. Click **Connect with GitHub**.
2. Install the Back4App GitHub app for the `gym-assistant` repository.
3. Select the repository from the list.

## 3. Configure the app

| Field | Value |
| --- | --- |
| App name | `angkat-api` |
| Branch | `main` |
| Root | `backend` |
| Auto deployment | On |

The root directory must contain the Dockerfile. In this repository that is `backend/Dockerfile`.

Do not set a `PORT` variable. The container listens on port 80, which is what Back4App expects.

## 4. Add environment variables

Add these before clicking **Create App**.

```ini
APP_NAME=ANGKAT
APP_ENV=production
APP_KEY=PASTE_THE_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://angkat-api.back4app.app
APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id
APP_FALLBACK_LOCALE=en
LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_HOST=YOUR_NEON_HOST
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=YOUR_NEON_PASSWORD
DB_SSLMODE=require

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync

CORS_ALLOWED_ORIGINS=*

AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=models/gemini-3.1-flash-lite
AI_DAILY_MESSAGE_LIMIT=30
```

If the final app URL is different from `https://angkat-api.back4app.app`, update `APP_URL` after the first deploy and restart the app.

## 5. Deploy

1. Click **Create App**.
2. Wait for the deployment status to move from **Building** to **Ready**.
3. Open the app URL from the dashboard.

The container runs migrations and the idempotent seeders on every start. The first start also creates the sessions and cache tables.

## 6. Verify the API

Open these URLs:

```text
https://YOUR_APP_URL/up
https://YOUR_APP_URL/api/v1/ping
https://YOUR_APP_URL/admin/login
```

Expected results:

- `/up` returns 200.
- `/api/v1/ping` returns `{"status":"ok","service":"gym-assistant"}`.
- `/admin/login` returns the Filament login page.

If the app was asleep, the first request may take 30 to 60 seconds.

## 7. Deploy the frontend

1. Import the same repository into Vercel.
2. Set the root directory to `frontend`.
3. Set `VITE_API_BASE_URL` to `https://YOUR_APP_URL/api/v1`.
4. Deploy.

Then return to Back4App and change:

```ini
CORS_ALLOWED_ORIGINS=https://YOUR_VERCEL_URL
```

Restart the app after changing the variable. Do not add a trailing slash.

## 8. Create the admin account

1. Register through the deployed frontend.
2. Complete onboarding.
3. Open the Neon SQL editor and run:

```sql
UPDATE users
SET is_admin = true
WHERE email = 'your-email@example.com';
```

4. Log in at `https://YOUR_APP_URL/admin`.

## Limits to keep in mind

- 256 MB RAM. The image limits Apache to six workers and PHP to 160 MB per request.
- 0.25 shared CPU. Expect slower responses than local development.
- The container filesystem is ephemeral. Sessions and cache use the database, and logs go to stderr.
- There is no SSH or shell on the free plan.
- The free plan runs in the USA. A Neon database in Singapore adds latency. Creating the Neon project in a US region reduces it.
- The app sleeps after inactivity.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Build fails during Composer install | The first 10 lines of the build log |
| Container starts but the URL times out | The app must listen on port 80; do not set `PORT` |
| 500 on every API request | `APP_KEY`, `DB_*`, and `APP_DEBUG=false` |
| CORS error in the browser | `CORS_ALLOWED_ORIGINS` must match the Vercel URL without a slash |
| Admin page 500 | Logs in the Back4App running logs, usually sessions or database |
| AI returns 404 | `GEMINI_MODEL` must be `models/gemini-3.1-flash-lite` |
| AI returns 429 | Daily quota or rate limit |
| App is slow after idle | Free containers sleep; wait for the cold start |

Never paste the Neon password or the Gemini key into an issue or chat.
