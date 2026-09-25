'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '@/lib/supabase/client';
import { authApi } from '@/lib/api/endpoints';
import type { User, Household } from '@/types';
import type { Session } from '@supabase/supabase-js';

// ──────────────────────────────────────────────
// Auth Context — Finora
// Manages Supabase auth session + syncs with Laravel backend.
// ──────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  household: Household | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHousehold: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, metadata?: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Sync with Laravel backend — creates/updates local user record.
   */
  const syncWithBackend = useCallback(async () => {
    try {
      const response = await authApi.login();
      if (response.success) {
        setUser(response.data.user);
        setHousehold(response.data.household);
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  }, []);

  /**
   * Fetch current user from backend.
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      if (response.success) {
        setUser(response.data.user);
        setHousehold(response.data.household);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  /**
   * Listen for Supabase auth state changes.
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        syncWithBackend().finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      
      if (event === 'SIGNED_IN') {
        localStorage.setItem('finora_login_time', Date.now().toString());
        syncWithBackend();
      } else if (event === 'TOKEN_REFRESHED') {
        syncWithBackend();
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('finora_login_time');
        setUser(null);
        setHousehold(null);
      }
    });

    // Check for 6-hour session timeout
    const checkSessionTimeout = () => {
      const loginTime = localStorage.getItem('finora_login_time');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        if (elapsed > SIX_HOURS) {
          supabase.auth.signOut().then(() => {
            window.location.href = '/login';
          });
        }
      }
    };
    
    // Check initially and set an interval
    checkSessionTimeout();
    const intervalId = setInterval(checkSessionTimeout, 5 * 60 * 1000); // Check every 5 mins

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [syncWithBackend]);

  /**
   * Login with email + password via Supabase.
   */
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  /**
   * Register a new user via Supabase.
   */
  const register = async (email: string, password: string, name: string, metadata: any = {}) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, ...metadata },
      },
    });
    if (error) throw error;
  };

  /**
   * Logout — clear Supabase session + notify backend.
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Backend logout is best-effort
    }
    await supabase.auth.signOut();
    setUser(null);
    setHousehold(null);
    setSession(null);
  };

  // [TEMPORARY] Set to true to bypass login and view dashboard
  const BYPASS_AUTH = false;

  return (
    <AuthContext.Provider
      value={{
        user: BYPASS_AUTH ? { id: 'dummy', name: 'Guest Viewer', email: 'guest@example.com' } as any : user,
        household: BYPASS_AUTH ? { id: 'dummy-hh', name: 'Guest Household', currency: 'IDR' } as any : household,
        session,
        isLoading: BYPASS_AUTH ? false : isLoading,
        isAuthenticated: BYPASS_AUTH ? true : (!!session && !!user),
        hasHousehold: BYPASS_AUTH ? true : !!household,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
