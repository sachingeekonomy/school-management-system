import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    const userId = session?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const parentId = searchParams.get("parentId");
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    // If parentId is provided, filter by parent's students
    if (parentId) {
      whereClause.student = {
        parentId: parentId
      };
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
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.payment.count({
      where: whereClause,
    });

    return NextResponse.json({
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

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
    const { studentId, amount, paymentType, paymentMethod, dueDate, description, status } = body;

    // Validate required fields
    if (!studentId || !amount || !paymentType || !paymentMethod || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
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

    const payment = await prisma.payment.create({
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

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
