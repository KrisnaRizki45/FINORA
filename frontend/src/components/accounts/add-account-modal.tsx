import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AccountType, OwnerType } from '@/types';
import { accountsApi } from '@/lib/api/endpoints';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { parseMoneyInput } from '@/lib/utils';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [ownerType, setOwnerType] = useState('personal');

  const createMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Invalidate dashboard data if any
      handleClose();
    },
  });

  const handleClose = () => {
    setName('');
    setType('bank');
    setInitialBalance('');
    setOwnerType('personal');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || initialBalance === '') return;

    toast.promise(
      createMutation.mutateAsync({
        name,
        type: type as AccountType,
        initial_balance: parseMoneyInput(initialBalance),
        currency: 'IDR', // Defaulting to IDR based on settings
        owner_type: ownerType as OwnerType,
        is_active: true,
      }),
      {
        loading: 'Creating account...',
        success: 'Account created successfully!',
        error: (err: any) => err.message || 'Failed to create account',
      }
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Add New Account" 
      description="Create a new financial account to track your balances."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Account Name</Label>
          <Input
            id="name"
            placeholder="e.g. BCA Savings, OVO, Cash in Wallet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Account Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <option value="bank">Bank Account</option>
            <option value="ewallet">E-Wallet</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="other">Other / Investment</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialBalance">Current Balance</Label>
          <CurrencyInput
            id="initialBalance"
            placeholder="0"
            value={initialBalance}
            onValueChange={setInitialBalance}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerType">Ownership</Label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${ownerType === 'personal' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <input type="radio" className="hidden" name="ownerType" value="personal" checked={ownerType === 'personal'} onChange={() => setOwnerType('personal')} />
              <div className="font-semibold mb-1">Personal</div>
              <div className="text-xs opacity-80">Only you can view and edit</div>
            </label>
            <label className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${ownerType === 'shared' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <input type="radio" className="hidden" name="ownerType" value="shared" checked={ownerType === 'shared'} onChange={() => setOwnerType('shared')} />
              <div className="font-semibold mb-1">Shared</div>
              <div className="text-xs opacity-80">Visible to household</div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {createMutation.isPending ? 'Saving...' : 'Save Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
