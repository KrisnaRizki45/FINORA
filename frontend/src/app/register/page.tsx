'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, Calendar, Phone, Globe, Type } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta');
  const [language, setLanguage] = useState('id');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !dob) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      toast.error('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    // Basic Date Validation
    const birthDate = new Date(dob);
    const today = new Date();
    if (birthDate >= today) {
      toast.error('Invalid Date of Birth.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, name, {
        dob,
        phone,
        timezone,
        language
      });
      toast.success('Account created successfully!');
      window.location.href = '/setup-household';
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 dark:bg-gray-950 py-12 sm:px-6 lg:px-8 selection:bg-emerald-200 dark:selection:bg-emerald-900 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-100 dark:bg-emerald-900/30 blur-[100px] opacity-70" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-50 dark:bg-blue-900/20 blur-[100px] opacity-70" />

      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl animate-in-slide-up relative z-10 mt-12 mb-12">
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
            <CardTitle className="text-2xl font-bold text-center dark:text-white">Create an account</CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Start mastering your shared finances today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Krisna Wijaya" 
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="partner@example.com" 
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-10 pr-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      minLength={8}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="dob">Date of Birth *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <Input 
                      id="dob" 
                      type="date" 
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="phone">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+62 812..." 
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="timezone">Timezone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Globe className="h-5 w-5" />
                    </div>
                    <Input 
                      id="timezone" 
                      type="text" 
                      className="pl-10 h-11 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="language">Preferred Language</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Type className="h-5 w-5" />
                    </div>
                    <select 
                      id="language"
                      className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent pl-10 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:bg-gray-900 dark:text-white"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="id">Indonesian (ID)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    I agree to the <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link>
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    id="privacy" 
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-950"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    I acknowledge that I have read the <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium mt-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
