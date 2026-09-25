# Finora — Bug Fix, Data Synchronization & UI/UX Enhancement

## Context

Saya sedang mengembangkan aplikasi **Finora**, yaitu aplikasi money management berbasis household/couple dengan frontend Next.js dan backend Laravel API.

Gunakan **arsitektur, database schema, API contract, routing, authentication flow, dan struktur project yang sudah ada** sebagai source of truth.

### IMPORTANT

Jangan melakukan rewrite besar-besaran.

Jangan membuat architecture baru.

Jangan mengganti stack.

Jangan menghapus fitur yang sudah berjalan.

Jangan mengubah struktur database/API secara breaking change jika tidak benar-benar diperlukan.

Tujuan utama task ini adalah:

1. memperbaiki bug yang sudah ada;
2. memastikan seluruh menu saling terhubung secara data;
3. memperbaiki formatting nominal;
4. memperbaiki AI receipt/transfer image analysis;
5. memperbaiki household active members;
6. memperbaiki responsive UI;
7. memastikan Dashboard menjadi agregator data sebenarnya;
8. meningkatkan UX tanpa menghilangkan design system Finora yang sudah ada.

---

# 1. Architecture — MUST PRESERVE

Existing architecture:

```text
┌─────────────────────────────────────────────────────────┐
│                       Nginx (Port 80)                   │
│   /api/* → Laravel        /* → Next.js                  │
└───────────┬──────────────────────────────┬──────────────┘
            │                              │
            ▼                              ▼
   ┌─────────────────┐            ┌─────────────────┐
   │  Laravel API    │            │  Next.js App    │
   │  PHP 8.3        │            │  Node 20        │
   │                 │            │                 │
   │ REST API        │            │ App Router      │
   │ Auth Verify     │            │ TypeScript       │
   │ Business Logic  │            │ Tailwind CSS     │
   │ Validation      │            │ shadcn/ui        │
   │ Authorization   │            │ TanStack Query   │
   │ Audit Logging   │            │ Recharts         │
   └────────┬────────┘            └─────────────────┘
            │
            ▼
   ┌─────────────────┐
   │ Supabase        │
   │ PostgreSQL      │
   │ Auth            │
   │ Storage         │
   │ RLS             │
   └─────────────────┘
```

Data flow MUST remain:

```text
Browser
  ↓
Supabase Auth
  ↓
JWT
  ↓
Laravel API
  ↓
Resolve user
  ↓
Resolve household
  ↓
Authorize
  ↓
Business logic
  ↓
Supabase PostgreSQL
```

Rules:

* Frontend NEVER writes directly to database.
* All mutations MUST go through Laravel API.
* Laravel remains the single source of truth.
* `household_id` MUST NOT be trusted from frontend.
* Household MUST be resolved from authenticated session.
* Do not bypass existing authentication/authorization.
* Preserve audit logging.
* Preserve soft delete behavior.

---

# 2. PRIMARY BUG — Account Balance Not Synchronized With Transactions

## Current Problem

Nominal/account balance is not synchronized with transaction data.

Example:

```text
Account:
Bank BCA
Current Balance: Rp 5.000.000
```

Then user creates:

```text
Expense:
Rp 500.000
```

Expected:

```text
Account Balance:
Rp 4.500.000
```

But currently the account balance does not properly reflect the transaction.

The same issue occurs with:

* income;
* expense;
* transfer;
* transaction update;
* transaction delete/soft delete;
* potentially transaction reversal.

---

# 3. ACCOUNT BALANCE BUSINESS RULE

Do NOT simply rely on frontend state.

Implement/verify balance calculation at backend/service/business-logic level.

For an account:

```text
Current Balance =
initial_balance
+ income
- expense
- transfer_out
+ transfer_in
```

For example:

```text
initial_balance = 10.000.000

income          = +2.000.000
expense         = -1.500.000
transfer_out    = -500.000
transfer_in     = +1.000.000

current_balance = 11.000.000
```

Transfers MUST affect both accounts atomically.

Example:

```text
BCA → E-Wallet
Rp 500.000
```

Result:

```text
BCA       - Rp 500.000
E-Wallet  + Rp 500.000
```

Total household cash should not accidentally increase/decrease because of an internal transfer.

---

# 4. TRANSACTION CREATE / UPDATE / DELETE CONSISTENCY

Verify these scenarios:

### Income

```text
Account + income
```

### Expense

```text
Account - expense
```

### Transfer

```text
Source Account - amount
Destination Account + amount
```

### Update

If:

```text
Expense Rp 100.000
```

changes to:

```text
Expense Rp 250.000
```

only the delta must affect the account.

Expected:

```text
Additional deduction = Rp 150.000
```

Do NOT apply the full Rp 250.000 again.

### Delete

If an expense is soft-deleted:

```text
Expense Rp 250.000
```

its effect must no longer be included in calculated balance.

Same principle applies to income and transfer.

### Transaction date

Make sure account balance logic does not accidentally ignore valid transactions because of date filtering unless the existing business rule explicitly requires a date range.

---

# 5. ACCOUNT BALANCE SOURCE OF TRUTH

