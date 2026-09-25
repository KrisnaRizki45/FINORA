'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memproses autentikasi...');

  useEffect(() => {
    const handleAuth = async () => {
      // For implicit flow (hash containing access_token) or PKCE (query containing code)
      const hash = window.location.hash;
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard';
      const error_description = searchParams.get('error_description');
      
      if (error_description) {
        setStatus('error');
        setMessage(error_description);
        return;
      }

      // If we have a code, exchange it (PKCE)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus('error');
          setMessage('Tautan tidak valid atau sudah kadaluarsa.');
          return;
        }
      }

      // Check if session exists now
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setStatus('success');
        
        // Determine if it was a password reset or email confirm
        const type = searchParams.get('type') || (hash.includes('type=recovery') ? 'recovery' : 'signup');
        
        if (type === 'recovery') {
          setMessage('Verifikasi berhasil! Silakan perbarui kata sandi Anda.');
          // Redirect after 2.5 seconds
          setTimeout(() => {
            router.push('/dashboard/settings/profile'); 
          }, 2500);
        } else {
          setMessage('Selamat, akun Anda berhasil diaktifkan! Mengarahkan ke Dashboard...');
          // Redirect after 2.5 seconds
          setTimeout(() => {
            router.push(next);
          }, 2500);
        }
      } else {
        setStatus('error');
        setMessage('Gagal memverifikasi sesi. Silakan coba login kembali.');
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-100 dark:border-gray-800 animate-in zoom-in duration-300">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Mohon Tunggu</h2>
              <p className="text-gray-500 dark:text-gray-400">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Berhasil!</h2>
              <p className="text-gray-500 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Otentikasi Gagal</h2>
              <p className="text-red-500 dark:text-red-400 mb-4">{message}</p>
              <Button 
                onClick={() => router.push('/login')}
                className="bg-emerald-600 hover:bg-emerald-700 w-full mt-4"
              >
                Kembali ke Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
