# BRD — Money Management Couple

**Document Type:** Business Requirements Document (BRD)  
**Product Name:** Money Management Couple / Finora (working title)  
**Version:** 1.0  
**Status:** Draft / Development Ready  
**Date:** 2026-09-19  
**Platform:** Responsive Web Application, Mobile-First / PWA-ready  
**Primary Users:** Couples / two-person households  
**Language:** Indonesian  
**Currency:** IDR (Rp), extensible to other currencies

---

## 1. Executive Summary

Money Management Couple adalah aplikasi manajemen keuangan bersama yang dirancang sebagai **mobile-first responsive web application**. Aplikasi memungkinkan dua orang dalam satu household/couple untuk mencatat, memonitor, dan menganalisis kondisi keuangan secara terintegrasi.

Aplikasi tidak hanya berfungsi sebagai pencatatan pemasukan dan pengeluaran, tetapi juga sebagai **personal financial dashboard** yang menggabungkan:

- Pemasukan
- Pengeluaran
- Transfer antar rekening
- Rekening bank
- E-wallet
- Cash
- Emas
- Saham
- Crypto
- Reksa dana
- Obligasi
- Aset lainnya
- Tabungan dan target finansial
- Budget
- Recurring transactions
- Net worth
- Cashflow
- Asset allocation
- Financial reports
- AI financial assistant

Konsep utama aplikasi:

> **"One financial view for two people."**

Setiap household memiliki dua atau lebih anggota yang dapat mengakses data sesuai permission. Untuk MVP, household dibatasi pada dua anggota utama, tetapi desain database harus memungkinkan ekspansi di masa depan.

---

# 2. Business Objective

## 2.1 Tujuan Utama

Membangun platform yang memungkinkan pasangan melihat kondisi keuangan bersama secara cepat, akurat, aman, dan terstruktur.

## 2.2 Business Goals

1. Mengurangi pencatatan keuangan manual.
2. Memberikan satu sumber data keuangan bersama.
3. Memisahkan liquid accounts dan investment/assets.
4. Menyediakan gambaran Net Worth secara berkala.
5. Membantu pengguna memahami cashflow bulanan.
6. Membantu pasangan mencapai financial goals.
7. Menyediakan historical financial data.
8. Menyediakan insight berbasis data.
9. Menyiapkan fondasi untuk AI financial assistant.
10. Memiliki arsitektur production-ready dan scalable.

---

# 3. Product Vision

Aplikasi harus memberikan pengalaman seperti aplikasi mobile finansial modern walaupun secara teknis berbentuk responsive web application.

### Prinsip UX

- Mobile-first
- Simple
- Fast
- Clear
- Minimal cognitive load
- Financial information hierarchy
- Safe by default
- Responsive
- Accessible
- Consistent

Pengguna harus dapat:

> Login → melihat kondisi keuangan → mencatat transaksi → mengetahui dampaknya terhadap saldo dan net worth → melihat progress goal.

Idealnya proses pencatatan transaksi dapat dilakukan dalam waktu kurang dari 10–15 detik setelah user terbiasa menggunakan aplikasi.

---

# 4. Target Users

## 4.1 Primary User

Pasangan yang ingin mengelola keuangan secara bersama.

Contoh:

- Pasangan menikah
- Pasangan yang sedang mempersiapkan pernikahan
- Pasangan yang tinggal bersama
- Dua orang yang mengelola household secara bersama

## 4.2 Secondary User

Pada tahap selanjutnya:

- Individual user
- Small household
- Family
- Financial planner

---

# 5. User Roles

## 5.1 Household Owner

Hak:

- Membuat household
- Mengundang partner
- Mengatur household
- Mengelola anggota
- Mengelola seluruh data household
- Mengatur permission
- Menghapus household

## 5.2 Household Member

Hak default:

- Melihat data household
- Membuat transaksi
- Mengelola transaksi miliknya
- Melihat accounts yang diberikan akses
- Melihat dashboard
- Melihat assets
- Mengelola goal sesuai permission

## 5.3 Future Admin

Role opsional untuk pengembangan:

- Support
- Finance admin
- System administrator

Role admin tidak boleh otomatis memiliki akses ke data financial user tanpa authorization dan audit trail.

---

# 6. Core Concepts

## 6.1 Household

Container utama seluruh data finansial bersama.

```text
Household
├── Members
├── Accounts
├── Transactions
├── Assets
├── Goals
├── Budgets
└── Reports
```

## 6.2 Account

Tempat penyimpanan uang/liquid balance.

Contoh:

- BCA
- Mandiri
- BRI
- Jago
- GoPay
- DANA
- Cash

## 6.3 Asset

Aset yang memiliki value tetapi bukan rekening transaksi biasa.

Contoh:

- Gold
- Stock
- Crypto
- Mutual Fund
- Bond
- Property
- Vehicle
- Other Asset

## 6.4 Transaction

Perubahan finansial yang terjadi.

Jenis:

- Income
- Expense
- Transfer
- Investment Purchase
- Investment Sale
- Adjustment

## 6.5 Financial Goal

Target finansial yang ingin dicapai.

Contoh:

- Emergency Fund
- Wedding
- House
- Car
- Vacation
- Education
- Investment Target

---

# 7. Functional Scope

## Phase 1 — Authentication & Household

### FR-AUTH-001 Registration

User dapat membuat akun menggunakan email dan password.

Acceptance criteria:

- Email wajib valid.
- Password memenuhi minimum security requirement.
- Email tidak boleh duplicate.
- Password tidak disimpan dalam plaintext.

### FR-AUTH-002 Login

User dapat login menggunakan credential yang valid.

### FR-AUTH-003 Logout

User dapat logout dari perangkat.

### FR-AUTH-004 Session

Session harus aman dan memiliki expiration/refresh mechanism.

### FR-HOUSE-001 Create Household

User dapat membuat household.

Field:

- Household name
- Currency
- Timezone

Default:

```text
currency = IDR
timezone = Asia/Jakarta
```

