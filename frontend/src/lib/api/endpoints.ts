import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Household,
  HouseholdMember,
  HouseholdInvitation,
  Account,
  Category,
  Transaction,
  TransactionFilters,
  Asset,
  AssetTransaction,
  Goal,
  GoalTransaction,
  Budget,
  RecurringTransaction,
  DashboardSummary,
  CashflowData,
  AssetAllocation,
  CategorySpending,
  Notification,
} from '@/types';

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────
export const authApi = {
  login: () =>
    api.post<ApiResponse<{ user: User; household: Household | null }>>('/auth/login'),

  logout: () =>
    api.post<ApiResponse>('/auth/logout'),

  me: () =>
    api.get<ApiResponse<{ user: User; household: Household | null }>>('/auth/me'),

  updateProfile: (data: { name?: string; avatar_url?: string }) =>
    api.put<ApiResponse<User>>('/auth/profile', data),
};

// ──────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<{ users: number; households: number; transactions: number }>>('/admin/stats'),

  getUsers: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<ApiResponse<User[]> & { meta: { current_page: number; last_page: number; total: number } }>('/admin/users', params),

  getUser: (id: string) =>
    api.get<ApiResponse<User>>(`/admin/users/${id}`),

  updateUser: (id: string, data: { name?: string; role?: string; status?: string }) =>
    api.put<ApiResponse<User>>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<ApiResponse>(`/admin/users/${id}`),
};

// ──────────────────────────────────────────────
// Household
// ──────────────────────────────────────────────
export const householdApi = {
  get: () =>
    api.get<ApiResponse<Household>>('/household'),

  create: (data: { name: string; currency?: string; timezone?: string }) =>
    api.post<ApiResponse<Household>>('/household', data),

  update: (data: { name?: string; currency?: string; timezone?: string }) =>
    api.put<ApiResponse<Household>>('/household', data),

  getMembers: () =>
    api.get<ApiResponse<HouseholdMember[]>>('/household/members'),

  join: (data: { code: string }) =>
    api.post<ApiResponse<HouseholdMember>>('/household/join', data as Record<string, unknown>),

  invite: (data: { email: string }) =>
    api.post<ApiResponse<HouseholdInvitation>>('/household/invitations', data),

  acceptInvitation: (token: string) =>
    api.post<ApiResponse<HouseholdMember>>(`/household/invitations/${token}/accept`),

  removeMember: (userId: string) =>
    api.delete<ApiResponse>(`/household/members/${userId}`),

  updateRole: (userId: string, role: 'owner' | 'member') =>
    api.put<ApiResponse>(`/household/members/${userId}/role`, { role }),

  leave: () =>
    api.post<ApiResponse>('/household/leave'),
};

// ──────────────────────────────────────────────
// Accounts
// ──────────────────────────────────────────────
export const accountsApi = {
  list: (params?: { is_active?: boolean; page?: number; per_page?: number; owner_type?: string }) =>
    api.get<PaginatedResponse<Account>>('/accounts', params as Record<string, string>),

  get: (id: string) =>
    api.get<ApiResponse<Account>>(`/accounts/${id}`),

  create: (data: Partial<Account>) =>
    api.post<ApiResponse<Account>>('/accounts', data as Record<string, unknown>),

  update: (id: string, data: Partial<Account>) =>
    api.put<ApiResponse<Account>>(`/accounts/${id}`, data as Record<string, unknown>),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/accounts/${id}`),
};

// ──────────────────────────────────────────────
// Categories
// ──────────────────────────────────────────────
export const categoriesApi = {
  list: (params?: { type?: string; is_active?: boolean }) =>
    api.get<ApiResponse<Category[]>>('/categories', params as Record<string, string>),

  get: (id: string) =>
    api.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>('/categories', data as Record<string, unknown>),

  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data as Record<string, unknown>),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/categories/${id}`),
};

