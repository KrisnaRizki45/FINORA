'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';

export default function LanguageSettingsPage() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.tab_language')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Choose your preferred language.</p>
      </div>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Language Preferences</CardTitle>
          <CardDescription>Select the language used throughout the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                language === 'en' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div>
                <span className="block font-medium text-gray-900 dark:text-white">English</span>
                <span className="text-xs text-gray-500">United States</span>
              </div>
              <span className="text-2xl">🇺🇸</span>
            </button>
            <button
              onClick={() => setLanguage('id')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                language === 'id' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div>
                <span className="block font-medium text-gray-900 dark:text-white">Bahasa Indonesia</span>
                <span className="text-xs text-gray-500">Indonesia</span>
              </div>
              <span className="text-2xl">🇮🇩</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
