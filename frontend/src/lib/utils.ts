// ──────────────────────────────────────────────
// Utility Functions — Finora
// Indonesian locale formatting for currency, dates, numbers
// ──────────────────────────────────────────────

/**
 * Format a number as Indonesian Rupiah currency.
 * Example: 6000000 → "Rp 6.000.000", 6000000.5 → "Rp 6.000.000,50"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR'
): string {
  // Check if amount has decimals
  const hasDecimals = amount % 1 !== 0;
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format raw money input string (e.g., 1000000) into Indonesian format (e.g., 1.000.000)
 */
export function formatMoneyInput(value: string | number): string {
  if (!value && value !== 0) return '';
  
  // Convert to string and handle decimal part
  let strValue = value.toString();
  strValue = strValue.replace(/[^0-9.,-]/g, ''); // Allow only numbers, dot, comma, minus
  
  // Replace comma with dot for JS numeric parsing if there's only one comma at the end
  if (strValue.includes(',')) {
    const parts = strValue.split(',');
    if (parts.length === 2) {
      strValue = parts[0].replace(/\./g, '') + '.' + parts[1];
    } else {
      strValue = strValue.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (strValue.includes('.')) {
    // Check if it's multiple dots (Indonesian thousand separator)
    const dotsCount = (strValue.match(/\./g) || []).length;
    if (dotsCount > 1 || (strValue.length - strValue.lastIndexOf('.') > 3)) {
      strValue = strValue.replace(/\./g, '');
    }
  }

  const num = parseFloat(strValue);
  if (isNaN(num)) return '';

  const hasDecimals = strValue.includes('.') && !strValue.endsWith('.');
  const isEndingWithDot = strValue.endsWith('.') || strValue.endsWith(',');
  
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: hasDecimals ? (strValue.split('.')[1]?.length || 0) : 0,
    maximumFractionDigits: 2,
  }).format(num);

  return isEndingWithDot ? formatted + ',' : formatted;
}

/**
 * Parse money input string (e.g., "1.000.000,50") into number (1000000.5)
 */
export function parseMoneyInput(value: string): number {
  if (!value) return 0;
  // Remove all non-numeric except dot and comma
  let cleanValue = value.replace(/[^0-9.,-]/g, '');
  
  // In Indonesian format, dot is thousand separator, comma is decimal separator
  // We need to convert this to standard JS number (no thousand separator, dot is decimal)
  if (cleanValue.includes(',') || cleanValue.includes('.')) {
     // If both dot and comma exist, dot is thousand separator, comma is decimal
     if (cleanValue.includes('.') && cleanValue.includes(',')) {
       cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
     } 
     // If only comma exists, it's a decimal separator
     else if (cleanValue.includes(',')) {
       cleanValue = cleanValue.replace(',', '.');
     }
     // If only dot exists, it could be either thousand separator or decimal
     else if (cleanValue.includes('.')) {
       // If multiple dots, they are thousand separators
       const dotsCount = (cleanValue.match(/\./g) || []).length;
       if (dotsCount > 1 || (cleanValue.length - cleanValue.lastIndexOf('.') > 3)) {
         cleanValue = cleanValue.replace(/\./g, '');
       }
       // If one dot and exactly 2 decimal places, assume decimal (although IDR rarely uses decimal point)
       // Let's assume standard JS number parsing for this edge case
     }
  }
  
  const num = parseFloat(cleanValue);
  return isNaN(num) ? 0 : num;
}

/**
 * Format a number as Indonesian Rupiah with sign.
 * Example: 500000 → "+Rp 500.000", -250000 → "-Rp 250.000"
 */
export function formatCurrencyWithSign(
  amount: number,
  currency: string = 'IDR'
): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount, currency)}`;
}

/**
 * Format a number with decimal places for asset quantities.
 * Example: 12.5 → "12,5" or 0.00345 → "0,00345"
 */
export function formatQuantity(
  quantity: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(quantity);
}

/**
 * Format a date as "DD MMM YYYY" in Indonesian locale.
 * Example: "2025-03-15" → "15 Mar 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a date as "DD MMM YYYY, HH:mm".
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format a date relative to now.
 * Example: "2 jam yang lalu", "Kemarin", "3 hari yang lalu"
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return formatDate(dateString);
}

/**
 * Format a percentage.
 * Example: 85.5 → "85,5%"
 */
export function formatPercentage(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

/**
 * Format number with Indonesian thousands separator.
 * Example: 1250000 → "1.250.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Get color for transaction type.
 */
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case 'income':
      return 'text-emerald-600';
    case 'expense':
      return 'text-red-500';
    case 'transfer':
      return 'text-blue-500';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get label for transaction type in Indonesian.
 */
export function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'income':
      return 'Pemasukan';
    case 'expense':
      return 'Pengeluaran';
    case 'transfer':
      return 'Transfer';
    default:
      return type;
  }
}

/**
 * Get label for account type in Indonesian.
 */
export function getAccountTypeLabel(type: string): string {
  switch (type) {
    case 'bank':
      return 'Bank';
    case 'ewallet':
      return 'E-Wallet';
    case 'cash':
      return 'Tunai';
    case 'credit_card':
      return 'Kartu Kredit';
    default:
      return type;
  }
}

/**
 * Get label for asset type in Indonesian.
 */
export function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    gold: 'Emas',
    stock: 'Saham',
    crypto: 'Crypto',
    mutual_fund: 'Reksa Dana',
    bond: 'Obligasi',
    property: 'Properti',
    vehicle: 'Kendaraan',
    business: 'Bisnis',
    other: 'Lainnya',
  };
  return labels[type] || type;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate initials from a name.
 * Example: "Krisna Wijaya" → "KW"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Construct a CSS class string from conditional classes.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
