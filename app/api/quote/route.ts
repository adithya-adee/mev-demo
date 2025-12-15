import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const amount = searchParams.get('amount');
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    const tokens = {
      SOL: 'So11111111111111111111111111111111111111112',
      USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    };

    // Fetch from Jupiter API server-side (avoids CORS)
    const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${tokens.SOL}&outputMint=${tokens.USDC}&amount=${amount}&slippageBps=50`;
    
    let response;
    try {
      response = await fetch(jupiterUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
      });
    } catch {
      // console.warn('Jupiter API unreachable, using mock data for demo:', fetchError);
      
      // Fallback mock data when API is unavailable
      const solAmount = parseInt(amount) / 1e9;
      const mockPrice = 195; // ~$195 per SOL
      const mockUsdcOutput = solAmount * mockPrice * 1e6; // USDC has 6 decimals
      
      return NextResponse.json({
        outAmount: Math.floor(mockUsdcOutput).toString(),
        priceImpactPct: '0.01',
        _mock: true
      }, { status: 200 });
    }

    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Jupiter API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote from Jupiter' },
      { status: 500 }
    );
  }
}