### FR-HOUSE-002 Invite Partner

Owner dapat mengundang partner melalui email atau invitation link.

Invitation memiliki:

- token
- expiration
- status
- invited_by
- invited_email

Status:

```text
pending
accepted
expired
revoked
```

### FR-HOUSE-003 Join Household

User menerima invitation dan bergabung ke household.

---

# 8. Account Management

## FR-ACC-001 Create Account

Field:

```text
name
type
institution
owner
initial_balance
currency
color/icon
notes
```

Account types:

```text
bank
ewallet
cash
credit_card
other
```

## FR-ACC-002 Account Ownership

Account dapat:

```text
personal
shared
```

Jika personal:

```text
owner_user_id
```

Jika shared:

```text
owner_type = shared
```

## FR-ACC-003 Account Balance

Balance harus dihitung berdasarkan transaction ledger.

Jangan menjadikan manual balance sebagai source of truth untuk transaksi.

## FR-ACC-004 Archive Account

Account tidak dihapus secara destructive jika sudah memiliki transaksi.

Gunakan:

```text
is_active = false
```

---

# 9. Transaction Management

## FR-TXN-001 Create Income

Field:

```text
account_id
category_id
amount
transaction_date
description
created_by
```

## FR-TXN-002 Create Expense

Field sama dengan income.

## FR-TXN-003 Create Transfer

Transfer membutuhkan:

```text
from_account_id
to_account_id
amount
transaction_date
description
```

Transfer tidak boleh dihitung sebagai income atau expense.

## FR-TXN-004 Edit Transaction

User yang memiliki permission dapat mengedit transaksi.

## FR-TXN-005 Delete Transaction

Soft delete disarankan.

```text
deleted_at
deleted_by
```

## FR-TXN-006 Transaction Detail

Detail transaksi harus menampilkan:

- Type
- Amount
- Account
- Category
- Date
- Created by
- Description
- Created at
- Updated at

## FR-TXN-007 Attachment

Future feature:

- Receipt
- Invoice
- Screenshot

Storage menggunakan Supabase Storage.

---

# 10. Categories

Default categories:

## Income

```text
Salary
Freelance
Business
Bonus
Gift
Investment Return
Other Income
```

## Expense

```text
Food
Transport
Shopping
Bills
Utilities
Entertainment
Health
Education
Travel
Family
Subscription
Housing
Insurance
Tax
Other Expense
```

User dapat membuat custom category.

Category harus memiliki:

```text
id
household_id
name
type
icon
color
is_default
is_active
```

---

# 11. Asset Management

## FR-ASSET-001 Create Asset

Asset fields:

```text
name
type
institution
quantity
unit
average_cost
current_price
currency
owner_type
owner_user_id
notes
```

Asset types:

```text
gold
stock
crypto
mutual_fund
bond
property
vehicle
business
other
```

## FR-ASSET-002 Gold

Contoh:

```text
quantity = 12
unit = gram
average_cost = 1950000
current_price = 2150000
```

System menghitung:

```text
current_value = quantity × current_price
```

## FR-ASSET-003 Investment Transaction

Support:

```text
buy
sell
deposit
withdrawal
dividend
fee
adjustment
```

## FR-ASSET-004 Unrealized P/L

Untuk asset yang mendukung market price:

```text
unrealized_profit =
current_value - invested_value
```

## FR-ASSET-005 Asset Allocation

Dashboard harus dapat menghitung percentage allocation:

```text
asset_value / total_net_worth × 100
```

---

# 12. Savings & Goals

## FR-GOAL-001 Create Goal

Field:

```text
name
target_amount
current_amount
deadline
icon
description
```

## FR-GOAL-002 Goal Progress

Formula:

```text
progress =
current_amount / target_amount × 100
```

Progress maksimal ditampilkan 100% walaupun terdapat overfunding.

## FR-GOAL-003 Goal Contribution

User dapat memasukkan contribution.

## FR-GOAL-004 Goal Withdrawal

User dapat mencatat penggunaan dana goal.

---

# 13. Budget

## FR-BUDGET-001 Create Budget

Contoh:

```text
Food
Monthly
Rp 1.500.000
```

## FR-BUDGET-002 Budget Calculation

System menghitung:

```text
budget_used
budget_remaining
budget_percentage
```

## FR-BUDGET-003 Budget Alert

Threshold:

```text
80%
90%
100%
```

Threshold harus configurable.

---

# 14. Recurring Transactions

User dapat membuat transaksi berulang.

Contoh:

```text
Salary
Every month
25th

Internet
Every month
10th

Rent
Every month
1st
```

Field:

```text
name
type
amount
account_id
category_id
frequency
start_date
end_date
next_run_at
is_active
```

Laravel Scheduler menjalankan recurring transaction processor.

---

# 15. Dashboard

Dashboard merupakan halaman utama.

## 15.1 KPI

Minimum:

```text
Total Net Worth
Total Balance
Monthly Income
Monthly Expense
Monthly Cashflow
Saving Rate
```

## 15.2 Net Worth

Formula:

```text
Net Worth =
Total Accounts
+ Total Assets
- Total Liabilities
```

Jika liability belum tersedia pada MVP:

```text
Net Worth =
Total Accounts + Total Assets
```

## 15.3 Cashflow

```text
Cashflow =
Income - Expense
```

Transfer tidak dihitung.

## 15.4 Saving Rate

```text
Saving Rate =
(Income - Expense) / Income × 100
```

Jika income = 0, tampilkan N/A.

## 15.5 Asset Allocation

Chart:

- Bank
- Cash
- Gold
- Stock
- Crypto
- Mutual Fund
- Other

## 15.6 Recent Transactions

Menampilkan 5–10 transaksi terbaru.

---

# 16. Reports

## Monthly Report

Menampilkan:

- Income
- Expense
- Cashflow
- Saving rate
- Category breakdown
- Account balance
- Net worth
- Asset allocation
- Goal progress

## Category Analysis

User dapat melihat:

```text
Food
Transport
Shopping
Bills
etc.
```

