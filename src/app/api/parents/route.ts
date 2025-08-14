import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parents = await prisma.parent.findMany({
      orderBy: [
        { name: 'asc' },
        { surname: 'asc' }
      ]
    });

    return NextResponse.json(parents);
  } catch (error) {
    console.error('Error fetching parents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parents' },
      { status: 500 }
    );
  }
}
