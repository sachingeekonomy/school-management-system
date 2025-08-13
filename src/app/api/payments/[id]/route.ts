import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            email: true,
            img: true,
            phone: true,
            address: true,
            class: {
              select: {
                name: true,
                grade: {
                  select: {
                    level: true,
                  }
                }
              }
            }
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

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { studentId, amount, paymentType, paymentMethod, dueDate, description, status } = body;

    // Validate required fields
    if (!studentId || !amount || !paymentType || !paymentMethod || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        studentId,
        amount: parseFloat(amount),
        paymentType,
        paymentMethod,
        dueDate: new Date(dueDate),
        description,
        status,
      },
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            email: true,
            img: true,
          }
        }
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession();
    const userId = session?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    await prisma.payment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
