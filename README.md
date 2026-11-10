# ANGKAT

A training and nutrition log for people cutting, bulking, or maintaining. Built as a portfolio project with a Laravel API, a React SPA, and a context-aware AI coach.

> Live demo: deployment in progress. The URL will be added after the free-tier deployment is complete.

## What it does

- Token-based authentication with Sanctum.
- Onboarding that calculates BMR, TDEE, calorie target, macros, and water target.
- Food database with search, custom foods, and daily meal logs.
- Exercise library, workout sessions, sets, reps, weight, and RPE.
- Body measurements and a weight trend chart.
- AI coach that receives the user's current profile, nutrition, measurements, and recent workouts as context.
- Admin panel with Filament for foods, exercises, and users.
- Daily AI message quota, rate limiting, and token usage logs.

## Stack

| Layer | Technology |
| --- | --- |
| API | Laravel 13, PHP 8.4, Sanctum |
| Database | SQLite for local development, PostgreSQL for production |
| Admin | Filament 5 |
| AI | Laravel AI SDK with Gemini |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Tests | PHPUnit |

## Architecture

```text
gym-assistant/
├─ backend/     Laravel API, Filament admin, AI agents
├─ frontend/    React SPA
└─ .github/     CI workflow
```

The frontend calls `/api/v1`. In development, Vite proxies that path to the Laravel server. In production, `VITE_API_BASE_URL` points to the deployed API.

## Design

The interface uses a "training logbook" direction: warm paper, ink, burnt orange, serif display type, monospace numbers, and ruled lists instead of floating cards.

- Display type: Fraunces
- UI type: Archivo
- Data type: IBM Plex Mono
- Dials: ENERGY 2 / RHYTHM 3 / MOTION 1

The app is light-themed by choice, uses visible focus rings, 44px touch targets, and reduced-motion support.

## Local setup

### Requirements

- PHP 8.4 with `pdo_sqlite`, `mbstring`, `openssl`, `fileinfo`, `curl`, `zip`, `intl`
- Composer 2
- Node.js 24
- A Gemini API key from Google AI Studio

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The seeders create 18 foods and 22 exercises. They do not create user accounts.

Set these values in `backend/.env` to enable the AI coach:

```ini
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key
GEMINI_MODEL=models/gemini-3.1-flash-lite
AI_DAILY_MESSAGE_LIMIT=30
```

Then clear the configuration cache:

```bash
php artisan config:clear
```

On Windows, PHP may need a CA bundle for outbound HTTPS. Set `curl.cainfo` and `openssl.cafile` in `php.ini` to a local `cacert.pem`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL, register an account, and complete onboarding.

### Admin

The admin panel is available at `/admin`.

To grant access:

```bash
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'you@example.com')->first();
$user->is_admin = true;
$user->save();
```

## API

Base path: `/api/v1`. Protected routes use `Authorization: Bearer <token>`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Profile | `GET /profile`, `PUT /profile` |
| Foods | `GET /foods`, `POST /foods` |
| Meal entries | `GET /meal-entries`, `POST /meal-entries`, `PUT /meal-entries/{id}`, `DELETE /meal-entries/{id}` |
| Exercises | `GET /exercises` |
| Workout sessions | `GET /workout-sessions`, `POST /workout-sessions`, `GET /workout-sessions/{id}`, `DELETE /workout-sessions/{id}` |
| Measurements | `GET /measurements`, `POST /measurements`, `DELETE /measurements/{id}` |
| AI | `GET /ai/conversations`, `GET /ai/conversations/{id}/messages`, `POST /ai/chat` |

The AI endpoint is limited to 10 requests per minute and 30 messages per user per day. Authentication endpoints are limited to 5 requests per minute per IP.

## Tests

```bash
cd backend
php artisan test
```

The suite covers authentication, profile calculation, food access, meal logging totals, workout sessions, measurements, and AI chat with a faked agent. It currently runs 61 tests with 209 assertions.

## Deployment

The intended free-tier stack is Render for the API, Neon for PostgreSQL, and Vercel for the frontend.

Render now asks some new accounts for a card. If that happens, use Back4App Containers instead. It builds the same `backend/Dockerfile`, uses the same Neon database, and does not require a card. The full walkthrough is in [`docs/deploy-back4app.md`](docs/deploy-back4app.md).

### Backend on Render

1. Create a Neon PostgreSQL project and copy the connection string.
2. Create a Render Web Service from the repository.
3. Set the root directory to `backend` and the runtime to Docker.
4. Add the environment variables below.
5. Deploy.

| Variable | Value |
| --- | --- |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | output of `php artisan key:generate --show` |
| `APP_URL` | Render service URL |
| `APP_TIMEZONE` | `Asia/Jakarta` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | Neon host |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | Neon database name |
| `DB_USERNAME` | Neon user |
| `DB_PASSWORD` | Neon password |
| `DB_SSLMODE` | `require` |
| `CORS_ALLOWED_ORIGINS` | Vercel production URL |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | `models/gemini-3.1-flash-lite` |
| `AI_DAILY_MESSAGE_LIMIT` | `30` |
| `LOG_CHANNEL` | `stderr` |

The container runs migrations and idempotent seeders on startup. The free Render service sleeps after inactivity, so the first request can take around a minute.

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Set `VITE_API_BASE_URL` to `https://your-render-service.onrender.com/api/v1`.
4. Build with `npm run build`.
5. Update `CORS_ALLOWED_ORIGINS` on Render with the Vercel URL.

`frontend/vercel.json` rewrites all routes to `index.html` so client-side routing works on refresh.

## Security notes

- Tokens are stored in `localStorage` for this MVP. A production version should move to httpOnly cookies or short-lived tokens with refresh.
- AI responses include a medical disclaimer. The coach is not a doctor or clinical dietitian.
- The AI quota and rate limits are intentional cost controls.
- `.env` files are ignored and must never be committed.

## Status

The MVP is feature complete. Deployment and the public demo link are in progress.
