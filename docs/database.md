# Database Schema — Finora

## Overview

Database: **Supabase PostgreSQL**
All monetary values: `NUMERIC(20,2)` — NEVER floating point
Asset quantities: `NUMERIC(30,10)` for precision (crypto, stocks)
Primary keys: `UUID`
Soft deletes: `deleted_at` on transactions, accounts

## ERD

```
users
  │
  ├──────────────┐
  │              │
  ▼              ▼
household_members ← households
        │              │
        │              ├── accounts ──────── transactions ← categories
        │              │                          │
        │              │                     transfers
        │              │
        │              ├── assets ──────── asset_transactions
        │              │
        │              ├── goals ───────── goal_transactions
        │              │
        │              ├── budgets
        │              │
        │              ├── recurring_transactions
        │              │
        │              ├── notifications
        │              │
        │              └── audit_logs
        │
        └── household_invitations
```

## Tables

### users
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK (synced with Supabase Auth UID) |
| email | VARCHAR | UNIQUE, NOT NULL |
| name | VARCHAR | NOT NULL |
| avatar_url | VARCHAR | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### households
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| currency | VARCHAR(10) | DEFAULT 'IDR' |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Jakarta' |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### household_members
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| user_id | UUID | FK → users |
| role | VARCHAR | 'owner' or 'member' |
| status | VARCHAR | 'active' or 'inactive' |
| joined_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| **UNIQUE** | | (household_id, user_id) |

### household_invitations
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| invited_by | UUID | FK → users |
| invited_email | VARCHAR | NOT NULL |
| token | VARCHAR | UNIQUE, NOT NULL |
| status | VARCHAR | 'pending', 'accepted', 'expired', 'revoked' |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### accounts
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | 'bank', 'ewallet', 'cash', 'credit_card', 'other' |
| institution | VARCHAR | NULL |
| owner_type | VARCHAR | 'personal' or 'shared' |
| owner_user_id | UUID | FK → users, NULL if shared |
| currency | VARCHAR(10) | DEFAULT 'IDR' |
| initial_balance | NUMERIC(20,2) | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL (soft delete) |

### categories
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | 'income' or 'expense' |
| icon | VARCHAR | NULL |
| color | VARCHAR | NULL |
| is_default | BOOLEAN | DEFAULT false |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### transactions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| created_by | UUID | FK → users |
| account_id | UUID | FK → accounts |
| category_id | UUID | FK → categories, NULL for transfers |
| type | VARCHAR | 'income', 'expense', 'transfer' |
| amount | NUMERIC(20,2) | NOT NULL |
| transaction_date | DATE | NOT NULL |
| description | VARCHAR | NULL |
| notes | TEXT | NULL |
| metadata | JSONB | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL (soft delete) |
| deleted_by | UUID | FK → users, NULL |

### transfers
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| transaction_id | UUID | FK → transactions |
| from_account_id | UUID | FK → accounts |
| to_account_id | UUID | FK → accounts |
| amount | NUMERIC(20,2) | NOT NULL |

### assets
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | 'gold', 'stock', 'crypto', 'mutual_fund', 'bond', 'property', 'vehicle', 'business', 'other' |
| institution | VARCHAR | NULL |
| owner_type | VARCHAR | 'personal' or 'shared' |
| owner_user_id | UUID | FK → users, NULL if shared |
| quantity | NUMERIC(30,10) | DEFAULT 0 |
| unit | VARCHAR | NULL ('gram', 'lot', 'unit', etc.) |
| average_cost | NUMERIC(20,2) | DEFAULT 0 |
| current_price | NUMERIC(20,2) | DEFAULT 0 |
| currency | VARCHAR(10) | DEFAULT 'IDR' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### asset_transactions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| asset_id | UUID | FK → assets |
| created_by | UUID | FK → users |
| type | VARCHAR | 'buy', 'sell', 'deposit', 'withdrawal', 'dividend', 'fee', 'adjustment' |
| quantity | NUMERIC(30,10) | |
| unit_price | NUMERIC(20,2) | |
| fee | NUMERIC(20,2) | DEFAULT 0 |
| transaction_date | DATE | NOT NULL |
| notes | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### goals
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| name | VARCHAR | NOT NULL |
| target_amount | NUMERIC(20,2) | NOT NULL |
| current_amount | NUMERIC(20,2) | DEFAULT 0 |
| deadline | DATE | NULL |
| description | TEXT | NULL |
| icon | VARCHAR | NULL |
| status | VARCHAR | 'active', 'completed', 'cancelled' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### goal_transactions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| goal_id | UUID | FK → goals |
| created_by | UUID | FK → users |
| type | VARCHAR | 'contribution' or 'withdrawal' |
| amount | NUMERIC(20,2) | NOT NULL |
| transaction_date | DATE | NOT NULL |
| notes | TEXT | NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### budgets
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| category_id | UUID | FK → categories |
| period_type | VARCHAR | 'monthly', 'weekly', 'yearly' |
| amount | NUMERIC(20,2) | NOT NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NULL |
| alert_threshold | INTEGER | DEFAULT 80 (percentage) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### recurring_transactions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| created_by | UUID | FK → users |
| name | VARCHAR | NOT NULL |
| type | VARCHAR | 'income' or 'expense' |
| account_id | UUID | FK → accounts |
| category_id | UUID | FK → categories |
| amount | NUMERIC(20,2) | NOT NULL |
| frequency | VARCHAR | 'daily', 'weekly', 'monthly', 'yearly' |
| start_date | DATE | NOT NULL |
| end_date | DATE | NULL |
| next_run_at | DATE | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### audit_logs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| user_id | UUID | FK → users |
| action | VARCHAR | NOT NULL |
| entity_type | VARCHAR | NOT NULL |
| entity_id | UUID | NULL |
| metadata | JSONB | NULL |
| ip_address | VARCHAR(45) | NULL |
| user_agent | TEXT | NULL |
| created_at | TIMESTAMP | **NO updated_at — immutable** |

### notifications
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | FK → households |
| user_id | UUID | FK → users |
| type | VARCHAR | NOT NULL |
| title | VARCHAR | NOT NULL |
| message | TEXT | NULL |
| is_read | BOOLEAN | DEFAULT false |
| metadata | JSONB | NULL |
| created_at | TIMESTAMP | |
| read_at | TIMESTAMP | NULL |

## Indexes

Key indexes for query performance:

- `accounts`: household_id, owner_user_id, type, is_active
- `categories`: household_id, type, is_active
- `transactions`: household_id, account_id, category_id, type, transaction_date, created_by
- `assets`: household_id, type, owner_user_id
- `audit_logs`: household_id, user_id, action, created_at
- `notifications`: user_id, is_read, created_at
