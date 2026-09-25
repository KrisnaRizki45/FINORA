import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Settings, ChevronDown, ChevronUp, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ProfileDropdownProps {
  direction?: 'up' | 'down';
}

export function ProfileDropdown({ direction = 'down' }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const executeLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold shrink-0 shadow-sm border border-emerald-200 dark:border-emerald-800/50 overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="hidden md:flex flex-col items-start overflow-hidden text-left">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate w-32">{user?.name || 'User'}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-32">{user?.email || 'user@example.com'}</span>
        </div>
        {direction === 'up' ? (
          <ChevronUp className={`hidden md:block h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        ) : (
          <ChevronDown className={`hidden md:block h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-xl dark:shadow-gray-950 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none animate-in fade-in zoom-in-95
            ${direction === 'up' 
              ? 'bottom-full left-0 mb-2 origin-bottom-left' 
              : 'top-full right-0 mt-2 origin-top-right'
            }`}
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 md:hidden">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
          </div>
          
          <div className="p-1">
            <Link 
              href="/dashboard/settings/profile" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <UserIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              Edit Profile
            </Link>
            <Link 
              href="/dashboard/settings" 
              onClick={() => setIsOpen(false)}
              className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              Settings
            </Link>

            {user?.role === 'admin' && !pathname.startsWith('/admin') && (
              <Link 
                href="/admin" 
                onClick={() => setIsOpen(false)}
                className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
              >
                <Shield className="mr-3 h-4 w-4 text-amber-500 dark:text-amber-500 group-hover:text-amber-600" />
                Admin Panel
              </Link>
            )}

            {user?.role === 'admin' && pathname.startsWith('/admin') && (
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors"
              >
                <LayoutDashboard className="mr-3 h-4 w-4 text-emerald-500 dark:text-emerald-500 group-hover:text-emerald-600" />
                User Panel
              </Link>
            )}
          </div>
          
          <div className="p-1 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={handleLogoutClick}
              className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" />
              Log out
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={executeLogout}
        title="Confirm Logout"
        description="Are you sure you want to leave? You will need to sign in again to access your household."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
      />
    </div>
  );
}