Do not create multiple competing balance systems.

Determine how the current project calculates:

* Current Balance
* Total Balance
* Net Worth
* Cashflow

Reuse the existing implementation where possible.

If `initial_balance` is the stored starting balance, derive current balance from:

```text
initial_balance + transaction effects
```

rather than creating another unrelated balance column.

If the existing implementation intentionally stores a cached balance, ensure it is updated transactionally and cannot become inconsistent.

Prefer calculated/source-of-truth logic if performance allows.

---

# 6. MONEY INPUT FORMATTING — GLOBAL REQUIREMENT

This applies to ALL monetary input fields in Finora.

The user must be able to type:

```text
1000000
```

and immediately see:

```text
1.000.000
```

Likewise:

```text
23999999
```

must display:

```text
23.999.999
```

Decimal values must also be supported where applicable.

Example:

```text
23999999.50
```

should be represented appropriately without forcing every amount into an integer.

Do not break the underlying API payload.

Frontend display format and backend numeric value must remain separate.

---

# 7. MONEY INPUT COMPONENT

Create/reuse a centralized money input formatter instead of implementing formatting separately in every page.

Expected behavior:

```text
User input:
1
10
100
1000
10000
1000000

Display:
1
10
100
1.000
10.000
1.000.000
```

For Indonesian currency:

```text
1.000.000
23.999.999
100.000.000
```

Do not send:

```text
"1.000.000"
```

to backend if the backend expects numeric data.

Normalize before API request:

```text
"1.000.000" → 1000000
```

or:

```text
"23.999.999,50" → 23999999.50
```

according to the application's decimal convention.

Do not use floating point for financial calculations.

Backend remains:

```text
NUMERIC(20,2)
```

---

# 8. APPLY MONEY FORMAT TO ALL RELEVANT MENUS

The formatter must be consistently used in:

## Accounts

* Initial Balance
* Current Balance
* account forms
* account detail
* account cards

## Transactions

* Income
* Expense
* Transfer
* Transaction amount
* transaction forms
* transaction detail
* transaction edit

## Assets / Wealth

* Current Price
* Average Cost
* Investment value
* asset transaction value
* buy/sell values
* fees
* other monetary fields

Asset quantity must remain separately formatted according to its unit/precision.

Example:

```text
Gold:
12.500 gram

Price:
Rp 1.234.567
```

Do not confuse quantity formatting with currency formatting.

## Goals

* Target Amount
* Current Amount
* Contribution
* Withdrawal

## Budgets

* Budget amount
* Spending
* Remaining budget
* Monthly limit

## Dashboard

* Total Balance
* Income
* Expense
* Cashflow
* Net Worth
* Asset Value

## Reports

All monetary values.

---

# 9. CURRENCY DISPLAY

Use consistent Indonesian Rupiah display:

```text
Rp 1.000.000
Rp 23.999.999
Rp 100.000
```

Avoid inconsistent displays such as:

```text
1000000
Rp1000000
1,000,000
1.000,000
```

Use one centralized formatter.

Example conceptual API:

```ts
formatCurrency(value)
formatMoneyInput(value)
parseMoneyInput(value)
```

Do not duplicate formatting logic across components.

---

# 10. ASSETS / WEALTH — FIX UPDATE ISSUE

Fix the existing:

```text
Nominal Update
Menu Aset / Wealth
```

Verify that when asset values are updated:

* frontend state updates;
* backend persists correctly;
* GET endpoint returns latest value;
* TanStack Query cache is invalidated/refetched;
* Dashboard reflects the new value;
* Wealth page reflects the new value;
* related asset calculations are updated.

After mutation:

```text
PUT /assets/{id}
```

the frontend must not continue displaying stale data.

Use appropriate query invalidation.

---

# 11. AI RECEIPT / IMAGE ANALYSIS

Current issue:

```text
AI fetch always fails / alert appears when uploading photo.
```

Investigate the complete flow:

```text
Frontend upload
↓
Request payload
↓
Laravel API
↓
AI service
↓
Response
↓
Frontend parser
```

Do not only hide the alert.

Find the actual root cause.

Check:

* file type;
* MIME type;
* file size;
* FormData;
* request headers;
* authentication;
* Laravel validation;
* storage;
* AI API request;
* AI API response;
* timeout;
* malformed response;
* JSON parsing;
* error handling;
* environment variables;
* backend logs.

---

# 12. AI IMAGE CLASSIFICATION

AI MUST distinguish between:

### Valid financial transfer/transaction evidence

Examples:

* bank transfer receipt;
* e-wallet transfer receipt;
* payment receipt;
* transaction screenshot;
* bank statement screenshot;
* relevant financial transaction evidence.

And:

### Invalid/non-financial image

Examples:

* selfie;
* random photo;
* food photo;
* landscape;
* unrelated screenshot;
* random document;
* meme;
* product photo without transaction information.

If the image is unrelated:

Return a controlled response such as:

```json
{
  "success": false,
  "type": "unsupported_image",
  "message": "The uploaded image does not appear to contain financial transaction information."
}
```

Do NOT treat an unrelated image as a valid transaction.

---

# 13. AI RESPONSE CONTRACT