dalam periode:

```text
7 days
30 days
90 days
6 months
1 year
custom
```

## Net Worth History

Chart:

```text
Jan
Feb
Mar
Apr
May
Jun
...
```

---

# 17. Couple / Shared Finance

Aplikasi harus membedakan:

```text
My Money
Partner Money
Shared Money
```

Contoh:

```text
Krisna
├── BCA Krisna
└── Gold Krisna

Partner
├── BCA Partner
└── Investment Partner

Shared
├── Joint Account
└── Household Cash
```

Dashboard dapat menyediakan filter:

```text
All
Me
Partner
Shared
```

---

# 18. Audit Trail

Setiap perubahan penting harus dapat dilacak.

Audit event:

```text
LOGIN
CREATE_TRANSACTION
UPDATE_TRANSACTION
DELETE_TRANSACTION
CREATE_ACCOUNT
UPDATE_ACCOUNT
CREATE_ASSET
UPDATE_ASSET
CREATE_GOAL
UPDATE_GOAL
INVITE_MEMBER
ACCEPT_INVITATION
```

Audit log:

```text
id
household_id
user_id
action
entity_type
entity_id
metadata
ip_address
user_agent
created_at
```

Data audit tidak boleh mudah diubah oleh ordinary user.

---

# 19. Notification

Notification types:

```text
Budget approaching limit
Budget exceeded
Goal deadline approaching
Recurring transaction generated
Partner invitation
Monthly report ready
```

Channel MVP:

- In-app

Future:

- Email
- Telegram
- WhatsApp
- Push notification

---

# 20. AI Financial Assistant

AI merupakan Phase 2/3 feature.

## AI-001 Financial Summary

User:

> "Bagaimana kondisi keuangan saya bulan ini?"

System mengambil structured financial summary dan memberikan insight.

## AI-002 Spending Analysis

User:

> "Kenapa pengeluaran saya naik?"

AI membandingkan periode.

## AI-003 Natural Language Query

Contoh:

> "Berapa pengeluaran makan bulan ini?"

> "Berapa total investasi saya?"

> "Berapa total emas yang saya punya?"

AI harus menggunakan tool/query terkontrol, bukan membuat angka dari hallucination.

## AI-004 Monthly Financial Summary

AI menghasilkan:

- Summary
- Largest expense
- Cashflow
- Saving rate
- Asset movement
- Goal progress
- Data-based observations

AI tidak boleh memberikan financial advice yang diposisikan sebagai professional investment advice.

---

# 21. UX Requirements

## Mobile Navigation

Bottom navigation:

```text
Home
Transactions
Add
Assets
More
```

Quick Add button harus prominent.

## Desktop Navigation

Sidebar:

```text
Dashboard
Transactions
Accounts
Assets
Goals
Budgets
Reports
Settings
```

## Quick Add

Floating/central action:

```text
+ Add Transaction
```

Pilihan:

```text
Income
Expense
Transfer
Investment
```

---

# 22. Responsive Requirements

Breakpoints:

```text
Mobile: < 640px
Tablet: 640–1024px
Desktop: > 1024px
```

Mobile-first CSS.

Tidak boleh ada horizontal scrolling pada normal viewport.

Touch target minimal sekitar 44px.

---

# 23. PWA Requirements

Future-ready:

```text
manifest.json
service worker
installable
offline shell
mobile viewport
app icons
splash screen
```

Offline transaction queue dapat menjadi future enhancement.

---

# 24. Technical Architecture

```text
                    Client
                      │
                      ▼
               Next.js Web App
                      │
                 HTTPS / REST
                      │
                      ▼
                Laravel API
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    PostgreSQL     Storage      Queue
         │
         ▼
      Supabase
```

---

# 25. Technology Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Recharts
Lucide
```

## Backend

```text
Laravel
PHP
Laravel Sanctum
Laravel Queue
Laravel Scheduler
Laravel Validation
Laravel API Resources
```

## Database

```text
Supabase PostgreSQL
```

## Storage

```text
Supabase Storage
```

## Authentication

Preferred architecture:

```text
Supabase Auth
+
Laravel authorization
```

Alternative:

```text
Laravel Sanctum
```

One authentication strategy should be selected for implementation and not mixed without a clear reason.

## Infrastructure

```text
Docker
Docker Compose
Nginx
GitHub Actions
```

---

# 26. Database ERD

Logical model:

```text
users
  │
  ├──────────────┐
  │              │
  ▼              ▼
household_members
        │
        ▼
    households
        │
        ├── accounts
        │      │
        │      └── transactions
        │
        ├── categories
        │      │
        │      └── transactions
        │
        ├── assets
        │      │
        │      └── asset_transactions
        │
        ├── goals
        │      │
        │      └── goal_transactions
        │
        ├── budgets
        │
        ├── recurring_transactions
        │
        └── audit_logs
```

---

# 27. Suggested Database Tables

## users

```text
id
email
name
avatar_url
created_at
updated_at
```

## households

```text
id
name
currency
timezone
created_by
created_at
updated_at
```

## household_members

```text
id
household_id
user_id
role
status
joined_at
created_at
updated_at
```

Unique:

```text
household_id + user_id
```

## accounts

```text
id
household_id
name
type
institution
owner_type
owner_user_id
currency
initial_balance
is_active
created_at
updated_at
deleted_at
```

## categories

```text
id
household_id
name
type
icon
color
is_default
is_active
created_at
updated_at
```

## transactions

```text
id
household_id
created_by
account_id
category_id
type
amount
transaction_date
description
notes
metadata
created_at
updated_at
deleted_at
```

## transfers

```text
id
transaction_id
from_account_id
to_account_id
amount
```

## assets

```text
id
household_id
name
type
institution
owner_type
owner_user_id
quantity
unit
average_cost
current_price
currency
is_active
created_at
updated_at
```

## asset_transactions

```text
id
asset_id
created_by
type
quantity
unit_price
fee
transaction_date
notes
created_at
updated_at
```

## goals

```text
id
household_id
name
target_amount
current_amount
deadline
description
status
created_at
updated_at
```

## goal_transactions

```text
id
goal_id
created_by
type
amount
transaction_date
notes
created_at
updated_at
```

## budgets

```text
id
household_id
category_id
period_type
amount
start_date
end_date
alert_threshold
created_at
updated_at
```

## recurring_transactions

```text
id
household_id
created_by
name
type
account_id
category_id
amount
frequency
start_date
end_date
next_run_at
is_active
created_at
updated_at
```

## audit_logs

```text
id
household_id
user_id
action
entity_type
entity_id
metadata
ip_address
user_agent
created_at
```

---

# 28. API Design

Base URL:

```text
/api/v1
```

Authentication:

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
```

