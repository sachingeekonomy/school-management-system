import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    const userId = session?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paymentMethod: "ONLINE",
        updatedAt: new Date(),
      },
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            email: true,
          }
        }
      }
    });

    // Create a financial record for income tracking
    await prisma.financial.create({
      data: {
        month: new Date().toLocaleString('default', { month: 'short' }),
        year: new Date().getFullYear(),
        income: updatedPayment.amount,
        expense: 0,
        description: `Payment received for ${updatedPayment.student.name} ${updatedPayment.student.surname} - ${updatedPayment.paymentType}`,
      },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: "Payment verified and processed successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