Define a predictable structured response.

Example:

```json
{
  "success": true,
  "type": "transaction_receipt",
  "data": {
    "transaction_type": "expense",
    "amount": 150000,
    "date": "2026-09-22",
    "description": "Payment",
    "merchant": "Example Merchant",
    "reference": null,
    "confidence": 0.92
  }
}
```

For transfer:

```json
{
  "success": true,
  "type": "transfer_receipt",
  "data": {
    "transaction_type": "transfer",
    "amount": 500000,
    "from_account": "BCA",
    "to_account": "OVO",
    "date": "2026-09-22"
  }
}
```

For invalid image:

```json
{
  "success": false,
  "type": "unsupported_image",
  "message": "This image does not contain recognizable financial transaction information."
}
```

Frontend MUST handle all states gracefully:

```text
loading
success
unsupported
validation_error
AI_error
network_error
timeout
```

Never expose raw backend/AI exceptions directly to users.

---

# 14. AI MUST NOT AUTO-CREATE TRANSACTION WITHOUT USER CONFIRMATION

If AI extracts transaction information:

```text
Upload receipt
↓
AI analyzes
↓
Show extracted data
↓
User reviews
↓
User confirms
↓
Create transaction
```

Do not automatically create a financial transaction from an uncertain OCR/AI result.

Allow the user to edit:

* amount;
* date;
* account;
* category;
* description;
* transaction type.

---

# 15. SETTINGS — HOUSEHOLD ACTIVE MEMBERS

Current issue:

```text
Settings → Household Details → Active Members
```

does not show the expected user/member list.

Fix the complete data flow:

```text
GET /household/members
↓
Laravel resolves current household
↓
household_members
↓
users
↓
Frontend
```

The response should contain enough information for UI:

```json
{
  "id": "member-id",
  "user_id": "user-id",
  "name": "Krisna",
  "email": "user@example.com",
  "avatar_url": "...",
  "role": "owner",
  "status": "active",
  "joined_at": "...",
  "is_current_user": true
}
```

Do not expose unnecessary sensitive information.

---

# 16. MEMBER UI

Household member card should display:

```text
○ Profile Image

Krisna
Owner
Active
Joined Sep 2026
```

Profile image:

* circular;
* proper fallback initials if no image;
* consistent sizing;
* object-cover;
* no broken image icon.

Status should be visually clear:

```text
Active
Inactive
Pending
```

Use the existing Finora color/design system.

---

# 17. MEMBER MANAGEMENT

Implement or verify support for:

### Invite

```text
Invite Partner
```

### Pending invitation

Display:

```text
Pending
Expires:
Invited email:
```

### Accept invitation

After accepting:

```text
household_members
```

must be updated correctly.

### Leave / Remove / Kick

If supported by existing authorization:

Owner can remove member.

Do not allow:

```text
Owner removes self
```

unless an explicit ownership-transfer flow exists.

Do not allow member management actions to bypass backend authorization.

After every member mutation:

```text
invalidate household members query
```

and refresh UI.

---

# 18. ACTIVE / INACTIVE STATE

Use:

```text
household_members.status
```

as the source of truth.

Do not infer activity only from:

```text
created_at
last login
frontend session
```

unless the existing application explicitly defines activity that way.

---

# 19. BUDGET UI — MONEY FORMAT

All budget values must support:

```text
Rp 23.999.999
```

and not require integer-only presentation.

Apply formatting to:

* budget limit;
* total spending;
* remaining;
* category spending;
* budget creation;
* budget edit.

---

# 20. BUDGET — TOTAL MONTHLY SPENDING

Current UI:

```text
Total Monthly Spending

Rp 0

of Rp 880.000 limit

Overall Health
0.0%
```

has poor visual styling because the health section appears white/inconsistent.

Redesign this section to match the rest of Finora.

Example conceptual layout:

```text
┌───────────────────────────────────────┐
│ Total Monthly Spending                │
│                                       │
│ Rp 350.000                            │
│ of Rp 880.000 limit                   │
│                                       │
│ ███████████░░░░░░░░ 39.8%             │
│                                       │
│ Overall Health                        │
│ 39.8%                                 │
└───────────────────────────────────────┘
```

Use semantic states:

```text
0–59%   → healthy
60–79%  → caution
80–99%  → warning
100%+   → exceeded
```

Do not use colors arbitrarily.

Follow existing Finora theme tokens.

The component must remain readable in:

* mobile;
* tablet;
* desktop;
* light/dark theme if currently supported.

---

# 21. BUDGET DATA MUST BE REAL

Do not use static:

```text
Rp 0
0.0%
```

unless the actual database value is zero.

Calculate from real transactions and budget data.

Conceptually:

```text
monthly spending
=
sum(expense transactions)
within budget period
and household
and category if applicable
```

Then:

```text
health =
spending / budget_limit * 100
```

Handle:

```text
budget_limit = 0
```

without division-by-zero errors.

---

# 22. DASHBOARD MUST BE DATA-RELATED

Dashboard should not behave like an isolated page.

Dashboard must aggregate real data from:

