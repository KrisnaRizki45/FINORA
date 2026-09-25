import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, accountsApi, categoriesApi } from '@/lib/api/endpoints';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, UploadCloud, ReceiptText, PenLine } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { parseMoneyInput } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const queryClient = useQueryClient();
  const [inputMode, setInputMode] = useState<'manual' | 'scan'>('manual');
  
  // Manual Entry States
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch accounts and categories
  const { data: accountsResponse } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list({ is_active: true }),
    enabled: isOpen,
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoriesApi.list({ type, is_active: true }),
    enabled: isOpen,
  });

  const accounts = accountsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setInputMode('manual');
    setType('expense');
    setAmount('');
    setAccountId('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsScanning(false);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !categoryId) return;

    toast.promise(
      createMutation.mutateAsync({
        type,
        amount: parseMoneyInput(amount),
        account_id: accountId,
        category_id: categoryId,
        transaction_date: date,
        description,
      }),
      {
        loading: 'Creating transaction...',
        success: 'Transaction created successfully!',
        error: (err: any) => err.message || 'Failed to create transaction',
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result.success && result.data) {
        setAmount(result.data.amount.toString());
        setDate(result.data.date);
        setDescription(`${result.data.merchant} - ${result.data.notes}`);
        setType(result.data.type === 'income' ? 'income' : 'expense');
        toast.success('Receipt scanned successfully. Please review the extracted data.');
        setInputMode('manual');
      } else {
        throw new Error(result.error || 'Failed to scan receipt');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong while scanning the receipt.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Transaction" description="Record a new income or expense.">
      
      {/* Top Level Tabs */}
      <div className="flex p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${inputMode === 'manual' ? 'bg-white dark:bg-gray-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setInputMode('manual')}
        >
          <PenLine className="h-4 w-4" /> Manual Entry
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${inputMode === 'scan' ? 'bg-white dark:bg-gray-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setInputMode('scan')}
        >
          <ReceiptText className="h-4 w-4" /> Scan Receipt
        </button>
      </div>

      {inputMode === 'manual' ? (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in zoom-in-95">
          {imagePreview && (
            <div className="w-full flex justify-center border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 p-2 mb-4">
              <img src={imagePreview} alt="Receipt Preview" className="max-h-48 object-contain rounded-lg shadow-sm" />
            </div>
          )}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-full mb-4">
            <button
              type="button"
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setType('income')}
            >
              Income
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onValueChange={setAmount}
              placeholder="0"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <select
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" disabled>Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {createMutation.isPending ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 flex flex-col items-center text-center">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-full">
            <Camera className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Scan a Receipt</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto">
              Upload a picture of your receipt and our AI will automatically extract the total amount, date, and merchant.
            </p>
          </div>
          
          <div className="w-full mt-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
            >
              {isScanning ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing Receipt...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400 mt-3">Powered by Finora AI Foundation</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
