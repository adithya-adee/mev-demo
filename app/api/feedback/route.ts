import { NextRequest, NextResponse } from 'next/server';

import { neon } from '@neondatabase/serverless';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentiment, amount, timestamp, feedback } = body;

    // Validate input
    if (!sentiment || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert feedback into database
    await sql`
      INSERT INTO feedback (sentiment, amount, timestamp, feedback)
      VALUES (${sentiment}, ${amount || null}, ${timestamp}, ${feedback || null})
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to store feedback' },
      { status: 500 }
    );
  }
}