```text
Accounts
Transactions
Budgets
Assets / Wealth
Goals
```

and other existing Finora modules where relevant.

Use existing APIs:

```text
GET /dashboard/summary
GET /dashboard/cashflow
GET /dashboard/net-worth
GET /dashboard/assets
GET /dashboard/categories
```

Do not duplicate business logic in frontend.

---

# 23. DASHBOARD RELATIONSHIP

Example:

When user adds:

```text
Income Rp 5.000.000
```

Dashboard should update:

```text
Income
Cashflow
Account balance
```

When user adds:

```text
Expense Rp 1.000.000
```

Dashboard should update:

```text
Expense
Cashflow
Account balance
Budget spending
Category spending
```

When user creates:

```text
Transfer Rp 500.000
```

Dashboard should not incorrectly interpret the transfer as income/expense.

When user updates:

```text
Asset current price
```

Dashboard should update:

```text
Net worth
Asset allocation
```

according to the existing financial model.

---

# 24. QUERY CACHE CONSISTENCY

Because the application uses TanStack Query, ensure mutation invalidation is consistent.

Examples:

After transaction creation:

```text
invalidate:
transactions
accounts
dashboard
budgets
reports
```

where relevant.

After account update:

```text
invalidate:
accounts
dashboard
```

After asset update:

```text
invalidate:
assets
dashboard
```

After budget mutation:

```text
invalidate:
budgets
dashboard
```

After household member mutation:

```text
invalidate:
household
household-members
```

Do not blindly invalidate everything if unnecessary.

Use the smallest correct dependency set.

---

# 25. MOBILE PROFILE DROPDOWN

Current issue:

On mobile, when clicking the profile avatar, the dropdown is not aligned with the circular profile icon.

Fix:

```text
Profile Avatar
       ↓
Dropdown
```

The dropdown must anchor to the profile trigger itself.

Use appropriate positioning:

```text
relative parent
absolute dropdown
right alignment
```

or the existing shadcn/ui dropdown/popover positioning mechanism.

Do not use hardcoded viewport coordinates.

Requirements:

* aligned to avatar;
* no overflow outside viewport;
* usable on small screens;
* does not overlap important content incorrectly;
* closes when clicking outside;
* closes after selecting an item;
* keyboard accessible;
* touch friendly.

---

# 26. RESPONSIVE LAYOUT AUDIT

Audit all pages:

```text
Dashboard
Accounts
Transactions
Budgets
Assets / Wealth
Goals
Reports
Settings
Household
AI
```

Test:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Fix:

* horizontal overflow;
* empty space on right side;
* cards exceeding viewport;
* fixed width components;
* tables overflowing unexpectedly;
* dropdown overflow;
* modal overflow;
* buttons going outside viewport;
* text wrapping;
* charts exceeding container;
* navigation issues.

Do NOT solve horizontal overflow by blindly applying:

```css
overflow-x: hidden;
```

unless the underlying component is correctly sized.

Find the actual source of overflow.

---

# 27. MOBILE-FIRST DESIGN

Finora is primarily used as a mobile-focused responsive web application.

Mobile requirements:

* cards stack naturally;
* buttons remain accessible;
* inputs use full available width;
* dialogs fit viewport;
* tables become cards/scrollable sections when appropriate;
* charts remain readable;
* navigation remains usable;
* touch target should be comfortable;
* no accidental horizontal page scrolling.

Tablet and desktop should progressively enhance the layout.

---

# 28. DESIGN CONSISTENCY

All affected screens must use the existing Finora visual language.

Keep consistency for:

* border radius;
* card style;
* spacing;
* typography;
* icon style;
* buttons;
* badges;
* inputs;
* dropdowns;
* modal/dialogs;
* charts;
* colors.

Do not introduce random new colors.

Do not redesign the entire application.

Improve consistency using the existing design tokens/components.

---

# 29. "NOMINAL UPDATE" AUDIT

Search the entire codebase for all places where financial values are:

```text
created
updated
displayed
calculated
formatted
parsed
sent to API
```

Audit:

```text
Account
Transaction
Transfer
Asset
Asset Transaction
Goal
Goal Transaction
Budget
Recurring Transaction
Dashboard
Reports
AI extracted transactions
```

Find duplicated or inconsistent implementation.

Centralize where appropriate.

---

# 30. BACKEND TRANSACTIONAL INTEGRITY

Financial mutations should be atomic.

For example:

```text
Create Transfer
```

must ensure:

```text
transactions created
+
transfer record created
```

either both succeed or both fail.

Use database transactions in Laravel.

Similarly for any operation that modifies multiple related financial records.

Do not leave partial records if one operation fails.

---

# 31. VALIDATION

Verify backend validation for:

### Amount

```text
required
numeric
>= 0
```

according to existing business rules.

### Account

Must belong to current household.

### Category

Must belong to current household.

### Asset

Must belong to current household.

### Budget

Must belong to current household.

### Transfer

Both accounts must belong to current household.

Source and destination should not be identical unless explicitly supported.

---

# 32. SECURITY

Do not weaken authorization while fixing bugs.

Every resource must continue to verify household ownership.

Example:

User A must not be able to access:

