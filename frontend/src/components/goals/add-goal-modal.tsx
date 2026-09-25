import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '@/lib/api/endpoints';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/ui/currency-input';
import { parseMoneyInput } from '@/lib/utils';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  const createMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });

  const handleClose = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    createMutation.mutate({
      name,
      target_amount: parseMoneyInput(targetAmount),
      current_amount: parseMoneyInput(currentAmount) || 0,
      deadline: targetDate || null,
      status: 'active',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Savings Goal" description="Set a new financial target for your household.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goalName">Goal Name</Label>
          <Input id="goalName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Car, Emergency Fund, Bali Vacation" required autoFocus />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount</Label>
          <CurrencyInput id="targetAmount" value={targetAmount} onValueChange={setTargetAmount} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Starting Amount (Already saved)</Label>
          <CurrencyInput id="currentAmount" value={currentAmount} onValueChange={setCurrentAmount} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date (Optional)</Label>
          <Input id="targetDate" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {createMutation.isPending ? 'Saving...' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
