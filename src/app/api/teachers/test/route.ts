import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

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
    
    // Test 2: Can we create a test Clerk user?
    try {
      const testUser = await clerkClient.users.createUser({
        username: `test_${Date.now()}`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        emailAddress: ['test@example.com'],
        publicMetadata: { role: "teacher" }
      });
      
      console.log('Test Clerk user created:', testUser.id);
      
      // Clean up - delete the test user
      await clerkClient.users.deleteUser(testUser.id);
      console.log('Test Clerk user deleted');
      
      return NextResponse.json({
        success: true,
        message: 'All tests passed',
        teachersFound: teachers.length,
        clerkTest: 'passed'
      });
      
    } catch (clerkError) {
      console.error('Clerk test failed:', clerkError);
      return NextResponse.json({
        success: false,
        message: 'Clerk test failed',
        teachersFound: teachers.length,
        clerkError: clerkError instanceof Error ? clerkError.message : 'Unknown error'
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
