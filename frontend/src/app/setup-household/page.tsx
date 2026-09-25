'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { householdApi } from '@/lib/api/endpoints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SetupHouseholdPage() {
  const { user, isAuthenticated, hasHousehold, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Security redirect
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (hasHousehold) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, hasHousehold, isLoading, router]);

  if (isLoading || !isAuthenticated || hasHousehold) {
    return null; // Will redirect
  }

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await householdApi.create({ name: householdName });
      if (res.success) {
        await refreshUser(); // Update auth context with new household
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.errors?.[0] || err.message || 'Failed to create household');
      setIsSubmitting(false);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await householdApi.join({ code: inviteCode });
      if (res.success) {
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired invitation code');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-100/50 blur-[100px] opacity-70" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-in-fade relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to Finora, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-lg text-gray-600">Let's set up your shared financial space.</p>
        </div>

        {mode === 'select' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card 
              className="glass hover-lift cursor-pointer border-emerald-100 shadow-emerald-900/5 transition-all hover:border-emerald-500"
              onClick={() => setMode('create')}
            >
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <Home className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create New</h3>
                <p className="text-gray-500 mb-6">Start a fresh household and invite your partner later.</p>
                <Button className="w-full mt-auto" variant="outline">
                  Create Household
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="glass hover-lift cursor-pointer border-blue-100 shadow-blue-900/5 transition-all hover:border-blue-500"
              onClick={() => setMode('join')}
            >
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join Partner</h3>
                <p className="text-gray-500 mb-6">Enter an invitation code sent by your partner.</p>
                <Button className="w-full mt-auto" variant="outline">
                  Enter Code
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'create' && (
          <Card className="glass shadow-xl animate-in-slide-up">
            <CardHeader>
              <CardTitle>Create a Household</CardTitle>
              <CardDescription>Give your shared financial space a name.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHousehold} className="space-y-6">
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Household Name</label>
                  <Input 
                    placeholder="e.g. The Smiths" 
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    required
                    className="h-12 text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500">You can change this later in settings.</p>
                </div>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setMode('select')}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : (
                      <>Create & Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="glass shadow-xl animate-in-slide-up">
            <CardHeader>
              <CardTitle>Join your Partner</CardTitle>
              <CardDescription>Enter the 6-character code provided by your partner.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinHousehold} className="space-y-6">
                {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Household Code</label>
                  <Input 
                    placeholder="e.g. FN-392A" 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                    maxLength={10}
                    className="h-12 font-mono text-center text-xl uppercase tracking-widest"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setMode('select')}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
                    {isSubmitting ? 'Joining...' : (
                      <>Join Household <CheckCircle2 className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
