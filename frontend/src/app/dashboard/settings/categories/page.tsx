'use client';

import { CategoryManager } from '@/components/categories/category-manager';
import { useLanguage } from '@/lib/i18n/language-context';

export default function CategoriesSettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.tab_categories')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Organize your transaction categories.</p>
      </div>

      <div className="glass rounded-xl border border-white/50 dark:border-gray-800 p-6 shadow-sm bg-white/50 dark:bg-gray-950/50">
        <CategoryManager />
      </div>
    </div>
  );
}