Household:

```text
GET    /household
POST   /household
PUT    /household
GET    /household/members
POST   /household/invitations
POST   /household/invitations/{token}/accept
```

Accounts:

```text
GET    /accounts
POST   /accounts
GET    /accounts/{id}
PUT    /accounts/{id}
DELETE /accounts/{id}
```

Transactions:

```text
GET    /transactions
POST   /transactions
GET    /transactions/{id}
PUT    /transactions/{id}
DELETE /transactions/{id}
POST   /transactions/transfer
```

Assets:

```text
GET    /assets
POST   /assets
GET    /assets/{id}
PUT    /assets/{id}
DELETE /assets/{id}
GET    /assets/{id}/transactions
POST   /assets/{id}/transactions
```

Goals:

```text
GET    /goals
POST   /goals
GET    /goals/{id}
PUT    /goals/{id}
POST   /goals/{id}/contributions
POST   /goals/{id}/withdrawals
```

Budgets:

```text
GET    /budgets
POST   /budgets
PUT    /budgets/{id}
DELETE /budgets/{id}
```

Dashboard:

```text
GET /dashboard/summary
GET /dashboard/cashflow
GET /dashboard/net-worth
GET /dashboard/assets
GET /dashboard/categories
```

Reports:

```text
GET /reports/monthly
GET /reports/cashflow
GET /reports/net-worth
GET /reports/spending
```

AI:

```text
POST /ai/chat
POST /ai/financial-summary
POST /ai/analyze-spending
```

---

# 29. API Rules

Every protected endpoint must:

1. Validate authentication.
2. Resolve current user.
3. Resolve active household.
4. Validate household membership.
5. Validate resource ownership/access.
6. Validate payload.
7. Execute business logic.
8. Write audit log where required.
9. Return standardized response.

Standard response:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {}
}
```

---

# 30. Financial Integrity Rules

## Rule 1

Money values must use exact decimal/numeric database types.

Avoid floating point for monetary values.

Recommended:

```text
NUMERIC(20,2)
```

For asset quantity requiring precision:

```text
NUMERIC(30,10)
```

## Rule 2

Transfer must not affect income/expense.

## Rule 3

Deleting a historical transaction should preferably use soft delete.

## Rule 4

Every transaction belongs to exactly one household.

## Rule 5

Every account belongs to exactly one household.

## Rule 6

Every asset belongs to exactly one household.

## Rule 7

Cross-household access is forbidden.

## Rule 8

Financial calculations must be deterministic and testable.

---

# 31. Security Requirements

- HTTPS in production.
- Passwords never stored in plaintext.
- Secure session/cookie handling.
- Server-side authorization.
- Supabase RLS.
- API rate limiting.
- Input validation.
- SQL injection protection through ORM/query builder.
- XSS protection.
- CSRF protection where applicable.
- Secure file upload validation.
- Audit logging.
- Secret management through environment variables.
- No secrets committed to Git.
- Production database backups.
- Least privilege access.

---

# 32. Environment Variables

Example:

```env
APP_ENV=local
APP_URL=http://localhost

NEXT_PUBLIC_API_URL=http://localhost/api

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

OPENAI_API_KEY=

SESSION_SECRET=
```

Secrets must not be exposed through `NEXT_PUBLIC_*`.

---

# 33. Docker Architecture

Suggested services:

```yaml
services:
  frontend:
    Next.js

  backend:
    Laravel

  nginx:
    reverse proxy

  worker:
    Laravel queue worker

  scheduler:
    Laravel scheduler
```

Supabase can remain managed externally.

Development commands should support:

```text
docker compose up -d
docker compose down
docker compose logs
docker compose exec backend php artisan migrate
docker compose exec backend php artisan test
```

---

# 34. Testing Requirements

## Unit Testing

Test:

- Cashflow calculation
- Saving rate
- Net worth
- Asset allocation
- Budget percentage
- Goal progress
- Transaction calculations

## Feature/API Testing

Test:

- Authentication
- Household isolation
- CRUD
- Transfer
- Authorization
- Invitation
- Soft delete

## E2E Testing

Minimum flows:

```text
Register
Login
Create household
Invite partner
Create account
Create income
Create expense
Create transfer
Create asset
Create goal
View dashboard
View report
```

---

# 35. Observability

Production should support:

- Application logs
- API request logs
- Error tracking
- Queue monitoring
- Database monitoring
- Health check endpoint

Health endpoint:

```text
GET /health
```

Response:

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "..."
}
```

---

# 36. CI/CD

GitHub Actions pipeline:

```text
Push
 ↓
Lint
 ↓
Type Check
 ↓
Unit Test
 ↓
API Test
 ↓
Build
 ↓
Docker Build
 ↓
Security Check
 ↓
Deploy
```

Branches:

```text
main
develop
feature/*
fix/*
hotfix/*
```

---

# 37. Non-Functional Requirements

## Performance

Target:

- Initial page load optimized for mobile.
- API p95 target < 500 ms for ordinary CRUD operations under normal load.
- Dashboard query should avoid N+1 queries.
- Pagination required for transaction history.

## Scalability

Architecture must support:

```text
1 household
→ 10.000 households
→ 100.000+ households
```

without redesigning the domain model.

## Availability

Production target can start at:

```text
99.5%
```

