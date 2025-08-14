import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: {
            students: true
          }
        },
        grade: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}