```text
Account belonging to Household B
Transaction belonging to Household B
Asset belonging to Household B
Budget belonging to Household B
```

even if User A manually changes the UUID in the API request.

Backend authorization remains mandatory.

---

# 33. ERROR HANDLING

Replace generic/unhelpful alerts such as:

```text
Something went wrong
Fetch failed
AI failed
```

with meaningful user-facing messages.

Examples:

```text
Unable to load household members.
Please try again.
```

```text
The uploaded image does not appear to contain a financial transaction.
```

```text
We couldn't analyze this receipt right now.
Please try again.
```

```text
Your transaction was not saved because the selected account is no longer available.
```

Do not expose:

* stack traces;
* SQL errors;
* API keys;
* internal URLs;
* raw AI provider errors;
* database details.

---

# 34. LOADING STATES

Every asynchronous operation should have a proper loading state.

Especially:

```text
Account fetch
Transaction fetch
Budget fetch
Asset fetch
Household members
AI upload
AI analysis
Dashboard
```

Avoid flashing:

```text
Rp 0
0 members
0.0%
```

when data is simply still loading.

Use skeleton/loading state where appropriate.

Distinguish:

```text
loading
empty
error
success
```

---

# 35. EMPTY STATES

Create meaningful empty states.

Example:

```text
No transactions yet

Start tracking your first income or expense.
```

Instead of simply:

```text
0
```

For household:

```text
No active partner yet

Invite your partner to manage your household finances together.
```

For budgets:

```text
No budgets configured
```

---

# 36. API DEBUGGING

Before changing frontend behavior, inspect existing backend endpoint behavior.

For each affected feature:

```text
Frontend request
↓
Request payload
↓
Laravel controller
↓
Service
↓
Validation
↓
Database
↓
Response
↓
Frontend query/cache
```

Determine where the failure occurs.

Do not patch symptoms only.

---

# 37. TEST CASES

After implementation, verify at minimum:

## Account

```text
Create account
Set initial balance
Create income
Create expense
Create transfer
Edit transaction
Delete transaction
Verify balance
```

## Transaction

```text
Income
Expense
Transfer
Update amount
Delete transaction
```

## Asset

```text
Create asset
Update price
Update quantity
Create asset transaction
Verify dashboard
```

## Budget

```text
Create budget
Create expense
Verify spending
Verify percentage
Update budget
Delete budget
```

## Household

```text
View members
Invite member
Accept invitation
Display avatar
Display name
Display role
Display status
```

## AI

```text
Upload valid transfer receipt
Upload valid expense receipt
Upload unrelated image
Upload unsupported file
Upload oversized file
AI timeout
AI provider error
```

## Dashboard

Verify updates after:

```text
Account mutation
Transaction mutation
Transfer
Asset mutation
Budget mutation
```

---

# 38. REGRESSION CHECK

Do not break existing:

* authentication;
* login;
* registration;
* household creation;
* transaction creation;
* account CRUD;
* asset CRUD;
* budget CRUD;
* goal CRUD;
* reports;
* AI chat;
* existing navigation;
* existing API contracts.

If an existing endpoint already works, do not rewrite it unnecessarily.

---

# 39. DATABASE SCHEMA — PRESERVE

Existing financial fields remain:

```text
NUMERIC(20,2)
```

for monetary values.

Asset quantities:

```text
NUMERIC(30,10)
```

UUID primary keys.

Existing soft delete behavior.

Existing household/member relationships.

Do not migrate to floating-point types.

Do not introduce unnecessary duplicate balance fields.

---

# 40. API CONTRACT — PRESERVE

Existing base:

```text
/api/v1
```

Response format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

Keep existing API contracts compatible.

If an API response must be extended, add fields backward-compatibly.

---

# 41. ACCEPTANCE CRITERIA

The task is considered complete only when:

### Financial synchronization

* [ ] Account balance reflects income.
* [ ] Account balance reflects expense.
* [ ] Account balance reflects transfer in/out.
* [ ] Transaction update correctly adjusts balance.
* [ ] Transaction delete correctly reverses effect.
* [ ] Transfer does not incorrectly affect household net cashflow as income/expense.
* [ ] Dashboard reflects changes.

### Currency formatting

* [ ] All monetary inputs support thousands separator.
* [ ] `1000000` displays as `1.000.000`.
* [ ] `23999999` displays as `23.999.999`.
* [ ] Decimal amounts are supported where applicable.
* [ ] API receives normalized numeric values.
* [ ] Display formatting is centralized.

### Assets

* [ ] Asset update persists.
* [ ] UI refreshes after update.
* [ ] Wealth page reflects latest data.
* [ ] Dashboard reflects relevant changes.

### AI

* [ ] Photo upload works.
* [ ] Valid transaction receipt is detected.
* [ ] Transfer receipt is distinguished from normal expense/income.
* [ ] Unrelated image is rejected gracefully.
* [ ] AI errors are handled gracefully.
* [ ] User confirms extracted transaction before saving.

### Household

* [ ] Active members appear.
* [ ] User name appears.
* [ ] Avatar appears.
* [ ] Role appears.
* [ ] Active/inactive status appears.
* [ ] Joined date appears.
* [ ] Invitation state appears where relevant.
* [ ] Member management respects authorization.

