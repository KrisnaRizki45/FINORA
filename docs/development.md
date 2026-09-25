# Development Guide — Finora

## Prerequisites

- Docker Desktop v29+
- Node.js v20+ (for local frontend development)
- PHP 8.3+ (for local backend development)
- Composer v2+
- A Supabase project with PostgreSQL

## Environment Setup

1. Copy `.env.example` to `.env` at project root
2. Fill in Supabase credentials:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_ANON_KEY` — public anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key (backend only)
   - `SUPABASE_JWT_SECRET` — JWT secret for token verification
   - `DB_HOST` — Supabase DB host
   - `DB_PASSWORD` — Supabase DB password
   - `NEXT_PUBLIC_SUPABASE_URL` — same as SUPABASE_URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same as SUPABASE_ANON_KEY

## Running with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Run migrations
docker compose exec backend php artisan migrate

# Seed database
docker compose exec backend php artisan db:seed

# Run tests
docker compose exec backend php artisan test

# Stop
docker compose down
```

## Running Locally (Without Docker)

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure .env with your database credentials

php artisan migrate
php artisan db:seed
php artisan serve  # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

## Code Conventions

### Backend (Laravel)

- Controllers in `app/Http/Controllers/Api/V1/`
- Business logic in `app/Services/`
- Form validation in `app/Http/Requests/`
- API responses via `app/Http/Resources/`
- Authorization via `app/Policies/`
- Audit logging via `app/Traits/HasAuditLog.php`

### Frontend (Next.js)

- Pages in `src/app/` using App Router
- Components in `src/components/`
- API functions in `src/lib/api/`
- Zod schemas in `src/lib/validations/`
- Types in `src/types/`
- Hooks in `src/hooks/`

### Naming

- Database columns: `snake_case`
- PHP classes: `PascalCase`
- PHP methods: `camelCase`
- TypeScript types: `PascalCase`
- React components: `PascalCase`
- CSS classes: Tailwind utilities
- API routes: `kebab-case`

## Useful Commands

```bash
# Create a new migration
docker compose exec backend php artisan make:migration create_xxx_table

# Create a new controller
docker compose exec backend php artisan make:controller Api/V1/XxxController

# Create a new model
docker compose exec backend php artisan make:model Xxx -m

# Create a new service
# (manual — create in app/Services/)

# Fresh migrate + seed
docker compose exec backend php artisan migrate:fresh --seed
```
