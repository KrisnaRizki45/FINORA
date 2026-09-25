# Finora — Money Management Couple

> **One financial view for two people.**

A production-ready financial management platform for couples. Mobile-first responsive web application built with Next.js, Laravel, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Laravel 12, PHP 8.3 |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | Supabase Auth + Laravel Authorization |
| Infrastructure | Docker, Nginx, GitHub Actions |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v29+)
- [Node.js](https://nodejs.org/) v20+ (for local frontend development)
- [PHP](https://www.php.net/) 8.3+ (for local backend development)
- [Composer](https://getcomposer.org/) v2+
- A [Supabase](https://supabase.com/) project

## Quick Start

### 1. Clone & Configure

```bash
git clone <repository-url>
cd Finora

# Copy environment template
cp .env.example .env

# Fill in your Supabase credentials in .env
```

### 2. Docker Development

```bash
# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend php artisan migrate

# Seed default data (categories, etc.)
docker compose exec backend php artisan db:seed

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### 3. Local Development (Without Docker)

**Backend:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4. Access

| Service | URL |
|---|---|
| App (via Nginx) | http://localhost |
| Frontend (direct) | http://localhost:3000 |
| Backend API | http://localhost/api/v1 |
| Health Check | http://localhost/health |

## Project Structure

```
Finora/
├── frontend/          # Next.js App (TypeScript, Tailwind, shadcn/ui)
├── backend/           # Laravel API (PHP 8.3)
├── docker/            # Docker configurations
│   ├── nginx/         # Reverse proxy config
│   ├── frontend/      # Frontend Dockerfile
│   └── backend/       # Backend Dockerfile
├── docs/              # Documentation
├── docker-compose.yml # 5 services: nginx, frontend, backend, worker, scheduler
├── .env.example       # Environment template
└── README.md
```

## Testing

```bash
# Backend tests
docker compose exec backend php artisan test

# Frontend tests
cd frontend && npm test

# E2E tests (Playwright)
cd frontend && npx playwright test
```

## Docker Services

| Service | Container | Purpose |
|---|---|---|
| `nginx` | finora-nginx | Reverse proxy (port 80) |
| `frontend` | finora-frontend | Next.js dev server |
| `backend` | finora-backend | Laravel API server |
| `worker` | finora-worker | Queue job processor |
| `scheduler` | finora-scheduler | Recurring task scheduler |

## Documentation

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Development Guide](docs/development.md)
- [Deployment](docs/deployment.md)

## License

Private — All rights reserved.
