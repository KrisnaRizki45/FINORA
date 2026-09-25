'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/lib/api/endpoints';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, BarChart4, Coins, Building2, Car, Trash2 } from 'lucide-react';
import type { Asset } from '@/types';
import { AddAssetModal } from '@/components/assets/add-asset-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerPage } from '@/hooks/use-per-page';

const getAssetIcon = (type: string) => {
  switch (type) {
    case 'crypto': return <Coins className="h-5 w-5" />;
    case 'stock': return <TrendingUp className="h-5 w-5" />;
    case 'gold': return <div className="h-5 w-5 rounded-full bg-yellow-400 border-2 border-yellow-500" />;
    case 'property': return <Building2 className="h-5 w-5" />;
    case 'vehicle': return <Car className="h-5 w-5" />;
    default: return <BarChart4 className="h-5 w-5" />;
  }
};

import { DetailModal } from '@/components/ui/detail-modal';

export default function AssetsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'shared' | 'personal'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const perPage = usePerPage(6, 4);

  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assetToView, setAssetToView] = useState<any | null>(null);

  const deleteMutation = useMutation({
    mutationFn: assetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t('common.success'));
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || t('common.error'));
      setDeleteId(null);
    }
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['assets', page, perPage, filter],
    queryFn: () => {
      const params: any = { page, per_page: perPage };
      if (filter !== 'all') params.owner_type = filter;
      return assetsApi.list(params);
    },
  });

  const assets = response?.data || [];
  const meta = response?.meta;

  const getValidNumber = (val: any) => isNaN(Number(val)) || !val ? 0 : Number(val);

  const totalValue = response?.summary?.total_value ?? assets.reduce((sum, asset) => sum + getValidNumber(asset.current_value), 0);
  const totalCostBasis = response?.summary?.total_cost_basis ?? assets.reduce((sum, asset) => sum + (getValidNumber(asset.current_units ?? asset.quantity) * getValidNumber(asset.average_buy_price ?? asset.average_cost)), 0);
  const unrealizedReturn = totalValue - totalCostBasis;
  const returnPercentage = totalCostBasis > 0 ? (unrealizedReturn / totalCostBasis) * 100 : 0;

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-3 border-0">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('wealth.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('wealth.subtitle')}</p>
        </div>
        <Button className="shadow-md w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('wealth.add_asset')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {/* Compact & Sleek Portfolio Summary Card */}
        <Card className="border-0 bg-gradient-to-br from-indigo-900 to-purple-900 text-white shadow-lg shadow-purple-900/20 col-span-full lg:col-span-3 overflow-hidden relative rounded-xl">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <CardContent className="p-5 pt-5 sm:p-6 sm:pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-6">
            <div>
              <p className="text-indigo-200 font-semibold mb-2 uppercase tracking-wider text-xs sm:text-sm">{t('wealth.total_portfolio_value')}</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight break-words leading-tight">{formatCurrency(totalValue)}</h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-start sm:items-end">
                <p className="text-indigo-200 font-semibold mb-0.5 uppercase tracking-wider text-xs">{t('wealth.total_return')}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-base sm:text-lg font-bold ${unrealizedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {unrealizedReturn >= 0 ? '+' : ''}{formatCurrency(unrealizedReturn)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${unrealizedReturn >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {unrealizedReturn >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="col-span-full flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full sm:w-fit">
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            {t('wealth.all_assets')}
          </button>
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${filter === 'shared' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setFilter('shared')}
          >
            {t('wealth.shared')}
          </button>
          <button
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${filter === 'personal' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setFilter('personal')}
          >
            {t('wealth.personal')}
          </button>
        </div>

        {/* Asset Cards */}
        {assets.length === 0 ? (
          <div className="col-span-full p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <BarChart4 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('wealth.no_assets')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4 text-sm">{t('wealth.no_assets_desc')}</p>
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>{t('wealth.add_asset')}</Button>
          </div>
        ) : (
          assets.map((asset: any) => {
            const qty = getValidNumber(asset.current_units ?? asset.quantity);
            const avgCost = getValidNumber(asset.average_buy_price ?? asset.average_cost);
            const cost = qty * avgCost;
            const value = getValidNumber(asset.current_value);
            const profit = value - cost;
            const isProfit = profit >= 0;
            const returnPct = cost > 0 ? (profit / cost) * 100 : 0;

            return (
              <Card key={asset.id} onClick={() => setAssetToView(asset)} className="cursor-pointer hover-lift border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-emerald-900/5 flex flex-col justify-between bg-white dark:bg-gray-900">
                <div>
                  <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-5 pb-1 sm:pb-2">
                    <div className="flex flex-col pr-1 sm:pr-2 overflow-hidden">
                      <CardTitle className="text-sm sm:text-lg dark:text-white truncate">{asset.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-0.5 sm:mt-1 font-mono text-[9px] sm:text-xs dark:text-gray-400 truncate">
                        {asset.type.toUpperCase()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <div className="scale-75 sm:scale-100">{getAssetIcon(asset.type)}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50" onClick={(e) => { e.stopPropagation(); setAssetToEdit(asset); setIsAddModalOpen(true); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scale-75 sm:scale-100"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={(e) => { e.stopPropagation(); setDeleteId(asset.id); }}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-5 py-2 sm:py-4">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{t('wealth.current_value') || 'Current Value'}</span>
                        <span className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white truncate">{formatCurrency(value, asset.currency)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Return</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] sm:text-sm font-bold truncate ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isProfit ? '+' : ''}{formatCurrency(profit, asset.currency)}
                          </span>
                          <span className={`text-[8px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium ${isProfit ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-red-500/20 text-red-600 dark:text-red-300'}`}>
                            {isProfit ? '+' : ''}{returnPct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] sm:text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400 font-medium truncate">{t('wealth.holdings')}</span>
                        <span className="font-bold text-gray-900 dark:text-white truncate ml-2">{qty} {asset.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400 font-medium truncate">{t('wealth.avg_cost')}</span>
                        <span className="font-bold text-gray-900 dark:text-white truncate ml-2">{formatCurrency(avgCost)}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
                <div className="px-3 py-2 sm:px-5 sm:py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[9px] sm:text-xs font-medium rounded-b-xl mt-2 sm:mt-3">
                  <span className={`truncate mr-1 ${asset.owner_type === 'shared' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                    {asset.owner_type === 'shared' ? t('wealth.shared_asset') : t('wealth.personal_asset')}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full shrink-0 ${asset.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {asset.type}
                  </span>
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

      {isAddModalOpen && (
        <AddAssetModal 
          isOpen={isAddModalOpen} 
          onClose={() => { setIsAddModalOpen(false); setAssetToEdit(null); }} 
          assetToEdit={assetToEdit}
        />
      )}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        title={t('wealth.delete_title')}
        description={t('wealth.delete_desc')}
        isLoading={deleteMutation.isPending}
      />
      <DetailModal 
        isOpen={!!assetToView}
        onClose={() => setAssetToView(null)}
        title="Asset Details"
        data={assetToView}
        formatters={{
          current_value: (v) => formatCurrency(Number(v)),
          currency_rate: (v) => formatCurrency(Number(v)),
          average_buy_price: (v) => formatCurrency(Number(v)),
          average_cost: (v) => formatCurrency(Number(v)),
          created_at: (v) => new Date(v).toLocaleString(),
          updated_at: (v) => new Date(v).toLocaleString(),
        }}
      />
    </div>
  );
}