### Budget

* [ ] Money formatting is consistent.
* [ ] Total monthly spending is real data.
* [ ] Budget limit is real data.
* [ ] Percentage is calculated correctly.
* [ ] Health indicator is visually consistent.
* [ ] Over-budget state is clearly represented.

### Dashboard

* [ ] Dashboard reflects Accounts.
* [ ] Dashboard reflects Transactions.
* [ ] Dashboard reflects Budgets.
* [ ] Dashboard reflects Assets.
* [ ] Dashboard values are not hardcoded.
* [ ] TanStack Query invalidation is correct.

### Responsive

* [ ] Mobile works.
* [ ] Tablet works.
* [ ] Desktop works.
* [ ] No unintended horizontal overflow.
* [ ] Profile dropdown aligns with avatar.
* [ ] Dropdown stays inside viewport.
* [ ] Dialogs work on mobile.
* [ ] Tables/charts/cards are responsive.

---

# 42. IMPLEMENTATION APPROACH

Follow this order:

## Phase 1 — Inspect

First inspect existing implementation.

Identify:

```text
Frontend routes
Components
Hooks
TanStack Query keys
API clients
Laravel controllers
Services
Models
Migrations
Validation
AI integration
Household endpoints
Dashboard endpoints
```

Do not immediately modify files.

---

## Phase 2 — Trace Bugs

For every reported bug:

```text
UI
↓
API request
↓
Backend
↓
Database
↓
API response
↓
Query cache
↓
UI
```

Identify the actual root cause.

---

## Phase 3 — Fix Core Data Layer

Fix:

1. account balance;
2. transaction synchronization;
3. transfer logic;
4. asset update;
5. household member API;
6. AI API/response handling;
7. budget calculations.

---

## Phase 4 — Fix Shared Frontend Utilities

Implement/reuse:

```text
currency formatter
money input
number parser
query invalidation
error handling
loading state
```

Avoid duplicated logic.

---

## Phase 5 — UI/UX

Fix:

```text
Budget health card
Household member cards
Profile dropdown
Mobile responsiveness
Desktop responsiveness
Tablet responsiveness
```

---

## Phase 6 — Dashboard Integration

Verify all dashboard values are derived from the actual backend data.

---

## Phase 7 — Regression Testing

Run existing tests if available.

Also manually test the acceptance criteria above.

---

# 43. IMPORTANT DEVELOPMENT RULE

Do not declare the task completed merely because the page renders.

The feature is only complete if:

```text
Database
    ↕
Laravel API
    ↕
TanStack Query
    ↕
Next.js UI
```

all remain synchronized.

Especially verify mutation → cache invalidation → updated UI.

---

# 44. FINAL DELIVERABLE

After implementation, provide a concise report containing:

### Changed

List files/modules changed.

### Root Causes

For every reported bug, explain the actual root cause.

### Fixes

Explain what was changed.

### API Changes

List API changes, if any.

### Database Changes

List migrations/schema changes, if any.

### UI Changes

List responsive/UI changes.

### AI Changes

Explain image classification and error handling.

### Testing

Provide:

```text
Feature
Scenario
Result
```

Do not claim a test passed unless it was actually executed.

---

# 45. FINAL PRINCIPLE

Finora must behave as one integrated financial system.

The expected relationship is:

```text
                 ┌──────────────┐
                 │   Dashboard  │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      Accounts     Transactions     Budgets
          │             │             │
          │             │             │
          └──────┬──────┴─────────────┘
                 │
                 ▼
            Financial Data
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      Assets   Goals    Reports
                 │
                 ▼
             Household
                 │
                 ▼
             Members
```

Every module must consume the same authoritative backend data.

Avoid isolated frontend state that creates conflicting numbers.

The most important objective is:

> **One source of truth, consistent financial calculations, synchronized UI, predictable API behavior, and responsive UX across the entire Finora application.**

Do not rebuild Finora.

**Fix the existing system, preserve the architecture, improve the implementation, and make every existing module work together correctly.**


# 46. GLOBAL NaN / INVALID NUMERIC VALUE FIX

Selain seluruh bug sebelumnya, lakukan **global audit terhadap seluruh menu Finora untuk memastikan tidak ada nilai `NaN`, `Infinity`, `-Infinity`, `undefined`, atau `null` yang tampil sebagai angka kepada user.**

## Problem

Saat ini pada beberapa menu terdapat kemungkinan hasil seperti:

```text
NaN
NaN%
NaN / Rp 1.000.000
Rp NaN
undefined
null
Infinity
- Infinity
```

Masalah ini harus diperbaiki **di source data dan calculation layer**, bukan hanya disembunyikan di UI.

Jangan melakukan patch seperti:

```ts
value || 0
```

secara sembarangan karena dapat menyembunyikan bug data.

---

# 46.1 GLOBAL NUMERIC SAFETY

Audit seluruh operasi numerik:

```text
+
-
*
/
%
parseInt()
parseFloat()
Number()
toFixed()
Math.round()
Math.floor()
Math.ceil()
```

