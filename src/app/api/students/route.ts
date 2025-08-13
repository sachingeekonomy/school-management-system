import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students with their class, grade, and parent information
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new student
 *     description: Create a new student account in both Clerk and PostgreSQL database
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the student
 *               name:
 *                 type: string
 *                 description: First name of the student
 *               surname:
 *                 type: string
 *                 description: Last name of the student
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the student
 *               phone:
 *                 type: string
 *                 description: Phone number of the student
 *               address:
 *                 type: string
 *                 description: Address of the student
 *               bloodType:
 *                 type: string
 *                 description: Blood type of the student
 *               sex:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 description: Gender of the student
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               gradeId:
 *                 type: integer
 *                 description: ID of the grade
 *               classId:
 *                 type: integer
 *                 description: ID of the class
 *               parentId:
 *                 type: string
 *                 description: ID of the parent
 *               password:
 *                 type: string
 *                 description: Password for the student account
 *             required:
 *               - username
 *               - name
 *               - surname
 *               - address
 *               - bloodType
 *               - sex
 *               - birthday
 *               - gradeId
 *               - classId
 *               - parentId
 *               - password
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request - missing fields or class at capacity
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
    const { username, name, surname, email, phone, address, bloodType, sex, birthday, gradeId, classId, parentId, password } = body;
    
    if (!username || !name || !surname || !address || !bloodType || !sex || !birthday || !gradeId || !classId || !parentId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if class has capacity
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return NextResponse.json(
        { error: 'Class is at full capacity' },
        { status: 400 }
      );
    }

    // Create user in Clerk
    const user = await clerkClient.users.createUser({
      username: username,
      password: password,
      firstName: name,
      lastName: surname,
      publicMetadata: { role: 'student' }
    });

    // Create student in database
    const student = await prisma.student.create({
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
        gradeId: gradeId,
        classId: classId,
        parentId: parentId,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Student created successfully',
        student: student 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: {
          include: {
            grade: {
              select: {
                level: true
              }
            }
          }
        },
        grade: true,
        parent: true,
      },
      orderBy: [
        { name: 'asc' },
        { surname: 'asc' }
      ],
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
