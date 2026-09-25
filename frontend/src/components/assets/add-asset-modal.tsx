import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssetType, OwnerType } from '@/types';
import { assetsApi } from '@/lib/api/endpoints';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/ui/currency-input';
import { parseMoneyInput } from '@/lib/utils';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: any | null;
}

export function AddAssetModal({ isOpen, onClose, assetToEdit }: AddAssetModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(assetToEdit?.name || '');
  const [type, setType] = useState(assetToEdit?.type || 'stock');
  const [symbol, setSymbol] = useState(assetToEdit?.symbol || '');
  const [units, setUnits] = useState(assetToEdit?.current_units?.toString() || assetToEdit?.quantity?.toString() || '');
  const [buyPrice, setBuyPrice] = useState(assetToEdit?.average_buy_price?.toString() || assetToEdit?.average_cost?.toString() || '');
  const [currentValue, setCurrentValue] = useState(assetToEdit?.current_value?.toString() || '');
  const [ownerType, setOwnerType] = useState<'personal' | 'shared'>(assetToEdit?.owner_type || 'personal');
  
  // Re-initialize state when assetToEdit changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(assetToEdit?.name || '');
      setType(assetToEdit?.type || 'stock');
      setSymbol(assetToEdit?.symbol || '');
      setUnits(assetToEdit?.current_units?.toString() || assetToEdit?.quantity?.toString() || '');
      setBuyPrice(assetToEdit?.average_buy_price?.toString() || assetToEdit?.average_cost?.toString() || '');
      setCurrentValue(assetToEdit?.current_value?.toString() || '');
      setOwnerType(assetToEdit?.owner_type || 'personal');
    }
  }, [isOpen, assetToEdit]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => assetToEdit ? assetsApi.update(assetToEdit.id, data) : assetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setName('');
    setType('stock');
    setSymbol('');
    setUnits('');
    setBuyPrice('');
    setCurrentValue('');
    setOwnerType('personal');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentValue) return;

    toast.promise(
      saveMutation.mutateAsync({
        name,
        type: type as AssetType,
        quantity: parseFloat(units) || 1,
        average_cost: parseMoneyInput(buyPrice) || parseMoneyInput(currentValue),
        current_value: parseMoneyInput(currentValue),
        currency: 'IDR',
        owner_type: ownerType as OwnerType,
        is_active: true,
      }),
      {
        loading: assetToEdit ? 'Updating asset...' : 'Adding asset...',
        success: assetToEdit ? 'Asset updated successfully!' : 'Asset added successfully!',
        error: (err: any) => err.message || `Failed to ${assetToEdit ? 'update' : 'create'} asset`,
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={assetToEdit ? "Edit Asset" : "Add New Asset"} description={assetToEdit ? "Update your investment details." : "Track a new investment or property."}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assetName">Asset Name</Label>
          <Input id="assetName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apple Stock, Bitcoin, House" required autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetType">Type</Label>
            <select id="assetType" value={type} onChange={e => setType(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="stock">Stock</option>
              <option value="crypto">Crypto</option>
              <option value="gold">Gold</option>
              <option value="property">Property</option>
              <option value="vehicle">Vehicle</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetSymbol">Symbol/Ticker (Optional)</Label>
            <Input id="assetSymbol" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g. AAPL, BTC" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetUnits">Total Units</Label>
            <Input id="assetUnits" type="number" step="any" min="0" value={units} onChange={e => setUnits(e.target.value)} placeholder="e.g. 10.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetBuyPrice">Avg Buy Price</Label>
            <CurrencyInput id="assetBuyPrice" value={buyPrice} onValueChange={setBuyPrice} placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assetValue">Current Total Value</Label>
          <CurrencyInput id="assetValue" value={currentValue} onValueChange={setCurrentValue} required />
        </div>

        <div className="space-y-2">
          <Label>Ownership</Label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${ownerType === 'personal' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <input type="radio" className="hidden" checked={ownerType === 'personal'} onChange={() => setOwnerType('personal')} />
              <div className="font-semibold text-sm">Personal</div>
            </label>
            <label className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${ownerType === 'shared' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <input type="radio" className="hidden" checked={ownerType === 'shared'} onChange={() => setOwnerType('shared')} />
              <div className="font-semibold text-sm">Shared</div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {saveMutation.isPending ? 'Saving...' : (assetToEdit ? 'Save Changes' : 'Save Asset')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
