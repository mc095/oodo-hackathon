import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    if (!from || !to || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    const rate = data.rates[to];
    
    if (!rate) {
      return NextResponse.json({ error: 'Currency not supported' }, { status: 400 });
    }

    const convertedAmount = parseFloat(amount) * rate;

    return NextResponse.json({
      from,
      to,
      amount: parseFloat(amount),
      rate,
      convertedAmount: Math.round(convertedAmount * 100) / 100
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json({ error: 'Failed to convert currency' }, { status: 500 });
  }
}
