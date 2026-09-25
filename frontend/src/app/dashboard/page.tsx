'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/endpoints';
import { formatCurrency, formatCurrencyWithSign } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/lib/i18n/language-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [months, setMonths] = useState<string | number>(6);
  
  // Fetch KPIs
  const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.summary(),
  });

  // Fetch Chart Data
  const { data: cashflowResponse, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard', 'cashflow', months],
    queryFn: () => dashboardApi.cashflow({ months: months as any }),
  });

  const summary = summaryResponse?.data;
  const cashflowData = cashflowResponse?.data || [];

  if (summaryLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in-fade">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-8 px-6 pb-3 sm:p-6 sm:pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 sm:p-6 sm:pt-0">
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in-fade">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards: 2-column on mobile, 4-column on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Balance */}
        <Card className="hover-lift border-emerald-100 dark:border-gray-800 shadow-emerald-900/5 dark:shadow-none bg-white dark:bg-gray-900 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-8 px-6 pb-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">
              {t('dashboard.total_balance')}
            </CardTitle>
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-1.5 sm:p-2 shrink-0">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">
              {formatCurrency(summary?.total_balance || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 truncate">
              {t('dashboard.across_accounts')}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="hover-lift border-emerald-100 dark:border-gray-800 shadow-emerald-900/5 dark:shadow-none bg-white dark:bg-gray-900 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-8 px-6 pb-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">
              {t('dashboard.monthly_income')}
            </CardTitle>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-1.5 sm:p-2 shrink-0">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">
              {formatCurrency(summary?.monthly_income || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 truncate">
              {t('dashboard.this_month')}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Expense */}
        <Card className="hover-lift border-emerald-100 dark:border-gray-800 shadow-emerald-900/5 dark:shadow-none bg-white dark:bg-gray-900 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-8 px-6 pb-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">
              {t('dashboard.monthly_expense')}
            </CardTitle>
            <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-1.5 sm:p-2 shrink-0">
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight">
              {formatCurrency(summary?.monthly_expense || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 truncate">
              {t('dashboard.this_month')}
            </p>
          </CardContent>
        </Card>

        {/* Net Cashflow */}
        <Card className="hover-lift border-emerald-100 dark:border-gray-800 shadow-emerald-900/5 dark:shadow-none bg-white dark:bg-gray-900 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-8 px-6 pb-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">
              {t('dashboard.net_cashflow')}
            </CardTitle>
            <div className={`rounded-full p-1.5 sm:p-2 shrink-0 ${(summary?.monthly_cashflow || 0) >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
              <Activity className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${(summary?.monthly_cashflow || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold break-words leading-tight ${(summary?.monthly_cashflow || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrencyWithSign(summary?.monthly_cashflow || 0)}
            </div>
            {summary?.saving_rate !== null && (
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 truncate">
                {t('dashboard.saving_rate')}: {summary?.saving_rate}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-emerald-100 dark:border-gray-800 shadow-emerald-900/5 dark:shadow-none bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-3">
          <CardTitle className="dark:text-white text-lg sm:text-xl">{t('dashboard.cashflow_trend')}</CardTitle>
          <div className="relative w-full sm:w-auto">
            <select
              value={months}
              onChange={(e) => setMonths(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="appearance-none h-9 w-full sm:w-[140px] rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pl-3 pr-8 py-1 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value={1}>{t('dashboard.1_month')}</option>
              <option value={2}>{t('dashboard.2_months')}</option>
              <option value={3}>{t('dashboard.3_months')}</option>
              <option value={6}>{t('dashboard.6_months')}</option>
              <option value={12}>{t('dashboard.1_year')}</option>
              <option value={60}>{t('dashboard.5_years')}</option>
              <option value="all">{t('dashboard.all_time')}</option>
            </select>
            <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="h-[280px] sm:h-[300px] w-full mt-4">
              <Skeleton className="h-full w-full" />
            </div>
          ) : cashflowData.length > 0 ? (
            <div className="h-[280px] sm:h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000000}M`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-gray-800" />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] sm:h-[300px] flex items-center justify-center text-gray-400 text-sm">
              {t('dashboard.no_cashflow')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
