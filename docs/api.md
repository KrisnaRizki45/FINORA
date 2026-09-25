# API Reference — Finora

Base URL: `/api/v1`

## Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["Error message"]
  }
}
```

### Paginated
```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

## Authentication

All protected endpoints require:
```
Authorization: Bearer <supabase_jwt_token>
```

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /auth/login | Sync Supabase user to local DB | ✅ |
| POST | /auth/logout | Clear session | ✅ |
| GET | /auth/me | Get current user + household | ✅ |

## Household

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /household | Get household details | ✅ |
| POST | /household | Create household | ✅ |
| PUT | /household | Update household | ✅ Owner |
| GET | /household/members | List members | ✅ |
| POST | /household/invitations | Invite partner | ✅ Owner |
| POST | /household/invitations/{token}/accept | Accept invitation | ✅ |

## Accounts

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /accounts | List accounts | ✅ |
| POST | /accounts | Create account | ✅ |
| GET | /accounts/{id} | Get account detail | ✅ |
| PUT | /accounts/{id} | Update account | ✅ |
| DELETE | /accounts/{id} | Archive account | ✅ |

## Transactions

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /transactions | List (paginated) | ✅ |
| POST | /transactions | Create income/expense | ✅ |
| GET | /transactions/{id} | Get detail | ✅ |
| PUT | /transactions/{id} | Update | ✅ |
| DELETE | /transactions/{id} | Soft delete | ✅ |
| POST | /transactions/transfer | Create transfer | ✅ |

### Transaction Query Parameters
```
?page=1
&per_page=20
&type=expense
&category_id=uuid
&account_id=uuid
&created_by=uuid
&from=2025-01-01
&to=2025-12-31
&search=keyword
&sort=-transaction_date
```

## Categories

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /categories | List categories | ✅ |
| POST | /categories | Create custom category | ✅ |
| GET | /categories/{id} | Get category | ✅ |
| PUT | /categories/{id} | Update category | ✅ |

## Assets

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /assets | List assets | ✅ |
| POST | /assets | Create asset | ✅ |
| GET | /assets/{id} | Get asset detail | ✅ |
| PUT | /assets/{id} | Update asset | ✅ |
| DELETE | /assets/{id} | Deactivate asset | ✅ |
| GET | /assets/{id}/transactions | List asset transactions | ✅ |
| POST | /assets/{id}/transactions | Create asset transaction | ✅ |

## Goals

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /goals | List goals | ✅ |
| POST | /goals | Create goal | ✅ |
| GET | /goals/{id} | Get goal detail | ✅ |
| PUT | /goals/{id} | Update goal | ✅ |
| POST | /goals/{id}/contributions | Add contribution | ✅ |
| POST | /goals/{id}/withdrawals | Record withdrawal | ✅ |

## Budgets

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /budgets | List budgets | ✅ |
| POST | /budgets | Create budget | ✅ |
| PUT | /budgets/{id} | Update budget | ✅ |
| DELETE | /budgets/{id} | Delete budget | ✅ |

## Dashboard

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /dashboard/summary | KPIs (net worth, income, expense, cashflow, saving rate) | ✅ |
| GET | /dashboard/cashflow | Monthly cashflow chart data | ✅ |
| GET | /dashboard/net-worth | Net worth history | ✅ |
| GET | /dashboard/assets | Asset allocation | ✅ |
| GET | /dashboard/categories | Category spending breakdown | ✅ |

## Reports

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /reports/monthly | Monthly summary report | ✅ |
| GET | /reports/cashflow | Cashflow trend report | ✅ |
| GET | /reports/net-worth | Net worth history report | ✅ |
| GET | /reports/spending | Spending analysis by category | ✅ |

### Report Query Parameters
```
?period=7d|30d|90d|6m|1y|custom
&from=2025-01-01
&to=2025-12-31
```

## AI (Phase 2/3)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /ai/chat | Chat with AI assistant | ✅ |
| POST | /ai/financial-summary | Generate financial summary | ✅ |
| POST | /ai/analyze-spending | Analyze spending patterns | ✅ |

## Health

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /health | System health check | ❌ |
