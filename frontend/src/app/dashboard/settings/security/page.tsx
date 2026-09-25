'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, KeyRound, ShieldAlert } from 'lucide-react';

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Security Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your password and account security.</p>
      </div>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <Input type="password" placeholder="••••••••" className="dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <Input type="password" placeholder="••••••••" className="dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <Input type="password" placeholder="••••••••" className="dark:bg-gray-900" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
            <Lock className="mr-2 h-4 w-4" /> Update Password
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-red-200 dark:border-red-900/50 shadow-lg animate-in fade-in bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-xl text-red-700 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-red-600/70 dark:text-red-400/70">Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-red-200 dark:border-red-900/50 rounded-xl bg-white dark:bg-gray-900">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Delete Account</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permanently remove your account and data.</p>
            </div>
            <Button variant="destructive" className="shrink-0 w-full sm:w-auto shadow-md">
              <ShieldAlert className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
