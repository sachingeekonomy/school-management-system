import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

// Prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { username, name, surname, email, phone, address, bloodType, sex, birthday, subjects, password } = body;
    
    if (!username || !name || !surname || !address || !bloodType || !sex || !birthday || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the teacher
    const teacherId = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create teacher in database
    const teacher = await prisma.teacher.create({
      data: {
        id: teacherId,
        username: username,
        password: password, // In a real app, this should be hashed
        name: name,
        surname: surname,
        email: email || null,
        phone: phone || null,
        address: address,
        bloodType: bloodType,
        sex: sex,
        birthday: new Date(birthday),
        subjects: {
          connect: subjects?.map((subjectId: number) => ({ id: subjectId })) || []
        }
      },
    });

    // Also create user in User table for authentication
    await prisma.user.create({
      data: {
        id: teacherId,
        username: username,
        name: name,
        surname: surname,
        email: email || null,
        phone: phone || null,
        role: 'TEACHER'
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Teacher created successfully',
        teacher: teacher 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        subjects: true,
        classes: true,
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

