'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

export default function SubscriptionSettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.tab_subscription')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your billing and plan.</p>
      </div>

      <Card className="glass shadow-lg border-emerald-200 dark:border-emerald-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Current Plan: Free Tier</CardTitle>
              <CardDescription>You are on the basic free tier.</CardDescription>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Active
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {['Basic transaction tracking', 'Up to 2 household members', 'Standard reports'].map((feature, i) => (
              <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 pt-6">
          <Button variant="outline" className="w-full">Upgrade Plan (Coming Soon)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