and increase later.

## Accessibility

Minimum:

- Keyboard navigation
- Accessible labels
- Proper contrast
- Semantic HTML
- Focus states

---

# 38. Pagination / Filtering / Sorting

Transaction endpoint must support:

```text
?page=1
&per_page=20
&type=expense
&category_id=
&account_id=
&created_by=
&from=
&to=
&search=
&sort=-transaction_date
```

Default:

```text
per_page = 20
max_per_page = 100
```

---

# 39. Data Export

Future/MVP+:

```text
CSV
Excel
PDF
```

Export filters:

```text
date range
account
category
transaction type
member
```

---

# 40. Data Import

Future:

- CSV import
- Bank statement import
- Manual bulk upload

Import must have validation preview before committing.

---

# 41. Future Integration

Potential integrations:

```text
Bank API
E-wallet API
Gold price API
Stock market API
Crypto price API
Telegram Bot
WhatsApp
Email
Push Notification
Google OAuth
Apple OAuth
```

External market data must be treated as external source data and timestamped.

---

# 42. AI Architecture

Do not allow the LLM to directly execute arbitrary SQL.

Preferred:

```text
User
 ↓
AI API
 ↓
Intent detection
 ↓
Allowed financial tools
 ↓
Backend service
 ↓
Structured result
 ↓
LLM explanation
 ↓
User
```

Example tools:

```text
get_monthly_summary()
get_expense_by_category()
get_net_worth()
get_asset_summary()
get_goal_progress()
get_recent_transactions()
```

AI response must be grounded in returned structured data.

---

# 43. UX Screens

Required screens:

```text
01 Splash / Loading
02 Login
03 Register
04 Forgot Password
05 Create Household
06 Invite Partner
07 Dashboard
08 Transactions
09 Transaction Detail
10 Add Transaction
11 Accounts
12 Account Detail
13 Assets
14 Asset Detail
15 Add Asset
16 Goals
17 Goal Detail
18 Budgets
19 Reports
20 Notifications
21 Profile
22 Household Settings
23 Security Settings
24 AI Assistant
```

---

# 44. Dashboard Mobile Layout

Order:

```text
Header
↓
Net Worth
↓
Income / Expense
↓
Cashflow
↓
Quick Actions
↓
Asset Allocation
↓
Goal Progress
↓
Recent Transactions
↓
Bottom Navigation
```

---

# 45. Design System

Recommended style:

- Modern fintech
- Clean
- Minimal
- Rounded cards
- Subtle shadows
- Strong typography hierarchy
- Neutral base colors
- Semantic colors only where needed

Semantic colors:

```text
Income = positive
Expense = negative
Warning = budget threshold
Danger = critical
Neutral = information
```

Do not rely on color alone to communicate financial meaning.

---

# 46. Empty States

Examples:

No transaction:

> Belum ada transaksi. Mulai catat pemasukan atau pengeluaran pertama Anda.

No account:

> Tambahkan rekening untuk mulai melihat total saldo.

No asset:

> Belum ada aset investasi. Tambahkan emas, saham, crypto, atau aset lainnya.

No partner:

> Undang pasangan Anda untuk mulai mengelola keuangan bersama.

---

# 47. Error Handling

User-facing error harus human-readable.

Bad:

```text
SQLSTATE[23505]
```

Good:

```text
Data gagal disimpan karena data tersebut sudah tersedia.
```

Technical error tetap masuk log.

---

# 48. Acceptance Criteria MVP

MVP dianggap selesai apabila:

- User dapat register/login.
- User dapat membuat household.
- User dapat mengundang partner.
- Partner dapat join household.
- User dapat membuat account.
- User dapat mencatat income.
- User dapat mencatat expense.
- User dapat melakukan transfer.
- User dapat membuat category.
- User dapat membuat asset.
- User dapat membuat goal.
- Dashboard menghitung total balance.
- Dashboard menghitung income.
- Dashboard menghitung expense.
- Dashboard menghitung cashflow.
- Dashboard menghitung net worth.
- Data household terisolasi.
- Responsive mobile berjalan baik.
- Desktop layout tersedia.
- API memiliki validation.
- Authorization berjalan.
- Automated tests tersedia.
- Docker development environment tersedia.
- Dokumentasi setup tersedia.

---

# 49. MVP Out of Scope

Tidak wajib pada MVP:

- Bank open API
- Automatic bank synchronization
- Stock real-time market price
- Crypto real-time price
- Tax automation
- Advanced AI advisor
- WhatsApp integration
- Complex accounting
- Multi-household management
- Financial planner marketplace

---

# 50. Development Priority

Priority:

```text
P0 = mandatory
P1 = important
P2 = enhancement
P3 = future
```

### P0

```text
Auth
Household
Accounts
Transactions
Categories
Dashboard
Security
Database
API
Responsive UI
Docker
Testing
```

### P1

```text
Assets
Goals
Budgets
Recurring Transactions
Reports
Notifications
Audit Logs
```

### P2

```text
PWA
CSV Export
CSV Import
AI Assistant
Advanced Analytics
```

### P3

```text
Bank Integration
Market Data
WhatsApp
Telegram
Advanced Automation
```

---

# 51. Recommended Development Sequence

```text
Step 01
Project setup

Step 02
Docker

Step 03
Supabase project

Step 04
Database schema

Step 05
Authentication

Step 06
Household

Step 07
Account

Step 08
Transaction

Step 09
Dashboard

Step 10
Asset

Step 11
Goal

Step 12
Budget

Step 13
Recurring transaction

Step 14
Report

Step 15
Audit

Step 16
Testing

Step 17
PWA

Step 18
AI

Step 19
CI/CD

Step 20
Production deployment
```

---

# 52. Definition of Done

Feature dianggap selesai jika:

- Requirement terpenuhi.
- UI responsive.
- API validation tersedia.
- Authorization tersedia.
- Database migration tersedia.
- Error handling tersedia.
- Loading state tersedia.
- Empty state tersedia.
- Unit/feature test tersedia sesuai kebutuhan.
- Tidak ada critical console error.
- Tidak ada hardcoded secret.
- Dokumentasi diperbarui.
- Code mengikuti project convention.
- Tidak menimbulkan regression pada feature existing.

