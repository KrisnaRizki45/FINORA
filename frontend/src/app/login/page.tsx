'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 dark:bg-gray-950 py-12 sm:px-6 lg:px-8 selection:bg-emerald-200 dark:selection:bg-emerald-900 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100 dark:bg-emerald-900/30 blur-[100px] opacity-70" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-50 dark:bg-teal-900/20 blur-[100px] opacity-70" />

      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in-slide-up relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Finora</span>
          </Link>
        </div>
        
        <Card className="glass shadow-xl shadow-gray-200/50 dark:shadow-none border-white/50 dark:border-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your email and password to access your secure vault.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="partner@example.com" 
                    className="pl-10 h-12 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
                  <Link href="/reset-password" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="pl-10 pr-10 h-12 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium mt-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in to Finora <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
                Create a free account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
