import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
    
    if (!response.ok) {
      throw new Error('Failed to fetch countries data');
    }

    const countries = await response.json();
    
    const formattedCountries = countries.map((country: any) => ({
      name: country.name.common,
      code: Object.keys(country.currencies || {})[0] || 'USD',
      currency: Object.keys(country.currencies || {})[0] || 'USD',
      currencyName: country.currencies ? Object.values(country.currencies)[0]?.name : 'US Dollar'
    }));

    return NextResponse.json(formattedCountries);

  } catch (error) {
    console.error('Countries fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}
