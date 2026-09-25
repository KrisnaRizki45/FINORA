import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, accountsApi } from '@/lib/api/endpoints';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/ui/currency-input';
import { parseMoneyInput } from '@/lib/utils';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransferModal({ isOpen, onClose }: AddTransferModalProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const { data: accountsResponse } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list({ is_active: true }),
    enabled: isOpen,
  });

  const accounts = accountsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: transactionsApi.transfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setAmount('');
    setFromAccountId('');
    setToAccountId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !fromAccountId || !toAccountId || fromAccountId === toAccountId) return;

    toast.promise(
      createMutation.mutateAsync({
        amount: parseMoneyInput(amount),
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        transaction_date: date,
        description,
      }),
      {
        loading: 'Processing transfer...',
        success: 'Transfer completed successfully!',
        error: (err: any) => err.message || 'Failed to transfer money',
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Transfer Money" description="Move money between your accounts.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transferAmount">Amount</Label>
          <CurrencyInput
            id="transferAmount"
            value={amount}
            onValueChange={setAmount}
            placeholder="0"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">From</Label>
            <select
              id="fromAccount"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>Select Source</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={acc.id === toAccountId}>{acc.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toAccount">To</Label>
            <select
              id="toAccount"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>Select Destination</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transferDate">Date</Label>
          <Input
            id="transferDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transferDesc">Description (Optional)</Label>
          <Input
            id="transferDesc"
            placeholder="e.g. Monthly Savings"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending || fromAccountId === toAccountId} className="bg-blue-600 hover:bg-blue-700">
            {createMutation.isPending ? 'Processing...' : 'Transfer Funds'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
