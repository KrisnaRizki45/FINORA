'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationsSettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.tab_notifications')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage how you receive alerts.</p>
      </div>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Notification Preferences</CardTitle>
          <CardDescription>Choose what updates you want to see.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Email Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly summaries and important alerts via email.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Budget Warnings</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you exceed 80% of a budget.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">New Transactions</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Alert me when a household member adds a transaction.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