---

# 53. Master AI Coding Prompt

Gunakan prompt berikut untuk mengembangkan aplikasi dengan AI coding agent seperti Codex/Claude Code/Cursor.

```text
You are a senior software architect, full-stack engineer, DevOps engineer, QA engineer, and product engineer.

Build a production-ready financial management application called "Money Management Couple".

The application is a mobile-first responsive web application that behaves visually like a modern mobile finance app while remaining fully responsive on tablet and desktop.

The application is designed for two people in one shared household/couple.

==================================================
PRODUCT OBJECTIVE
==================================================

Build a secure and scalable personal finance management platform where two household members can collaboratively manage:

- Income
- Expenses
- Transfers
- Bank accounts
- E-wallets
- Cash
- Gold
- Stocks
- Crypto
- Mutual funds
- Bonds
- Other assets
- Savings goals
- Budgets
- Recurring transactions
- Net worth
- Cashflow
- Reports
- Financial analytics
- AI financial assistant

The application must be designed as a real software product, not a simple CRUD demo.

==================================================
TECHNOLOGY
==================================================

Frontend:
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Recharts
- Lucide Icons

Backend:
- Laravel
- PHP
- REST API
- Laravel Sanctum OR Supabase Auth, choose one clear authentication architecture
- Laravel Validation
- Laravel API Resources
- Laravel Queue
- Laravel Scheduler

Database:
- Supabase PostgreSQL

Storage:
- Supabase Storage

Infrastructure:
- Docker
- Docker Compose
- Nginx

Testing:
- PHPUnit/Pest
- Playwright
- Frontend unit/component tests where appropriate

CI/CD:
- GitHub Actions

==================================================
ARCHITECTURE
==================================================

Use this architecture:

Next.js
    |
    | REST API
    v
Laravel
    |
    v
Supabase PostgreSQL

Do not let the frontend directly mutate financial data in PostgreSQL.

Laravel is responsible for:
- business logic
- authorization
- validation
- financial calculations
- transaction processing
- audit logging
- API response formatting

Supabase provides:
- PostgreSQL
- authentication if selected
- storage
- optional realtime
- row-level security as defense in depth

==================================================
CORE DOMAIN MODEL
==================================================

The central domain is:

User
  -> Household
      -> Household Members
      -> Accounts
      -> Categories
      -> Transactions
      -> Assets
      -> Asset Transactions
      -> Goals
      -> Goal Transactions
      -> Budgets
      -> Recurring Transactions
      -> Audit Logs

Every financial entity must belong to exactly one household.

Users must never access another household's data.

==================================================
USER MODEL
==================================================

A household initially consists of two members.

Roles:
- owner
- member

Support:
- personal account
- shared account
- personal asset
- shared asset

Dashboard filters:
- All
- Me
- Partner
- Shared

==================================================
FINANCIAL RULES
==================================================

Money must use exact decimal/numeric types.

Never use floating point for financial values.

Recommended:
NUMERIC(20,2)

Asset quantities may use:
NUMERIC(30,10)

Transfer must NOT affect income or expense.

Net Worth:

Total Accounts
+ Total Assets
- Total Liabilities

For MVP, if liabilities are not implemented:

Total Accounts + Total Assets

Cashflow:

Income - Expense

Saving Rate:

(Income - Expense) / Income * 100

Asset allocation:

asset_value / total_net_worth * 100

Goal progress:

current_amount / target_amount * 100

==================================================
REQUIRED FEATURES
==================================================

PHASE 1:

1. Registration
2. Login
3. Logout
4. Session
5. Household creation
6. Partner invitation
7. Partner acceptance
8. Household member management

PHASE 2:

9. Account management
10. Categories
11. Income
12. Expense
13. Transfer
14. Transaction list
15. Transaction detail
16. Transaction edit
17. Transaction soft delete

PHASE 3:

18. Dashboard
19. Net worth
20. Cashflow
21. Saving rate
22. Asset allocation
23. Recent transactions

PHASE 4:

24. Assets
25. Gold
26. Stocks
27. Crypto
28. Mutual funds
29. Bonds
30. Asset transactions
31. Unrealized P/L

PHASE 5:

32. Goals
33. Goal contributions
34. Goal withdrawals
35. Budgets
36. Budget alerts
37. Recurring transactions

PHASE 6:

38. Reports
39. Monthly report
40. Spending analysis
41. Net worth history
42. Export

PHASE 7:

43. Notifications
44. Audit logs
45. PWA
46. AI financial assistant

==================================================
DATABASE REQUIREMENTS
==================================================

Create proper migrations and indexes for:

users
households
household_members
accounts
categories
transactions
transfers
assets
asset_transactions
goals
goal_transactions
budgets
recurring_transactions
audit_logs
notifications

Use foreign keys.

Use indexes on:
- household_id
- user_id
- account_id
- category_id
- transaction_date
- type
- created_at

Use soft deletes where appropriate.

Do not duplicate derived financial values unnecessarily.

==================================================
API
==================================================

Base:

/api/v1

Auth:
POST /auth/login
POST /auth/logout
GET /auth/me

Household:
GET /household
POST /household
PUT /household
GET /household/members
POST /household/invitations
POST /household/invitations/{token}/accept

Accounts:
GET /accounts
POST /accounts
GET /accounts/{id}
PUT /accounts/{id}
DELETE /accounts/{id}

Transactions:
GET /transactions
POST /transactions
GET /transactions/{id}
PUT /transactions/{id}
DELETE /transactions/{id}
POST /transactions/transfer

Assets:
GET /assets
POST /assets
GET /assets/{id}
PUT /assets/{id}
DELETE /assets/{id}
GET /assets/{id}/transactions
POST /assets/{id}/transactions

Goals:
GET /goals
POST /goals
GET /goals/{id}
PUT /goals/{id}
POST /goals/{id}/contributions
POST /goals/{id}/withdrawals

Budgets:
GET /budgets
POST /budgets
PUT /budgets/{id}
DELETE /budgets/{id}

Dashboard:
GET /dashboard/summary
GET /dashboard/cashflow
GET /dashboard/net-worth
GET /dashboard/assets
GET /dashboard/categories

Reports:
GET /reports/monthly
GET /reports/cashflow
GET /reports/net-worth
GET /reports/spending

AI:
POST /ai/chat
POST /ai/financial-summary
POST /ai/analyze-spending

==================================================
API SECURITY
==================================================

For every protected request:

1. Authenticate user.
2. Resolve active household.
3. Verify household membership.
4. Verify resource belongs to the household.
5. Verify user permission.
6. Validate request payload.
7. Execute business logic.
8. Write audit log when necessary.
9. Return standardized response.

Never trust household_id sent by the client.

Determine household from authenticated user/session whenever possible.

==================================================
RESPONSE FORMAT
==================================================

Success:

{
  "success": true,
  "message": "Transaction created successfully",
  "data": {}
}

Error:

{
  "success": false,
  "message": "Unauthorized",
  "errors": {}
}

==================================================
FRONTEND UX
==================================================

Mobile navigation:

Home
Transactions
Add
Assets
More

Desktop sidebar:

Dashboard
Transactions
Accounts
Assets
Goals
Budgets
Reports
Settings

The primary action must be easy to reach.

Mobile Quick Add:
- Income
- Expense
- Transfer
- Investment

Use bottom sheets/modals where appropriate on mobile.

Use dialogs on desktop where appropriate.

==================================================
MOBILE-FIRST DESIGN
==================================================

Design for mobile first.

Breakpoints:
- mobile < 640px
- tablet 640-1024px
- desktop > 1024px

No unnecessary horizontal scrolling.

Touch targets should be at least approximately 44px.

The UI should feel like a modern fintech application.

Use:
- clean cards
- rounded corners
- clear hierarchy
- strong typography
- subtle shadows
- semantic colors
- accessible contrast

Do not overdesign.

==================================================
DASHBOARD
==================================================

Dashboard order:

Header
Net Worth
Income / Expense
Cashflow
Quick Actions
Asset Allocation
Goal Progress
Recent Transactions
Bottom Navigation

Primary KPI:

Total Net Worth
Monthly Income
Monthly Expense
Monthly Cashflow
Saving Rate

Charts:
- cashflow
- category spending
- asset allocation
- net worth history

==================================================
TRANSACTIONS
==================================================

Transaction types:

income
expense
transfer
investment
withdrawal
adjustment

Transaction fields:

id
household_id
created_by
account_id
category_id
type
amount
transaction_date
description
notes
metadata
created_at
updated_at
deleted_at

Transaction list must support:
- pagination
- search
- filter
- date range
- account
- category
- type
- member
- sorting

Default page size:
20

Maximum:
100

==================================================
ASSETS
==================================================

Asset types:

gold
stock
crypto
mutual_fund
bond
property
vehicle
business
other

Fields:

name
type
institution
owner_type
owner_user_id
quantity
unit
average_cost
current_price
currency
is_active

Support asset transactions:
- buy
- sell
- deposit
- withdrawal
- dividend
- fee
- adjustment

For gold, support gram units.

==================================================
GOALS
==================================================

Goals:
- Emergency Fund
- Wedding
- House
- Car
- Vacation
- Education
- Investment
- Custom

Each goal:
- name
- target amount
- current amount
- deadline
- progress
- status

==================================================
BUDGET
==================================================

Budget can be assigned to categories.

Show:
- budget
- used
- remaining
- percentage

Alert thresholds:
80%
90%
100%

==================================================
RECURRING TRANSACTIONS
==================================================

Support:
- daily
- weekly
- monthly
- yearly

Laravel Scheduler must process due recurring transactions.

The job must be idempotent.

Never create duplicate recurring transactions if the scheduler runs twice.

==================================================
AUDIT LOG
==================================================

Audit events include:

LOGIN
CREATE_TRANSACTION
UPDATE_TRANSACTION
DELETE_TRANSACTION
CREATE_ACCOUNT
UPDATE_ACCOUNT
CREATE_ASSET
UPDATE_ASSET
CREATE_GOAL
UPDATE_GOAL
INVITE_MEMBER
ACCEPT_INVITATION

Store:
- user
- household
- action
- entity
- entity id
- metadata
- IP
- user agent
- timestamp

==================================================
AI
==================================================

Do not allow the LLM to execute arbitrary SQL.

Use controlled backend tools:

get_monthly_summary()
get_expense_by_category()
get_net_worth()
get_asset_summary()
get_goal_progress()
get_recent_transactions()

AI must answer only from structured backend data.

Example:

User:
"Kenapa pengeluaran saya bulan ini naik?"

Backend returns structured data.

LLM explains the result.

Never fabricate financial figures.

==================================================
PWA
==================================================

Prepare the frontend to become installable as a PWA.

Include:
- manifest
- icons
- mobile viewport
- service worker strategy
- offline shell where practical

Offline transaction sync can be implemented later.

==================================================
DOCKER
==================================================

Create:

docker-compose.yml

Services:

frontend
backend
nginx
worker
scheduler

Supabase remains managed externally.

Provide:

docker compose up -d
docker compose down
docker compose logs
docker compose exec backend php artisan migrate
docker compose exec backend php artisan test

==================================================
PROJECT STRUCTURE
==================================================

Use:

money-management/
  apps/
    web/
    api/
  packages/
    types/
    validation/
    shared/
  docker/
    nginx/
    frontend/
    backend/
  docs/
  .env.example
  docker-compose.yml
  README.md

If a monorepo creates unnecessary complexity for the selected tooling, use a clean root-level frontend/backend structure instead. Do not force a monorepo solely for aesthetics.

==================================================
TESTING
==================================================

Write tests for:

Authentication
Household isolation
Authorization
Income
Expense
Transfer
Account balance
Cashflow
Net worth
Saving rate
Asset allocation
Goal progress
Budget
Recurring transactions
Soft deletion

E2E:

Register
Login
Create household
Invite partner
Create account
Create income
Create expense
Create transfer
Create asset
Create goal
Open dashboard
Open report

==================================================
QUALITY REQUIREMENTS
==================================================

Do not create fake functionality.

Do not use mock data as the final implementation.

Do not hardcode financial numbers.

Do not put business logic in React components.

Do not expose secrets to frontend.

Do not trust client-provided household_id.

Do not use floating point for money.

Do not directly mutate database from frontend.

Do not create unnecessary abstractions.

Prefer maintainable production code over clever code.

==================================================
DEVELOPMENT PROCESS
==================================================

Before coding:

1. Inspect the repository.
2. Identify existing architecture.
3. Identify existing package manager.
4. Identify existing database configuration.
5. Identify existing authentication.
6. Identify existing environment variables.
7. Do not overwrite existing work without understanding it.

If this is a new project, initialize a clean architecture.

After inspection, produce:

1. Architecture summary.
2. Implementation plan.
3. Database ERD.
4. API plan.
5. UI route map.
6. Then implement.

Do not implement everything in one giant change.

Implement vertical slices.

Recommended order:

Slice 1:
Authentication + Household

Slice 2:
Accounts + Categories

Slice 3:
Transactions

Slice 4:
Dashboard

Slice 5:
Assets

Slice 6:
Goals

Slice 7:
Budgets + Recurring

Slice 8:
Reports

Slice 9:
Audit + Notifications

Slice 10:
PWA + AI

Each slice must be runnable and testable.

==================================================
DOCUMENTATION
==================================================

Maintain:

README.md
docs/architecture.md
docs/database.md
docs/api.md
docs/development.md
docs/deployment.md

README must contain:
- prerequisites
- environment setup
- Docker setup
- Supabase setup
- migration
- seed
- testing
- development
- production build

==================================================
FINAL DELIVERY
==================================================

At the end of implementation, provide:

1. Architecture summary
2. Implemented features
3. Database schema summary
4. API summary
5. Environment variables
6. Docker commands
7. Test commands
8. Known limitations
9. Next recommended implementation
10. Security considerations

Start by inspecting the existing repository and environment.

If the repository is empty, scaffold the project.

Do not ask unnecessary questions if reasonable technical defaults can be chosen.

Make reasonable engineering decisions, document them, and keep the implementation consistent.
```

