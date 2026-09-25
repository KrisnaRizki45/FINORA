'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Loader2, Users, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProfileDropdown } from '@/components/layout/profile-dropdown';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (!isClient || isLoading || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Finora Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-3 lg:col-span-2">
          <nav className="space-y-1">
            {links.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  <Icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}
