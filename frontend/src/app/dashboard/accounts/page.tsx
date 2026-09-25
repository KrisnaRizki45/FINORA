'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountsApi } from '@/lib/api/endpoints';
import { formatCurrency, getAccountTypeLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, CreditCard, Landmark, Coins, Briefcase, Trash2 } from 'lucide-react';
import type { Account } from '@/types';
import { AddAccountModal } from '@/components/accounts/add-account-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { useLanguage } from '@/lib/i18n/language-context';
import { usePerPage } from '@/hooks/use-per-page';
import { Skeleton } from '@/components/ui/skeleton';

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'bank': return <Landmark className="h-5 w-5" />;
    case 'credit_card': return <CreditCard className="h-5 w-5" />;
    case 'ewallet': return <Wallet className="h-5 w-5" />;
    case 'cash': return <Coins className="h-5 w-5" />;
    default: return <Briefcase className="h-5 w-5" />;
  }
};

import { DetailModal } from '@/components/ui/detail-modal';

export default function AccountsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'shared' | 'personal'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [accountToView, setAccountToView] = useState<any | null>(null);
  const perPage = usePerPage(6, 4);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t('common.success'));
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('common.error'));
      setDeleteId(null);
    },
  });

  const { data: accountsResponse, isLoading } = useQuery({
    queryKey: ['accounts', page, perPage, filter],
    queryFn: () => {
      const params: any = { page, per_page: perPage };
      if (filter !== 'all') params.owner_type = filter;
      return accountsApi.list(params);
    },
  });

  const accounts = accountsResponse?.data || [];
  const meta = accountsResponse?.meta;
  
  const totalBalance = accountsResponse?.summary?.total_balance ?? accounts.reduce((sum, acc) => sum + Number((acc.current_balance ?? acc.initial_balance) || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in-fade flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        
        <Skeleton className="h-10 w-full sm:w-[320px] rounded-lg" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-3 border-0">
            <CardContent className="p-5 sm:p-6 flex flex-col justify-between items-start">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-48" />
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 flex flex-col shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 px-4 sm:px-6">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in-fade flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('accounts.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('accounts.subtitle')}</p>
        </div>
        <Button className="shadow-md w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('accounts.add_account')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full sm:w-fit">
        <button
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setFilter('all')}
        >
          {t('accounts.all')}
        </button>
        <button
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${filter === 'shared' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setFilter('shared')}
        >
          {t('accounts.shared_only')}
        </button>
        <button
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${filter === 'personal' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setFilter('personal')}
        >
          {t('accounts.personal_only')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {/* Compact & Sleek Total Summary Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-800 to-teal-900 text-white col-span-full relative overflow-hidden rounded-xl">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
            <div>
              <p className="text-emerald-200 font-semibold mb-2 uppercase tracking-wider text-xs">
                {t('accounts.total_balance')} {filter !== 'all' ? `(${filter})` : ''}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(totalBalance)}</h2>
            </div>
            <div className="flex items-center gap-6 text-emerald-100">
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-emerald-200 uppercase tracking-wider text-[10px] sm:text-xs mb-0.5 font-medium">{t('accounts.active_accounts')}</span>
                <span className="text-lg sm:text-2xl font-bold text-white">{meta?.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Cards */}
        {accounts.length === 0 ? (
          <div className="col-span-full p-6 sm:p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <Wallet className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">{t('accounts.no_accounts')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-3 sm:mb-4 text-xs sm:text-sm">{t('accounts.no_accounts_desc')}</p>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>{t('accounts.create_first')}</Button>
          </div>
        ) : (
          accounts.map((account: Account) => (
            <Card key={account.id} onClick={() => setAccountToView(account)} className="cursor-pointer hover-lift border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-emerald-900/5 bg-white dark:bg-gray-900 flex flex-col justify-between">
              <div>
                <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-5 pb-1 sm:pb-2">
                  <div className="flex flex-col pr-1 sm:pr-2 overflow-hidden">
                    <CardTitle className="text-sm sm:text-lg dark:text-white truncate">{account.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[9px] sm:text-xs dark:text-gray-400 truncate">
                      {account.institution || getAccountTypeLabel(account.type)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={(e) => { e.stopPropagation(); setDeleteId(account.id); }}>
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <div className={`p-1.5 sm:p-2 rounded-lg ${account.owner_type === 'shared' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                      <div className="scale-75 sm:scale-100">{getAccountIcon(account.type)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-5 py-3 sm:py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{t('accounts.current_balance')}</span>
                    <span className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white truncate ml-2">{formatCurrency(account.current_balance ?? account.initial_balance, account.currency)}</span>
                  </div>
                </CardContent>
              </div>
              <div className="px-3 py-2 sm:px-5 sm:py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[9px] sm:text-xs font-medium rounded-b-xl mt-2 sm:mt-4">
                <span className={`truncate mr-1 ${account.owner_type === 'shared' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                  {account.owner_type === 'shared' ? t('accounts.shared_account') : t('accounts.personal_account')}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full shrink-0 ${account.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {account.is_active ? t('accounts.active') : t('accounts.inactive')}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {meta && (
        <div className="mt-auto pt-6">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={meta.per_page}
            onPageChange={setPage}
          />
        </div>
      )}

      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if(deleteId) deleteMutation.mutate(deleteId); }}
        title={t('accounts.delete_title')}
        description={t('accounts.delete_desc')}
        isLoading={deleteMutation.isPending}
      />

      <DetailModal 
        isOpen={!!accountToView}
        onClose={() => setAccountToView(null)}
        title="Account Details"
        data={accountToView}
        formatters={{
          initial_balance: (v) => formatCurrency(Number(v)),
          current_balance: (v) => formatCurrency(Number(v)),
          is_active: (v) => v ? 'Yes' : 'No',
          created_at: (v) => new Date(v).toLocaleString(),
          updated_at: (v) => new Date(v).toLocaleString(),
        }}
      />
    </div>
  );
}