// ──────────────────────────────────────────────
// Transactions
// ──────────────────────────────────────────────
export const transactionsApi = {
  list: (filters?: TransactionFilters) =>
    api.get<PaginatedResponse<Transaction>>('/transactions', filters as Record<string, string>),

  get: (id: string) =>
    api.get<ApiResponse<Transaction>>(`/transactions/${id}`),

  create: (data: {
    account_id: string;
    category_id: string;
    type: 'income' | 'expense';
    amount: number;
    transaction_date: string;
    description?: string;
    notes?: string;
  }) => api.post<ApiResponse<Transaction>>('/transactions', data as Record<string, unknown>),

  update: (id: string, data: Partial<Transaction>) =>
    api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data as Record<string, unknown>),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/transactions/${id}`),

  transfer: (data: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    transaction_date: string;
    description?: string;
  }) => api.post<ApiResponse<Transaction>>('/transactions/transfer', data as Record<string, unknown>),
};

// ──────────────────────────────────────────────
// Assets
// ──────────────────────────────────────────────
export const assetsApi = {
  list: (params?: { type?: string; is_active?: boolean; page?: number; per_page?: number; owner_type?: string }) =>
    api.get<PaginatedResponse<Asset>>('/assets', params as Record<string, string>),

  get: (id: string) =>
    api.get<ApiResponse<Asset>>(`/assets/${id}`),

  create: (data: Partial<Asset>) =>
    api.post<ApiResponse<Asset>>('/assets', data as Record<string, unknown>),

  update: (id: string, data: Partial<Asset>) =>
    api.put<ApiResponse<Asset>>(`/assets/${id}`, data as Record<string, unknown>),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/assets/${id}`),

  getTransactions: (assetId: string) =>
    api.get<ApiResponse<AssetTransaction[]>>(`/assets/${assetId}/transactions`),

  createTransaction: (assetId: string, data: Partial<AssetTransaction>) =>
    api.post<ApiResponse<AssetTransaction>>(`/assets/${assetId}/transactions`, data as Record<string, unknown>),
};

// ──────────────────────────────────────────────
// Goals
// ──────────────────────────────────────────────
export const goalsApi = {
  list: () =>
    api.get<ApiResponse<Goal[]>>('/goals'),

  get: (id: string) =>
    api.get<ApiResponse<Goal>>(`/goals/${id}`),

  create: (data: Partial<Goal>) =>
    api.post<ApiResponse<Goal>>('/goals', data as Record<string, unknown>),

  update: (id: string, data: Partial<Goal>) =>
    api.put<ApiResponse<Goal>>(`/goals/${id}`, data as Record<string, unknown>),

  contribute: (id: string, data: { amount: number; transaction_date: string; notes?: string }) =>
    api.post<ApiResponse<GoalTransaction>>(`/goals/${id}/contributions`, data as Record<string, unknown>),

  withdraw: (id: string, data: { amount: number; transaction_date: string; notes?: string }) =>
    api.post<ApiResponse<GoalTransaction>>(`/goals/${id}/withdrawals`, data as Record<string, unknown>),
};

// ──────────────────────────────────────────────
// Budgets
// ──────────────────────────────────────────────
export const budgetsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Budget>>('/budgets', params as Record<string, string>),

  create: (data: Partial<Budget>) =>
    api.post<ApiResponse<Budget>>('/budgets', data as Record<string, unknown>),

  update: (id: string, data: Partial<Budget>) =>
    api.put<ApiResponse<Budget>>(`/budgets/${id}`, data as Record<string, unknown>),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/budgets/${id}`),
};

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────
export const dashboardApi = {
  summary: (params?: { owner?: string }) =>
    api.get<ApiResponse<DashboardSummary>>('/dashboard/summary', params),

  cashflow: (params?: { months?: number }) =>
    api.get<ApiResponse<CashflowData[]>>('/dashboard/cashflow', params),

  netWorth: (params?: { months?: number }) =>
    api.get<ApiResponse<{ month: string; net_worth: number }[]>>('/dashboard/net-worth', params),

  assets: () =>
    api.get<ApiResponse<AssetAllocation[]>>('/dashboard/assets'),

  categories: (params?: { period?: string }) =>
    api.get<ApiResponse<CategorySpending[]>>('/dashboard/categories', params),
};

// ──────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────
export const reportsApi = {
  monthly: (params?: { month?: string; year?: number }) =>
    api.get<ApiResponse>('/reports/monthly', params as Record<string, string>),

  cashflow: (params?: { period?: string; from?: string; to?: string }) =>
    api.get<ApiResponse>('/reports/cashflow', params),

  netWorth: (params?: { period?: string }) =>
    api.get<ApiResponse>('/reports/net-worth', params),

  spending: (params?: { period?: string; from?: string; to?: string }) =>
    api.get<ApiResponse>('/reports/spending', params),
};

// ──────────────────────────────────────────────
// Recurring Transactions
// ──────────────────────────────────────────────
export const recurringApi = {
  list: () =>
    api.get<ApiResponse<RecurringTransaction[]>>('/recurring-transactions'),

  create: (data: Partial<RecurringTransaction>) =>
    api.post<ApiResponse<RecurringTransaction>>('/recurring-transactions', data as Record<string, unknown>),

  update: (id: string, data: Partial<RecurringTransaction>) =>
    api.put<ApiResponse<RecurringTransaction>>(`/recurring-transactions/${id}`, data as Record<string, unknown>),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/recurring-transactions/${id}`),
};

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────
export const notificationsApi = {
  list: () =>
    api.get<ApiResponse<Notification[]>>('/notifications'),

  markRead: (id: string) =>
    api.put<ApiResponse>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post<ApiResponse>('/notifications/read-all'),
};
