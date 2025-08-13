import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    const userId = session?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Update the message to mark it as read
    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
        receiverId: userId, // Only allow marking messages as read if user is the receiver
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Message marked as read' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
