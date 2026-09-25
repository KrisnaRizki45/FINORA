'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIndex = pathname === '/dashboard/settings';

  return (
    <div className="w-full animate-in fade-in">
      {!isIndex && (
        <div className="max-w-3xl mx-auto mb-4 sm:mb-6">
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
