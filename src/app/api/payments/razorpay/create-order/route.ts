import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";

// Initialize Razorpay with proper error handling
let razorpay: Razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
} catch (error) {
  console.error("Failed to initialize Razorpay:", error);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error("Razorpay not initialized");
      return NextResponse.json(
        { error: "Payment gateway not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { paymentId, studentId } = body;

    console.log("Creating order for payment:", { paymentId, studentId });

    if (!paymentId || !studentId) {
      return NextResponse.json(
        { error: "Payment ID and Student ID are required" },
        { status: 400 }
      );
    }

    // Get the payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            email: true,
            parentId: true,
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to pay for this student
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Allow payment if user is admin, or if user is parent/student and matches the student
    const canPay = user.role === "ADMIN" || 
                   (user.role === "PARENT" && payment.student.parentId === userId) ||
                   (user.role === "STUDENT" && payment.studentId === userId);

    if (!canPay) {
      return NextResponse.json(
        { error: "You don't have permission to pay for this student" },
        { status: 403 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(payment.amount * 100), // Convert to paise
      currency: "INR",
      receipt: `payment_${paymentId}`,
      notes: {
        paymentId: paymentId,
        studentId: studentId,
        paymentType: payment.paymentType,
        description: payment.description || "",
      },
    });

    console.log("Razorpay order created:", order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
