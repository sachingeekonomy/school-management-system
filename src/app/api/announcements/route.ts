import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";

// Prevent build-time execution
export const dynamic = 'force-dynamic';

// GET - Fetch all announcements with role-based filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    const role = session?.role;
    const currentUserId = session?.id;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the base query
    const query: any = {};

    // Add search functionality
    if (search) {
      query.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { class: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Role-based filtering
    if (role === "admin") {
      // Admin can see all announcements
    } else if (role === "teacher" && currentUserId) {
      // Teachers can see announcements for their classes or general announcements
      query.OR = [
        { classId: null }, // General announcements
        {
          class: {
            OR: [
              { supervisorId: currentUserId }, // Classes they supervise
              { lessons: { some: { teacherId: currentUserId } } } // Classes they teach
            ]
          }
        }
      ];
    } else if (role === "student" && currentUserId) {
      // Students can see announcements for their class or general announcements
      const student = await prisma.student.findUnique({
        where: { id: currentUserId },
        select: { classId: true }
      });
      
      if (student) {
        query.OR = [
          { classId: null }, // General announcements
          { classId: student.classId } // Their specific class
        ];
      }
    } else if (role === "parent" && currentUserId) {
      // Parents can see announcements for their children's classes or general announcements
      const parentStudents = await prisma.student.findMany({
        where: { parentId: currentUserId },
        select: { classId: true }
      });
      
      if (parentStudents.length > 0) {
        const classIds = parentStudents.map(s => s.classId);
        query.OR = [
          { classId: null }, // General announcements
          { classId: { in: classIds } } // Their children's classes
        ];
      }
    }

    const [announcements, totalCount] = await prisma.$transaction([
      prisma.announcement.findMany({
        where: query,
        include: {
          class: {
            include: {
              grade: true,
            },
          },
        },
        orderBy: {
          date: 'desc'
        },
        take: limit,
        skip: skip,
      }),
      prisma.announcement.count({ where: query }),
    ]);

    return NextResponse.json({
      data: announcements,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST - Create a new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, classId } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Title, description, and date are required" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        date: new Date(date),
        classId: classId || null,
      },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
