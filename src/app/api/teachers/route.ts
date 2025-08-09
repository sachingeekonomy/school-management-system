import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers
 *     description: Retrieve a list of all teachers with their subjects and classes
 *     tags: [Teachers]
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new teacher
 *     description: Create a new teacher account in both Clerk and PostgreSQL database
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the teacher
 *               name:
 *                 type: string
 *                 description: First name of the teacher
 *               surname:
 *                 type: string
 *                 description: Last name of the teacher
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the teacher
 *               phone:
 *                 type: string
 *                 description: Phone number of the teacher
 *               address:
 *                 type: string
 *                 description: Address of the teacher
 *               bloodType:
 *                 type: string
 *                 description: Blood type of the teacher
 *               sex:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 description: Gender of the teacher
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of subject IDs
 *               password:
 *                 type: string
 *                 description: Password for the teacher account
 *             required:
 *               - username
 *               - name
 *               - surname
 *               - address
 *               - bloodType
 *               - sex
 *               - birthday
 *               - password
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 teacher:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad request - missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

