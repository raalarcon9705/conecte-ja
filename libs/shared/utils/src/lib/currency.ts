/**
 * Currency formatting utilities
 */

export type Currency = 'BRL' | 'USD' | 'EUR';

export interface FormatCurrencyOptions {
  currency?: Currency;
  locale?: string;
  showSymbol?: boolean;
  decimals?: number;
}

/**
 * Format a number as currency
 * Default: Brazilian Real (BRL) with pt-BR locale
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    currency = 'BRL',
    locale = 'pt-BR',
    showSymbol = true,
    decimals = 2,
  } = options;

  if (!showSymbol) {
    return amount.toFixed(decimals).replace('.', ',');
  }

  // Currency symbols
  const symbols: Record<Currency, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
  };

  // Format number with locale
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${symbols[currency]} ${formatted}`;
}

/**
 * Format a price range (e.g., "R$ 50 - R$ 100")
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  options: FormatCurrencyOptions = {}
): string {
  const { currency = 'BRL' } = options;
  const symbols: Record<Currency, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
  };

  return `${symbols[currency]} ${minPrice} - ${symbols[currency]} ${maxPrice}`;
}

/**
 * Parse a price string to number
 * Handles formats like "R$ 50", "$50", "50.00"
 */
export function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove currency symbols and spaces
  const cleaned = priceString
    .replace(/[R$€]/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  
  return parseFloat(cleaned) || 0;
}

