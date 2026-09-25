// ──────────────────────────────────────────────
// Core Domain Types — Finora
// ──────────────────────────────────────────────

// ──── User ────
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// ──── Household ────
export interface Household {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  created_by: string;
  invite_code?: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  status: 'active' | 'inactive';
  joined_at: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  invited_by: string;
  invited_email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ──── Account ────
export type AccountType = 'bank' | 'ewallet' | 'cash' | 'credit_card' | 'other';
export type OwnerType = 'personal' | 'shared';

export interface Account {
  id: string;
  household_id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  owner_type: OwnerType;
  owner_user_id: string | null;
  currency: string;
  initial_balance: number;
  current_balance?: number; // computed
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ──── Category ────
export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  household_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ──── Transaction ────
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  household_id: string;
  created_by: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  description: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  account?: Account;
  category?: Category;
  creator?: User;
  transfer?: Transfer;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Transfer {
  id: string;
  transaction_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  from_account?: Account;
  to_account?: Account;
}

// ──── Asset ────
export type AssetType =
  | 'gold'
  | 'stock'
  | 'crypto'
  | 'mutual_fund'
  | 'bond'
  | 'property'
  | 'vehicle'
  | 'business'
  | 'other';

export interface Asset {
  id: string;
  household_id: string;
  name: string;
  type: AssetType;
  institution: string | null;
  owner_type: OwnerType;
  owner_user_id: string | null;
  quantity?: number;
  current_units?: number;
  unit: string | null;
  average_cost?: number;
  average_buy_price?: number;
  current_price: number;
  current_value?: number; // computed: quantity × current_price
  unrealized_pl?: number; // computed: current_value - invested_value
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AssetTransactionType =
  | 'buy'
  | 'sell'
  | 'deposit'
  | 'withdrawal'
  | 'dividend'
  | 'fee'
  | 'adjustment';

export interface AssetTransaction {
  id: string;
  asset_id: string;
  created_by: string;
  type: AssetTransactionType;
  quantity: number;
  unit_price: number;
  fee: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ──── Goal ────
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  description: string | null;
  icon: string | null;
  status: GoalStatus;
  progress?: number; // computed: current/target × 100, capped at 100
  created_at: string;
  updated_at: string;
}

export type GoalTransactionType = 'contribution' | 'withdrawal';

export interface GoalTransaction {
  id: string;
  goal_id: string;
  created_by: string;
  type: GoalTransactionType;
  amount: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ──── Budget ────
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  household_id: string;
  category_id: string;
  period_type: BudgetPeriod;
  amount: number;
  start_date: string;
  end_date: string | null;
  alert_threshold: number;
  used?: number;       // computed
  remaining?: number;  // computed
  percentage?: number; // computed
  category?: Category;
  created_at: string;
  updated_at: string;
}

// ──── Recurring Transaction ────
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  household_id: string;
  created_by: string;
  name: string;
  type: 'income' | 'expense';
  account_id: string;
  category_id: string;
  amount: number;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  next_run_at: string;
  is_active: boolean;
  account?: Account;
  category?: Category;
  created_at: string;
  updated_at: string;
}

// ──── Notification ────
export interface Notification {
  id: string;
  household_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
}

// ──── Audit Log ────
export interface AuditLog {
  id: string;
  household_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ──── Dashboard ────
export interface DashboardSummary {
  total_balance: number;
  total_net_worth: number;
  monthly_income: number;
  monthly_expense: number;
  monthly_cashflow: number;
  saving_rate: number | null; // null if income = 0
}

export interface CashflowData {
  month: string;
  income: number;
  expense: number;
  cashflow: number;
}

export interface AssetAllocation {
  type: string;
  label: string;
  value: number;
  percentage: number;
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  category_color: string | null;
  category_icon: string | null;
  amount: number;
  percentage: number;
}

// ──── API Response ────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  summary?: Record<string, any>;
}

// ──── Filter / Query Params ────
export interface TransactionFilters {
  page?: number;
  per_page?: number;
  type?: TransactionType;
  category_id?: string;
  account_id?: string;
  created_by?: string;
  from?: string;
  to?: string;
  search?: string;
  sort?: string;
}

export type OwnerFilter = 'all' | 'me' | 'partner' | 'shared';
