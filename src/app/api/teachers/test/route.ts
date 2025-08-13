import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing teacher operations...');
    
    // Test 1: Can we fetch teachers from database?
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
      },
      take: 2 // Just get first 2 for testing
    });
    
    console.log('Found teachers:', teachers);
    
    // Test 2: Can we create a test user in the database?
    try {
      const testUser = await prisma.user.create({
        data: {
          id: `test_${Date.now()}`,
          username: `test_${Date.now()}`,
          name: 'Test',
          surname: 'User',
          email: 'test@example.com',
          role: 'TEACHER'
        }
      });
      
      console.log('Test user created:', testUser.id);
      
      // Clean up - delete the test user
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('Test user deleted');
      
      return NextResponse.json({
        success: true,
        message: 'All tests passed',
        teachersFound: teachers.length,
        authTest: 'passed'
      });
      
    } catch (authError) {
      console.error('Auth test failed:', authError);
      return NextResponse.json({
        success: false,
        message: 'Auth test failed',
        teachersFound: teachers.length,
        authError: authError instanceof Error ? authError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
