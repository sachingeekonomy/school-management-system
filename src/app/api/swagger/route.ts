import { NextResponse } from 'next/server';
import { swaggerSpec } from '../../../lib/swagger';

export async function GET() {
  try {
    // Return the generated swagger specification
    return NextResponse.json(swaggerSpec);
  } catch (error) {
    console.error('Error serving swagger spec:', error);
    return NextResponse.json(
      { error: 'Failed to serve swagger specification' },
      { status: 500 }
    );
  }
}

