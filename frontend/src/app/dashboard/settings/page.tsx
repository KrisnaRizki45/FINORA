'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';
import { Card } from '@/components/ui/card';
import { 
  User as UserIcon, 
  Users, 
  Tags, 
  Monitor, 
  Globe, 
  Shield, 
  CreditCard, 
  Bell,
  ChevronRight
} from 'lucide-react';

export default function SettingsIndexPage() {
  const { t } = useLanguage();

  const settingsLinks = [
    {
      title: t('settings.tab_profile'),
      description: 'Manage your personal identity and basic info.',
      icon: UserIcon,
      href: '/dashboard/settings/profile',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40'
    },
    {
      title: t('settings.tab_household'),
      description: 'Manage members and base currency.',
      icon: Users,
      href: '/dashboard/settings/household',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/40'
    },
    {
      title: t('settings.tab_categories'),
      description: 'Organize your transaction categories.',
      icon: Tags,
      href: '/dashboard/settings/categories',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/40'
    },
    {
      title: 'Theme & Appearance', // Hardcoded as it's a new tab
      description: 'Customize light/dark mode and appearance.',
      icon: Monitor,
      href: '/dashboard/settings/theme',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/40'
    },
    {
      title: t('settings.tab_language'),
      description: 'Change the language of the application.',
      icon: Globe,
      href: '/dashboard/settings/language',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/40'
    },
    {
      title: t('settings.tab_security'),
      description: 'Update password and account security.',
      icon: Shield,
      href: '/dashboard/settings/security',
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/40'
    },
    {
      title: t('settings.tab_subscription'),
      description: 'Manage billing and features.',
      icon: CreditCard,
      href: '/dashboard/settings/subscription',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/40'
    },
    {
      title: t('settings.tab_notifications'),
      description: 'Choose what updates you want to see.',
      icon: Bell,
      href: '/dashboard/settings/notifications',
      color: 'text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/40'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-4">
        {settingsLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="glass group hover:shadow-md transition-all border-white/50 dark:border-gray-800 p-2 sm:p-4 h-full flex items-center justify-between cursor-pointer shadow-sm sm:shadow">
              <div className="flex items-center gap-3 sm:gap-4 w-full overflow-hidden">
                <div className={`h-7 w-7 sm:h-12 sm:w-12 rounded-full ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-3.5 w-3.5 sm:h-6 sm:w-6 ${item.color}`} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-xs sm:text-base truncate">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1 truncate opacity-75 sm:opacity-100">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
