import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '@/lib/api/endpoints';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/ui/currency-input';
import { parseMoneyInput } from '@/lib/utils';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps) {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => categoriesApi.list({ type: 'expense' }),
    enabled: isOpen,
  });

  const categories = categoriesResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setCategoryId('');
    setAmount('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    toast.promise(
      createMutation.mutateAsync({
        category_id: categoryId,
        amount: parseMoneyInput(amount),
        period: 'monthly', // default to monthly for now
      } as any),
      {
        loading: 'Creating budget...',
        success: 'Budget created successfully!',
        error: (err: any) => err.message || 'Failed to create budget',
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Budget" description="Set a monthly spending limit for a category.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="" disabled>Select Expense Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Monthly Limit</Label>
          <CurrencyInput
            id="amount"
            value={amount}
            onValueChange={setAmount}
            required
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {createMutation.isPending ? 'Saving...' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
