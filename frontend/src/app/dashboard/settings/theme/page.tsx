'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Theme & Appearance</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Customize how Finora looks on your device.</p>
      </div>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Display Theme</CardTitle>
          <CardDescription>Select your preferred color scheme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === 'light' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Sun className="h-6 w-6 text-orange-500" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Light</span>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === 'dark' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <Moon className="h-6 w-6 text-indigo-500" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Dark</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === 'system' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">System Default</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
