import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user data with profile image based on role
    let userData = {
      id: session.id,
      username: session.username,
      firstName: session.name,
      lastName: session.surname,
      role: session.role,
      email: `${session.username}@example.com`, // Fallback email
      profileImage: null as string | null
    };

    // Get profile image from database based on role
    if (session.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { id: session.id },
        select: { img: true }
      });
      userData.profileImage = student?.img || null;
    } else if (session.role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: session.id },
        select: { img: true }
      });
      userData.profileImage = teacher?.img || null;
    }
    // Note: Parent model doesn't have img field in the schema

    return NextResponse.json({
      user: userData
    });

  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
