'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/profile/avatar-upload';

export default function ProfileSettingsPage() {
  const { session, user, isLoading } = useAuth();
  const { t } = useLanguage();
  const metadata = session?.user?.user_metadata || {};
  
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileTimezone, setProfileTimezone] = useState('Asia/Jakarta');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user || session) {
      setProfileName(user?.name || metadata.name || '');
      setProfilePhone(metadata.phone || '');
      setProfileDob(metadata.dob || '');
      setProfileTimezone(metadata.timezone || 'Asia/Jakarta');
    }
  }, [user, session]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profileName,
          phone: profilePhone,
          dob: profileDob,
          timezone: profileTimezone,
        }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.tab_profile')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Update your personal information.</p>
      </div>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Personal Information</CardTitle>
          <CardDescription>Manage your identity on Finora.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
            
            <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <AvatarUpload user={user} />
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <Input 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)} 
                required 
                className="dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <Input value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <Input 
                value={profilePhone} 
                onChange={(e) => setProfilePhone(e.target.value)} 
                className="dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
              <Input 
                type="date"
                value={profileDob} 
                onChange={(e) => setProfileDob(e.target.value)} 
                className="dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
              <Input 
                value={profileTimezone} 
                onChange={(e) => setProfileTimezone(e.target.value)} 
                className="dark:bg-gray-900"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6">
          <Button 
            type="submit" 
            form="profile-form"
            disabled={isSavingProfile}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-[0.98]"
          >
            {isSavingProfile ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
