import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

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

    // Create user in Clerk
    const user = await clerkClient.users.createUser({
      username: username,
      password: password,
      firstName: name,
      lastName: surname,
      publicMetadata: { role: 'teacher' }
    });

    // Create teacher in database
    const teacher = await prisma.teacher.create({
      data: {
        id: user.id,
        username: username,
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

