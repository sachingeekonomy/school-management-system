import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.id,
        username: session.username,
        firstName: session.name,
        lastName: session.surname,
        role: session.role,
        email: `${session.username}@example.com` // Fallback email
      }
    });

  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
