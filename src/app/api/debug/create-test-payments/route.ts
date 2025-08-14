import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get a student to create payments for
    const student = await prisma.student.findFirst();
    
    if (!student) {
      return NextResponse.json(
        { error: "No students found in database" },
        { status: 404 }
      );
    }

    // Create test payments
    const testPayments = [
      {
        studentId: student.id,
        amount: 5000,
        paymentType: "TUITION" as const,
        paymentMethod: "ONLINE" as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: "Monthly tuition fee for January 2024",
        status: "PENDING" as const,
      },
      {
        studentId: student.id,
        amount: 2500,
        paymentType: "EXAM" as const,
        paymentMethod: "CASH" as const,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        description: "Mid-term examination fee",
        status: "OVERDUE" as const,
      },
      {
        studentId: student.id,
        amount: 1000,
        paymentType: "TRANSPORT" as const,
        paymentMethod: "BANK_TRANSFER" as const,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        description: "Transport fee for February 2024",
        status: "PENDING" as const,
      },
      {
        studentId: student.id,
        amount: 3000,
        paymentType: "TUITION" as const,
        paymentMethod: "ONLINE" as const,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        description: "Monthly tuition fee for December 2023",
        status: "PAID" as const,
      },
    ];

    const createdPayments = await prisma.payment.createMany({
      data: testPayments,
    });

    return NextResponse.json({
      message: `Created ${createdPayments.count} test payments for student ${student.id}`,
      studentId: student.id,
      paymentsCreated: createdPayments.count,
    });
  } catch (error) {
    console.error("Error creating test payments:", error);
    return NextResponse.json(
      { error: "Failed to create test payments" },
      { status: 500 }
    );
  }
}
