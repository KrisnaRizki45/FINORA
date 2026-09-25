'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { householdApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Users, Copy, Check, MoreVertical, LogOut, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/language-context';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function HouseholdSettingsPage() {
  const { household, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const [householdName, setHouseholdName] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (household) {
      setHouseholdName(household.name || '');
      setCurrency(household.currency || 'IDR');
    }
  }, [household]);

  const { data: householdResponse, isLoading: isHouseholdLoading } = useQuery({
    queryKey: ['household'],
    queryFn: () => householdApi.get(),
  });
  const freshHousehold = householdResponse?.data || household;

  const { data: membersResponse, isLoading: isMembersLoading } = useQuery({
    queryKey: ['householdMembers'],
    queryFn: () => householdApi.getMembers(),
  });
  const members = membersResponse?.data || [];

  const updateMutation = useMutation({
    mutationFn: householdApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
      toast.success('Household settings saved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update household settings');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: householdApi.removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['householdMembers'] });
      toast.success('Member removed successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to remove member')
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: 'owner' | 'member' }) => householdApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['householdMembers'] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update role')
  });

  const leaveMutation = useMutation({
    mutationFn: householdApi.leave,
    onSuccess: () => {
      toast.success('You have left the household');
      window.location.href = '/dashboard';
    },
    onError: (error: any) => toast.error(error.message || 'Failed to leave household')
  });

  const handleSaveHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) {
      toast.error('Household name cannot be empty');
      return;
    }
    updateMutation.mutate({ name: householdName, currency });
  };

  const copyInviteCode = () => {
    if (freshHousehold?.invite_code) {
      navigator.clipboard.writeText(freshHousehold.invite_code);
      setIsCopied(true);
      toast.success('Invite code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isAuthLoading || isHouseholdLoading || isMembersLoading) {
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
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
        
        <Card className="glass shadow-lg border-white/50 dark:border-gray-800 mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('settings.tab_household')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your family's shared financial workspace.</p>
      </div>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Household Details</CardTitle>
          <CardDescription>Update the name and base currency for your household.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="household-form" onSubmit={handleSaveHousehold} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Household Name</label>
              <Input 
                value={householdName} 
                onChange={(e) => setHouseholdName(e.target.value)} 
                required 
                className="dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="IDR">IDR - Indonesian Rupiah</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6">
          <Button 
            type="submit" 
            form="household-form"
            disabled={updateMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-[0.98]"
          >
            {updateMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Members & Invites</CardTitle>
          <CardDescription>See who has access to this household.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Invite Code</p>
              <p className="text-2xl font-bold font-mono tracking-widest text-emerald-600 dark:text-emerald-400">
                {freshHousehold?.invite_code || '------'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={copyInviteCode} className="bg-white dark:bg-gray-900 shadow-sm w-full sm:w-auto">
              {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 mr-2" />}
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Active Members</h4>
            </div>
            <div className="space-y-2">
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <Users className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">No active members found</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">Share your invite code above to invite family members.</p>
                </div>
              ) : (
                members.map((member: any) => (
                  <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">
                            {member.name?.charAt(0) || <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.name} {member.is_current_user && <span className="text-gray-400 font-normal">(You)</span>}
                          </p>
                          {member.role === 'owner' && (
                            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[11px] text-gray-500 truncate leading-none mt-0.5">{member.email}</p>
                        <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">Joined on {format(new Date(member.joined_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end mt-1 sm:mt-0 pt-1 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium ring-1 ring-inset ${member.role === 'owner' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20'}`}>
                      {member.role === 'owner' ? 'Owner' : 'Member'}
                    </span>
                    
                    <div className="flex gap-1.5 sm:gap-2 shrink-0">
                      {member.is_current_user ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => { if(confirm('Are you sure you want to leave this household?')) leaveMutation.mutate(); }} 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-6 sm:h-8 text-xs px-2"
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Leave</span>
                        </Button>
                      ) : (
                        <>
                          {members.find((m: any) => m.is_current_user)?.role === 'owner' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateRoleMutation.mutate({ userId: member.user_id, role: member.role === 'owner' ? 'member' : 'owner' })}
                                className="h-6 sm:h-8 text-[10px] sm:text-xs px-1.5 sm:px-2"
                              >
                                <Shield className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1" />
                                {member.role === 'owner' ? 'Demote' : 'Make Owner'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { if(confirm(`Remove ${member.name} from the household?`)) removeMemberMutation.mutate(member.user_id); }} 
                                className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                title="Remove Member"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
