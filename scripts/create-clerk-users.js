require('dotenv').config();
const { clerkClient } = require('@clerk/nextjs/server');

async function createClerkUsers() {
  try {
    console.log('Creating test users in Clerk...');

    // Create one test admin user
    const admin1 = await clerkClient.users.createUser({
      username: 'admin1',
      emailAddress: ['admin1@example.com'],
      phoneNumber: ['+12345678901'],
      password: 'SchoolMgt2024!@#',
      firstName: 'Admin',
      lastName: 'User',
      publicMetadata: { role: 'admin' }
    });
    console.log('Created admin1:', admin1.id);

    // Create one test teacher
    const teacher1 = await clerkClient.users.createUser({
      username: 'teacher1',
      emailAddress: ['teacher1@example.com'],
      phoneNumber: ['+12345678902'],
      password: 'SchoolMgt2024!@#',
      firstName: 'Teacher',
      lastName: 'One',
      publicMetadata: { role: 'teacher' }
    });
    console.log('Created teacher1:', teacher1.id);

    // Create one test student
    const student1 = await clerkClient.users.createUser({
      username: 'student1',
      emailAddress: ['student1@example.com'],
      phoneNumber: ['+12345678903'],
      password: 'SchoolMgt2024!@#',
      firstName: 'Student',
      lastName: 'One',
      publicMetadata: { role: 'student' }
    });
    console.log('Created student1:', student1.id);

    // Create one test parent
    const parent1 = await clerkClient.users.createUser({
      username: 'parentId1',
      emailAddress: ['parent1@example.com'],
      phoneNumber: ['+12345678904'],
      password: 'SchoolMgt2024!@#',
      firstName: 'Parent',
      lastName: 'One',
      publicMetadata: { role: 'parent' }
    });
    console.log('Created parentId1:', parent1.id);

    console.log('Test users created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin1 / SchoolMgt2024!@#');
    console.log('Teacher: teacher1 / SchoolMgt2024!@#');
    console.log('Student: student1 / SchoolMgt2024!@#');
    console.log('Parent: parentId1 / SchoolMgt2024!@#');
  } catch (error) {
    console.error('Error creating users:', error);
  }
}

createClerkUsers();
