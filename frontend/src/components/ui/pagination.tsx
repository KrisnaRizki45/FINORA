import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
  perPage?: number;
}

export function Pagination({ currentPage, lastPage, total, onPageChange, perPage = 15 }: PaginationProps) {
  const { t } = useLanguage();

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, '...', lastPage);
      } else if (currentPage >= lastPage - 1) {
        pages.push(1, '...', lastPage - 2, lastPage - 1, lastPage);
      } else {
        pages.push(1, '...', currentPage, '...', lastPage);
      }
    }
    return pages;
  };

  const startResult = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endResult = Math.min(currentPage * perPage, total);

  return (
    <div className="flex flex-row items-center justify-between px-1 py-3 sm:px-4 w-full border-t border-gray-100 dark:border-gray-800 mt-2 sm:mt-4 gap-2">
      <div className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">
        Showing <span className="font-medium text-gray-900 dark:text-white">{startResult}</span> to <span className="font-medium text-gray-900 dark:text-white">{endResult}</span> of <span className="font-medium text-gray-900 dark:text-white">{total}</span> entries
      </div>
      <div className="flex items-center gap-1 min-w-max">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 sm:h-7 sm:w-7 disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
        
        {/* On mobile: EXACTLY ONE box with the current page */}
        <div className="flex sm:hidden items-center justify-center mx-1">
          <Button variant="default" size="icon" className="h-6 w-6 text-[10px] bg-emerald-600 hover:bg-emerald-600 text-white pointer-events-none border-transparent">
            {currentPage}
          </Button>
        </div>

        {/* On desktop: full pagination numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <div key={`dots-${index}`} className="px-1 text-gray-400 flex items-center justify-center">
                <MoreHorizontal className="h-3 w-3" />
              </div>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className={`h-7 w-7 text-[10px] transition-all flex-shrink-0 ${currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'}`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 sm:h-7 sm:w-7 disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </div>
    </div>
  );
}
