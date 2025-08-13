import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    const role = session?.role;
    const userId = session?.id;

    let whereClause: any = {};

    // Filter lessons based on user role
    if (role === 'teacher' && userId) {
      // Teachers can only see their own lessons
      whereClause.teacherId = userId;
    }
    // Admins can see all lessons (no filter)

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        subject: true,
        class: true,
        teacher: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}