---

# 54. Prompt — UI/UX Specialist

Gunakan prompt tambahan ini jika ingin AI fokus membuat tampilan:

```text
Act as a senior fintech product designer and frontend engineer.

Design the Money Management Couple application as a mobile-first responsive web application.

The application should feel like a native financial mobile app even though it runs in a browser.

Design principles:

- mobile first
- professional fintech
- clean
- minimal
- fast
- accessible
- high information density without feeling crowded

Mobile navigation:

Home
Transactions
Add
Assets
More

Desktop:

Sidebar navigation.

Main dashboard must show:

1. Net Worth
2. Income
3. Expense
4. Cashflow
5. Saving Rate
6. Asset Allocation
7. Goal Progress
8. Recent Transactions

Use shadcn/ui components.

Use Tailwind CSS.

Use Lucide icons.

Use Recharts for financial charts.

Use responsive cards.

Mobile:
- bottom navigation
- floating/central quick action
- bottom sheets
- compact charts
- large touch targets

Desktop:
- sidebar
- multi-column dashboard
- expanded charts
- tables

Create polished:
- loading states
- skeletons
- empty states
- error states
- confirmation dialogs
- success feedback
- form validation

Do not use excessive gradients.

Do not make the UI look like a generic admin dashboard.

It should feel like a consumer fintech product.

Use Indonesian copy.

Currency:
IDR / Rp

Date format:
DD MMM YYYY

Number formatting:
Indonesian locale.

Examples:

Rp 6.000.000
Rp 1.250.000
12 gram
+Rp 500.000
-Rp 250.000

Use semantic financial indicators but never rely on color alone.

Ensure every screen is responsive from 320px width upward.

Prioritize real usability over decorative visuals.
```

