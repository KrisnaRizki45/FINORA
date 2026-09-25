'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, UploadCloud, Receipt, ArrowRightLeft, PenLine, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { toast } from 'sonner';
import { transactionsApi, accountsApi, categoriesApi } from '@/lib/api/endpoints';

export default function AIAssistantPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'transfer' | 'insights'>('transfer');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Real transaction fields
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch accounts and categories
  const { data: accountsResponse } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list({ is_active: true }),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list({ type: 'expense', is_active: true }),
  });

  const accounts = accountsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Transaction saved successfully from AI Analysis!');
      setScanResult(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save transaction');
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to analyze image');
      }
      
      // The API returns { data: { amount, merchant, date, reference, category_hint, notes } }
      setScanResult({
        bank: responseData.data.category_hint || 'Unknown',
        amount: responseData.data.amount || 0,
        date: responseData.data.date || new Date().toISOString().split('T')[0],
        reference: responseData.data.reference || '',
        sender: 'You',
        recipient: responseData.data.merchant || ''
      });

      // Default selects to first available
      if (accounts.length > 0) setAccountId(accounts[0].id);
      if (categories.length > 0) setCategoryId(categories[0].id);

      toast.success('Screenshot analyzed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error communicating with AI');
      setImagePreview(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveTransaction = () => {
    if (!accountId || !categoryId) {
      toast.error('Please select an account and a category');
      return;
    }

    createMutation.mutate({
      type: 'expense',
      amount: Number(scanResult.amount),
      account_id: accountId,
      category_id: categoryId,
      transaction_date: scanResult.date,
      description: `Transfer to ${scanResult.recipient} (Ref: ${scanResult.reference})`,
    });
  };

  return (
    <div className="space-y-6 animate-in-fade">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <Sparkles className="mr-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          {t('nav.ai_assistant')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Let our AI simplify your financial data entry and analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass shadow-lg border-white/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Transfer Screenshot Analyzer</CardTitle>
              <CardDescription>Upload a screenshot of a bank transfer to automatically extract the details.</CardDescription>
            </CardHeader>
            <CardContent>
              {!scanResult && !isScanning ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/50">
                  <ArrowRightLeft className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Transfer Screenshot</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                    We will extract the bank name, amount, date, sender, and recipient details.
                  </p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> Select Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="w-full flex justify-center border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 p-2">
                      <img src={imagePreview} alt="Preview" className="max-h-64 object-contain rounded-lg shadow-sm" />
                    </div>
                  )}

                  {isScanning ? (
                     <div className="flex flex-col items-center justify-center p-6 sm:p-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-4" />
                        <p className="text-sm text-gray-500 font-medium">Gemini AI is analyzing the image...</p>
                     </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                      <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
                        <Check className="mr-2 h-5 w-5" /> Review & Edit AI Results
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bank / Provider</label>
                          <Input 
                            value={scanResult.bank} 
                            onChange={(e) => setScanResult({...scanResult, bank: e.target.value})} 
                            className="h-8 text-sm bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Amount</label>
                          <Input 
                            type="number"
                            value={scanResult.amount} 
                            onChange={(e) => setScanResult({...scanResult, amount: e.target.value})} 
                            className="h-8 text-sm bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</label>
                          <Input 
                            type="date"
                            value={scanResult.date} 
                            onChange={(e) => setScanResult({...scanResult, date: e.target.value})} 
                            className="h-8 text-sm bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reference Number</label>
                          <Input 
                            value={scanResult.reference} 
                            onChange={(e) => setScanResult({...scanResult, reference: e.target.value})} 
                            className="h-8 text-sm bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sender</label>
                          <Input 
                            value={scanResult.sender} 
                            onChange={(e) => setScanResult({...scanResult, sender: e.target.value})} 
                            className="h-8 text-sm bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Recipient</label>
                          <Input 
                            value={scanResult.recipient} 
                            onChange={(e) => setScanResult({...scanResult, recipient: e.target.value})} 
                            className="h-8 text-sm bg-white dark:bg-gray-900"
                          />
                        </div>
                      </div>

                      <hr className="border-emerald-100 dark:border-emerald-800/30 my-4" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Select Source Account</label>
                          <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="" disabled>Select Account</option>
                            {accounts.map((acc: any) => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Select Category</label>
                          <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="" disabled>Select Category</option>
                            {categories.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isScanning && scanResult && (
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => { setScanResult(null); setImagePreview(null); }}>
                        Discard
                      </Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                        onClick={handleSaveTransaction}
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? 'Saving...' : 'Save Transaction'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="glass shadow-sm border-white/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">Receipt Scanner</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Powered by Google Gemini 1.5 Flash Vision.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">Transfer Analyzer</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically extract details from transfer screenshots.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
