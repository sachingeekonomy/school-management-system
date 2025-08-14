import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: {
        level: 'asc'
      }
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}
