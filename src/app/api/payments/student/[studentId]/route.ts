import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
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

    // Check if user has permission to view this student's payments
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // For parent access, we need to check if the student belongs to this parent
    let canView = false;
    
    if (user.role === "ADMIN") {
      canView = true;
    } else if (user.role === "STUDENT") {
      canView = params.studentId === userId;
    } else if (user.role === "PARENT") {
      // Check if the student belongs to this parent
      const student = await prisma.student.findFirst({
        where: {
          id: params.studentId,
          parentId: userId,
        },
      });
      canView = !!student;
    }

    if (!canView) {
      return NextResponse.json(
        { error: "You don't have permission to view this student's payments" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { studentId: params.studentId };
    if (status) {
      whereClause.status = status;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            email: true,
            img: true,
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
      },
      skip,
      take: limit,
      orderBy: {
        dueDate: "asc",
      },
    });

    const total = await prisma.payment.count({ where: whereClause });

    // Calculate summary statistics
    const totalAmount = await prisma.payment.aggregate({
      where: whereClause,
      _sum: { amount: true },
    });

    const paidAmount = await prisma.payment.aggregate({
      where: { ...whereClause, status: "PAID" },
      _sum: { amount: true },
    });

    const pendingAmount = await prisma.payment.aggregate({
      where: { ...whereClause, status: "PENDING" },
      _sum: { amount: true },
    });

    const overdueAmount = await prisma.payment.aggregate({
      where: { ...whereClause, status: "OVERDUE" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalAmount: totalAmount._sum.amount || 0,
        paidAmount: paidAmount._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
        overdueAmount: overdueAmount._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
