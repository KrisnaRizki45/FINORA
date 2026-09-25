# Architecture — Finora

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (Port 80)                     │
│   /api/* → Laravel    │    /* → Next.js                  │
└───────────┬───────────┴──────────────┬──────────────────┘
            │                          │
            ▼                          ▼
   ┌─────────────────┐      ┌─────────────────┐
   │  Laravel API     │      │  Next.js App     │
   │  (PHP 8.3)       │      │  (Node 20)       │
   │                  │      │                  │
   │  • REST API      │      │  • App Router    │
   │  • Auth Verify   │      │  • TypeScript    │
   │  • Business Logic│      │  • Tailwind CSS  │
   │  • Validation    │      │  • shadcn/ui     │
   │  • Authorization │      │  • TanStack Query│
   │  • Audit Logging │      │  • Recharts      │
   └────────┬─────────┘      └─────────────────┘
            │
            ▼
   ┌─────────────────┐
   │  Supabase        │
   │                  │
   │  • PostgreSQL    │
   │  • Auth          │
   │  • Storage       │
   │  • RLS (defense) │
   └─────────────────┘
```

## Auth Flow

```
Browser → Supabase Auth (login/register) → JWT Token
Browser → Laravel API (with JWT in Authorization header)
Laravel → Verify JWT with Supabase JWT Secret
Laravel → Resolve user → Resolve household → Authorize → Execute
```

## Data Flow Principles

1. **Frontend NEVER writes directly to database**
2. **All mutations go through Laravel API**
3. **Laravel is the single source of truth for business logic**
4. **Supabase RLS is defense-in-depth, not primary authorization**
5. **household_id is NEVER trusted from client — always resolved from session**

## Docker Services

| Service | Purpose | Port |
|---|---|---|
| nginx | Reverse proxy | 80 |
| frontend | Next.js dev server | 3000 (internal) |
| backend | Laravel API | 8000 (internal) |
| worker | Queue processor | — |
| scheduler | Cron jobs | — |

## Domain Model

```
Household (container)
├── Members (max 2 for MVP)
├── Accounts (bank, ewallet, cash, credit_card)
├── Categories (income/expense)
├── Transactions (income, expense, transfer)
├── Assets (gold, stock, crypto, mutual_fund, bond, property, vehicle, business)
├── Goals (savings targets)
├── Budgets (per-category spending limits)
├── Recurring Transactions (scheduled)
└── Audit Logs (immutable trail)
```