---

# 55. Prompt — QA / Testing Agent

```text
Act as a senior QA engineer for the Money Management Couple application.

Review the application against the BRD.

Focus on:

1. Authentication
2. Authorization
3. Household isolation
4. Account management
5. Transaction correctness
6. Transfer correctness
7. Financial calculations
8. Asset calculations
9. Goal calculations
10. Budget calculations
11. Recurring transactions
12. Responsive UI
13. API validation
14. Security
15. Performance

Critical financial test cases:

- Income increases balance.
- Expense decreases balance.
- Transfer moves balance between accounts but does not change net worth.
- Transfer does not appear as income.
- Transfer does not appear as expense.
- Deleted transaction no longer affects calculations.
- Cross-household data cannot be accessed.
- User cannot modify unauthorized account.
- Net worth calculation is deterministic.
- Saving rate handles zero income.
- Goal progress handles zero target safely.
- Asset P/L calculation is correct.
- Recurring transaction is idempotent.
- Duplicate scheduler execution must not duplicate transactions.

Generate:

- Test cases
- Expected result
- Actual result
- Severity
- Reproduction steps
- API test cases
- E2E test cases

Severity:

Critical
High
Medium
Low

Do not mark a test as passed without evidence from the implementation.
```

---

# 56. Recommended MVP

The first production milestone should intentionally be smaller:

```text
Authentication
       ↓
Household
       ↓
Invite Partner
       ↓
Accounts
       ↓
Categories
       ↓
Income / Expense
       ↓
Transfer
       ↓
Dashboard
       ↓
Net Worth
```

After that:

```text
Assets
↓
Goals
↓
Budget
↓
Recurring
↓
Reports
↓
AI
```

This keeps development manageable while preserving the correct domain architecture.