Pastikan inputnya valid sebelum calculation.

Contoh yang berbahaya:

```ts
const percentage = (spent / budget) * 100;
```

Jika:

```text
spent = undefined
budget = undefined
```

hasil:

```text
NaN
```

Jika:

```text
budget = 0
```

hasil dapat menjadi:

```text
Infinity
```

Implementasikan numeric normalization yang konsisten.

---

# 46.2 CENTRALIZED NUMERIC HELPERS

Gunakan centralized utility/helper.

Contoh konsep:

```ts
isValidNumber(value)
toSafeNumber(value, fallback)
formatCurrency(value)
formatPercentage(value)
formatQuantity(value)
```

Behavior:

```text
null       → fallback
undefined  → fallback
NaN        → fallback
Infinity   → fallback
-Infinity  → fallback
valid 0    → 0
valid number → number
```

Jangan menganggap:

```ts
if (!value)
```

sebagai validasi angka karena:

```text
0
```

adalah nilai valid.

Gunakan validasi yang benar.

---

# 46.3 MONEY VALUES

Semua nominal uang harus aman dari `NaN`.

Contoh:

```text
Rp NaN
```

tidak boleh muncul di:

* Dashboard
* Accounts
* Account Detail
* Transactions
* Transaction Detail
* Budgets
* Assets / Wealth
* Goals
* Reports
* AI extracted transaction
* Recurring Transactions
* Household financial summary
* Charts
* Cards
* Tables
* Modals
* Forms

Jika nilai memang belum tersedia:

```text
Rp 0
```

atau:

```text
—
```

gunakan sesuai konteks.

Jangan menampilkan:

```text
NaN
undefined
null
```

kepada user.

---

# 46.4 PERCENTAGE VALUES

Audit seluruh percentage calculation.

Contoh:

```ts
const percentage = (current / target) * 100;
```

Handle:

```text
target = 0
target = null
target = undefined
current = null
```

Contoh:

```text
Target = Rp 0
Current = Rp 0
```

jangan menghasilkan:

```text
NaN%
```

Gunakan behavior yang konsisten dengan business meaning.

Misalnya:

```text
0%
```

atau:

```text
—
```

sesuai konteks UI.

---

# 46.5 BUDGET NaN AUDIT

Audit seluruh calculation di Budget.

Minimal:

```text
total spending
budget limit
remaining
usage percentage
overall health
category spending
category percentage
progress bar
```

Formula:

```text
spending
budget limit
remaining = budget limit - spending
usage percentage = spending / budget limit × 100
```

Handle:

```text
budget limit = 0
spending = 0
budget limit = null
spending = null
```

Never render:

```text
NaN
NaN%
Infinity%
```

---

# 46.6 ACCOUNT NaN AUDIT

Audit:

```text
Current Balance
Initial Balance
Total Balance
Income
Expense
Transfer In
Transfer Out
```

Ensure:

```text
null + number
undefined + number
string + number
```

does not create invalid calculations.

Normalize API values before calculation because PostgreSQL `NUMERIC` values may arrive from API as:

```text
string
```

depending on Laravel/serialization implementation.

For example:

```json
{
  "initial_balance": "1000000.00"
}
```

must be safely normalized before arithmetic.

Do not perform unsafe operations such as:

```ts
"1000000.00" + 500000
```

because this may produce an incorrect string result instead of numeric addition.

---

# 46.7 TRANSACTION NaN AUDIT

Audit:

```text
amount
income total
expense total
transfer total
transaction statistics
daily totals
monthly totals
category totals
```

Make sure transaction amount is normalized consistently.

Invalid transaction amount should be handled before calculation.

---

# 46.8 ASSETS / WEALTH NaN AUDIT

Audit:

```text
quantity
average cost
current price
total value
profit/loss
profit/loss percentage
allocation percentage
asset growth
```

Typical formulas:

```text
total value = quantity × current price

profit/loss =
current value - invested value

profit/loss percentage =
profit/loss / invested value × 100
```

Handle:

```text
quantity = 0
current_price = 0
invested_value = 0
```

without producing:

```text
NaN
Infinity
```

Asset quantity and currency must remain separate.

Example:

```text
12.5 gram
×
Rp 1.500.000
```

must produce:

```text
Rp 18.750.000
```

not:

```text
NaN
```

---

# 46.9 GOALS NaN AUDIT

Audit:

```text
target amount
current amount
remaining amount
progress percentage
contribution
withdrawal
```

Formula:

```text
remaining =
target - current

progress =
current / target × 100
```

Handle:

```text
target = 0
current = 0
```

without `NaN`.

Progress must be capped appropriately if the existing business rule requires:

```text
0% → 100%
```

or otherwise follow the existing domain behavior.

---

# 46.10 DASHBOARD NaN AUDIT

Audit every dashboard KPI:

```text
Net Worth
Total Balance
Income
Expense
Cashflow
Saving Rate
Asset Value
Budget Usage
Category Spending
```

Also audit all charts.

Especially:

```text
Recharts
Tooltip
XAxis
YAxis
Pie Chart
Bar Chart
Line Chart
Progress
```

