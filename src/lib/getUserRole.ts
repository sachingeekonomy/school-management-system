import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from './prisma';

export async function getUserRole(): Promise<string | null> {
  try {
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return null;
    }

    // First, try to get role from session claims (fastest)
    const sessionRole = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (sessionRole) {
      console.log('Role found in session claims:', sessionRole);
      return sessionRole;
    }

    // Second, try to get role from Clerk user object
    try {
      const user = await clerkClient.users.getUser(userId);
      const clerkRole = user.publicMetadata?.role as string;
      if (clerkRole) {
        console.log('Role found in Clerk user metadata:', clerkRole);
        return clerkRole;
      }
    } catch (clerkError) {
      console.log('Could not fetch user from Clerk:', clerkError);
    }

    // Third, determine role from database (fallback)
    console.log('Determining role from database for user:', userId);
    
    // Check if user is a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (teacher) {
      const role = 'teacher';
      console.log('User found in teachers table, role:', role);
      
      // Update Clerk metadata for future requests
      try {
        await clerkClient.users.updateUser(userId, {
          publicMetadata: { role }
        });
        console.log('Updated Clerk metadata with role:', role);
      } catch (updateError) {
        console.log('Could not update Clerk metadata:', updateError);
      }
      
      return role;
    }

    // Check if user is a student
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (student) {
      const role = 'student';
      console.log('User found in students table, role:', role);
      
      // Update Clerk metadata for future requests
      try {
        await clerkClient.users.updateUser(userId, {
          publicMetadata: { role }
        });
        console.log('Updated Clerk metadata with role:', role);
      } catch (updateError) {
        console.log('Could not update Clerk metadata:', updateError);
      }
      
      return role;
    }

    // Check if user is a parent
    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (parent) {
      const role = 'parent';
      console.log('User found in parents table, role:', role);
      
      // Update Clerk metadata for future requests
      try {
        await clerkClient.users.updateUser(userId, {
          publicMetadata: { role }
        });
        console.log('Updated Clerk metadata with role:', role);
      } catch (updateError) {
        console.log('Could not update Clerk metadata:', updateError);
      }
      
      return role;
    }

    // Default to admin if not found in any table
    const role = 'admin';
    console.log('User not found in any role tables, defaulting to:', role);
    
    // Update Clerk metadata for future requests
    try {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { role }
      });
      console.log('Updated Clerk metadata with role:', role);
    } catch (updateError) {
      console.log('Could not update Clerk metadata:', updateError);
    }
    
    return role;

  } catch (error) {
    console.error('Error determining user role:', error);
    return 'admin'; // Safe fallback
  }
}

export async function getUserRoleSync(): Promise<string> {
  const role = await getUserRole();
  return role || 'admin';
}
