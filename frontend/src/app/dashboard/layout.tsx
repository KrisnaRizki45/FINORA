'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  PieChart, 
  Target, 
  Settings,
  Menu,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/layout/profile-dropdown';
import { useLanguage } from '@/lib/i18n/language-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hasHousehold, isLoading, logout, user, household } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!hasHousehold) {
        router.push('/setup-household');
      }
    }
  }, [isAuthenticated, hasHousehold, isLoading, router]);

  if (isLoading || !isAuthenticated || !hasHousehold) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  const navItems = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.accounts'), href: '/dashboard/accounts', icon: Wallet },
    { name: t('nav.transactions'), href: '/dashboard/transactions', icon: ArrowRightLeft },
    { name: t('nav.wealth'), href: '/dashboard/assets', icon: Target },
    { name: t('nav.budgets'), href: '/dashboard/budgets', icon: PieChart },
    { name: t('nav.ai_assistant'), href: '/dashboard/ai-assistant', icon: Sparkles },
    { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10">
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6 gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <span className="text-lg font-bold text-white">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Finora</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-3 border border-emerald-100 dark:border-emerald-800/40">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">{t('nav.household')}</p>
              <p className="font-semibold text-gray-900 dark:text-white truncate">{household?.name}</p>
            </div>
          </div>
          <nav className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-center w-full">
          <ProfileDropdown direction="up" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 px-4 md:hidden backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Finora</span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 rounded-sm uppercase tracking-wider truncate max-w-[120px]">{household?.name}</span>
            </div>
          </div>
          <ProfileDropdown />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 flex flex-col">
          <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col min-h-[calc(100vh-10rem)]">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-between border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg px-2 pb-0 mb-0 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}`}>
                  <item.icon className={`h-5 w-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                </div>
                <span className="text-[9px] font-medium tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
