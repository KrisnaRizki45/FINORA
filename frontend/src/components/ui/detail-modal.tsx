import React from 'react';
import { Modal } from './modal';
import { Button } from './button';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
  formatters?: Record<string, (val: any) => React.ReactNode>;
}

export function DetailModal({ isOpen, onClose, title, data, formatters = {} }: DetailModalProps) {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto no-scrollbar pb-6">
        {Object.entries(data).map(([key, value]) => {
          if (value === null || value === undefined) return null;
          
          // Skip internal IDs or long hashes if they aren't useful, but let's just display all for now unless filtered before passing
          const formattedKey = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

          const displayValue = formatters[key] 
            ? formatters[key](value) 
            : (typeof value === 'object' ? JSON.stringify(value) : String(value));

          return (
            <div key={key} className="flex justify-between items-start gap-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{formattedKey}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-900 dark:text-white text-right break-words">{displayValue}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
          Close
        </Button>
      </div>
    </Modal>
  );
}
