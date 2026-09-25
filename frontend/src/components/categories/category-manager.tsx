'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Category } from '@/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryManager() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('');
  const [editForm, setEditForm] = useState<{ id: string; name: string; type: 'income'|'expense' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const categories = categoriesResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: (response) => {
      queryClient.setQueryData(['categories'], (old: any) => {
        if (!old || !old.data) return old;
        return { ...old, data: [...old.data, response.data] };
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Category> }) => categoriesApi.update(id, data),
    onSuccess: (response) => {
      queryClient.setQueryData(['categories'], (old: any) => {
        if (!old || !old.data) return old;
        return { ...old, data: old.data.map((cat: Category) => cat.id === response.data.id ? response.data : cat) };
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      setEditingId(null);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['categories'], (old: any) => {
        if (!old || !old.data) return old;
        return { ...old, data: old.data.filter((cat: Category) => cat.id !== deletedId) };
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
      setDeleteId(null);
    }
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setType('expense');
    setIcon('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createMutation.mutate({ name, type, icon: icon || undefined });
  };

  const handleUpdate = (id: string) => {
    if (!name) return;
    updateMutation.mutate({ id, data: { name, type, icon: icon || undefined } });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || '');
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <Card className="glass shadow-lg border-white/50 dark:border-gray-800 animate-in fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const incomes = categories.filter(c => c.type === 'income');
  const expenses = categories.filter(c => c.type === 'expense');

  return (
    <Card className="glass shadow-lg border-white/50 dark:border-gray-800 animate-in fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Category Management</CardTitle>
          <CardDescription>Organize your transactions with custom categories.</CardDescription>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => { resetForm(); setIsAdding(true); }} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Form for Adding / Editing */}
        {(isAdding || editingId) && (
          <div className="mb-6 p-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl">
            <h4 className="font-medium text-emerald-800 dark:text-emerald-400 mb-3">
              {editingId ? 'Edit Category' : 'New Category'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Groceries" autoFocus />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Icon (Emoji)</Label>
                <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🛒" maxLength={2} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={editingId ? () => handleUpdate(editingId) : handleCreate}>
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Expenses</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {expenses.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 group hover:shadow-sm transition-all gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <span className="text-xl shrink-0">{cat.icon || '📌'}</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" onClick={() => startEdit(cat)}>
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => setDeleteId(cat.id)}>
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 italic col-span-2">No expense categories yet.</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Income</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {incomes.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 group hover:shadow-sm transition-all gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                    <span className="text-xl shrink-0">{cat.icon || '💰'}</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" onClick={() => startEdit(cat)}>
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => setDeleteId(cat.id)}>
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {incomes.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 italic col-span-2">No income categories yet.</p>}
            </div>
          </div>
        </div>

      </CardContent>

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if(deleteId) deleteMutation.mutate(deleteId); }}
        title="Delete Category"
        description="Are you sure you want to delete this category? All related transactions will be marked as uncategorized."
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
}
