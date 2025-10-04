export interface CurrencyConversionResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  convertedAmount: number;
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number
): Promise<CurrencyConversionResult> {
  try {
    const response = await fetch(
      `/api/currency/convert?from=${from}&to=${to}&amount=${amount}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to convert currency');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw error;
  }
}

export async function getCountries(): Promise<Array<{
  name: string;
  code: string;
  currency: string;
  currencyName: string;
}>> {
  try {
    const response = await fetch('/api/countries');
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Countries fetch error:', error);
    throw error;
  }
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
