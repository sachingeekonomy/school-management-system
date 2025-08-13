import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    let whereClause: any = {};
    if (studentId) {
      whereClause.studentId = studentId;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCount = await prisma.payment.count();
    const studentCount = await prisma.student.count();

    return NextResponse.json({
      totalPayments: totalCount,
      totalStudents: studentCount,
      payments: payments,
      message: studentId 
        ? `Found ${payments.length} payments for student ${studentId}`
        : `Found ${payments.length} total payments in database`,
    });
  } catch (error) {
    console.error("Error checking payments:", error);
    return NextResponse.json(
      { error: "Failed to check payments" },
      { status: 500 }
    );
  }
}
