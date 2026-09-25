'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, TrendingDown, CheckCircle2, Trash2 } from 'lucide-react';
import { AddBudgetModal } from '@/components/budgets/add-budget-modal';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { useLanguage } from '@/lib/i18n/language-context';
import { usePerPage } from '@/hooks/use-per-page';
import { DetailModal } from '@/components/ui/detail-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetsPage() {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [budgetToView, setBudgetToView] = useState<any | null>(null);
  const perPage = usePerPage(6, 4);

  const { data: response, isLoading } = useQuery({
    queryKey: ['budgets', page, perPage],
    queryFn: () => budgetsApi.list({ page, per_page: perPage }),
  });

  const budgets = response?.data || [];
  const meta = response?.meta;
  
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success(t('common.success'));
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('common.error'));
      setDeleteId(null);
    }
  });

  const totalBudget = response?.summary?.total_budget ?? budgets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
  const totalSpent = response?.summary?.total_spent ?? budgets.reduce((sum: number, b: any) => sum + Number(b.current_spent), 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverallDanger = overallProgress >= 90;

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
        
        <Card className="col-span-full lg:col-span-3 border-0">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-48" />
            </div>
            <div className="w-full sm:w-1/2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in-fade flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('budgets.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('budgets.subtitle')}</p>
        </div>
        <Button className="shadow-md bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('budgets.create_budget')}
        </Button>
      </div>

      {budgets.length > 0 && (
        <Card className={`text-white shadow-lg ${isOverallDanger ? 'bg-gradient-to-br from-red-600 to-rose-900 shadow-red-900/20' : 'bg-gradient-to-br from-orange-600 to-pink-700 shadow-pink-900/20'} overflow-hidden relative rounded-xl border-0`}>
          <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-40 w-40 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />
          
          <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4">
            <div className="w-full sm:w-auto">
              <p className="text-white/80 font-semibold mb-1 uppercase tracking-wider text-xs">{t('budgets.total_spending')}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(totalSpent)}</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1">
                {t('tx.of')} {formatCurrency(totalBudget)} {t('budgets.limit').toLowerCase()}
              </p>
            </div>
            
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs sm:text-sm font-medium text-white/90">{t('budgets.overall_health')}</span>
                <span className="text-xs sm:text-sm font-bold">{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverallDanger ? 'bg-red-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, overallProgress)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {budgets.length === 0 ? (
          <div className="col-span-full p-6 sm:p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <TrendingDown className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white">{t('budgets.no_budgets')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-3 sm:mb-4 text-[10px] sm:text-sm">{t('budgets.no_budgets_desc')}</p>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>{t('budgets.create_budget')}</Button>
          </div>
        ) : (
          budgets.map((budget: any) => {
            const percentage = budget.progress_percentage;
            const isWarning = percentage >= 80 && percentage < 100;
            const isDanger = percentage >= 100;
            
            let colorClass = 'bg-emerald-500';
            if (isWarning) colorClass = 'bg-yellow-500';
            if (isDanger) colorClass = 'bg-red-500';

            return (
              <Card key={budget.id} onClick={() => setBudgetToView(budget)} className="cursor-pointer hover-lift transition-all border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500/30 hover:shadow-emerald-900/5 flex flex-col justify-between bg-white dark:bg-gray-900">
                <div>
                  <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-5 pb-1 sm:pb-2">
                    <div className="flex items-center gap-1.5 sm:gap-3 pr-1 sm:pr-2 overflow-hidden">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                        {budget.category?.icon ? <span className="text-xs sm:text-base">{budget.category.icon}</span> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <CardTitle className="text-[11px] sm:text-lg dark:text-white truncate">{budget.category?.name || 'Unknown Category'}</CardTitle>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      {isDanger ? (
                        <AlertCircle className="h-3 w-3 sm:h-5 sm:w-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 text-emerald-500 opacity-20" />
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={(e) => { e.stopPropagation(); setDeleteId(budget.id); }}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-5 py-2 sm:py-4 pb-3 sm:pb-5">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{t('budgets.spent')}</span>
                        <span className={`text-sm sm:text-xl font-bold truncate ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                          {formatCurrency(budget.current_spent)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{t('budgets.limit')}</span>
                        <span className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                          {formatCurrency(budget.amount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-1.5 sm:h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2 sm:mt-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-1.5 sm:mt-2 text-[8px] sm:text-xs">
                      <span className={`font-bold ${isDanger ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {percentage}% {t('budgets.used')}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 truncate max-w-[60px] sm:max-w-[120px]">
                        {isDanger ? t('budgets.over_budget') : `${formatCurrency(budget.remaining)} ${t('budgets.left')}`}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })
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

      <AddBudgetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if(deleteId) deleteMutation.mutate(deleteId); }}
        title={t('budgets.delete_title')}
        description={t('budgets.delete_desc')}
        isLoading={deleteMutation.isPending}
      />

      <DetailModal 
        isOpen={!!budgetToView}
        onClose={() => setBudgetToView(null)}
        title="Budget Details"
        data={budgetToView}
        formatters={{
          amount: (v) => formatCurrency(Number(v)),
          current_spent: (v) => formatCurrency(Number(v)),
          remaining: (v) => formatCurrency(Number(v)),
          category: (v) => v?.name || 'Unknown',
          created_at: (v) => new Date(v).toLocaleString(),
          updated_at: (v) => new Date(v).toLocaleString(),
        }}
      />
    </div>
  );
}
