'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/endpoints';
import { formatCurrency, formatDate, getTransactionTypeColor, getTransactionTypeLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft, TrendingUp, TrendingDown, Filter, Trash2 } from 'lucide-react';
import type { Transaction } from '@/types';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { AddTransferModal } from '@/components/transactions/add-transfer-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/language-context';
import { usePerPage } from '@/hooks/use-per-page';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailModal } from '@/components/ui/detail-modal';

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);
  const [txToView, setTxToView] = useState<any | null>(null);

  const perPage = usePerPage(10, 7);

  const { data: response, isLoading } = useQuery({
    queryKey: ['transactions', page, filterType, perPage],
    queryFn: () => {
      const params: any = { page, per_page: perPage };
      if (filterType !== 'all') params.type = filterType;
      return transactionsApi.list(params);
    },
  });

  const transactions = response?.data || [];
  const meta = response?.meta;

  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t('common.success'));
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('common.error'));
      setDeleteId(null);
    }
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-2 shrink-0"><TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>;
      case 'expense': return <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-2 shrink-0"><TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" /></div>;
      case 'transfer': return <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-2 shrink-0"><ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>;
      default: return null;
    }
  };

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'all': return t('tx.all');
      case 'expense': return t('tx.expense');
      case 'income': return t('tx.income');
      case 'transfer': return t('tx.transfer');
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-in-fade flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('tx.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('tx.subtitle')}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsAddTransferOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> {t('tx.transfer')}
          </Button>
          <Button className="flex-1 sm:flex-none shadow-md" onClick={() => setIsAddTransactionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('tx.add_record')}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Responsive Filter Header */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 border-b border-gray-100 dark:border-gray-800 gap-3">
          <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full sm:w-auto">
            {['all', 'expense', 'income', 'transfer'].map((type) => (
              <button
                key={type}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all ${filterType === type ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setFilterType(type)}
              >
                {getFilterLabel(type)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> {t('tx.more_filters')}
          </Button>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <ArrowRightLeft className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('tx.no_transactions')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('tx.no_transactions_desc')}</p>
            </div>
          ) : (
            <div>
              {/* Mobile View: Stacked Card List (eliminates text collision & horizontal squishing) */}
              <div className="block sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map((tx: Transaction) => (
                  <div key={tx.id} onClick={() => setTxToView(tx)} className="cursor-pointer group px-3 py-2 sm:p-4 flex items-start justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {getTransactionIcon(tx.type)}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm break-words leading-tight">
                          {tx.description || getTransactionTypeLabel(tx.type)}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.transaction_date)}</span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          {tx.type === 'transfer' ? (
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                              {tx.transfer?.from_account?.name} → {tx.transfer?.to_account?.name}
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-medium truncate max-w-[100px]">
                                {tx.category?.name || t('tx.uncategorized')}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[90px]">
                                {tx.account?.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className={`font-bold text-sm sm:text-base ${getTransactionTypeColor(tx.type)}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 mt-1" 
                        onClick={(e) => { e.stopPropagation(); setDeleteId(tx.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet / Desktop View: Full Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t('tx.details')}</th>
                      <th className="px-6 py-4 font-semibold">{t('tx.category')}</th>
                      <th className="px-6 py-4 font-semibold">{t('tx.account')}</th>
                      <th className="px-6 py-4 font-semibold text-right">{t('tx.amount')}</th>
                      <th className="px-4 py-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.map((tx: Transaction) => (
                      <tr key={tx.id} onClick={() => setTxToView(tx)} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(tx.type)}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {tx.description || getTransactionTypeLabel(tx.type)}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{formatDate(tx.transaction_date)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {tx.type === 'transfer' ? (
                            <span className="text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{t('tx.internal_transfer')}</span>
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{tx.category?.name || t('tx.uncategorized')}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {tx.type === 'transfer' ? (
                            <div className="flex items-center text-xs">
                              <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{tx.transfer?.from_account?.name}</span>
                              <ArrowRightLeft className="h-3 w-3 mx-1 text-gray-400 dark:text-gray-500 shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{tx.transfer?.to_account?.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-gray-700 dark:text-gray-300">{tx.account?.name}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">{tx.account?.owner_type === 'shared' ? 'Shared' : 'Personal'}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${getTransactionTypeColor(tx.type)}`}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50" 
                            onClick={(e) => { e.stopPropagation(); setDeleteId(tx.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
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

      <AddTransactionModal 
        isOpen={isAddTransactionOpen} 
        onClose={() => setIsAddTransactionOpen(false)} 
      />
      <AddTransferModal 
        isOpen={isAddTransferOpen} 
        onClose={() => setIsAddTransferOpen(false)} 
      />
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if(deleteId) deleteMutation.mutate(deleteId); }}
        title={t('tx.delete_title')}
        description={t('tx.delete_desc')}
        isLoading={deleteMutation.isPending}
      />

      <DetailModal 
        isOpen={!!txToView}
        onClose={() => setTxToView(null)}
        title="Transaction Details"
        data={txToView}
        formatters={{
          amount: (v) => formatCurrency(Number(v)),
          transaction_date: (v) => new Date(v).toLocaleDateString(),
          category: (v) => v?.name || 'N/A',
          account: (v) => v?.name || 'N/A',
          transfer: (v) => v ? `Transfer from ${v.from_account?.name || 'Unknown'} to ${v.to_account?.name || 'Unknown'}` : null,
          created_at: (v) => new Date(v).toLocaleString(),
          updated_at: (v) => new Date(v).toLocaleString(),
        }}
      />
    </div>
  );
}