Do not allow chart data such as:

```json
{
  "value": null
}
```

or:

```json
{
  "value": "NaN"
}
```

to reach chart components if the chart library cannot safely handle it.

Normalize data before rendering.

---

# 46.11 REPORTS NaN AUDIT

Audit:

```text
Monthly Summary
Cashflow Report
Net Worth Report
Spending Analysis
Category Breakdown
Trend calculations
```

Ensure all calculated values are valid.

Especially percentage comparisons such as:

```text
growth %
change %
saving rate
expense ratio
category percentage
```

---

# 46.12 AI RESULT NaN AUDIT

AI extracted financial values must also be validated.

AI may return:

```text
null
""
"unknown"
"not found"
"N/A"
```

or malformed numeric values.

Do not blindly cast AI output.

Normalize:

```text
"1.000.000"
"1000000"
"Rp 1.000.000"
"1000000.00"
```

into the application's canonical numeric representation.

If AI cannot confidently extract an amount:

```text
amount = null
```

should be handled as an extraction issue, not converted into:

```text
NaN
```

User should be asked to review/fill the amount before transaction creation.

---

# 46.13 CHART DATA VALIDATION

Before sending data to charts:

```text
API
↓
normalize
↓
validate
↓
remove/replace invalid numeric values
↓
chart
```

Do not allow:

```text
NaN
Infinity
-Infinity
undefined
```

inside chart datasets.

Example:

```ts
const safeChartValue = Number.isFinite(value)
  ? value
  : 0;
```

Use the appropriate semantic fallback instead of blindly converting every invalid value to zero.

---

# 46.14 API RESPONSE NORMALIZATION

Inspect all API responses containing numeric fields.

Potential examples:

```json
{
  "amount": "1000000.00",
  "balance": "5000000.00",
  "percentage": null
}
```

Frontend should have a predictable normalization strategy.

Do not mix:

```text
string number
number
null
undefined
```

without a defined handling strategy.

---

# 46.15 BACKEND NUMERIC VALIDATION

Frontend safety is not enough.

Laravel must validate monetary fields before persistence.

Verify:

```text
amount
initial_balance
target_amount
current_amount
budget.amount
asset.average_cost
asset.current_price
asset transaction.unit_price
asset transaction.fee
```

according to the existing schema and business rules.

Database remains:

```text
NUMERIC(20,2)
```

for monetary values.

Never introduce floating point for financial calculations.

---

# 46.16 NaN ERROR DETECTION DURING DEVELOPMENT

During development, search the entire codebase for patterns that commonly produce NaN:

```text
/ 0
/ variable
parseFloat(
parseInt(
Number(
.toFixed(
Math.
```

Also search for:

```text
NaN
isNaN
Number.isNaN
Number.isFinite
```

Identify existing defensive handling and consolidate duplicated logic where appropriate.

---

# 46.17 UI FALLBACK

If data is legitimately unavailable, use a deliberate UI state.

Examples:

For money:

```text
Rp 0
```

when the actual value is truly zero.

Use:

```text
—
```

when the value is unavailable/not applicable.

Use:

```text
Loading...
```

while fetching.

Use:

```text
Unable to load
```

for an actual API error.

Never use:

```text
NaN
undefined
null
Infinity
```

as user-facing output.

---

# 46.18 NO SILENT DATA CORRUPTION

Do NOT solve every NaN by:

```ts
Number(value) || 0
```

because this can silently turn invalid financial data into zero.

Bad:

```ts
const amount = Number(api.amount) || 0;
```

Better conceptual behavior:

```text
valid numeric value
    ↓
use value

null / undefined
    ↓
handle as missing

invalid numeric string
    ↓
validation/error state

Infinity / NaN
    ↓
invalid calculation state
```

Financial data must not silently become zero merely because parsing failed.

---

# 46.19 GLOBAL ACCEPTANCE CRITERIA

After fixing the application, perform a global search and manual verification.

There must be no user-facing:

```text
NaN
NaN%
Infinity
-Infinity
undefined
null
```

in any normal UI state.

Test at minimum:

### Zero values

```text
0
Rp 0
0%
```

### Empty values

```text
null
undefined
```

### Large values

```text
23.999.999
100.000.000
1.000.000.000
```

### Decimal values

```text
23.999.999,50
```

where supported.

### Loading

No temporary NaN while API is loading.

### API error

No NaN when API request fails.

### Empty database

No NaN when household has:

```text
0 accounts
0 transactions
0 assets
0 budgets
0 goals
```

### Partial data

No NaN when optional fields are null.

### Division by zero

No NaN or Infinity.

---

# 46.20 FINAL GLOBAL RULE

**No financial calculation may produce a user-visible invalid numeric value.**

The correct flow is:

```text
Raw API Data
     ↓
Normalize
     ↓
Validate
     ↓
Calculate
     ↓
Validate result
     ↓
Format
     ↓
Render
```

Not:

```text
Raw API Data
     ↓
Calculate blindly
     ↓
NaN
     ↓
Hide with CSS
```

The fix must address the root cause at the appropriate layer while maintaining the existing Finora architecture and financial data integrity.
