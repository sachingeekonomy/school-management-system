import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, teachers } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Subject name is required' },
        { status: 400 }
      );
    }

    // Create subject in database
    const subject = await prisma.subject.create({
      data: {
        name: name,
        teachers: {
          connect: teachers?.map((teacherId: string) => ({ id: teacherId })) || []
        }
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Subject created successfully',
        subject: subject 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teachers: true,
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

