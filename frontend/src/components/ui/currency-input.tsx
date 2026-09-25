import React from 'react';
import { Input } from './input';
import { formatMoneyInput, parseMoneyInput } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onValueChange: (value: string) => void;
  prefixSymbol?: string;
}

export function CurrencyInput({ value, onValueChange, prefixSymbol = 'Rp', className, ...props }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pass the raw text input (with dots/commas) back to parent if needed, 
    // or just pass a cleaned up string. For React state, it's often easier to just pass the raw input 
    // and format it inside the component. We'll pass the raw string and let formatMoneyInput handle it on render.
    onValueChange(e.target.value);
  };

  // Format value with thousand separators using Indonesian locale
  const formattedValue = typeof value === 'string' && value.includes(',') || (typeof value === 'string' && value.endsWith('.')) 
    ? formatMoneyInput(value) // keep trailing commas/dots while typing
    : value || value === 0 ? formatMoneyInput(value) : '';

  return (
    <div className="relative">
      {prefixSymbol && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium z-10 pointer-events-none">
          {prefixSymbol}
        </span>
      )}
      <Input
        type="text"
        inputMode="numeric"
        value={formattedValue}
        onChange={handleChange}
        className={`${prefixSymbol ? 'pl-9' : ''} ${className || ''}`}
        {...props}
      />
    </div>
  );
}
